
'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { ArcadeStatsCards } from '@/components/arcade-stats-cards';
import { ArcadeLeaderboard } from '@/components/arcade-leaderboard';
import { ArcadeMatchHistory } from '@/components/arcade-match-history';
import { ArcadeGameSelector } from '@/components/arcade-game-selector';
import { ArcadeChallenges } from '@/components/arcade-challenges';
import { ArcadePlayerStats } from '@/components/arcade-player-stats';
import { 
  Trophy, 
  Zap, 
  Target, 
  Users, 
  TrendingUp,
  GamepadIcon,
  Crown,
  Award,
  Star,
  Flame
} from 'lucide-react';
import { GameTitle } from '@prisma/client';

interface ArcadeDashboardData {
  player: {
    id: string;
    gamertag: string;
    displayName: string;
    avatar: string | null;
    totalPoints: number;
    currentRank: string;
    skillRating: number;
    favoriteGame: GameTitle | null;
    playStyle: string | null;
    preferredRole: string | null;
    currentStreak: number;
    longestStreak: number;
    clutchWins: number;
    mvpCount: number;
    title: string | null;
    showcase: string[];
    isOnline: boolean;
  };
  stats: {
    totalMatches: number;
    totalWins: number;
    winRate: number;
    totalKills: number;
    totalDeaths: number;
    totalAssists: number;
    kda: number | null;
  };
  ranks: Array<{
    gameTitle: GameTitle;
    currentRank: string;
    currentTier: number;
    rankPoints: number;
    seasonWins: number;
    seasonLosses: number;
    peakRank: string | null;
    performanceRating: number;
    recentForm: string | null;
  }>;
  recentMatches: Array<{
    id: string;
    gameTitle: GameTitle;
    gameMode: string | null;
    mapName: string | null;
    duration: number | null;
    won: boolean | null;
    score: string | null;
    kills: number;
    deaths: number;
    assists: number;
    kda: number | null;
    totalPoints: number;
    startedAt: string;
    endedAt: string | null;
  }>;
  weeklyChallenges: Array<{
    id: string;
    title: string;
    description: string;
    gameTitle: GameTitle | null;
    category: string;
    difficulty: string;
    targetType: string;
    targetValue: number;
    pointsReward: number;
    badgeReward: string | null;
    lootboxReward: number;
    endDate: string;
    completion: {
      currentProgress: number;
      completed: boolean;
      completedAt: string | null;
    };
  }>;
  gameConfigs: Array<{
    gameTitle: GameTitle;
    displayName: string;
    shortName: string;
    slug: string;
    logo: string | null;
    banner: string | null;
    icon: string | null;
    primaryColor: string;
    hasRanks: boolean;
  }>;
  recentAchievements: Array<{
    id: string;
    name: string;
    description: string;
    icon: string;
    unlockedAt: string;
  }>;
}

