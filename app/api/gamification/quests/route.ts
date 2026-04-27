// GET /api/gamification/quests
// Kullanıcının aktif görev listesi + kendi ilerlemeleri
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const userId = (session.user as any).id;

  const typeFilter = req.nextUrl.searchParams.get('type'); // daily | weekly | special
  const now = new Date();

  const tasks = await prisma.gamificationTask.findMany({
    where: {
      isActive: true,
      ...(typeFilter && { type: typeFilter }),
      startDate: { lte: now },
      OR: [{ endDate: null }, { endDate: { gte: now } }],
    },
    orderBy: [{ type: 'asc' }, { difficulty: 'asc' }],
    include: {
      completions: {
        where: { userId },
        select: {
          progress: true,
          completed: true,
          completedAt: true,
          xpClaimed: true,
          creditsClaimed: true,
        },
      },
    },
  });

  // Reshape: per-task progress for this user
  const data = tasks.map((task) => {
    const completion = task.completions[0];
    const progress = completion?.progress ?? 0;
    const completed = completion?.completed ?? false;
    return {
      id: task.id,
      title: task.title,
      description: task.description,
      icon: task.icon,
      type: task.type,
      difficulty: task.difficulty,
      category: task.category,
      target: task.target,
      targetValue: task.targetValue,
      xpReward: task.xpReward,
      creditsReward: task.creditsReward,
      isRepeatable: task.isRepeatable,
      progress,
      progressPercent: Math.min(
        100,
        Math.round((progress / Math.max(1, task.targetValue)) * 100),
      ),
      completed,
      completedAt: completion?.completedAt ?? null,
    };
  });

  // Group by type for easier rendering
  const grouped = {
    daily: data.filter((t) => t.type === 'daily'),
    weekly: data.filter((t) => t.type === 'weekly'),
    special: data.filter((t) => t.type === 'special'),
    other: data.filter((t) => !['daily', 'weekly', 'special'].includes(t.type)),
  };

  return NextResponse.json({ success: true, data, grouped });
}
