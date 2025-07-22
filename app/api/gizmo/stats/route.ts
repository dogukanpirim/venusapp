
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const player = await prisma.player.findFirst({
      where: { userId: (session.user as any).id },
      include: { gizmoProfile: true },
    });

    if (!player?.gizmoProfile) {
      return NextResponse.json({ error: 'Gizmo profile not found' }, { status: 404 });
    }

    const profileId = player.gizmoProfile.id;

    // Get session statistics
    const sessionStats = await prisma.gizmoSession.aggregate({
      where: { profileId },
      _sum: {
        duration: true,
        finalCost: true,
      },
      _count: {
        id: true,
      },
      _avg: {
        duration: true,
      },
    });

    // Get recent activity counts by type
    const activityCounts = await prisma.gizmoActivity.groupBy({
      by: ['type'],
      where: {
        profileId,
        timestamp: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
        },
      },
      _count: {
        id: true,
      },
    });

    // Get transaction stats by type
    const transactionStats = await prisma.gizmoTransaction.groupBy({
      by: ['type'],
      where: { profileId },
      _sum: {
        amount: true,
      },
      _count: {
        id: true,
      },
    });

    // Get monthly usage for the last 6 months
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyUsage = await prisma.gizmoSession.findMany({
      where: {
        profileId,
        startTime: {
          gte: sixMonthsAgo,
        },
      },
      select: {
        startTime: true,
        duration: true,
        finalCost: true,
      },
      orderBy: {
        startTime: 'asc',
      },
    });

    // Group by month
    const monthlyStats = monthlyUsage.reduce((acc: any, session) => {
      const monthKey = session.startTime.toISOString().substr(0, 7); // YYYY-MM
      if (!acc[monthKey]) {
        acc[monthKey] = {
          month: monthKey,
          totalDuration: 0,
          totalCost: 0,
          sessionCount: 0,
        };
      }
      acc[monthKey].totalDuration += session.duration || 0;
      acc[monthKey].totalCost += session.finalCost || 0;
      acc[monthKey].sessionCount += 1;
      return acc;
    }, {});

    return NextResponse.json({
      sessionStats: {
        totalSessions: sessionStats._count.id || 0,
        totalPlayTime: sessionStats._sum.duration || 0,
        totalSpent: sessionStats._sum.finalCost || 0,
        averageSession: sessionStats._avg.duration || 0,
      },
      activityCounts,
      transactionStats,
      monthlyStats: Object.values(monthlyStats),
    });
  } catch (error) {
    console.error('Gizmo stats error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
