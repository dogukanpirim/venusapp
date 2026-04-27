// GET /api/gamification/me
// Tek istekle kullanıcının cüzdan görüntüsü:
//   - coin balance + bugün kazanılan coin
//   - XP + seviye + bir sonraki seviyeye kalan XP
//   - streak (current + longest)
//   - lootbox sayısı
//   - bugünkü işlemler özeti
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { levelFromXP, xpRequiredForLevel } from '@/lib/events/config';

export const dynamic = 'force-dynamic';

export async function GET(_req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const userId = (session.user as any).id;

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const [user, player, todayCoinSum, recentTx, todayLogin] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: {
        coinBalance: true,
        lootboxBalance: true,
        totalLootboxesOpened: true,
        gizmoUserId: true,
      },
    }),
    prisma.player.findUnique({
      where: { userId },
      select: {
        totalPoints: true,
        currentStreak: true,
        longestStreak: true,
        currentRank: true,
        gamertag: true,
      },
    }),
    prisma.coinTransaction.aggregate({
      where: { userId, type: 'EARN', createdAt: { gte: todayStart } },
      _sum: { amount: true },
      _count: true,
    }),
    prisma.coinTransaction.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: {
        id: true,
        type: true,
        amount: true,
        balanceAfter: true,
        source: true,
        description: true,
        createdAt: true,
      },
    }),
    prisma.dailyLogin.findUnique({
      where: {
        userId_date: {
          userId,
          date: new Date(new Date().toISOString().slice(0, 10)),
        },
      },
      select: { streakAtLogin: true, coinAwarded: true },
    }),
  ]);

  const totalXP = player?.totalPoints ?? 0;
  const level = levelFromXP(totalXP);
  const xpForCurrent = xpRequiredForLevel(level);
  const xpForNext = xpRequiredForLevel(level + 1);
  const xpInLevel = totalXP - xpForCurrent;
  const xpForLevelUp = xpForNext - xpForCurrent;
  const progress = xpForLevelUp > 0 ? Math.min(100, (xpInLevel / xpForLevelUp) * 100) : 0;

  return NextResponse.json({
    success: true,
    wallet: {
      coinBalance: user?.coinBalance ?? 0,
      lootboxBalance: user?.lootboxBalance ?? 0,
      totalLootboxesOpened: user?.totalLootboxesOpened ?? 0,
    },
    progression: {
      totalXP,
      level,
      xpInLevel,
      xpForLevelUp,
      progressToNextLevel: Math.round(progress * 10) / 10,
      rank: player?.currentRank ?? 'Bronze',
    },
    streak: {
      current: player?.currentStreak ?? 0,
      longest: player?.longestStreak ?? 0,
      checkedInToday: !!todayLogin,
    },
    today: {
      coinEarned: todayCoinSum._sum.amount ?? 0,
      transactionCount: todayCoinSum._count ?? 0,
    },
    gizmo: {
      linked: !!user?.gizmoUserId,
      gizmoUserId: user?.gizmoUserId ?? null,
    },
    recentTransactions: recentTx,
    user: {
      gamertag: player?.gamertag ?? null,
    },
  });
}
