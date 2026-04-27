// ============================================================
// Idempotency Layer
// ============================================================
// Wraps Prisma's unique constraint on ProcessedEvent.externalId
// to give a clean "already processed?" check.

import type { Prisma, PrismaClient } from '@prisma/client';

export class DuplicateEventError extends Error {
  constructor(public externalId: string) {
    super(`Event already processed: ${externalId}`);
    this.name = 'DuplicateEventError';
  }
}

/**
 * Atomically reserve an externalId for processing.
 * Throws DuplicateEventError if already taken.
 *
 * This is a "lock-by-insert" — Prisma's unique constraint
 * on externalId ensures only one caller wins.
 */
export async function reserveEvent(
  tx: Prisma.TransactionClient | PrismaClient,
  params: {
    externalId: string;
    eventType: string;
    userId: string | null;
    payload: unknown;
  },
): Promise<{ id: string }> {
  try {
    const row = await tx.processedEvent.create({
      data: {
        externalId: params.externalId,
        eventType: params.eventType,
        userId: params.userId,
        payload: JSON.stringify(params.payload),
      },
      select: { id: true },
    });
    return row;
  } catch (err) {
    // P2002 = Prisma unique constraint violation
    if (
      err &&
      typeof err === 'object' &&
      'code' in err &&
      (err as { code: string }).code === 'P2002'
    ) {
      throw new DuplicateEventError(params.externalId);
    }
    throw err;
  }
}

/**
 * Update the ProcessedEvent row with handler results.
 * Called at end of dispatch to record what happened.
 */
export async function recordEventResult(
  tx: Prisma.TransactionClient | PrismaClient,
  processedEventId: string,
  result: {
    xpAwarded: number;
    coinAwarded: number;
    lootboxesGranted: number;
    summary?: unknown;
    errorMessage?: string | null;
  },
): Promise<void> {
  await tx.processedEvent.update({
    where: { id: processedEventId },
    data: {
      xpAwarded: result.xpAwarded,
      coinAwarded: result.coinAwarded,
      lootboxesGranted: result.lootboxesGranted,
      result: result.summary ? JSON.stringify(result.summary) : null,
      errorMessage: result.errorMessage ?? null,
    },
  });
}
