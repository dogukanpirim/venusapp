
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

export const dynamic = 'force-dynamic';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const rewards = await prisma.lootBoxReward.findMany({
      where: { isActive: true },
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
        weight: true,
      },
      orderBy: [
        { rarity: 'asc' },
        { weight: 'desc' }
      ]
    });

    // Group by rarity for easy frontend usage
    const groupedRewards = rewards.reduce((acc, reward) => {
      if (!acc[reward.rarity]) {
        acc[reward.rarity] = [];
      }
      acc[reward.rarity].push(reward);
      return acc;
    }, {} as Record<string, typeof rewards>);

    return NextResponse.json({
      rewards,
      groupedRewards,
      stats: {
        total: rewards.length,
        byRarity: {
          COMMON: rewards.filter(r => r.rarity === 'COMMON').length,
          RARE: rewards.filter(r => r.rarity === 'RARE').length,
          EPIC: rewards.filter(r => r.rarity === 'EPIC').length,
          LEGENDARY: rewards.filter(r => r.rarity === 'LEGENDARY').length,
        }
      }
    });

  } catch (error) {
    console.error('Get rewards error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
