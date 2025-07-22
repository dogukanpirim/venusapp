
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { MatchStatus } from '@prisma/client';

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!(session?.user as any)?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const {
      matchId,
      won,
      score,
      duration,
      playerScore,
      finalStats
    } = body;

    // Find the match
    const match = await prisma.overwolfMatch.findUnique({
      where: { id: matchId },
      include: { player: true, events: true }
    });

    if (!match) {
      return NextResponse.json({ error: 'Match not found' }, { status: 404 });
    }

    if (match.player.userId !== (session!.user as any).id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Calculate KDA
    const kda = match.deaths > 0 
      ? (match.kills + match.assists) / match.deaths 
      : match.kills + match.assists;

    // Calculate bonus points for match completion
    let bonusPoints = 0;
    if (won) {
      bonusPoints += 50; // Win bonus
      if (kda >= 2.0) bonusPoints += 25; // High performance bonus
      if (match.aces > 0) bonusPoints += match.aces * 20; // Ace bonus
      if (match.clutches > 0) bonusPoints += match.clutches * 15; // Clutch bonus
    }

    // Update match with final results
    const updatedMatch = await prisma.overwolfMatch.update({
      where: { id: matchId },
      data: {
        status: MatchStatus.COMPLETED,
        won,
        score,
        duration,
        playerScore,
        kda,
        bonusPoints,
        totalPoints: { increment: bonusPoints },
        endedAt: new Date(),
        pointsAwarded: true,
        // Merge any additional final stats
        ...(finalStats && {
          cs: finalStats.cs,
          gold: finalStats.gold,
          level: finalStats.level,
          wardsPlaced: finalStats.wardsPlaced,
          wardsDestroyed: finalStats.wardsDestroyed,
          accuracy: finalStats.accuracy
        })
      }
    });

    // Update player stats
    await prisma.player.update({
      where: { id: match.playerId },
      data: {
        totalPoints: { increment: bonusPoints },
        totalMatches: { increment: 1 },
        totalWins: won ? { increment: 1 } : undefined,
        winRate: {
          set: await calculatePlayerWinRate(match.playerId)
        },
        isOnline: false // Mark as offline after match
      }
    });

    // Update or create daily stats
    await updateDailyStats(match.playerId, match.gameTitle, {
      matchWon: won,
      kills: match.kills,
      deaths: match.deaths,
      assists: match.assists,
      kda,
      mvp: finalStats?.mvp || false,
      aces: match.aces,
      totalPoints: updatedMatch.totalPoints,
      playtime: Math.floor((duration || 0) / 60) // Convert to minutes
    });

    return NextResponse.json({
      success: true,
      bonusPoints,
      totalMatchPoints: updatedMatch.totalPoints,
      finalKDA: kda,
      message: 'Match completed successfully'
    });

  } catch (error) {
    console.error('Match end error:', error);
    return NextResponse.json(
      { error: 'Failed to complete match' },
      { status: 500 }
    );
  }
}

async function calculatePlayerWinRate(playerId: string): Promise<number> {
  const totalMatches = await prisma.overwolfMatch.count({
    where: { 
      playerId,
      status: MatchStatus.COMPLETED,
      won: { not: null }
    }
  });

  if (totalMatches === 0) return 0;

  const wins = await prisma.overwolfMatch.count({
    where: { 
      playerId,
      status: MatchStatus.COMPLETED,
      won: true
    }
  });

  return Math.round((wins / totalMatches) * 100) / 100;
}

async function updateDailyStats(
  playerId: string, 
  gameTitle: any, 
  matchData: {
    matchWon: boolean;
    kills: number;
    deaths: number;
    assists: number;
    kda: number;
    mvp: boolean;
    aces: number;
    totalPoints: number;
    playtime: number;
  }
) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  await prisma.dailyStats.upsert({
    where: {
      playerId_gameTitle_date: {
        playerId,
        gameTitle,
        date: today
      }
    },
    update: {
      matchesPlayed: { increment: 1 },
      matchesWon: matchData.matchWon ? { increment: 1 } : undefined,
      totalKills: { increment: matchData.kills },
      totalDeaths: { increment: matchData.deaths },
      totalAssists: { increment: matchData.assists },
      mvpCount: matchData.mvp ? { increment: 1 } : undefined,
      aceCount: { increment: matchData.aces },
      totalPoints: { increment: matchData.totalPoints },
      totalPlaytime: { increment: matchData.playtime },
      bestKDA: {
        set: Math.max(matchData.kda, await getBestKDAForDay(playerId, gameTitle, today))
      }
    },
    create: {
      playerId,
      gameTitle,
      date: today,
      matchesPlayed: 1,
      matchesWon: matchData.matchWon ? 1 : 0,
      totalKills: matchData.kills,
      totalDeaths: matchData.deaths,
      totalAssists: matchData.assists,
      avgKDA: matchData.kda,
      bestKDA: matchData.kda,
      mvpCount: matchData.mvp ? 1 : 0,
      aceCount: matchData.aces,
      totalPoints: matchData.totalPoints,
      totalPlaytime: matchData.playtime,
      winRate: matchData.matchWon ? 1.0 : 0.0
    }
  });

  // Recalculate average KDA and win rate
  const dailyStats = await prisma.dailyStats.findUnique({
    where: {
      playerId_gameTitle_date: {
        playerId,
        gameTitle,
        date: today
      }
    }
  });

  if (dailyStats) {
    const avgKDA = dailyStats.totalDeaths > 0 
      ? (dailyStats.totalKills + dailyStats.totalAssists) / dailyStats.totalDeaths
      : dailyStats.totalKills + dailyStats.totalAssists;
    
    const winRate = dailyStats.matchesPlayed > 0 
      ? dailyStats.matchesWon / dailyStats.matchesPlayed 
      : 0;

    await prisma.dailyStats.update({
      where: { id: dailyStats.id },
      data: {
        avgKDA,
        winRate
      }
    });
  }
}

async function getBestKDAForDay(playerId: string, gameTitle: any, date: Date): Promise<number> {
  const stats = await prisma.dailyStats.findUnique({
    where: {
      playerId_gameTitle_date: {
        playerId,
        gameTitle,
        date
      }
    }
  });
  
  return stats?.bestKDA || 0;
}
