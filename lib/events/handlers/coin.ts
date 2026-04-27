// ============================================================
// Coin Handler
// ============================================================
// Calculates coins for an event, writes CoinTransaction with
// running balance, updates User.coinBalance, and queues a sync
// to Gizmo /pointstransactions (best-effort).

import type { Prisma } from '@prisma/client';
import type { EventPayload } from '../types';
import { COIN_RULES } from '../config';

export interface CoinResult {
  coinAwarded: number;
  balanceBefore: number;
  balanceAfter: number;
  transactionId: string | null;
}

/** Calculate coin amount based on event. */
export function calculateCoin(event: EventPayload): number {
  switch (event.type) {
    case 'DAILY_LOGIN':
      return COIN_RULES.DAILY_LOGIN_BASE;

    case 'STREAK_MILESTONE':
      return COIN_RULES.STREAK_BONUSES[event.data.streakDays] ?? 0;

    case 'SESSION_ENDED': {
      const minutes = Math.max(0, event.data.durationMinutes);
      const earned = Math.round(minutes * COIN_RULES.COIN_PER_MINUTE);
      return Math.min(earned, COIN_RULES.MAX_COIN_PER_SESSION);
    }

    case 'HOUR_MILESTONE':
      return COIN_RULES.HOUR_MILESTONE_COIN;

    case 'SPEND': {
      // 1 coin per X TRY; capped by daily limit (enforced at apply-time)
      return Math.floor(event.data.amountTRY / COIN_RULES.TRY_PER_COIN);
    }

    case 'RESERVATION_COMPLETED':
      return COIN_RULES.RESERVATION_COMPLETED;

    case 'MATCH_ENDED': {
      if (!event.data.won) return 0;
      let c = COIN_RULES.MATCH_WIN;
      if (event.data.mvp) c += COIN_RULES.MATCH_MVP_BONUS;
      return c;
    }

    case 'MATCH_EVENT': {
      if (event.data.eventName === 'ACE') return COIN_RULES.MATCH_ACE_BONUS;
      if (event.data.eventName === 'CLUTCH') return COIN_RULES.MATCH_CLUTCH_BONUS;
      return 0;
    }

    case 'ADMIN_GRANT':
      return event.data.coins ?? 0;

    case 'CHALLENGE_APPROVED':
      // Coins for challenges are configured per-challenge; default: 0
      return 0;

    case 'SESSION_STARTED':
    case 'DEPOSIT':
    case 'MATCH_STARTED':
    case 'LOOTBOX_OPENED':
      return 0;

    default:
      return 0;
  }
}

/**
 * Map event types to CoinTransaction.source values.
 * Used for analytics / admin filtering.
 */
function sourceFor(event: EventPayload): string {
  switch (event.type) {
    case 'DAILY_LOGIN':            return 'daily_login';
    case 'STREAK_MILESTONE':       return 'streak';
    case 'SESSION_ENDED':          return 'session_duration';
    case 'HOUR_MILESTONE':         return 'session_milestone';
    case 'SPEND':                  return 'spend';
    case 'RESERVATION_COMPLETED':  return 'reservation';
    case 'MATCH_ENDED':            return 'match_win';
    case 'MATCH_EVENT':            return 'match_event';
    case 'CHALLENGE_APPROVED':     return 'challenge';
    case 'ADMIN_GRANT':            return 'admin';
    default:                       return 'other';
  }
}

/**
 * Apply coin grant atomically inside the dispatch transaction.
 * Writes CoinTransaction, updates User.coinBalance, returns result.
 *
 * Gizmo sync is intentionally NOT awaited here — the dispatcher
 * fires it as best-effort after the transaction commits.
 */
