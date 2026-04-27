// ============================================================
// Gizmo Session Poller
// ============================================================
// Called by /api/cron/gizmo-sync every minute.
//
// Strategy:
//   1. Pull active sessions from Gizmo v3.
//   2. Pull our DB's mirror (GizmoSession with status=ACTIVE).
//   3. Diff:
//        - In Gizmo & not in DB     → SESSION_STARTED
//        - In DB & not in Gizmo     → SESSION_ENDED
//        - In both                   → check hour milestones
//   4. Dispatch one event per delta.
//
// Each call is a snapshot — no in-memory state required.
// Safe to invoke from a serverless function.

import { prisma } from '@/lib/db';
import { getGizmoClient } from './client';
import { linkGizmoUser } from './linker';
import { dispatchEvent } from '@/lib/events/dispatcher';
import type { GizmoUserSession } from './types';

export interface PollSummary {
  activeNow: number;
  newSessions: number;
  endedSessions: number;
  milestonesFired: number;
  dailyLoginsAwarded: number;
  errors: string[];
  durationMs: number;
}

/** Half-hour milestone interval in minutes. */
const MILESTONE_INTERVAL_MIN = 30;

export async function syncGizmoSessions(): Promise<PollSummary> {
  const startedAt = Date.now();
  const summary: PollSummary = {
    activeNow: 0,
    newSessions: 0,
    endedSessions: 0,
    milestonesFired: 0,
    dailyLoginsAwarded: 0,
    errors: [],
    durationMs: 0,
  };

  let gizmoActive: GizmoUserSession[] = [];
  try {
    const client = getGizmoClient();
    // Pull *all* sessions, then filter by state. State 0 = active.
    const page = await client.sessions.list({ limit: 200, state: 0 });
    gizmoActive = page.data ?? [];
  } catch (err) {
    summary.errors.push(`gizmo-fetch: ${(err as Error).message}`);
    summary.durationMs = Date.now() - startedAt;
    return summary;
  }

  summary.activeNow = gizmoActive.length;

  // ── Local mirror ───────────────────────────────────────────
  const dbActive = await prisma.gizmoSession.findMany({
    where: { status: 'ACTIVE' },
    select: {
      id: true,
      sessionId: true,
      startTime: true,
      profile: {
        select: {
          gizmoUserId: true,
          player: { select: { userId: true } },
        },
      },
    },
  });

  const dbBySessionId = new Map(dbActive.map((s) => [s.sessionId, s]));
  const gizmoBySessionId = new Map(gizmoActive.map((s) => [String(s.id), s]));

  // ─────────────────────────────────────────────────────────
  // 1. New sessions: in Gizmo but not in DB
  // ─────────────────────────────────────────────────────────
  for (const gs of gizmoActive) {
    const sid = String(gs.id);
    if (dbBySessionId.has(sid)) continue;

    try {
      const linked = await linkGizmoUser({ gizmoUserId: gs.userId });

      // Get/create GizmoProfile to attach the session to
      const profile = await prisma.gizmoProfile.findUnique({
        where: { gizmoUserId: gs.userId },
        select: { id: true },
      });
      if (!profile) {
        summary.errors.push(`session-${sid}: profile missing for gizmo user ${gs.userId}`);
        continue;
      }

      // Mirror the session in DB
      const startTime = new Date(); // Gizmo doesn't return a startTime in this shape
      const dbSession = await prisma.gizmoSession.create({
        data: {
          profileId: profile.id,
          sessionId: sid,
          computerName: `PC-${gs.hostId}`,
          startTime,
          status: 'ACTIVE',
        },
        select: { id: true, startTime: true },
      });

      // Fire SESSION_STARTED (audit only — no rewards)
      await dispatchEvent({
        userId: linked.userId,
        externalId: `gizmo_session:${sid}:start`,
        event: {
          type: 'SESSION_STARTED',
          data: {
            gizmoSessionId: gs.id,
            localSessionId: dbSession.id,
            gizmoUserId: gs.userId,
            hostId: gs.hostId,
            startedAt: dbSession.startTime.toISOString(),
          },
        },
      });

      // Fire DAILY_LOGIN (the actual reward event for first session of the day)
      const dailyResult = await dispatchEvent({
        userId: linked.userId,
        externalId: `daily_login:${linked.userId}:${dateKey(new Date())}`,
        event: {
          type: 'DAILY_LOGIN',
          data: {
            date: dateKey(new Date()),
            gizmoSessionId: gs.id,
            hostId: gs.hostId,
            isFirstEverLogin: linked.isShadow,
          },
        },
      });

      if (dailyResult.processed) summary.dailyLoginsAwarded++;
      summary.newSessions++;
    } catch (err) {
      summary.errors.push(`new-session-${sid}: ${(err as Error).message}`);
    }
  }

  // ─────────────────────────────────────────────────────────
  // 2. Ended sessions: in DB but not in Gizmo
  // ─────────────────────────────────────────────────────────
  for (const dbs of dbActive) {
    if (gizmoBySessionId.has(dbs.sessionId)) continue;

    const userId = dbs.profile?.player?.userId;
    const gizmoUserId = dbs.profile?.gizmoUserId;
    if (!userId || !gizmoUserId) {
      summary.errors.push(`end-session-${dbs.sessionId}: no linked user`);
      continue;
    }

    try {
      const endedAt = new Date();
      const durationMin = Math.max(
        0,
        Math.round((endedAt.getTime() - dbs.startTime.getTime()) / 60000),
      );

      await prisma.gizmoSession.update({
        where: { id: dbs.id },
        data: {
          status: 'COMPLETED',
          endTime: endedAt,
          duration: durationMin,
        },
      });

      await dispatchEvent({
        userId,
        externalId: `gizmo_session:${dbs.sessionId}:end`,
        event: {
          type: 'SESSION_ENDED',
          data: {
            gizmoSessionId: Number(dbs.sessionId),
            localSessionId: dbs.id,
            gizmoUserId,
            hostId: 0,
            durationMinutes: durationMin,
            startedAt: dbs.startTime.toISOString(),
            endedAt: endedAt.toISOString(),
          },
        },
      });
      summary.endedSessions++;
    } catch (err) {
      summary.errors.push(`end-session-${dbs.sessionId}: ${(err as Error).message}`);
    }
  }

  // ─────────────────────────────────────────────────────────
  // 3. Hour milestones for sessions that are still active
  // ─────────────────────────────────────────────────────────
  for (const gs of gizmoActive) {
    const sid = String(gs.id);
    const dbs = dbBySessionId.get(sid);
    if (!dbs) continue;

    const userId = dbs.profile?.player?.userId;
    if (!userId) continue;

    const elapsedMin = Math.floor((Date.now() - dbs.startTime.getTime()) / 60000);
    const milestonesReached = Math.floor(elapsedMin / MILESTONE_INTERVAL_MIN);

    for (let n = 1; n <= milestonesReached; n++) {
      try {
        const res = await dispatchEvent({
          userId,
          externalId: `gizmo_session:${sid}:milestone:${n}`,
          event: {
            type: 'HOUR_MILESTONE',
            data: {
              gizmoSessionId: gs.id,
              hourNumber: n,
              cumulativeMinutes: n * MILESTONE_INTERVAL_MIN,
            },
          },
        });
        if (res.processed) summary.milestonesFired++;
      } catch (err) {
        summary.errors.push(
          `milestone-${sid}-${n}: ${(err as Error).message}`,
        );
      }
    }
  }

  summary.durationMs = Date.now() - startedAt;
  return summary;
}

function dateKey(d: Date): string {
  return d.toISOString().slice(0, 10); // YYYY-MM-DD
}
