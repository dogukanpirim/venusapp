
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { GameTitle, MatchStatus } from '@prisma/client';

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!(session?.user as any)?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const {
      gameTitle,
      gameId,
      sessionId,
      matchId,
      gameMode,
      mapName,
      teamName,
      teammates = [],
      opponents = [],
      rank,
      overwolfVersion,
      gameVersion,
      region
    } = body;

    // Find or create player
    let player = await prisma.player.findFirst({
      where: { userId: (session!.user as any).id }
    });

    if (!player) {
      // Create player if doesn't exist
      player = await prisma.player.create({
        data: {
          userId: (session!.user as any).id,
          gamertag: session!.user!.email?.split('@')[0] || 'Player',
          displayName: session!.user!.name || 'Player',
          email: session!.user!.email
        }
      });
    }

    // Create new match record
    const match = await prisma.overwolfMatch.create({
      data: {
        playerId: player.id,
        gameTitle: gameTitle as GameTitle,
        gameId,
        sessionId,
        matchId,
        gameMode,
        mapName,
        teamName,
        teammates,
        opponents,
        rank,
        status: MatchStatus.LIVE,
        overwolfVersion,
        gameVersion,
        region
      }
    });

    // Update player online status and last active game
    await prisma.player.update({
      where: { id: player.id },
      data: {
        isOnline: true,
        lastActiveGame: gameTitle,
        overwolfUserId: sessionId // Set overwolf user ID if not already set
      }
    });

    return NextResponse.json({
      success: true,
      matchId: match.id,
      message: 'Match started successfully'
    });

  } catch (error) {
    console.error('Match start error:', error);
    return NextResponse.json(
      { error: 'Failed to start match tracking' },
      { status: 500 }
    );
  }
}