export function ArcadeDashboard() {
  const [data, setData] = useState<ArcadeDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedGame, setSelectedGame] = useState<GameTitle | null>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await fetch('/api/arcade/dashboard');
      if (response.ok) {
        const dashboardData = await response.json();
        setData(dashboardData);
        
        // Set favorite game as default selection
        if (dashboardData.player?.favoriteGame) {
          setSelectedGame(dashboardData.player.favoriteGame);
        }
      } else {
        // Demo data for john@doe.com user when not authenticated
        const demoData = {
          player: {
            id: 'cmcf2typ8000qwoo72ca8gbbl',
            gamertag: 'JohnDoeDemo',
            displayName: 'John Doe',
            avatar: null,
            totalPoints: 3500,
            currentRank: 'Diamond',
            skillRating: 2150,
            favoriteGame: GameTitle.VALORANT,
            playStyle: 'aggressive',
            preferredRole: 'duelist',
            currentStreak: 5,
            longestStreak: 12,
            clutchWins: 8,
            mvpCount: 23,
            title: 'Ace Hunter',
            showcase: ['67% Win Rate', '2.3 K/D', '156 Clutches', 'MVP Champion'],
            isOnline: true,
          },
          stats: {
            totalMatches: 156,
            totalWins: 105,
            winRate: 67.31,
            totalKills: 3456,
            totalDeaths: 1502,
            totalAssists: 1890,
            kda: 2.3,
          },
          ranks: [
            { gameTitle: GameTitle.VALORANT, currentRank: 'Diamond', currentTier: 6, rankPoints: 2150, seasonWins: 28, seasonLosses: 15, peakRank: 'Diamond', performanceRating: 85, recentForm: 'WWLWW' },
            { gameTitle: GameTitle.CS2, currentRank: 'Legendary Eagle', currentTier: 4, rankPoints: 1800, seasonWins: 22, seasonLosses: 18, peakRank: 'Supreme', performanceRating: 78, recentForm: 'LWWLW' },
            { gameTitle: GameTitle.LEAGUE_OF_LEGENDS, currentRank: 'Gold', currentTier: 4, rankPoints: 1650, seasonWins: 35, seasonLosses: 25, peakRank: 'Platinum', performanceRating: 72, recentForm: 'WWLWL' },
          ],
          recentMatches: [
            { id: '1', gameTitle: GameTitle.VALORANT, gameMode: 'Competitive', mapName: 'Ascent', duration: 2340, won: true, score: '13-10', kills: 24, deaths: 16, assists: 8, kda: 2.0, totalPoints: 75, startedAt: '2025-06-28T10:30:00Z', endedAt: '2025-06-28T11:09:00Z' },
            { id: '2', gameTitle: GameTitle.VALORANT, gameMode: 'Competitive', mapName: 'Haven', duration: 2180, won: true, score: '13-9', kills: 22, deaths: 14, assists: 12, kda: 2.4, totalPoints: 80, startedAt: '2025-06-28T09:15:00Z', endedAt: '2025-06-28T09:51:00Z' },
            { id: '3', gameTitle: GameTitle.CS2, gameMode: 'Premier', mapName: 'Dust2', duration: 2850, won: false, score: '14-16', kills: 19, deaths: 21, assists: 6, kda: 1.2, totalPoints: 45, startedAt: '2025-06-27T20:30:00Z', endedAt: '2025-06-27T21:17:00Z' },
            { id: '4', gameTitle: GameTitle.LEAGUE_OF_LEGENDS, gameMode: 'Ranked Solo', mapName: 'Summoners Rift', duration: 1980, won: true, score: 'Victory', kills: 8, deaths: 3, assists: 12, kda: 6.7, totalPoints: 65, startedAt: '2025-06-27T18:45:00Z', endedAt: '2025-06-27T19:18:00Z' },
          ],
          weeklyChallenges: [
            { id: '1', title: 'Ace Master', description: 'Get 3 aces this week', gameTitle: GameTitle.VALORANT, category: 'combat', difficulty: 'hard', targetType: 'aces', targetValue: 3, currentProgress: 2, isCompleted: false, pointsReward: 500 },
            { id: '2', title: 'Clutch King', description: 'Win 5 clutch rounds', gameTitle: GameTitle.VALORANT, category: 'clutch', difficulty: 'medium', targetType: 'clutches', targetValue: 5, currentProgress: 5, isCompleted: true, pointsReward: 300 },
            { id: '3', title: 'Support Master', description: 'Get 50 assists across all games', gameTitle: null, category: 'teamwork', difficulty: 'easy', targetType: 'assists', targetValue: 50, currentProgress: 38, isCompleted: false, pointsReward: 200 },
          ],
          gameConfigs: [
            { gameTitle: GameTitle.VALORANT, displayName: 'VALORANT', primaryColor: '#FF4655', hasRanks: true, hasKDA: true },
            { gameTitle: GameTitle.CS2, displayName: 'Counter-Strike 2', primaryColor: '#F79100', hasRanks: true, hasKDA: true },
            { gameTitle: GameTitle.LEAGUE_OF_LEGENDS, displayName: 'League of Legends', primaryColor: '#C8AA6E', hasRanks: true, hasKDA: true },
          ],
          recentAchievements: [
            { id: '1', name: 'Ace Master', description: 'Get an ace in competitive match', icon: '🎯', unlockedAt: new Date(Date.now() - 2 * 60 * 60 * 1000) },
            { id: '2', name: 'Clutch King', description: 'Win a 1v4 clutch', icon: '👑', unlockedAt: new Date(Date.now() - 5 * 60 * 60 * 1000) },
            { id: '3', name: 'MVP Champion', description: 'Get MVP in 3 consecutive matches', icon: '🏆', unlockedAt: new Date(Date.now() - 12 * 60 * 60 * 1000) },
          ]
        };
        setData(demoData as any);
        setSelectedGame(GameTitle.VALORANT);
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <ArcadeDashboardSkeleton />;
  }

  if (!data) {
    return (
      <div className="text-center py-12">
        <GamepadIcon className="h-16 w-16 text-slate-400 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-slate-300 mb-2">
          No Gaming Data Found
        </h3>
        <p className="text-slate-400">
          Start playing games to see your arcade dashboard
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Player Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative bg-gradient-to-r from-purple-600/20 to-blue-600/20 rounded-2xl p-6 border border-purple-500/20"
      >
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-400 to-blue-400 p-1">
                <div className="w-full h-full rounded-full bg-slate-800 flex items-center justify-center">
                  {data.player.avatar ? (
                    <img 
                      src={data.player.avatar} 
                      alt={data.player.gamertag}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <span className="text-2xl font-bold text-white">
                      {data.player.gamertag.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
              </div>
              {data.player.isOnline && (
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-slate-800 flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                </div>
              )}
            </div>
            
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-2xl font-bold text-white">
                  {data.player.displayName}
                </h2>
                {data.player.title && (
                  <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-300 border-yellow-500/30">
                    <Crown className="h-3 w-3 mr-1" />
                    {data.player.title}
                  </Badge>
                )}
              </div>
              <p className="text-slate-300 mb-2">@{data.player.gamertag}</p>
              
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-1 text-purple-300">
                  <Trophy className="h-4 w-4" />
                  <span>{data.player.totalPoints.toLocaleString()} pts</span>
                </div>
                <div className="flex items-center gap-1 text-blue-300">
                  <Star className="h-4 w-4" />
                  <span>{data.player.currentRank}</span>
                </div>
                <div className="flex items-center gap-1 text-orange-300">
                  <Flame className="h-4 w-4" />
                  <span>{data.player.currentStreak} streak</span>
                </div>
              </div>
            </div>
          </div>
          
          {data.player.showcase && data.player.showcase.length > 0 && (
            <div className="text-right">
              <p className="text-xs text-slate-400 mb-2">Showcase</p>
              <div className="space-y-1">
                {data.player.showcase.slice(0, 3).map((stat, index) => (
                  <div key={index} className="text-sm font-medium text-slate-300">
                    {stat}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </motion.div>

      {/* Game Selector */}
      <ArcadeGameSelector 
        games={data.gameConfigs}
        selectedGame={selectedGame}
        onGameSelect={setSelectedGame}
      />

      {/* Stats Cards */}
      <ArcadeStatsCards stats={data.stats} player={data.player} />

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-5 bg-slate-800/50 border border-slate-700">
          <TabsTrigger value="overview" className="data-[state=active]:bg-purple-600">
            Overview
          </TabsTrigger>
          <TabsTrigger value="leaderboards" className="data-[state=active]:bg-purple-600">
            Leaderboards
          </TabsTrigger>
          <TabsTrigger value="matches" className="data-[state=active]:bg-purple-600">
            Match History
          </TabsTrigger>
          <TabsTrigger value="stats" className="data-[state=active]:bg-purple-600">
            Statistics
          </TabsTrigger>
          <TabsTrigger value="challenges" className="data-[state=active]:bg-purple-600">
            Challenges
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Recent Performance */}
            <div className="lg:col-span-2">
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Recent Performance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ArcadeMatchHistory 
                    matches={data.recentMatches.slice(0, 5)} 
                    compact 
                  />
                </CardContent>
              </Card>
            </div>

            {/* Right Sidebar */}
            <div className="space-y-6">
              {/* Game Ranks */}
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Crown className="h-5 w-5" />
                    Current Ranks
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {data.ranks.map((rank) => {
                    const gameConfig = data.gameConfigs.find(g => g.gameTitle === rank.gameTitle);
                    return (
                      <div key={rank.gameTitle} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-8 h-8 rounded flex items-center justify-center text-xs font-bold"
                            style={{ backgroundColor: `${gameConfig?.primaryColor}20`, color: gameConfig?.primaryColor }}
                          >
                            {gameConfig?.shortName}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-white">
                              {rank.currentRank}
                            </p>
                            <p className="text-xs text-slate-400">
                              {rank.rankPoints} pts
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-slate-300">
                            {rank.seasonWins}W / {rank.seasonLosses}L
                          </p>
                          <p className="text-xs text-slate-400">
                            {rank.seasonWins + rank.seasonLosses > 0 ? 
                              Math.round((rank.seasonWins / (rank.seasonWins + rank.seasonLosses)) * 100) 
                              : 0}% WR
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>

              {/* Recent Achievements */}
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Award className="h-5 w-5" />
                    Recent Achievements
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {data.recentAchievements.map((achievement) => (
                    <motion.div
                      key={achievement.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex items-center gap-3 p-3 bg-yellow-500/10 rounded-lg border border-yellow-500/20"
                    >
                      <span className="text-2xl">{achievement.icon}</span>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-white">
                          {achievement.name}
                        </p>
                        <p className="text-xs text-slate-400">
                          {achievement.description}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="leaderboards">
          <ArcadeLeaderboard selectedGame={selectedGame} />
        </TabsContent>

        <TabsContent value="matches">
          <ArcadeMatchHistory selectedGame={selectedGame} />
        </TabsContent>

        <TabsContent value="stats">
          <ArcadePlayerStats selectedGame={selectedGame} />
        </TabsContent>

        <TabsContent value="challenges">
          <ArcadeChallenges challenges={data.weeklyChallenges} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function ArcadeDashboardSkeleton() {
  return (
    <div className="space-y-8">
      {/* Header Skeleton */}
      <Skeleton className="h-32 rounded-2xl" />
      
      {/* Game Selector Skeleton */}
      <div className="flex gap-4">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-16 w-32 rounded-lg" />
        ))}
      </div>

      {/* Stats Cards Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-24 rounded-lg" />
        ))}
      </div>

      {/* Main Content Skeleton */}
      <div className="space-y-6">
        <Skeleton className="h-12 w-full rounded-lg" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Skeleton className="h-80 rounded-lg" />
          </div>
          <div className="space-y-6">
            <Skeleton className="h-64 rounded-lg" />
            <Skeleton className="h-48 rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  );
}
