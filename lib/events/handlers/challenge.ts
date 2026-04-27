// ============================================================
// Challenge Handler
// ============================================================
// Increment ChallengeProgress for events that match an active
// AUTO challenge's target. Mirrors the existing logic that lived
// inline in /api/overwolf/match-event.

import type { Prisma } from '@prisma/client';
import type { EventPayload } from '../types';

export interface ChallengeResult {
  challengesCompleted: string[];   // Challenge ids
  challengesProgressed: string[];
}

/** Map an event into a target string that admins set on Challenge.target. */
function challengeTargetFor(event: EventPayload): string | null {
  switch (event.type) {
    case 'SESSION_ENDED':         return 'session_minutes';
    case 'DAILY_LOGIN':           return 'daily_login';
    case 'SPEND':                 return 'spend_try';
    case 'RESERVATION_COMPLETED': return 'reservation';
    case 'MATCH_ENDED':           return event.data.won ? 'match_won' : 'match_played';
    case 'MATCH_EVENT':           return `match_event:${event.data.eventName.toLowerCase()}`;
    default:                      return null;
  }
}

function deltaFor(event: EventPayload): number {
  if (event.type === 'SESSION_ENDED') return event.data.durationMinutes;
  if (event.type === 'SPEND')         return Math.floor(event.data.amountTRY);
  return 1;
}

export async function processChallenges(
  tx: Prisma.TransactionClient,
  params: {
    userId: string;
    event: EventPayload;
  },
): Promise<ChallengeResult> {
  const target = challengeTargetFor(params.event);
  const delta = deltaFor(params.event);
  const completed: string[] = [];
  const progressed: string[] = [];

  if (!target || delta <= 0) return { challengesCompleted: [], challengesProgressed: [] };

  // Resolve player from user
  const player = await tx.player.findUnique({
    where: { userId: params.userId },
    select: { id: true },
  });
  if (!player) return { challengesCompleted: [], challengesProgressed: [] };

  const now = new Date();
  const challenges = await tx.challenge.findMany({
    where: {
      category: 'AUTO',
      status: 'ACTIVE',
      target,
      startDate: { lte: now },
      endDate: { gte: now },
    },
    select: { id: true, targetValue: true, pointsReward: true },
  });

  for (const ch of challenges) {
    const existing = await tx.challengeProgress.findUnique({
      where: { challengeId_playerId: { challengeId: ch.id, playerId: player.id } },
      select: { id: true, progressValue: true, completed: true },
    });

    if (existing?.completed) continue;

    const newValue = (existing?.progressValue ?? 0) + delta;
    const isComplete = newValue >= ch.targetValue;

    if (existing) {
      await tx.challengeProgress.update({
        where: { id: existing.id },
        data: {
          progressValue: newValue,
          ...(isComplete && { completed: true }),
        },
      });
    } else {
      await tx.challengeProgress.create({
        data: {
          challengeId: ch.id,
          playerId: player.id,
          progressValue: newValue,
          targetValue: ch.targetValue,
          completed: isComplete,
        },
      });
    }

    if (isComplete) completed.push(ch.id);
    else progressed.push(ch.id);
  }

  return { challengesCompleted: completed, challengesProgressed: progressed };
}
