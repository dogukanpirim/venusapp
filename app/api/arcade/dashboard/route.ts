
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

    // Get player profile
    const player = await prisma.player.findUnique({
      where: { userId: (session.user as any).id },
      include: {
        ranks: {
          include: {
            player: true,
          },
        },
        dailyStats: {
          where: {
            date: {
              gte: new Date(new Date().setHours(0, 0, 0, 0)),
            },
          },
        },
        matches: {
          orderBy: { startedAt: 'desc' },
          take: 5,
        },
      },
    });

    if (!player) {
      return NextResponse.json({ error: 'Player not found' }, { status: 404 });
    }

    // Get weekly challenges
    const currentWeek = Math.ceil((Date.now() - new Date(new Date().getFullYear(), 0, 1).getTime()) / (7 * 24 * 60 * 60 * 1000));
    const currentYear = new Date().getFullYear();

    const weeklyChallenges = await prisma.weeklyChallenge.findMany({
      where: {
        week: currentWeek,
        year: currentYear,
        isActive: true,
      },
      include: {
        completions: {
          where: {
            playerId: player.id,
          },
        },
      },
    });

    // Get game configs
    const gameConfigs = await prisma.gameConfig.findMany({
      where: { isActive: true },
    });

    // Calculate total stats
    const totalMatches = await prisma.overwolfMatch.count({
      where: { playerId: player.id },
    });

    const totalWins = await prisma.overwolfMatch.count({
      where: { 
        playerId: player.id,
        won: true,
      },
    });

    const totalKills = await prisma.overwolfMatch.aggregate({
      where: { playerId: player.id },
      _sum: { kills: true },
    });

    const totalDeaths = await prisma.overwolfMatch.aggregate({
      where: { playerId: player.id },
      _sum: { deaths: true },
    });

    const totalAssists = await prisma.overwolfMatch.aggregate({
      where: { playerId: player.id },
      _sum: { assists: true },
    });

    // Recent achievements (mock data for now)
    const recentAchievements = [
      {
        id: '1',
        name: 'Ace Master',
        description: 'Get an ace in competitive match',
        icon: '🎯',
        unlockedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
      },
      {
        id: '2',
        name: 'Clutch King',
        description: 'Win a 1v4 clutch',
        icon: '👑',
        unlockedAt: new Date(Date.now() - 5 * 60 * 60 * 1000),
      },
    ];

    return NextResponse.json({
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
        isOnline: player.isOnline,
      },
      stats: {
        totalMatches,
        totalWins,
        winRate: totalMatches > 0 ? (totalWins / totalMatches) * 100 : 0,
        totalKills: totalKills._sum.kills || 0,
        totalDeaths: totalDeaths._sum.deaths || 0,
        totalAssists: totalAssists._sum.assists || 0,
        kda: (totalDeaths._sum.deaths || 0) > 0 ? 
          ((totalKills._sum.kills || 0) + (totalAssists._sum.assists || 0)) / (totalDeaths._sum.deaths || 1) : 0,
      },
      ranks: player.ranks?.map((rank: any) => ({
        gameTitle: rank.gameTitle,
        currentRank: rank.currentRank,
        currentTier: rank.currentTier,
        rankPoints: rank.rankPoints,
        seasonWins: rank.seasonWins,
        seasonLosses: rank.seasonLosses,
        peakRank: rank.peakRank,
        performanceRating: rank.performanceRating,
        recentForm: rank.recentForm,
      })) || [],
      dailyStats: player.dailyStats || [],
      recentMatches: player.matches?.map((match: any) => ({
        id: match.id,
        gameTitle: match.gameTitle,
        gameMode: match.gameMode,
        mapName: match.mapName,
        duration: match.duration,
        won: match.won,
        score: match.score,
        kills: match.kills,
        deaths: match.deaths,
        assists: match.assists,
        kda: match.kda,
        totalPoints: match.totalPoints,
        startedAt: match.startedAt,
        endedAt: match.endedAt,
      })) || [],
      weeklyChallenges: weeklyChallenges?.map((challenge: any) => ({
        id: challenge.id,
        title: challenge.title,
        description: challenge.description,
        gameTitle: challenge.gameTitle,
        category: challenge.category,
        difficulty: challenge.difficulty,
        targetType: challenge.targetType,
        targetValue: challenge.targetValue,
        pointsReward: challenge.pointsReward,
        badgeReward: challenge.badgeReward,
        lootboxReward: challenge.lootboxReward,
        endDate: challenge.endDate,
        completion: challenge.completions?.[0] ? {
          currentProgress: challenge.completions[0].currentProgress,
          completed: challenge.completions[0].completed,
          completedAt: challenge.completions[0].completedAt,
        } : {
          currentProgress: 0,
          completed: false,
          completedAt: null,
        },
      })) || [],
      gameConfigs: gameConfigs?.map((config: any) => ({
        gameTitle: config.gameTitle,
        displayName: config.displayName,
        shortName: config.shortName,
        slug: config.slug,
        logo: config.logo,
        banner: config.banner,
        icon: config.icon,
        primaryColor: config.primaryColor,
        hasRanks: config.hasRanks,
      })) || [],
      recentAchievements,
    });

  } catch (error) {
    console.error('Arcade dashboard error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
