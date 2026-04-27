// ============================================================
// Lootbox Handler
// ============================================================
// Grants lootboxes (increments User.lootboxBalance) on triggers:
//  - streak milestones (7, 30, 100 days)
//  - level-ups (every 5 levels)
//  - first-ever login (welcome bonus)
//  - admin grants
//
// Does NOT open boxes — that's done by the user via /api/lootbox/open.

import type { Prisma } from '@prisma/client';
import { LOOTBOX_RULES } from '../config';

export interface LootboxResult {
  granted: number;
  reason: string | null;
}

/** Grant N lootboxes to a user. */
export async function grantLootboxes(
  tx: Prisma.TransactionClient,
  userId: string,
  count: number,
  reason: string,
): Promise<LootboxResult> {
  if (count <= 0) {
    return { granted: 0, reason: null };
  }

  await tx.user.update({
    where: { id: userId },
    data: { lootboxBalance: { increment: count } },
  });

  return { granted: count, reason };
}

/** How many boxes does a streak milestone grant? */
export function lootboxesForStreak(streakDays: number): number {
  return LOOTBOX_RULES.STREAK_LOOTBOX[streakDays] ?? 0;
}

/** Did this level-up cross a 5-level boundary? Returns box count. */
export function lootboxesForLevelUp(previousLevel: number, currentLevel: number): number {
  if (currentLevel <= previousLevel) return 0;
  const interval = LOOTBOX_RULES.LEVEL_UP_LOOTBOX_EVERY;
  // Count multiples of `interval` between previousLevel+1 and currentLevel inclusive
  const fromMultiple = Math.floor(previousLevel / interval) + 1;
  const toMultiple = Math.floor(currentLevel / interval);
  return Math.max(0, toMultiple - fromMultiple + 1);
}
