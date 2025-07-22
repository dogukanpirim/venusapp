
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

    const { searchParams } = new URL(req.url);
    const gameTitle = searchParams.get('gameTitle');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Find player
    const player = await prisma.player.findFirst({
      where: { userId: (session!.user as any).id }
    });

    if (!player) {
      return NextResponse.json({ error: 'Player not found' }, { status: 404 });
    }

    // Build filter conditions
    const where: any = {
      playerId: player.id,
      status: 'COMPLETED'
    };

    if (gameTitle) {
      where.gameTitle = gameTitle;
    }

    // Get matches with events
    const matches = await prisma.overwolfMatch.findMany({
      where,
      include: {
        events: {
          select: {
            id: true,
            eventType: true,
            eventValue: true,
            pointsEarned: true,
            timestamp: true,
            weapon: true,
            victim: true
          },
          orderBy: { timestamp: 'asc' }
        }
      },
      orderBy: { endedAt: 'desc' },
      take: limit,
      skip: offset
    });

    // Get total count for pagination
    const totalMatches = await prisma.overwolfMatch.count({
      where
    });

    // Calculate summary stats
    const summaryStats = await prisma.overwolfMatch.aggregate({
      where,
      _sum: {
        kills: true,
        deaths: true,
        assists: true,
        totalPoints: true,
        aces: true,
        clutches: true
      },
      _avg: {
        kda: true,
        accuracy: true
      },
      _count: {
        won: true
      }
    });

    const totalWins = await prisma.overwolfMatch.count({
      where: { ...where, won: true }
    });

    return NextResponse.json({
      success: true,
      matches: matches.map(match => ({
        id: match.id,
        gameTitle: match.gameTitle,
        gameMode: match.gameMode,
        mapName: match.mapName,
        won: match.won,
        score: match.score,
        duration: match.duration,
        kda: match.kda,
        kills: match.kills,
        deaths: match.deaths,
        assists: match.assists,
        headshots: match.headshots,
        aces: match.aces,
        clutches: match.clutches,
        totalPoints: match.totalPoints,
        rank: match.rank,
        startedAt: match.startedAt,
        endedAt: match.endedAt,
        events: match.events
      })),
      pagination: {
        total: totalMatches,
        limit,
        offset,
        hasMore: offset + limit < totalMatches
      },
      summary: {
        totalMatches,
        totalWins,
        winRate: totalMatches > 0 ? totalWins / totalMatches : 0,
        totalKills: summaryStats._sum.kills || 0,
        totalDeaths: summaryStats._sum.deaths || 0,
        totalAssists: summaryStats._sum.assists || 0,
        totalPoints: summaryStats._sum.totalPoints || 0,
        totalAces: summaryStats._sum.aces || 0,
        totalClutches: summaryStats._sum.clutches || 0,
        avgKDA: summaryStats._avg.kda || 0,
        avgAccuracy: summaryStats._avg.accuracy || 0
      }
    });

  } catch (error) {
    console.error('Match history error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch match history' },
      { status: 500 }
    );
  }
}
