
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { EventType } from '@prisma/client';

export const dynamic = "force-dynamic";

// Point calculation service
class PointsCalculator {
  private static async getPointsConfig(gameTitle: string, eventType: EventType) {
    return await prisma.pointsConfig.findUnique({
      where: {
        gameTitle_eventType: {
          gameTitle: gameTitle as any,
          eventType
        }
      }
    });
  }

  private static getGameModeMultiplier(gameMode?: string, config?: any) {
    if (!config || !gameMode) return 1.0;
    
    const mode = gameMode.toLowerCase();
    if (mode.includes('ranked') || mode.includes('competitive')) {
      return config.rankedMultiplier || 1.5;
    }
    if (mode.includes('competitive')) {
      return config.competitiveMultiplier || 1.2;
    }
    return config.casualMultiplier || 1.0;
  }

  static async calculatePoints(
    gameTitle: string,
    eventType: EventType,
    eventValue?: number,
    gameMode?: string
  ): Promise<number> {
    const config = await this.getPointsConfig(gameTitle, eventType);
    if (!config || !config.isActive) return 0;

    let basePoints = config.basePoints;
    
    // Apply multipliers based on event value
    if (eventValue && config.multiplier) {
      basePoints = Math.floor(basePoints * config.multiplier * eventValue);
    }

    // Apply game mode multiplier
    const modeMultiplier = this.getGameModeMultiplier(gameMode, config);
    basePoints = Math.floor(basePoints * modeMultiplier);

    // Apply max points cap if configured
    if (config.maxPoints && basePoints > config.maxPoints) {
      basePoints = config.maxPoints;
    }

    return Math.max(0, basePoints);
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!(session?.user as any)?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const {
      matchId,
      eventType,
      eventData,
      eventValue,
      matchTime,
      roundNumber,
      weapon,
      victim,
      location,
      distance
    } = body;

    // Find the match
    const match = await prisma.overwolfMatch.findUnique({
      where: { id: matchId },
      include: { player: true }
    });

    if (!match) {
      return NextResponse.json({ error: 'Match not found' }, { status: 404 });
    }

    if (match.player.userId !== (session!.user as any).id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Calculate points for this event
    const pointsEarned = await PointsCalculator.calculatePoints(
      match.gameTitle,
      eventType as EventType,
      eventValue,
      match.gameMode || undefined
    );

    // Create event record
    const event = await prisma.overwolfEvent.create({
      data: {
        matchId,
        eventType: eventType as EventType,
        eventData: eventData ? JSON.stringify(eventData) : null,
        eventValue,
        matchTime,
        roundNumber,
        weapon,
        victim,
        location,
        distance,
        pointsEarned
      }
    });

    // Update match stats based on event type
    const updateData: any = {};
    
    switch (eventType) {
      case 'KILL':
        updateData.kills = { increment: 1 };
        if (weapon?.toLowerCase().includes('headshot')) {
          updateData.headshots = { increment: 1 };
        }
        break;
      case 'DEATH':
        updateData.deaths = { increment: 1 };
        break;
      case 'ASSIST':
        updateData.assists = { increment: 1 };
        break;
      case 'HEADSHOT':
        updateData.headshots = { increment: 1 };
        break;
      case 'ACE':
        updateData.aces = { increment: 1 };
        break;
      case 'CLUTCH':
        updateData.clutches = { increment: 1 };
        break;
      case 'FIRST_BLOOD':
        updateData.firstBloods = { increment: 1 };
        break;
      case 'PLANT':
        updateData.plants = { increment: 1 };
        break;
      case 'DEFUSE':
        updateData.defuses = { increment: 1 };
        break;
      case 'DAMAGE_DEALT':
        updateData.damage = { increment: eventValue || 0 };
        break;
      default:
        break;
    }

    // Add points to total if any earned
    if (pointsEarned > 0) {
      updateData.basePoints = { increment: pointsEarned };
      updateData.totalPoints = { increment: pointsEarned };
    }

    // Update match with new stats
    if (Object.keys(updateData).length > 0) {
      await prisma.overwolfMatch.update({
        where: { id: matchId },
        data: updateData
      });
    }

    // Update player total points
    if (pointsEarned > 0) {
      await prisma.player.update({
        where: { id: match.playerId },
        data: {
          totalPoints: { increment: pointsEarned }
        }
      });
    }

    // Check for challenge progress updates
    await updateChallengeProgress(match.playerId, eventType as EventType, eventValue);

    return NextResponse.json({
      success: true,
      pointsEarned,
      eventId: event.id,
      message: 'Event recorded successfully'
    });

  } catch (error) {
    console.error('Match event error:', error);
    return NextResponse.json(
      { error: 'Failed to record event' },
      { status: 500 }
    );
  }
}

async function updateChallengeProgress(playerId: string, eventType: EventType, eventValue?: number) {
  try {
    // Find active challenges that might be affected by this event
    const activeChallenges = await prisma.challenge.findMany({
      where: {
        status: 'ACTIVE',
        category: 'AUTO',
        endDate: { gte: new Date() }
      }
    });

    for (const challenge of activeChallenges) {
      // Simple challenge matching logic - can be enhanced
      const challengeTarget = challenge.target.toLowerCase();
      const eventName = eventType.toLowerCase();

      let shouldUpdate = false;
      let progressIncrement = 1;

      if (challengeTarget.includes(eventName)) {
        shouldUpdate = true;
        if (eventValue && challengeTarget.includes('damage')) {
          progressIncrement = eventValue;
        }
      }

      if (shouldUpdate) {
        await prisma.challengeProgress.upsert({
          where: {
            challengeId_playerId: {
              challengeId: challenge.id,
              playerId
            }
          },
          update: {
            progressValue: { increment: progressIncrement },
            completed: {
              set: false // Will be recalculated
            }
          },
          create: {
            challengeId: challenge.id,
            playerId,
            progressValue: progressIncrement,
            targetValue: challenge.targetValue,
            completed: false
          }
        });

        // Check if challenge is now completed
        const progress = await prisma.challengeProgress.findUnique({
          where: {
            challengeId_playerId: {
              challengeId: challenge.id,
              playerId
            }
          }
        });

        if (progress && progress.progressValue >= progress.targetValue) {
          await prisma.challengeProgress.update({
            where: { id: progress.id },
            data: { completed: true }
          });

          // Award challenge completion points
          await prisma.player.update({
            where: { id: playerId },
            data: {
              totalPoints: { increment: challenge.pointsReward }
            }
          });
        }
      }
    }
  } catch (error) {
    console.error('Challenge progress update error:', error);
  }
}
