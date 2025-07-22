
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { GameTitle } from '@prisma/client';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || !(session.user as any).id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const gameTitle = searchParams.get('game') as GameTitle | null;
    const period = searchParams.get('period') || '30'; // days

    // Get player
    const player = await prisma.player.findUnique({
      where: { userId: (session.user as any).id },
      include: {
        ranks: gameTitle ? {
          where: { gameTitle },
        } : {},
        dailyStats: {
          where: {
            gameTitle: gameTitle || undefined,
            date: {
              gte: new Date(Date.now() - parseInt(period) * 24 * 60 * 60 * 1000),
            },
          },
          orderBy: { date: 'desc' },
        },
      },
    });

    if (!player) {
      return NextResponse.json({ error: 'Player not found' }, { status: 404 });
    }

    // Get matches for the period
    const periodStart = new Date(Date.now() - parseInt(period) * 24 * 60 * 60 * 1000);
    
    const matches = await prisma.overwolfMatch.findMany({
      where: {
        playerId: player.id,
        gameTitle: gameTitle || undefined,
        startedAt: {
          gte: periodStart,
        },
      },
      orderBy: { startedAt: 'desc' },
    });

    // Calculate detailed statistics
    const stats = {
      player: {
        id: player.id,
        gamertag: player.gamertag,
        displayName: player.displayName,
        avatar: player.avatar,
        totalPoints: player.totalPoints,
        currentRank: player.currentRank,
        skillRating: player.skillRating,
        favoriteGame: player.favoriteGame,
        playStyle: player.playStyle,
        preferredRole: player.preferredRole,
        currentStreak: player.currentStreak,
        longestStreak: player.longestStreak,
        clutchWins: player.clutchWins,
        mvpCount: player.mvpCount,
        title: player.title,
        showcase: player.showcase,
      },
      
      // Game-specific rank
      currentRank: player.ranks?.[0] ? {
        gameTitle: player.ranks[0].gameTitle,
        currentRank: player.ranks[0].currentRank,
        currentTier: player.ranks[0].currentTier,
        rankPoints: player.ranks[0].rankPoints,
        seasonWins: player.ranks[0].seasonWins,
        seasonLosses: player.ranks[0].seasonLosses,
        peakRank: player.ranks[0].peakRank,
        peakTier: player.ranks[0].peakTier,
        performanceRating: player.ranks[0].performanceRating,
        recentForm: player.ranks[0].recentForm,
      } : null,

      // Match statistics
      matchStats: {
        totalMatches: matches.length,
        wins: matches.filter(m => m.won === true).length,
        losses: matches.filter(m => m.won === false).length,
        draws: matches.filter(m => m.won === null).length,
        winRate: matches.length > 0 ? 
          (matches.filter(m => m.won === true).length / matches.length) * 100 : 0,
        
        // Combat stats
        totalKills: matches.reduce((sum, m) => sum + (m.kills || 0), 0),
        totalDeaths: matches.reduce((sum, m) => sum + (m.deaths || 0), 0),
        totalAssists: matches.reduce((sum, m) => sum + (m.assists || 0), 0),
        totalHeadshots: matches.reduce((sum, m) => sum + (m.headshots || 0), 0),
        totalDamage: matches.reduce((sum, m) => sum + (m.damage || 0), 0),
        
        // Special achievements
        totalAces: matches.reduce((sum, m) => sum + (m.aces || 0), 0),
        totalClutches: matches.reduce((sum, m) => sum + (m.clutches || 0), 0),
        totalFirstBloods: matches.reduce((sum, m) => sum + (m.firstBloods || 0), 0),
        totalPlants: matches.reduce((sum, m) => sum + (m.plants || 0), 0),
        totalDefuses: matches.reduce((sum, m) => sum + (m.defuses || 0), 0),
        
        // Points
        totalPoints: matches.reduce((sum, m) => sum + (m.totalPoints || 0), 0),
        totalBasePoints: matches.reduce((sum, m) => sum + (m.basePoints || 0), 0),
        totalBonusPoints: matches.reduce((sum, m) => sum + (m.bonusPoints || 0), 0),
      },

      // Calculated averages
      averages: {
        kdaRatio: 0,
        killsPerMatch: 0,
        deathsPerMatch: 0,
        assistsPerMatch: 0,
        headshotPercentage: 0,
        damagePerMatch: 0,
        pointsPerMatch: 0,
        accuracy: 0,
        matchDuration: 0,
      },

      // Performance trends (last 10 matches)
      recentPerformance: matches.slice(0, 10).map(match => ({
        date: match.startedAt,
        won: match.won,
        kills: match.kills,
        deaths: match.deaths,
        assists: match.assists,
        kda: (match.deaths || 0) > 0 ? 
          ((match.kills || 0) + (match.assists || 0)) / (match.deaths || 1) : 
          (match.kills || 0) + (match.assists || 0),
        points: match.totalPoints,
        gameTitle: match.gameTitle,
        mapName: match.mapName,
      })),

      // Daily stats chart data
      dailyStatsChart: player.dailyStats?.map(stat => ({
        date: stat.date,
        matchesPlayed: stat.matchesPlayed,
        matchesWon: stat.matchesWon,
        winRate: stat.winRate,
        totalKills: stat.totalKills,
        totalDeaths: stat.totalDeaths,
        totalAssists: stat.totalAssists,
        avgKDA: stat.avgKDA,
        totalPoints: stat.totalPoints,
        totalPlaytime: stat.totalPlaytime,
      })) || [],

      // Game breakdown (if no specific game requested)
      gameBreakdown: gameTitle ? null : await getGameBreakdown(player.id),
    };

    // Calculate averages
    if (matches.length > 0) {
      const totalKills = stats.matchStats.totalKills;
      const totalDeaths = stats.matchStats.totalDeaths || 1;
      const totalAssists = stats.matchStats.totalAssists;
      const totalMatches = matches.length;
      
      stats.averages = {
        kdaRatio: parseFloat(((totalKills + totalAssists) / totalDeaths).toFixed(2)),
        killsPerMatch: parseFloat((totalKills / totalMatches).toFixed(1)),
        deathsPerMatch: parseFloat((stats.matchStats.totalDeaths / totalMatches).toFixed(1)),
        assistsPerMatch: parseFloat((totalAssists / totalMatches).toFixed(1)),
        headshotPercentage: totalKills > 0 ? 
          parseFloat(((stats.matchStats.totalHeadshots / totalKills) * 100).toFixed(1)) : 0,
        damagePerMatch: parseFloat((stats.matchStats.totalDamage / totalMatches).toFixed(0)),
        pointsPerMatch: parseFloat((stats.matchStats.totalPoints / totalMatches).toFixed(0)),
        accuracy: parseFloat((matches.reduce((sum, m) => sum + (m.accuracy || 0), 0) / totalMatches).toFixed(1)),
        matchDuration: parseFloat((matches.reduce((sum, m) => sum + (m.duration || 0), 0) / totalMatches / 60).toFixed(1)), // in minutes
      };
    }

    return NextResponse.json(stats);

  } catch (error) {
    console.error('Stats API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function getGameBreakdown(playerId: string) {
  const games = [GameTitle.VALORANT, GameTitle.CS2, GameTitle.LEAGUE_OF_LEGENDS];
  const breakdown = [];

  for (const game of games) {
    const matches = await prisma.overwolfMatch.findMany({
      where: {
        playerId,
        gameTitle: game,
      },
    });

    if (matches.length > 0) {
      const wins = matches.filter(m => m.won === true).length;
      const totalKills = matches.reduce((sum, m) => sum + (m.kills || 0), 0);
      const totalDeaths = matches.reduce((sum, m) => sum + (m.deaths || 0), 0);
      const totalAssists = matches.reduce((sum, m) => sum + (m.assists || 0), 0);
      const totalPoints = matches.reduce((sum, m) => sum + (m.totalPoints || 0), 0);

      breakdown.push({
        gameTitle: game,
        totalMatches: matches.length,
        wins,
        losses: matches.filter(m => m.won === false).length,
        winRate: (wins / matches.length) * 100,
        totalKills,
        totalDeaths,
        totalAssists,
        kda: totalDeaths > 0 ? (totalKills + totalAssists) / totalDeaths : totalKills + totalAssists,
        totalPoints,
        averagePoints: totalPoints / matches.length,
      });
    }
  }

  return breakdown;
}
