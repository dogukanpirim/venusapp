// ============================================================
// Central Event Dispatcher
// ============================================================
// Single entry point for ALL gamification events.
// Called by:
//   - Gizmo poller (session start/end, daily login, hour milestone)
//   - Overwolf routes (match-event, match-end)
//   - Admin actions (manual grant, challenge approval)
//   - Lootbox / store routes (audit-only events)
//
// Guarantees:
//   - Idempotency: same externalId is processed at most once.
//   - Atomicity: all DB writes for an event happen in one transaction.
//   - Isolation: a handler error doesn't poison other events.

import type { PrismaClient } from '@prisma/client';
import { prisma } from '@/lib/db';
import { getGizmoClient } from '@/lib/gizmo/client';

import {
  type DispatchInput,
  type DispatchResult,
  type EventPayload,
} from './types';
import { reserveEvent, recordEventResult, DuplicateEventError } from './idempotency';
import { SILENT_EVENTS } from './config';

import { calculateXP, applyXP } from './handlers/xp';
import { calculateCoin, applyCoin } from './handlers/coin';
import { processDailyLogin, countTodayMilestones } from './handlers/streak';
import { processQuests } from './handlers/quest';
import { processChallenges } from './handlers/challenge';
import {
  grantLootboxes,
  lootboxesForStreak,
  lootboxesForLevelUp,
} from './handlers/lootbox';
import { updateStats } from './handlers/stats';
import { COIN_RULES } from './config';

// ─── Public API ──────────────────────────────────────────────

/**
 * Dispatch a gamification event.
 *
 * Flow:
 *   1. Reserve externalId in ProcessedEvent (atomic; throws if duplicate).
 *   2. Run all handlers inside a Prisma transaction.
 *   3. If transaction succeeds: optionally fire-and-forget Gizmo points sync.
 *   4. Record final result on the ProcessedEvent row.
 *
 * Errors inside individual handlers are swallowed — they go into `warnings`
 * so a single broken handler doesn't lose the rest of the event.
 */
