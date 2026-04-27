// ============================================================
// XP Handler
// ============================================================
// Computes XP for an event and applies it to Player.totalPoints.
// Also detects level-up.

import type { Prisma } from '@prisma/client';
import type { EventPayload } from '../types';
import { XP_RULES, levelFromXP } from '../config';

export interface XPResult {
  xpAwarded: number;
  totalXPBefore: number;
  totalXPAfter: number;
  levelUp?: { previous: number; current: number };
}

/** Calculate how much XP to grant based on the event payload. */
export function calculateXP(event: EventPayload): number {
  switch (event.type) {
    case 'DAILY_LOGIN':
      return XP_RULES.DAILY_LOGIN;

    case 'SESSION_ENDED': {
      const minutes = Math.max(0, event.data.durationMinutes);
      const earned = Math.round(minutes * XP_RULES.XP_PER_MINUTE);
      return Math.min(earned, XP_RULES.MAX_XP_PER_SESSION);
    }

    case 'HOUR_MILESTONE':
      return XP_RULES.HOUR_MILESTONE;

    case 'RESERVATION_COMPLETED':
      return XP_RULES.RESERVATION_COMPLETED;

    case 'CHALLENGE_APPROVED':
      return event.data.pointsReward ?? XP_RULES.CHALLENGE_APPROVED;

    case 'MATCH_ENDED': {
      let xp = event.data.won ? XP_RULES.MATCH_WIN : XP_RULES.MATCH_LOSS;
      if (event.data.mvp) xp += XP_RULES.MATCH_MVP_BONUS;
      // Per-event MATCH_EVENT handles kills/aces individually
      return xp;
    }

    case 'MATCH_EVENT':
      // Most match events emit fine-grained XP via PointsConfig
      // — handled separately. Default minimal XP here.
      return event.data.eventName === 'ACE' ? XP_RULES.MATCH_ACE_BONUS : 0;

    case 'ADMIN_GRANT':
      return event.data.xp ?? 0;

    // Silent / no-XP events
    case 'SESSION_STARTED':
    case 'STREAK_MILESTONE':         // streak gives coin, not XP
    case 'SPEND':
    case 'DEPOSIT':
    case 'MATCH_STARTED':
    case 'LOOTBOX_OPENED':
      return 0;

    default:
      return 0;
  }
}

/** Apply XP to Player.totalPoints and detect level-up. */
export async function applyXP(
  tx: Prisma.TransactionClient,
  userId: string,
  amount: number,
): Promise<XPResult> {
  if (amount <= 0) {
    const player = await tx.player.findUnique({
      where: { userId },
      select: { totalPoints: true },
    });
    const totalXP = player?.totalPoints ?? 0;
    return { xpAwarded: 0, totalXPBefore: totalXP, totalXPAfter: totalXP };
  }

  const player = await tx.player.findUnique({
    where: { userId },
    select: { totalPoints: true },
  });

  if (!player) {
    // No Player row — skip silently. Linker should create one for shadow accounts.
    return { xpAwarded: 0, totalXPBefore: 0, totalXPAfter: 0 };
  }

  const before = player.totalPoints;
  const after = before + amount;
  const levelBefore = levelFromXP(before);
  const levelAfter = levelFromXP(after);

  await tx.player.update({
    where: { userId },
    data: { totalPoints: after },
  });

  // Mirror to UserXP if the user has one (legacy — kept for backward compatibility)
  await tx.userXP.upsert({
    where: { userId },
    create: {
      userId,
      currentXP: amount,
      totalXP: amount,
      level: levelAfter,
    },
    update: {
      currentXP: { increment: amount },
      totalXP: { increment: amount },
      level: levelAfter,
    },
  });

  return {
    xpAwarded: amount,
    totalXPBefore: before,
    totalXPAfter: after,
    ...(levelAfter > levelBefore && {
      levelUp: { previous: levelBefore, current: levelAfter },
    }),
  };
}
