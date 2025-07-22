
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
    const status = searchParams.get('status');

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

    if (status) {
      whereClause.status = status;
    }

    const sessions = await prisma.gizmoSession.findMany({
      where: whereClause,
      orderBy: { startTime: 'desc' },
      take: limit,
      skip: offset,
      include: {
        activities: {
          orderBy: { timestamp: 'desc' },
          take: 5,
        },
      },
    });

    const totalSessions = await prisma.gizmoSession.count({
      where: whereClause,
    });

    return NextResponse.json({
      sessions,
      pagination: {
        total: totalSessions,
        limit,
        offset,
        hasMore: offset + limit < totalSessions,
      },
    });
  } catch (error) {
    console.error('Gizmo sessions error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
