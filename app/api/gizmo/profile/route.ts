
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
      include: {
        gizmoProfile: {
          include: {
            sessions: {
              take: 10,
              orderBy: { startTime: 'desc' },
            },
            transactions: {
              take: 20,
              orderBy: { createdAt: 'desc' },
            },
            activities: {
              take: 50,
              orderBy: { timestamp: 'desc' },
            },
          },
        },
      },
    });

    if (!player?.gizmoProfile) {
      return NextResponse.json({ error: 'Gizmo profile not found' }, { status: 404 });
    }

    return NextResponse.json({ profile: player.gizmoProfile });
  } catch (error) {
    console.error('Gizmo profile error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
