
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { GameTitle } from '@prisma/client';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const gameTitle = searchParams.get('game') as GameTitle | null;
    const period = searchParams.get('period') || 'weekly';
    const category = searchParams.get('category') || 'points';

    // Get cached leaderboard data
    const whereClause = gameTitle 
      ? { gameTitle_period_category: { gameTitle, period, category } }
      : { gameTitle_period_category: { gameTitle: null as any, period, category } };
    
    const leaderboard = await prisma.realtimeLeaderboard.findUnique({
      where: whereClause,
    });

    if (leaderboard) {
      const cachedData = JSON.parse(leaderboard.data || '[]');
      
      // If cache is recent (within update interval), return it
      const cacheAge = Date.now() - new Date(leaderboard.lastUpdated).getTime();
      if (cacheAge < (leaderboard.updateInterval * 1000)) {
        return NextResponse.json({
          data: cachedData,
          lastUpdated: leaderboard.lastUpdated,
          cached: true,
        });
      }
    }

    // Generate fresh leaderboard data
    let leaderboardData: any[] = [];

    if (category === 'points') {
      // Get top players by total points
      const players = await prisma.player.findMany({
        where: gameTitle ? {
          matches: {
            some: { gameTitle },
          },
        } : {},
        orderBy: { totalPoints: 'desc' },
        take: 100,
        include: {
          user: {
            select: { name: true },
          },
          ranks: gameTitle ? {
            where: { gameTitle },
          } : {},
          dailyStats: {
            where: {
              gameTitle: gameTitle || undefined,
              date: {
                gte: getPeriodStartDate(period),
              },
            },
          },
        },
      });

      leaderboardData = players.map((player, index) => ({
        rank: index + 1,
        playerId: player.id,
        gamertag: player.gamertag,
        displayName: player.displayName,
        avatar: player.avatar,
        title: player.title,
        value: player.totalPoints,
        currentRank: player.ranks?.[0]?.currentRank || player.currentRank,
        isOnline: player.isOnline,
        favoriteGame: player.favoriteGame,
      }));
    } else if (category === 'kills') {
      // Get top players by kills in the period
      const matches = await prisma.overwolfMatch.groupBy({
        by: ['playerId'],
        where: {
          gameTitle: gameTitle || undefined,
          startedAt: {
            gte: getPeriodStartDate(period),
          },
        },
        _sum: {
          kills: true,
        },
        orderBy: {
          _sum: {
            kills: 'desc',
          },
        },
        take: 100,
      });

      const playerIds = matches.map(m => m.playerId);
      const players = await prisma.player.findMany({
        where: { id: { in: playerIds } },
        include: {
          ranks: gameTitle ? {
            where: { gameTitle },
          } : {},
        },
      });

      const playerMap = new Map(players.map(p => [p.id, p]));

      leaderboardData = matches.map((match, index) => {
        const player = playerMap.get(match.playerId);
        return {
          rank: index + 1,
          playerId: match.playerId,
          gamertag: player?.gamertag || 'Unknown',
          displayName: player?.displayName || 'Unknown',
          avatar: player?.avatar,
          title: player?.title,
          value: match._sum.kills || 0,
          currentRank: player?.ranks?.[0]?.currentRank || player?.currentRank,
          isOnline: player?.isOnline || false,
          favoriteGame: player?.favoriteGame,
        };
      });
    } else if (category === 'wins') {
      // Get top players by wins in the period
      const matches = await prisma.overwolfMatch.groupBy({
        by: ['playerId'],
        where: {
          gameTitle: gameTitle || undefined,
          won: true,
          startedAt: {
            gte: getPeriodStartDate(period),
          },
        },
        _count: {
          playerId: true,
        },
        orderBy: {
          _count: {
            playerId: 'desc',
          },
        },
        take: 100,
      });

      const playerIds = matches.map(m => m.playerId);
      const players = await prisma.player.findMany({
        where: { id: { in: playerIds } },
        include: {
          ranks: gameTitle ? {
            where: { gameTitle },
          } : {},
        },
      });

      const playerMap = new Map(players.map(p => [p.id, p]));

      leaderboardData = matches.map((match, index) => {
        const player = playerMap.get(match.playerId);
        return {
          rank: index + 1,
          playerId: match.playerId,
          gamertag: player?.gamertag || 'Unknown',
          displayName: player?.displayName || 'Unknown',
          avatar: player?.avatar,
          title: player?.title,
          value: match._count.playerId || 0,
          currentRank: player?.ranks?.[0]?.currentRank || player?.currentRank,
          isOnline: player?.isOnline || false,
          favoriteGame: player?.favoriteGame,
        };
      });
    } else if (category === 'kda') {
      // Get top players by K/D/A ratio
      const matches = await prisma.overwolfMatch.groupBy({
        by: ['playerId'],
        where: {
          gameTitle: gameTitle || undefined,
          startedAt: {
            gte: getPeriodStartDate(period),
          },
        },
        _sum: {
          kills: true,
          deaths: true,
          assists: true,
        },
        orderBy: {
          _sum: {
            kills: 'desc',
          },
        },
        take: 100,
      });

      const playerIds = matches.map(m => m.playerId);
      const players = await prisma.player.findMany({
        where: { id: { in: playerIds } },
        include: {
          ranks: gameTitle ? {
            where: { gameTitle },
          } : {},
        },
      });

      const playerMap = new Map(players.map(p => [p.id, p]));

      leaderboardData = matches
        .map((match) => {
          const player = playerMap.get(match.playerId);
          const kills = match._sum.kills || 0;
          const deaths = match._sum.deaths || 0;
          const assists = match._sum.assists || 0;
          const kda = deaths > 0 ? (kills + assists) / deaths : kills + assists;
          
          return {
            rank: 0, // Will be set after sorting
            playerId: match.playerId,
            gamertag: player?.gamertag || 'Unknown',
            displayName: player?.displayName || 'Unknown',
            avatar: player?.avatar,
            title: player?.title,
            value: parseFloat(kda.toFixed(2)),
            currentRank: player?.ranks?.[0]?.currentRank || player?.currentRank,
            isOnline: player?.isOnline || false,
            favoriteGame: player?.favoriteGame,
          };
        })
        .sort((a, b) => b.value - a.value)
        .map((item, index) => ({ ...item, rank: index + 1 }));
    }

    // Update cache
    if (leaderboard) {
      await prisma.realtimeLeaderboard.update({
        where: { id: leaderboard.id },
        data: {
          data: JSON.stringify(leaderboardData),
          lastUpdated: new Date(),
        },
      });
    }

    return NextResponse.json({
      data: leaderboardData,
      lastUpdated: new Date(),
      cached: false,
    });

  } catch (error) {
    console.error('Leaderboard error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

function getPeriodStartDate(period: string): Date {
  const now = new Date();
  
  switch (period) {
    case 'daily':
      const today = new Date(now);
      today.setHours(0, 0, 0, 0);
      return today;
    
    case 'weekly':
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - now.getDay());
      weekStart.setHours(0, 0, 0, 0);
      return weekStart;
    
    case 'monthly':
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      return monthStart;
    
    case 'alltime':
    default:
      return new Date(0); // Beginning of time
  }
}
