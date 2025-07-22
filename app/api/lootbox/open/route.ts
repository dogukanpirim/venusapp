
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { PrismaClient } from '@prisma/client';

export const dynamic = 'force-dynamic';

const prisma = new PrismaClient();

// Weighted random selection function
function weightedRandomSelect<T extends { weight: number }>(items: T[]): T {
  const totalWeight = items.reduce((sum, item) => sum + item.weight, 0);
  let random = Math.random() * totalWeight;
  
  for (const item of items) {
    random -= item.weight;
    if (random <= 0) {
      return item;
    }
  }
  
  return items[items.length - 1]; // Fallback
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get user with current loot box balance
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { 
        id: true, 
        lootboxBalance: true, 
        totalLootboxesOpened: true 
      }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Check if user has loot boxes to open
    if (user.lootboxBalance < 1) {
      return NextResponse.json(
        { error: 'Insufficient loot box balance' },
        { status: 400 }
      );
    }

    // Get all active rewards
    const allRewards = await prisma.lootBoxReward.findMany({
      where: { isActive: true }
    });

    if (allRewards.length === 0) {
      return NextResponse.json(
        { error: 'No rewards available' },
        { status: 500 }
      );
    }

    // Select a random reward based on weights
    const selectedReward = weightedRandomSelect(allRewards);

    // Generate a unique animation seed for reproducible animations
    const animationSeed = `${user.id}-${Date.now()}-${Math.random()}`;

    // Create opening record and update user balance in a transaction
    const [lootBoxOpening] = await prisma.$transaction([
      prisma.lootBoxOpening.create({
        data: {
          userId: user.id,
          rewardId: selectedReward.id,
          rarity: selectedReward.rarity,
          animationSeed,
          ipAddress: request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || 
                     'unknown',
          userAgent: request.headers.get('user-agent') || 'unknown',
        },
        include: {
          reward: {
            select: {
              id: true,
              name: true,
              description: true,
              icon: true,
              image: true,
              type: true,
              rarity: true,
              value: true,
              quantity: true,
            }
          }
        }
      }),
      prisma.user.update({
        where: { id: user.id },
        data: {
          lootboxBalance: { decrement: 1 },
          totalLootboxesOpened: { increment: 1 }
        }
      })
    ]);

    // Log for admin tracking
    console.log(`🎁 Loot box opened by user ${user.id}: ${selectedReward.name} (${selectedReward.rarity})`);

    return NextResponse.json({
      success: true,
      opening: {
        id: lootBoxOpening.id,
        animationSeed: lootBoxOpening.animationSeed,
        reward: lootBoxOpening.reward,
        rarity: lootBoxOpening.rarity,
        openedAt: lootBoxOpening.createdAt
      },
      user: {
        remainingBalance: user.lootboxBalance - 1,
        totalOpened: user.totalLootboxesOpened + 1
      }
    });

  } catch (error) {
    console.error('Loot box opening error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
