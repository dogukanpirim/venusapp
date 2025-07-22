
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedOverwolfPointsConfig() {
  console.log('🎮 Seeding Overwolf Points Configuration...');

  const pointsConfigs = [
    // VALORANT Points Configuration
    { gameTitle: 'VALORANT', eventType: 'KILL', basePoints: 10, multiplier: 1.0, rankedMultiplier: 1.5, competitiveMultiplier: 1.2, casualMultiplier: 1.0 },
    { gameTitle: 'VALORANT', eventType: 'DEATH', basePoints: -2, multiplier: 1.0, rankedMultiplier: 1.0, competitiveMultiplier: 1.0, casualMultiplier: 1.0 },
    { gameTitle: 'VALORANT', eventType: 'ASSIST', basePoints: 5, multiplier: 1.0, rankedMultiplier: 1.5, competitiveMultiplier: 1.2, casualMultiplier: 1.0 },
    { gameTitle: 'VALORANT', eventType: 'WIN', basePoints: 50, multiplier: 1.0, rankedMultiplier: 2.0, competitiveMultiplier: 1.5, casualMultiplier: 1.0 },
    { gameTitle: 'VALORANT', eventType: 'LOSS', basePoints: 10, multiplier: 1.0, rankedMultiplier: 1.0, competitiveMultiplier: 1.0, casualMultiplier: 1.0 },
    { gameTitle: 'VALORANT', eventType: 'ACE', basePoints: 100, multiplier: 1.0, rankedMultiplier: 2.0, competitiveMultiplier: 1.5, casualMultiplier: 1.0 },
    { gameTitle: 'VALORANT', eventType: 'CLUTCH', basePoints: 25, multiplier: 1.0, rankedMultiplier: 1.5, competitiveMultiplier: 1.3, casualMultiplier: 1.0 },
    { gameTitle: 'VALORANT', eventType: 'HEADSHOT', basePoints: 5, multiplier: 1.0, rankedMultiplier: 1.3, competitiveMultiplier: 1.2, casualMultiplier: 1.0 },
    { gameTitle: 'VALORANT', eventType: 'FIRST_BLOOD', basePoints: 15, multiplier: 1.0, rankedMultiplier: 1.5, competitiveMultiplier: 1.2, casualMultiplier: 1.0 },
    { gameTitle: 'VALORANT', eventType: 'MVP', basePoints: 75, multiplier: 1.0, rankedMultiplier: 2.0, competitiveMultiplier: 1.5, casualMultiplier: 1.0 },
    { gameTitle: 'VALORANT', eventType: 'PLANT', basePoints: 10, multiplier: 1.0, rankedMultiplier: 1.3, competitiveMultiplier: 1.2, casualMultiplier: 1.0 },
    { gameTitle: 'VALORANT', eventType: 'DEFUSE', basePoints: 15, multiplier: 1.0, rankedMultiplier: 1.5, competitiveMultiplier: 1.3, casualMultiplier: 1.0 },
    { gameTitle: 'VALORANT', eventType: 'ROUND_WIN', basePoints: 5, multiplier: 1.0, rankedMultiplier: 1.2, competitiveMultiplier: 1.1, casualMultiplier: 1.0 },

    // CS2 Points Configuration
    { gameTitle: 'CS2', eventType: 'KILL', basePoints: 10, multiplier: 1.0, rankedMultiplier: 1.5, competitiveMultiplier: 1.2, casualMultiplier: 1.0 },
    { gameTitle: 'CS2', eventType: 'DEATH', basePoints: -2, multiplier: 1.0, rankedMultiplier: 1.0, competitiveMultiplier: 1.0, casualMultiplier: 1.0 },
    { gameTitle: 'CS2', eventType: 'ASSIST', basePoints: 5, multiplier: 1.0, rankedMultiplier: 1.5, competitiveMultiplier: 1.2, casualMultiplier: 1.0 },
    { gameTitle: 'CS2', eventType: 'WIN', basePoints: 50, multiplier: 1.0, rankedMultiplier: 2.0, competitiveMultiplier: 1.5, casualMultiplier: 1.0 },
    { gameTitle: 'CS2', eventType: 'LOSS', basePoints: 10, multiplier: 1.0, rankedMultiplier: 1.0, competitiveMultiplier: 1.0, casualMultiplier: 1.0 },
    { gameTitle: 'CS2', eventType: 'ACE', basePoints: 100, multiplier: 1.0, rankedMultiplier: 2.0, competitiveMultiplier: 1.5, casualMultiplier: 1.0 },
    { gameTitle: 'CS2', eventType: 'CLUTCH', basePoints: 30, multiplier: 1.0, rankedMultiplier: 1.5, competitiveMultiplier: 1.3, casualMultiplier: 1.0 },
    { gameTitle: 'CS2', eventType: 'HEADSHOT', basePoints: 5, multiplier: 1.0, rankedMultiplier: 1.3, competitiveMultiplier: 1.2, casualMultiplier: 1.0 },
    { gameTitle: 'CS2', eventType: 'FIRST_BLOOD', basePoints: 15, multiplier: 1.0, rankedMultiplier: 1.5, competitiveMultiplier: 1.2, casualMultiplier: 1.0 },
    { gameTitle: 'CS2', eventType: 'MVP', basePoints: 75, multiplier: 1.0, rankedMultiplier: 2.0, competitiveMultiplier: 1.5, casualMultiplier: 1.0 },
    { gameTitle: 'CS2', eventType: 'PLANT', basePoints: 10, multiplier: 1.0, rankedMultiplier: 1.3, competitiveMultiplier: 1.2, casualMultiplier: 1.0 },
    { gameTitle: 'CS2', eventType: 'DEFUSE', basePoints: 15, multiplier: 1.0, rankedMultiplier: 1.5, competitiveMultiplier: 1.3, casualMultiplier: 1.0 },

    // League of Legends Points Configuration
    { gameTitle: 'LEAGUE_OF_LEGENDS', eventType: 'KILL', basePoints: 15, multiplier: 1.0, rankedMultiplier: 1.8, competitiveMultiplier: 1.3, casualMultiplier: 1.0 },
    { gameTitle: 'LEAGUE_OF_LEGENDS', eventType: 'DEATH', basePoints: -5, multiplier: 1.0, rankedMultiplier: 1.0, competitiveMultiplier: 1.0, casualMultiplier: 1.0 },
    { gameTitle: 'LEAGUE_OF_LEGENDS', eventType: 'ASSIST', basePoints: 8, multiplier: 1.0, rankedMultiplier: 1.5, competitiveMultiplier: 1.2, casualMultiplier: 1.0 },
    { gameTitle: 'LEAGUE_OF_LEGENDS', eventType: 'WIN', basePoints: 100, multiplier: 1.0, rankedMultiplier: 2.5, competitiveMultiplier: 1.8, casualMultiplier: 1.0 },
    { gameTitle: 'LEAGUE_OF_LEGENDS', eventType: 'LOSS', basePoints: 20, multiplier: 1.0, rankedMultiplier: 1.2, competitiveMultiplier: 1.1, casualMultiplier: 1.0 },
    { gameTitle: 'LEAGUE_OF_LEGENDS', eventType: 'MVP', basePoints: 150, multiplier: 1.0, rankedMultiplier: 2.5, competitiveMultiplier: 2.0, casualMultiplier: 1.0 },
    { gameTitle: 'LEAGUE_OF_LEGENDS', eventType: 'MULTI_KILL', basePoints: 25, multiplier: 2.0, rankedMultiplier: 1.8, competitiveMultiplier: 1.5, casualMultiplier: 1.0 },
    { gameTitle: 'LEAGUE_OF_LEGENDS', eventType: 'OBJECTIVE_COMPLETED', basePoints: 20, multiplier: 1.0, rankedMultiplier: 1.5, competitiveMultiplier: 1.3, casualMultiplier: 1.0 },
    { gameTitle: 'LEAGUE_OF_LEGENDS', eventType: 'DAMAGE_DEALT', basePoints: 0, multiplier: 0.001, minValue: 1000, maxPoints: 50, rankedMultiplier: 1.3, competitiveMultiplier: 1.2, casualMultiplier: 1.0 },
    { gameTitle: 'LEAGUE_OF_LEGENDS', eventType: 'HEALING_DONE', basePoints: 0, multiplier: 0.002, minValue: 500, maxPoints: 30, rankedMultiplier: 1.3, competitiveMultiplier: 1.2, casualMultiplier: 1.0 }
  ];

  for (const config of pointsConfigs) {
    await prisma.pointsConfig.upsert({
      where: {
        gameTitle_eventType: {
          gameTitle: config.gameTitle as any,
          eventType: config.eventType as any
        }
      },
      update: {
        ...config,
        gameTitle: config.gameTitle as any,
        eventType: config.eventType as any,
      },
      create: {
        ...config,
        gameTitle: config.gameTitle as any,
        eventType: config.eventType as any,
        isActive: true
      }
    });
  }

  console.log(`✅ Created ${pointsConfigs.length} points configurations`);
}

