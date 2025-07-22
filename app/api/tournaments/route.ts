
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const gameSlug = searchParams.get('game');
    const limit = searchParams.get('limit');

    const where: any = {};
    
    if (status) {
      where.status = status;
    }
    
    if (gameSlug) {
      where.game = {
        slug: gameSlug
      };
    }

    const tournaments = await prisma.tournament.findMany({
      where,
      include: {
        game: true,
        registrations: {
          include: {
            player: true
          }
        },
        season: true,
        results: {
          include: {
            player: true
          },
          orderBy: {
            position: 'asc'
          }
        }
      },
      orderBy: [
        { status: 'asc' },
        { startDate: 'asc' }
      ],
      take: limit ? parseInt(limit) : undefined
    });

    return NextResponse.json({
      success: true,
      data: tournaments,
      count: tournaments.length
    });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch tournaments' 
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    const tournament = await prisma.tournament.create({
      data: {
        ...body,
        registrationStart: new Date(body.registrationStart),
        registrationEnd: new Date(body.registrationEnd),
        startDate: new Date(body.startDate),
        endDate: body.endDate ? new Date(body.endDate) : null,
      },
      include: {
        game: true,
        registrations: true
      }
    });

    return NextResponse.json({
      success: true,
      data: tournament
    });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to create tournament' 
      },
      { status: 500 }
    );
  }
}
