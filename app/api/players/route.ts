
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const gameSlug = searchParams.get('game');
    const limit = searchParams.get('limit');
    const sortBy = searchParams.get('sortBy') || 'totalPoints';
    const order = searchParams.get('order') || 'desc';

    let players;

    if (gameSlug) {
      // Get players for specific game
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
        orderBy: {
          [sortBy]: order as 'asc' | 'desc'
        },
        take: limit ? parseInt(limit) : undefined
      });

      players = gameStats.map(stat => ({
        ...stat.player,
        gameStats: stat
      }));
    } else {
      // Get all players
      players = await prisma.player.findMany({
        orderBy: {
          [sortBy]: order as 'asc' | 'desc'
        },
        take: limit ? parseInt(limit) : undefined,
        include: {
          stats: {
            include: {
              game: true
            }
          },
          achievements: {
            include: {
              achievement: true
            }
          }
        }
      });
    }

    return NextResponse.json({
      success: true,
      data: players,
      count: players.length
    });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch players' 
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    const player = await prisma.player.create({
      data: body
    });

    return NextResponse.json({
      success: true,
      data: player
    });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to create player' 
      },
      { status: 500 }
    );
  }
}
