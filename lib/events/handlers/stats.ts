// ============================================================
// Stats Handler
// ============================================================
// Updates GizmoProfile rollups (totalPlayTime, totalSessions, etc.)
// when sessions end. Keeps the profile dashboard data fresh.

import type { Prisma } from '@prisma/client';
import type { EventPayload } from '../types';

export async function updateStats(
  tx: Prisma.TransactionClient,
  params: {
    userId: string;
    event: EventPayload;
  },
): Promise<void> {
  const { userId, event } = params;

  // Only SESSION_ENDED rolls up time/session counts
  if (event.type !== 'SESSION_ENDED') return;

  const player = await tx.player.findUnique({
    where: { userId },
    select: { id: true },
  });
  if (!player) return;

  const profile = await tx.gizmoProfile.findUnique({
    where: { playerId: player.id },
    select: {
      id: true,
      totalPlayTime: true,
      totalSessions: true,
    },
  });
  if (!profile) return;

  const newTotalPlayTime = profile.totalPlayTime + event.data.durationMinutes;
  const newTotalSessions = profile.totalSessions + 1;
  const newAverage = newTotalSessions > 0 ? newTotalPlayTime / newTotalSessions : 0;

  await tx.gizmoProfile.update({
    where: { id: profile.id },
    data: {
      totalPlayTime: newTotalPlayTime,
      totalSessions: newTotalSessions,
      averageSession: newAverage,
      lastActiveDate: new Date(),
    },
  });
}