export async function applyCoin(
  tx: Prisma.TransactionClient,
  params: {
    userId: string;
    amount: number;
    event: EventPayload;
    externalId: string;
  },
): Promise<CoinResult> {
  const { userId, amount, event, externalId } = params;

  if (amount === 0) {
    const u = await tx.user.findUnique({
      where: { id: userId },
      select: { coinBalance: true },
    });
    return {
      coinAwarded: 0,
      balanceBefore: u?.coinBalance ?? 0,
      balanceAfter: u?.coinBalance ?? 0,
      transactionId: null,
    };
  }

  // ── Daily spend cap check ──────────────────────────────────
  if (event.type === 'SPEND' && amount > 0) {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todaySum = await tx.coinTransaction.aggregate({
      where: {
        userId,
        source: 'spend',
        createdAt: { gte: todayStart },
      },
      _sum: { amount: true },
    });
    const alreadyEarned = todaySum._sum.amount ?? 0;
    const remaining = Math.max(0, COIN_RULES.MAX_SPEND_COIN_PER_DAY - alreadyEarned);
    if (remaining === 0) {
      return {
        coinAwarded: 0,
        balanceBefore: 0,
        balanceAfter: 0,
        transactionId: null,
      };
    }
    if (amount > remaining) {
      params = { ...params, amount: remaining };
    }
  }

  const finalAmount = params.amount;

  const user = await tx.user.findUnique({
    where: { id: userId },
    select: { coinBalance: true },
  });

  if (!user) {
    return { coinAwarded: 0, balanceBefore: 0, balanceAfter: 0, transactionId: null };
  }

  const before = user.coinBalance;
  const after = before + finalAmount;

  await tx.user.update({
    where: { id: userId },
    data: { coinBalance: after },
  });

  const ledger = await tx.coinTransaction.create({
    data: {
      userId,
      type: finalAmount >= 0 ? 'EARN' : 'SPEND',
      amount: Math.abs(finalAmount),
      balanceAfter: after,
      source: sourceFor(event),
      sourceId: getSourceId(event),
      description: getDescription(event),
      // Tag the ledger with the same externalId — second layer of dedup,
      // even if ProcessedEvent ever gets pruned.
      externalId: `coin:${externalId}`,
    },
    select: { id: true },
  });

  return {
    coinAwarded: finalAmount,
    balanceBefore: before,
    balanceAfter: after,
    transactionId: ledger.id,
  };
}

function getSourceId(event: EventPayload): string | null {
  switch (event.type) {
    case 'SESSION_ENDED':
    case 'HOUR_MILESTONE':
    case 'SESSION_STARTED':
      return String(event.data.gizmoSessionId);
    case 'SPEND':
      return String(event.data.gizmoInvoiceId);
    case 'DEPOSIT':
      return String(event.data.gizmoTransactionId);
    case 'RESERVATION_COMPLETED':
      return String(event.data.gizmoReservationId);
    case 'MATCH_ENDED':
    case 'MATCH_EVENT':
    case 'MATCH_STARTED':
      return event.data.matchId;
    case 'CHALLENGE_APPROVED':
      return event.data.challengeId;
    default:
      return null;
  }
}

function getDescription(event: EventPayload): string {
  switch (event.type) {
    case 'DAILY_LOGIN':
      return 'Günlük giriş bonusu';
    case 'STREAK_MILESTONE':
      return `${event.data.streakDays} gün seri ödülü`;
    case 'SESSION_ENDED':
      return `${event.data.durationMinutes} dakika oyun`;
    case 'HOUR_MILESTONE':
      return `${event.data.cumulativeMinutes} dakika oyun ödülü`;
    case 'SPEND':
      return `Cafe harcaması (${event.data.amountTRY} TL)`;
    case 'RESERVATION_COMPLETED':
      return 'Tamamlanan rezervasyon';
    case 'MATCH_ENDED':
      return event.data.won ? `Maç kazanıldı (${event.data.gameTitle})` : '';
    case 'MATCH_EVENT':
      return `${event.data.eventName} (${event.data.gameTitle})`;
    case 'CHALLENGE_APPROVED':
      return 'Onaylanan görev';
    case 'ADMIN_GRANT':
      return event.data.reason || 'Admin ödülü';
    default:
      return '';
  }
}
