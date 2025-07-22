
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const gameSlug = searchParams.get('game');
    const limit = searchParams.get('limit');

    if (gameSlug) {
      // Game-specific leaderboard
      const gameStats = await prisma.playerStats.findMany({
        where: {
          game: {
            slug: gameSlug
          }
        },
        include: {
          player: true,
          game: true
        },
        orderBy: [
          { wins: 'desc' },
          { winRate: 'desc' },
          { gamesPlayed: 'desc' }
        ],
        take: limit ? parseInt(limit) : undefined
      });

      const leaderboard = gameStats.map((stat, index) => ({
        rank: index + 1,
        player: stat.player,
        game: stat.game,
        stats: {
          gamesPlayed: stat.gamesPlayed,
          wins: stat.wins,
          losses: stat.losses,
          winRate: stat.winRate,
          kills: stat.kills,
          deaths: stat.deaths,
          kda: stat.kda,
          avgScore: stat.avgScore,
          bestScore: stat.bestScore
        }
      }));

      return NextResponse.json({
        success: true,
        data: leaderboard,
        count: leaderboard.length,
        game: gameSlug
      });
    } else {
      // Overall leaderboard
      const players = await prisma.player.findMany({
        orderBy: [
          { totalPoints: 'desc' },
          { skillRating: 'desc' },
          { winRate: 'desc' }
        ],
        take: limit ? parseInt(limit) : undefined,
        include: {
          stats: {
            include: {
              game: true
            }
          }
        }
      });

      const leaderboard = players.map((player, index) => ({
        rank: index + 1,
        player,
        overallStats: {
          totalPoints: player.totalPoints,
          skillRating: player.skillRating,
          totalMatches: player.totalMatches,
          totalWins: player.totalWins,
          winRate: player.winRate,
          currentRank: player.currentRank
        }
      }));

      return NextResponse.json({
        success: true,
        data: leaderboard,
        count: leaderboard.length,
        type: 'overall'
      });
    }
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch leaderboard' 
      },
      { status: 500 }
    );
  }
}
