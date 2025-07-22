
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!(session?.user as any)?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { id: (session!.user as any).id }
    });

    if (!user?.isAdmin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const gameTitle = searchParams.get('gameTitle');

    const where = gameTitle ? { gameTitle: gameTitle as any } : {};

    const pointsConfigs = await prisma.pointsConfig.findMany({
      where,
      orderBy: [
        { gameTitle: 'asc' },
        { eventType: 'asc' }
      ]
    });

    return NextResponse.json({
      success: true,
      configs: pointsConfigs
    });

  } catch (error) {
    console.error('Points config fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch points configuration' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!(session?.user as any)?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { id: (session!.user as any).id }
    });

    if (!user?.isAdmin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const body = await req.json();
    const {
      gameTitle,
      eventType,
      basePoints,
      multiplier,
      minValue,
      maxPoints,
      cooldown,
      rankedMultiplier,
      competitiveMultiplier,
      casualMultiplier,
      isActive
    } = body;

    const pointsConfig = await prisma.pointsConfig.upsert({
      where: {
        gameTitle_eventType: {
          gameTitle,
          eventType
        }
      },
      update: {
        basePoints: basePoints || 0,
        multiplier: multiplier || 1.0,
        minValue,
        maxPoints,
        cooldown,
        rankedMultiplier: rankedMultiplier || 1.5,
        competitiveMultiplier: competitiveMultiplier || 1.2,
        casualMultiplier: casualMultiplier || 1.0,
        isActive: isActive !== undefined ? isActive : true
      },
      create: {
        gameTitle,
        eventType,
        basePoints: basePoints || 0,
        multiplier: multiplier || 1.0,
        minValue,
        maxPoints,
        cooldown,
        rankedMultiplier: rankedMultiplier || 1.5,
        competitiveMultiplier: competitiveMultiplier || 1.2,
        casualMultiplier: casualMultiplier || 1.0,
        isActive: isActive !== undefined ? isActive : true
      }
    });

    return NextResponse.json({
      success: true,
      config: pointsConfig,
      message: 'Points configuration updated successfully'
    });

  } catch (error) {
    console.error('Points config update error:', error);
    return NextResponse.json(
      { error: 'Failed to update points configuration' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!(session?.user as any)?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { id: (session!.user as any).id }
    });

    if (!user?.isAdmin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const configId = searchParams.get('id');

    if (!configId) {
      return NextResponse.json({ error: 'Config ID required' }, { status: 400 });
    }

    await prisma.pointsConfig.delete({
      where: { id: configId }
    });

    return NextResponse.json({
      success: true,
      message: 'Points configuration deleted successfully'
    });

  } catch (error) {
    console.error('Points config delete error:', error);
    return NextResponse.json(
      { error: 'Failed to delete points configuration' },
      { status: 500 }
    );
  }
}
