
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

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');
    const type = searchParams.get('type');

    const player = await prisma.player.findFirst({
      where: { userId: (session.user as any).id },
      include: { gizmoProfile: true },
    });

    if (!player?.gizmoProfile) {
      return NextResponse.json({ error: 'Gizmo profile not found' }, { status: 404 });
    }

    const whereClause: any = {
      profileId: player.gizmoProfile.id,
    };

    if (type) {
      whereClause.type = type;
    }

    const transactions = await prisma.gizmoTransaction.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
    });

    const totalTransactions = await prisma.gizmoTransaction.count({
      where: whereClause,
    });

    // Calculate summary stats
    const summary = await prisma.gizmoTransaction.aggregate({
      where: { profileId: player.gizmoProfile.id },
      _sum: {
        amount: true,
      },
      _count: {
        id: true,
      },
    });

    return NextResponse.json({
      transactions,
      summary: {
        totalAmount: summary._sum.amount || 0,
        totalCount: summary._count.id || 0,
      },
      pagination: {
        total: totalTransactions,
        limit,
        offset,
        hasMore: offset + limit < totalTransactions,
      },
    });
  } catch (error) {
    console.error('Gizmo transactions error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
