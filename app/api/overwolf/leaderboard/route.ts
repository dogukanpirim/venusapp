
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const gameTitle = searchParams.get('gameTitle');
    const timeframe = searchParams.get('timeframe') || 'all'; // all, daily, weekly, monthly
    const limit = parseInt(searchParams.get('limit') || '50');

    let dateFilter: any = {};
    const now = new Date();

    switch (timeframe) {
      case 'daily':
        dateFilter = { gte: new Date(now.setHours(0, 0, 0, 0)) };
        break;
      case 'weekly':
        dateFilter = { gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) };
        break;
      case 'monthly':
        dateFilter = { gte: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000) };
        break;
    }

    // Build query for Overwolf-based leaderboard
    const matchFilters: any = {
      status: 'COMPLETED',
      ...(gameTitle && { gameTitle: gameTitle as any }),
      ...(timeframe !== 'all' && { endedAt: dateFilter })
    };

    // Get aggregated player stats from matches
    const playerStats = await prisma.overwolfMatch.groupBy({
      by: ['playerId'],
      where: matchFilters,
      _sum: {
        totalPoints: true,
        kills: true,
        deaths: true,
        assists: true,
        aces: true,
        clutches: true
      },
      _avg: {
        kda: true
      },
      _count: {
        id: true,
        won: true
      },
      orderBy: {
        _sum: {
          totalPoints: 'desc'
        }
      },
      take: limit
    });

    // Get player details and calculate additional stats
    const leaderboardData = await Promise.all(
      playerStats.map(async (stat) => {
        const player = await prisma.player.findUnique({
          where: { id: stat.playerId },
          select: {
            id: true,
            gamertag: true,
            displayName: true,
            avatar: true,
            currentRank: true,
            skillRating: true,
            isOnline: true,
            lastActiveGame: true
          }
        });

        if (!player) return null;

        // Calculate wins count
        const wins = await prisma.overwolfMatch.count({
          where: {
            ...matchFilters,
            playerId: stat.playerId,
            won: true
          }
        });

        const totalMatches = stat._count.id;
        const winRate = totalMatches > 0 ? wins / totalMatches : 0;

        return {
          player,
          stats: {
            totalPoints: stat._sum.totalPoints || 0,
            totalMatches,
            totalWins: wins,
            winRate: Math.round(winRate * 100) / 100,
            totalKills: stat._sum.kills || 0,
            totalDeaths: stat._sum.deaths || 0,
            totalAssists: stat._sum.assists || 0,
            averageKDA: stat._avg.kda || 0,
            totalAces: stat._sum.aces || 0,
            totalClutches: stat._sum.clutches || 0
          }
        };
      })
    );

    // Filter out null results and add ranking
    const finalLeaderboard = leaderboardData
      .filter(entry => entry !== null)
      .map((entry, index) => ({
        rank: index + 1,
        ...entry
      }));

    // Get game-specific stats summary
    const gameStats = gameTitle ? await prisma.overwolfMatch.aggregate({
      where: matchFilters,
      _sum: {
        totalPoints: true,
        kills: true
      },
      _count: {
        id: true
      }
    }) : null;

    return NextResponse.json({
      success: true,
      leaderboard: finalLeaderboard,
      meta: {
        gameTitle,
        timeframe,
        totalEntries: finalLeaderboard.length,
        lastUpdated: new Date(),
        ...(gameStats && {
          gameStats: {
            totalMatches: gameStats._count.id,
            totalPoints: gameStats._sum.totalPoints,
            totalKills: gameStats._sum.kills
          }
        })
      }
    });

  } catch (error) {
    console.error('Leaderboard error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch leaderboard' },
      { status: 500 }
    );
  }
}
