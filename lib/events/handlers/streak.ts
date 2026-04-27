// ============================================================
// Streak Handler
// ============================================================
// Reads user's previous DailyLogin to compute current streak.
// Creates today's DailyLogin row, updates Player.currentStreak.
// Returns whether a milestone was hit (3, 7, 14, 30, 100 days).

import type { Prisma } from '@prisma/client';
import type { EventPayload } from '../types';

export interface StreakResult {
  /** Was a daily login row created/found? Only meaningful for DAILY_LOGIN events. */
  isFirstLoginToday: boolean;

  /** Streak count after this login. */
  streakDays: number;

  /** Streak count before this login. */
  previousStreak: number;

  /** Was today already counted? (idempotency safety) */
  alreadyCountedToday: boolean;

  /** Days reached a milestone — caller should fire STREAK_MILESTONE for each. */
  milestonesHit: number[];
}

const STREAK_MILESTONES = [3, 7, 14, 30, 100, 365];

/** Process a DAILY_LOGIN event: compute streak, write DailyLogin row, update Player. */
export async function processDailyLogin(
  tx: Prisma.TransactionClient,
  params: {
    userId: string;
    payload: Extract<EventPayload, { type: 'DAILY_LOGIN' }>['data'];
  },
): Promise<StreakResult> {
  const { userId, payload } = params;
  const today = toCalendarDate(payload.date);

  // ── 1. Was today already counted? ──────────────────────────
  const existing = await tx.dailyLogin.findUnique({
    where: { userId_date: { userId, date: today } },
    select: { streakAtLogin: true },
  });
  if (existing) {
    return {
      isFirstLoginToday: false,
      streakDays: existing.streakAtLogin,
      previousStreak: existing.streakAtLogin,
      alreadyCountedToday: true,
      milestonesHit: [],
    };
  }

  // ── 2. Find the most recent prior login ────────────────────
  const previous = await tx.dailyLogin.findFirst({
    where: {
      userId,
      date: { lt: today },
    },
    orderBy: { date: 'desc' },
    select: { date: true, streakAtLogin: true },
  });

  // ── 3. Compute streak ──────────────────────────────────────
  let streak = 1;
  if (previous) {
    const yesterday = new Date(today);
    yesterday.setUTCDate(today.getUTCDate() - 1);
    const prevDate = toCalendarDate(previous.date);
    if (sameDay(prevDate, yesterday)) {
      streak = previous.streakAtLogin + 1;
    } else {
      streak = 1; // gap → reset
    }
  }

  // ── 4. Insert today's DailyLogin row ───────────────────────
  await tx.dailyLogin.create({
    data: {
      userId,
      date: today,
      streakAtLogin: streak,
      gizmoUserId: null,            // filled by caller if available
      hostId: payload.hostId,
    },
  });

  // ── 5. Sync streak to Player ───────────────────────────────
  const player = await tx.player.findUnique({
    where: { userId },
    select: { longestStreak: true },
  });
  if (player) {
    await tx.player.update({
      where: { userId },
      data: {
        currentStreak: streak,
        longestStreak: Math.max(player.longestStreak ?? 0, streak),
      },
    });
  }

  // ── 6. Detect milestones ───────────────────────────────────
  const previousStreakValue = previous?.streakAtLogin ?? 0;
  const milestonesHit = STREAK_MILESTONES.filter(
    (m) => streak >= m && previousStreakValue < m,
  );

  return {
    isFirstLoginToday: true,
    streakDays: streak,
    previousStreak: previousStreakValue,
    alreadyCountedToday: false,
    milestonesHit,
  };
}

/** Apply hour-milestone enforcement: how many milestones already paid today? */
export async function countTodayMilestones(
  tx: Prisma.TransactionClient,
  userId: string,
): Promise<number> {
  const todayStart = new Date();
  todayStart.setUTCHours(0, 0, 0, 0);
  const count = await tx.coinTransaction.count({
    where: {
      userId,
      source: 'session_milestone',
      createdAt: { gte: todayStart },
    },
  });
  return count;
}

// ─── Date helpers ────────────────────────────────────────────

function toCalendarDate(input: Date | string): Date {
  const d = typeof input === 'string' ? new Date(input) : input;
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
}

function sameDay(a: Date, b: Date): boolean {
  return (
    a.getUTCFullYear() === b.getUTCFullYear() &&
    a.getUTCMonth() === b.getUTCMonth() &&
    a.getUTCDate() === b.getUTCDate()
  );
}