async function seedOverwolfChallenges() {
  console.log('🎯 Seeding Overwolf-based Challenges...');

  // Get existing games
  const games = await prisma.game.findMany({
    where: {
      slug: { in: ['valorant', 'cs2', 'league-of-legends'] }
    }
  });

  const challenges = [
    // Daily Challenges
    {
      title: 'Daily Warrior',
      description: 'Get 10 kills in any game today',
      gameId: games.find(g => g.slug === 'valorant')?.id || '',
      type: 'DAILY',
      category: 'AUTO',
      difficulty: 'Easy',
      target: 'Get 10 kills',
      targetValue: 10,
      pointsReward: 100,
      autoCompleteRule: JSON.stringify({ eventType: 'KILL', count: 10 }),
      startDate: new Date(),
      endDate: new Date(Date.now() + 24 * 60 * 60 * 1000)
    },
    {
      title: 'Ace Master',
      description: 'Get 1 ace in Valorant',
      gameId: games.find(g => g.slug === 'valorant')?.id || '',
      type: 'DAILY',
      category: 'AUTO',
      difficulty: 'Hard',
      target: 'Get 1 ace',
      targetValue: 1,
      pointsReward: 250,
      autoCompleteRule: JSON.stringify({ eventType: 'ACE', count: 1 }),
      startDate: new Date(),
      endDate: new Date(Date.now() + 24 * 60 * 60 * 1000)
    },
    {
      title: 'Victory Hunter',
      description: 'Win 3 matches today',
      gameId: games.find(g => g.slug === 'cs2')?.id || '',
      type: 'DAILY',
      category: 'AUTO',
      difficulty: 'Medium',
      target: 'Win 3 matches',
      targetValue: 3,
      pointsReward: 200,
      autoCompleteRule: JSON.stringify({ eventType: 'WIN', count: 3 }),
      startDate: new Date(),
      endDate: new Date(Date.now() + 24 * 60 * 60 * 1000)
    },

    // Weekly Challenges
    {
      title: 'Headshot Expert',
      description: 'Get 50 headshots this week',
      gameId: games.find(g => g.slug === 'valorant')?.id || '',
      type: 'WEEKLY',
      category: 'AUTO',
      difficulty: 'Medium',
      target: 'Get 50 headshots',
      targetValue: 50,
      pointsReward: 500,
      autoCompleteRule: JSON.stringify({ eventType: 'HEADSHOT', count: 50 }),
      startDate: new Date(),
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    },
    {
      title: 'Team Player',
      description: 'Get 100 assists this week',
      gameId: games.find(g => g.slug === 'league-of-legends')?.id || '',
      type: 'WEEKLY',
      category: 'AUTO',
      difficulty: 'Hard',
      target: 'Get 100 assists',
      targetValue: 100,
      pointsReward: 750,
      autoCompleteRule: JSON.stringify({ eventType: 'ASSIST', count: 100 }),
      startDate: new Date(),
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    },

    // Monthly Challenges
    {
      title: 'Consistent Champion',
      description: 'Win 50 matches this month',
      gameId: games.find(g => g.slug === 'cs2')?.id || '',
      type: 'MONTHLY',
      category: 'AUTO',
      difficulty: 'Expert',
      target: 'Win 50 matches',
      targetValue: 50,
      pointsReward: 2000,
      autoCompleteRule: JSON.stringify({ eventType: 'WIN', count: 50 }),
      startDate: new Date(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    }
  ];

  for (const challenge of challenges) {
    if (challenge.gameId) {
      await prisma.challenge.create({
        data: {
          ...challenge,
          type: challenge.type as any,
          category: challenge.category as any,
        }
      });
    }
  }

  console.log(`✅ Created ${challenges.filter(c => c.gameId).length} Overwolf challenges`);
}

async function main() {
  try {
    await seedOverwolfPointsConfig();
    await seedOverwolfChallenges();
    
    console.log('🎉 Overwolf integration seeding completed successfully!');
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  main().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}

export default main;
