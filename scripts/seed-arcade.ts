
import { config } from 'dotenv';
import { PrismaClient, GameTitle } from '@prisma/client';

// Load environment variables
config();

const prisma = new PrismaClient();

async function main() {
  console.log('🎮 Seeding Arcade System...');

  // Game Configurations
  const gameConfigs = [
    {
      gameTitle: GameTitle.VALORANT,
      displayName: 'VALORANT',
      shortName: 'VAL',
      slug: 'valorant',
      description: 'Tactical FPS oyunu',
      logo: 'https://i.pinimg.com/originals/22/f0/aa/22f0aaa27d8e54c51debbdabfb022597.jpg',
      banner: 'https://i.ytimg.com/vi/nD71qCWEtwY/maxresdefault.jpg',
      icon: 'https://i.pinimg.com/originals/ea/2e/a1/ea2ea1e23dd325f1ebe5edf83c2e15c5.png',
      primaryColor: '#FF4655',
      maxRankTier: 8,
      rankNames: ['Iron', 'Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond', 'Immortal', 'Radiant'],
      defaultRank: 'Iron',
      killPoints: 10,
      assistPoints: 5,
      winPoints: 50,
      mvpPoints: 25,
      acePoints: 100,
      hasRanks: true,
      hasKDA: true,
      hasHeadshots: true,
      hasObjectives: true,
      supportsTeams: true,
    },
    {
      gameTitle: GameTitle.CS2,
      displayName: 'Counter-Strike 2',
      shortName: 'CS2',
      slug: 'counter-strike-2',
      description: 'Competitive FPS oyunu',
      logo: 'https://blogger.googleusercontent.com/img/a/AVvXsEhD8xMqW0q18z7x2wguUkkwTB7caToO8wlSnk26s-vRpw-O1wdbxaqk8UAEMCez1RM22XdU-ELCATxNj2OjNTQnbEcEvE5U1DPhPYpKHmFQPcS24wNTH-kNEMe2R2paokw2sSjICkf8CfjYgZPADax17XQxDZwc2E_iba9VHDol-0X6xN8s9LbV5tkXLec=s1269',
      banner: 'https://i.ytimg.com/vi/zqLy6pPmupo/maxresdefault.jpg',
      icon: 'https://images-wixmp-ed30a86b8c4ca887773594c2.wixmp.com/f/3411dfaa-893e-4093-9260-3592bbd25a39/dgaf20k-dcd4f1a9-69a1-4bf1-9d25-be58cee536e4.png?token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1cm46YXBwOjdlMGQxODg5ODIyNjQzNzNhNWYwZDQxNWVhMGQyNmUwIiwiaXNzIjoidXJuOmFwcDo3ZTBkMTg4OTgyMjY0MzczYTVmMGQ0MTVlYTBkMjZlMCIsIm9iaiI6W1t7InBhdGgiOiJcL2ZcLzM0MTFkZmFhLTg5M2UtNDA5My05MjYwLTM1OTJiYmQyNWEzOVwvZGdhZjIway1kY2Q0ZjFhOS02OWExLTRiZjEtOWQyNS1iZTU4Y2VlNTM2ZTQucG5nIn1dXSwiYXVkIjpbInVybjpzZXJ2aWNlOmZpbGUuZG93bmxvYWQiXX0.SST1beWbLbxU61rmuViwSFlk3BCRdI6c_aLizFCe4Ak',
      primaryColor: '#F7931E',
      maxRankTier: 7,
      rankNames: ['Silver', 'Gold Nova', 'Master Guardian', 'Legendary Eagle', 'Supreme', 'Global Elite', 'Faceit'],
      defaultRank: 'Silver',
      killPoints: 8,
      assistPoints: 4,
      winPoints: 60,
      mvpPoints: 30,
      acePoints: 120,
      hasRanks: true,
      hasKDA: true,
      hasHeadshots: true,
      hasObjectives: true,
      supportsTeams: true,
    },
    {
      gameTitle: GameTitle.LEAGUE_OF_LEGENDS,
      displayName: 'League of Legends',
      shortName: 'LoL',
      slug: 'league-of-legends',
      description: 'MOBA oyunu',
      logo: 'https://s-media-cache-ak0.pinimg.com/originals/8c/10/e0/8c10e06a6acb06276aa880caa90e54bc.jpg',
      banner: 'https://i.pinimg.com/originals/77/9b/d0/779bd0aefd29434d5980c0fe9c3ed242.jpg',
      icon: 'https://i.pinimg.com/originals/f8/86/b3/f886b340577ab9876ec1c1a2e542160f.jpg',
      primaryColor: '#C89B3C',
      maxRankTier: 9,
      rankNames: ['Iron', 'Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond', 'Master', 'Grandmaster', 'Challenger'],
      defaultRank: 'Iron',
      killPoints: 12,
      assistPoints: 8,
      winPoints: 80,
      mvpPoints: 40,
      acePoints: 150,
      hasRanks: true,
      hasKDA: true,
      hasHeadshots: false,
      hasObjectives: true,
      supportsTeams: true,
    },
  ];

  // Create Game Configurations
  for (const config of gameConfigs) {
    await prisma.gameConfig.upsert({
      where: { gameTitle: config.gameTitle },
      update: config,
      create: config,
    });
  }

  // Create Real-time Leaderboards
  const leaderboardTypes = [
    { gameTitle: GameTitle.VALORANT, period: 'daily', category: 'kills' },
    { gameTitle: GameTitle.VALORANT, period: 'weekly', category: 'wins' },
    { gameTitle: GameTitle.VALORANT, period: 'monthly', category: 'kda' },
    { gameTitle: GameTitle.VALORANT, period: 'alltime', category: 'points' },
    { gameTitle: GameTitle.CS2, period: 'daily', category: 'kills' },
    { gameTitle: GameTitle.CS2, period: 'weekly', category: 'wins' },
    { gameTitle: GameTitle.CS2, period: 'monthly', category: 'kda' },
    { gameTitle: GameTitle.CS2, period: 'alltime', category: 'points' },
    { gameTitle: GameTitle.LEAGUE_OF_LEGENDS, period: 'daily', category: 'kills' },
    { gameTitle: GameTitle.LEAGUE_OF_LEGENDS, period: 'weekly', category: 'wins' },
    { gameTitle: GameTitle.LEAGUE_OF_LEGENDS, period: 'monthly', category: 'kda' },
    { gameTitle: GameTitle.LEAGUE_OF_LEGENDS, period: 'alltime', category: 'points' },
  ];

  for (const lb of leaderboardTypes) {
    await prisma.realtimeLeaderboard.upsert({
      where: {
        gameTitle_period_category: {
          gameTitle: lb.gameTitle,
          period: lb.period,
          category: lb.category,
        },
      },
      update: {
        data: JSON.stringify([]), // Empty leaderboard initially
        lastUpdated: new Date(),
      },
      create: {
        gameTitle: lb.gameTitle,
        period: lb.period,
        category: lb.category,
        data: JSON.stringify([]),
        maxEntries: 100,
        updateInterval: 300,
      },
    });
  }

  // Get demo player
  const demoUser = await prisma.user.findUnique({
    where: { email: 'john@doe.com' },
    include: { player: true },
  });

  if (demoUser?.player) {
    const playerId = demoUser.player.id;

    // Update player with arcade features
    await prisma.player.update({
      where: { id: playerId },
      data: {
        favoriteGame: GameTitle.VALORANT,
        playStyle: 'aggressive',
        preferredRole: 'duelist',
        currentStreak: 5,
        longestStreak: 12,
        clutchWins: 8,
        mvpCount: 23,
        title: 'Ace Hunter',
        showcase: ['67% Win Rate', '2.3 K/D', '156 Clutches', 'MVP Champion'],
      },
    });

    // Create Player Ranks for all games
    const ranks = [
      { gameTitle: GameTitle.VALORANT, currentRank: 'Diamond', currentTier: 6, rankPoints: 2150, seasonWins: 28, seasonLosses: 15, peakRank: 'Diamond', peakTier: 6 },
      { gameTitle: GameTitle.CS2, currentRank: 'Legendary Eagle', currentTier: 4, rankPoints: 1800, seasonWins: 22, seasonLosses: 18, peakRank: 'Supreme', peakTier: 5 },
      { gameTitle: GameTitle.LEAGUE_OF_LEGENDS, currentRank: 'Gold', currentTier: 4, rankPoints: 1650, seasonWins: 35, seasonLosses: 25, peakRank: 'Platinum', peakTier: 5 },
    ];

    for (const rank of ranks) {
      await prisma.playerRank.upsert({
        where: {
          playerId_gameTitle: {
            playerId: playerId,
            gameTitle: rank.gameTitle,
          },
        },
        update: rank,
        create: {
          playerId: playerId,
          ...rank,
          performanceRating: 1200 + (rank.currentTier * 200),
          recentForm: 'W-W-L-W-W',
        },
      });
    }

    // Create some demo matches for the demo player
    const demoMatches = [
      {
        gameTitle: GameTitle.VALORANT,
        gameMode: 'Competitive',
        mapName: 'Bind',
        duration: 2580, // 43 minutes
        status: 'COMPLETED' as const,
        won: true,
        score: '13-11',
        playerScore: 24,
        rank: 'Diamond',
        kills: 24,
        deaths: 16,
        assists: 8,
        headshots: 12,
        accuracy: 67.5,
        damage: 4250.0,
        plants: 3,
        defuses: 1,
        firstBloods: 2,
        aces: 1,
        clutches: 2,
        basePoints: 50,
        bonusPoints: 75,
        totalPoints: 125,
        pointsAwarded: true,
        startedAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        endedAt: new Date(Date.now() - 1.5 * 60 * 60 * 1000),
      },
      {
        gameTitle: GameTitle.CS2,
        gameMode: 'Premier',
        mapName: 'Mirage',
        duration: 3120, // 52 minutes
        status: 'COMPLETED' as const,
        won: false,
        score: '14-16',
        playerScore: 19,
        rank: 'Legendary Eagle',
        kills: 19,
        deaths: 21,
        assists: 6,
        headshots: 8,
        accuracy: 58.2,
        damage: 3890.0,
        plants: 2,
        defuses: 2,
        firstBloods: 1,
        aces: 0,
        clutches: 1,
        basePoints: 25,
        bonusPoints: 15,
        totalPoints: 40,
        pointsAwarded: true,
        startedAt: new Date(Date.now() - 5 * 60 * 60 * 1000), // 5 hours ago
        endedAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
      },
      {
        gameTitle: GameTitle.LEAGUE_OF_LEGENDS,
        gameMode: 'Ranked Solo',
        mapName: 'Summoner\'s Rift',
        duration: 1980, // 33 minutes
        status: 'COMPLETED' as const,
        won: true,
        score: 'Victory',
        playerScore: 15,
        rank: 'Gold II',
        kills: 8,
        deaths: 3,
        assists: 12,
        cs: 156,
        gold: 12450.0,
        level: 16,
        wardsPlaced: 14,
        wardsDestroyed: 7,
        basePoints: 80,
        bonusPoints: 20,
        totalPoints: 100,
        pointsAwarded: true,
        startedAt: new Date(Date.now() - 8 * 60 * 60 * 1000), // 8 hours ago
        endedAt: new Date(Date.now() - 7.5 * 60 * 60 * 1000),
      },
    ];

    for (const match of demoMatches) {
      await prisma.overwolfMatch.create({
        data: {
          playerId: playerId,
          ...match,
        },
      });
    }

    // Create Weekly Challenges
    const currentWeek = Math.ceil((Date.now() - new Date(new Date().getFullYear(), 0, 1).getTime()) / (7 * 24 * 60 * 60 * 1000));
    const currentYear = new Date().getFullYear();

    const weeklyChallenges = [
      {
        week: currentWeek,
        year: currentYear,
        gameTitle: GameTitle.VALORANT,
        title: 'Ace Master',
        description: 'Get 3 aces this week in competitive matches',
        category: 'combat',
        difficulty: 'hard',
        targetType: 'aces',
        targetValue: 3,
        pointsReward: 500,
        badgeReward: 'Ace Hunter',
        lootboxReward: 2,
        startDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        endDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      },
      {
        week: currentWeek,
        year: currentYear,
        gameTitle: GameTitle.CS2,
        title: 'Clutch King',
        description: 'Win 5 clutch situations (1v2 or better)',
        category: 'combat',
        difficulty: 'medium',
        targetType: 'clutches',
        targetValue: 5,
        pointsReward: 300,
        badgeReward: 'Clutch Master',
        lootboxReward: 1,
        startDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        endDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      },
      {
        week: currentWeek,
        year: currentYear,
        gameTitle: GameTitle.LEAGUE_OF_LEGENDS,
        title: 'Support Master',
        description: 'Get 20 assists in ranked matches',
        category: 'teamplay',
        difficulty: 'medium',
        targetType: 'assists',
        targetValue: 20,
        timeLimit: 168, // 1 week
        pointsReward: 350,
        badgeReward: 'Team Player',
        lootboxReward: 1,
        startDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        endDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      },
    ];

    for (const challenge of weeklyChallenges) {
      const createdChallenge = await prisma.weeklyChallenge.upsert({
        where: {
          week_year_gameTitle: {
            week: challenge.week,
            year: challenge.year,
            gameTitle: challenge.gameTitle,
          },
        },
        update: challenge,
        create: challenge,
      });

      // Create challenge completion for demo player
      await prisma.weeklyChallengeCompletion.upsert({
        where: {
          challengeId_playerId: {
            challengeId: createdChallenge.id,
            playerId: playerId,
          },
        },
        update: {
          currentProgress: challenge.targetType === 'aces' ? 1 : challenge.targetType === 'clutches' ? 3 : challenge.targetType === 'assists' ? 8 : 1,
          completed: false,
        },
        create: {
          challengeId: createdChallenge.id,
          playerId: playerId,
          currentProgress: challenge.targetType === 'aces' ? 1 : challenge.targetType === 'clutches' ? 3 : challenge.targetType === 'assists' ? 8 : 1,
          completed: false,
        },
      });
    }

    // Create Daily Stats for demo player
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const dailyStatsData = [
      {
        playerId: playerId,
        gameTitle: GameTitle.VALORANT,
        date: today,
        matchesPlayed: 3,
        matchesWon: 2,
        winRate: 66.7,
        totalKills: 42,
        totalDeaths: 28,
        totalAssists: 18,
        avgKDA: 2.14,
        bestKDA: 3.5,
        longestStreak: 2,
        mvpCount: 1,
        aceCount: 1,
        totalPoints: 225,
        bonusPoints: 50,
        totalPlaytime: 180,
      },
      {
        playerId: playerId,
        gameTitle: GameTitle.CS2,
        date: today,
        matchesPlayed: 2,
        matchesWon: 1,
        winRate: 50.0,
        totalKills: 28,
        totalDeaths: 32,
        totalAssists: 12,
        avgKDA: 1.25,
        bestKDA: 1.8,
        longestStreak: 1,
        mvpCount: 0,
        aceCount: 0,
        totalPoints: 140,
        bonusPoints: 20,
        totalPlaytime: 120,
      },
    ];

    for (const stats of dailyStatsData) {
      await prisma.dailyStats.upsert({
        where: {
          playerId_gameTitle_date: {
            playerId: stats.playerId,
            gameTitle: stats.gameTitle,
            date: stats.date,
          },
        },
        update: stats,
        create: stats,
      });
    }

    console.log('✅ Demo player arcade data created');
  }

  console.log('🎮 Arcade System seeded successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding arcade system:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
