// ============================================================
// Quest Handler (GamificationTask + TaskCompletion)
// ============================================================
// When an event fires, find any active tasks whose `target` matches
// the event type and increment their progress. If progress reaches
// targetValue, mark complete and award XP/coin via the dispatcher.

import type { Prisma } from '@prisma/client';
import type { EventPayload } from '../types';

export interface QuestResult {
  questsCompleted: string[];        // GamificationTask ids
  questsProgressed: string[];        // ids whose progress moved but didn't complete
}

/**
 * Map event types to GamificationTask.target values.
 * Admin defines tasks with these target keys; we increment matching ones.
 */
function targetForEvent(event: EventPayload): string | null {
  switch (event.type) {
    case 'DAILY_LOGIN':           return 'daily_login';
    case 'SESSION_ENDED':         return 'session_minutes';
    case 'HOUR_MILESTONE':        return 'session_milestones';
    case 'SPEND':                 return 'spend_try';
    case 'RESERVATION_COMPLETED': return 'reservation';
    case 'MATCH_ENDED':           return event.data.won ? 'match_won' : 'match_played';
    case 'MATCH_EVENT':           return `match_event:${event.data.eventName.toLowerCase()}`;
    default:                      return null;
  }
}

/** How much progress to add for this event (typically 1, but session minutes add many). */
function progressDelta(event: EventPayload): number {
  switch (event.type) {
    case 'SESSION_ENDED':
      return event.data.durationMinutes;
    case 'SPEND':
      return Math.floor(event.data.amountTRY);
    default:
      return 1;
  }
}

export async function processQuests(
  tx: Prisma.TransactionClient,
  params: {
    userId: string;
    event: EventPayload;
  },
): Promise<QuestResult> {
  const target = targetForEvent(params.event);
  const delta = progressDelta(params.event);
  const completed: string[] = [];
  const progressed: string[] = [];

  if (!target || delta <= 0) {
    return { questsCompleted: [], questsProgressed: [] };
  }

  // ── Find active matching tasks ───────────────────────────────
  const now = new Date();
  const tasks = await tx.gamificationTask.findMany({
    where: {
      target,
      isActive: true,
      startDate: { lte: now },
      OR: [{ endDate: null }, { endDate: { gte: now } }],
    },
    select: { id: true, targetValue: true, isRepeatable: true },
  });

  for (const task of tasks) {
    // ── Find or create user's TaskCompletion row ─────────────
    const existing = await tx.taskCompletion.findUnique({
      where: { userId_taskId: { userId: params.userId, taskId: task.id } },
      select: { id: true, progress: true, completed: true },
    });

    // Skip already-completed non-repeatable tasks
    if (existing?.completed && !task.isRepeatable) continue;

    const newProgress = (existing?.progress ?? 0) + delta;
    const isComplete = newProgress >= task.targetValue;

    if (existing) {
      await tx.taskCompletion.update({
        where: { id: existing.id },
        data: {
          progress: newProgress,
          ...(isComplete && !existing.completed && {
            completed: true,
            completedAt: now,
          }),
          // For repeatable tasks that just completed: reset progress for the next round
          ...(isComplete && task.isRepeatable && {
            progress: 0,
            completed: false,
            completedAt: null,
          }),
        },
      });
    } else {
      await tx.taskCompletion.create({
        data: {
          userId: params.userId,
          taskId: task.id,
          progress: isComplete ? (task.isRepeatable ? 0 : newProgress) : newProgress,
          completed: isComplete && !task.isRepeatable,
          completedAt: isComplete && !task.isRepeatable ? now : null,
        },
      });
    }

    if (isComplete) completed.push(task.id);
    else progressed.push(task.id);
  }

  return { questsCompleted: completed, questsProgressed: progressed };
}