export async function dispatchEvent(input: DispatchInput): Promise<DispatchResult> {
  const { userId, event, externalId } = input;

  const result: DispatchResult = {
    processed: false,
    effects: {
      xpAwarded: 0,
      coinAwarded: 0,
      lootboxesGranted: 0,
      achievementsUnlocked: [],
      questsCompleted: [],
      challengesCompleted: [],
    },
    warnings: [],
  };

  // ── 1. Reserve idempotency slot ────────────────────────────
  let processedEventId: string;
  try {
    const reservation = await reserveEvent(prisma, {
      externalId,
      eventType: event.type,
      userId,
      payload: event.data,
    });
    processedEventId = reservation.id;
  } catch (err) {
    if (err instanceof DuplicateEventError) {
      return { ...result, processed: false, duplicateOf: externalId };
    }
    throw err;
  }

  // ── 2. Run handlers in a transaction ───────────────────────
  let levelUp: { previous: number; current: number } | undefined;
  let streakUpdate: { previous: number; current: number } | undefined;

  try {
    await prisma.$transaction(async (tx) => {
      // Skip rewards entirely for silent events
      if (SILENT_EVENTS.has(event.type)) {
        return;
      }

      // ─── Handler: Daily Login (must run first — affects coin amount) ─
      if (event.type === 'DAILY_LOGIN') {
        try {
          const streak = await processDailyLogin(tx, {
            userId,
            payload: event.data,
          });

          if (streak.alreadyCountedToday) {
            // Don't re-award coin/XP for repeated DAILY_LOGIN today
            return;
          }

          streakUpdate = {
            previous: streak.previousStreak,
            current: streak.streakDays,
          };

          // Each milestone hit triggers its own STREAK_MILESTONE event
          // post-transaction (via the "post-effects" stage below).
          (result as any)._pendingMilestones = streak.milestonesHit;
        } catch (err) {
          result.warnings.push(`streak: ${(err as Error).message}`);
        }
      }

      // ─── Handler: Hour Milestone daily cap ─
      if (event.type === 'HOUR_MILESTONE') {
        try {
          const todayCount = await countTodayMilestones(tx, userId);
          if (todayCount >= COIN_RULES.MAX_MILESTONES_PER_DAY) {
            // Cap reached — silently skip rewards
            return;
          }
        } catch (err) {
          result.warnings.push(`milestone-cap: ${(err as Error).message}`);
        }
      }

      // ─── Handler: XP ─
      try {
        const xpAmount = calculateXP(event);
        const xpRes = await applyXP(tx, userId, xpAmount);
        result.effects.xpAwarded = xpRes.xpAwarded;
        levelUp = xpRes.levelUp;
      } catch (err) {
        result.warnings.push(`xp: ${(err as Error).message}`);
      }

      // ─── Handler: Coin ─
      try {
        const coinAmount = calculateCoin(event);
        const coinRes = await applyCoin(tx, {
          userId,
          amount: coinAmount,
          event,
          externalId,
        });
        result.effects.coinAwarded = coinRes.coinAwarded;
      } catch (err) {
        result.warnings.push(`coin: ${(err as Error).message}`);
      }

      // ─── Handler: Lootbox grants from level-up ─
      try {
        if (levelUp) {
          const boxes = lootboxesForLevelUp(levelUp.previous, levelUp.current);
          if (boxes > 0) {
            await grantLootboxes(tx, userId, boxes, `level_up:${levelUp.current}`);
            result.effects.lootboxesGranted += boxes;
          }
        }
      } catch (err) {
        result.warnings.push(`lootbox-levelup: ${(err as Error).message}`);
      }

      // ─── Handler: Quests (daily/weekly tasks) ─
      try {
        const q = await processQuests(tx, { userId, event });
        result.effects.questsCompleted = q.questsCompleted;
      } catch (err) {
        result.warnings.push(`quest: ${(err as Error).message}`);
      }

      // ─── Handler: Auto Challenges ─
      try {
        const c = await processChallenges(tx, { userId, event });
        result.effects.challengesCompleted = c.challengesCompleted;
      } catch (err) {
        result.warnings.push(`challenge: ${(err as Error).message}`);
      }

      // ─── Handler: Stats Rollup ─
      try {
        await updateStats(tx, { userId, event });
      } catch (err) {
        result.warnings.push(`stats: ${(err as Error).message}`);
      }
    });

    result.processed = true;
    result.effects.levelUp = levelUp;
    result.effects.streakUpdate = streakUpdate;
  } catch (err) {
    // Transaction failed. The ProcessedEvent row still exists, but with
    // errorMessage set so we can replay/diagnose later.
    await recordEventResult(prisma, processedEventId, {
      xpAwarded: 0,
      coinAwarded: 0,
      lootboxesGranted: 0,
      errorMessage: (err as Error).message,
    });
    throw err;
  }

  // ── 3. Persist effects on ProcessedEvent ─────────────────
  await recordEventResult(prisma, processedEventId, {
    xpAwarded: result.effects.xpAwarded,
    coinAwarded: result.effects.coinAwarded,
    lootboxesGranted: result.effects.lootboxesGranted,
    summary: result.effects,
  });

  // ── 4. Cascade: streak milestones → fire one event each ──
  const pendingMilestones: number[] | undefined = (result as any)._pendingMilestones;
  if (pendingMilestones && pendingMilestones.length > 0) {
    for (const days of pendingMilestones) {
      try {
        const milestoneRes = await dispatchEvent({
          userId,
          event: {
            type: 'STREAK_MILESTONE',
            data: { streakDays: days, achievedDate: new Date().toISOString() },
          },
          externalId: `streak:${userId}:${days}`,
        });
        result.effects.coinAwarded += milestoneRes.effects.coinAwarded;
        result.effects.lootboxesGranted += milestoneRes.effects.lootboxesGranted;
      } catch (err) {
        result.warnings.push(`streak-milestone-${days}: ${(err as Error).message}`);
      }
    }
    delete (result as any)._pendingMilestones;
  }

  // ── 5. Streak milestone bonus lootbox (in this same call) ─
  if (event.type === 'STREAK_MILESTONE') {
    try {
      const boxes = lootboxesForStreak(event.data.streakDays);
      if (boxes > 0) {
        await prisma.user.update({
          where: { id: userId },
          data: { lootboxBalance: { increment: boxes } },
        });
        result.effects.lootboxesGranted += boxes;
      }
    } catch (err) {
      result.warnings.push(`streak-lootbox: ${(err as Error).message}`);
    }
  }

  // ── 6. Best-effort Gizmo points sync (post-commit, no await) ─
  if (result.effects.coinAwarded > 0) {
    syncCoinToGizmo(userId, result.effects.coinAwarded).catch(() => {
      // swallow — sync is best-effort, ledger is source of truth
    });
  }

  return result;
}

// ─── Background: Sync coin grant to Gizmo as points transaction ─

async function syncCoinToGizmo(userId: string, amount: number): Promise<void> {
  if (amount === 0) return;
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { gizmoUserId: true },
    });
    if (!user?.gizmoUserId) return;

    const client = getGizmoClient();
    const isAdd = amount > 0;
    const result = await (isAdd
      ? client.points.add(user.gizmoUserId, Math.abs(amount))
      : client.points.subtract(user.gizmoUserId, Math.abs(amount)));

    // Update most recent unsynced CoinTransaction
    const tx = await prisma.coinTransaction.findFirst({
      where: { userId, syncedToGizmo: false },
      orderBy: { createdAt: 'desc' },
    });
    if (tx) {
      await prisma.coinTransaction.update({
        where: { id: tx.id },
        data: {
          syncedToGizmo: true,
          syncedAt: new Date(),
          gizmoTransactionId: result.id,
        },
      });
    }
  } catch (err) {
    console.warn('[dispatcher] Gizmo sync failed (non-fatal):', (err as Error).message);
  }
}

// ─── Re-export types for consumer convenience ────────────────
export type {
  EventPayload,
  EventType,
  DispatchInput,
  DispatchResult,
} from './types';
