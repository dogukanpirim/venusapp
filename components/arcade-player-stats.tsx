
'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import { 
  TrendingUp, 
  Target, 
  Zap,
  Award,
  Crown,
  Shield,
  Crosshair,
  Clock,
  Trophy,
  Users
} from 'lucide-react';
import { GameTitle } from '@prisma/client';

interface PlayerStatsData {
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
  };
  currentRank: {
    gameTitle: GameTitle;
    currentRank: string;
    currentTier: number;
    rankPoints: number;
    seasonWins: number;
    seasonLosses: number;
    peakRank: string | null;
    peakTier: number;
    performanceRating: number;
    recentForm: string | null;
  } | null;
  matchStats: {
    totalMatches: number;
    wins: number;
    losses: number;
    draws: number;
    winRate: number;
    totalKills: number;
    totalDeaths: number;
    totalAssists: number;
    totalHeadshots: number;
    totalDamage: number;
    totalAces: number;
    totalClutches: number;
    totalFirstBloods: number;
    totalPoints: number;
  };
  averages: {
    kdaRatio: number;
    killsPerMatch: number;
    deathsPerMatch: number;
    assistsPerMatch: number;
    headshotPercentage: number;
    damagePerMatch: number;
    pointsPerMatch: number;
    accuracy: number;
    matchDuration: number;
  };
  recentPerformance: Array<{
    date: string;
    won: boolean | null;
    kills: number;
    deaths: number;
    assists: number;
    kda: number;
    points: number;
    gameTitle: GameTitle;
    mapName: string | null;
  }>;
  dailyStatsChart: Array<{
    date: string;
    matchesPlayed: number;
    matchesWon: number;
    winRate: number;
    totalKills: number;
    totalDeaths: number;
    totalAssists: number;
    avgKDA: number;
    totalPoints: number;
    totalPlaytime: number;
  }>;
  gameBreakdown: Array<{
    gameTitle: GameTitle;
    totalMatches: number;
    wins: number;
    losses: number;
    winRate: number;
    totalKills: number;
    totalDeaths: number;
    totalAssists: number;
    kda: number;
    totalPoints: number;
    averagePoints: number;
  }> | null;
}

interface PlayerStatsProps {
  selectedGame: GameTitle | null;
}

export function ArcadePlayerStats({ selectedGame }: PlayerStatsProps) {
  const [statsData, setStatsData] = useState<PlayerStatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('30');

  useEffect(() => {
    fetchStats();
  }, [selectedGame, period]);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        period,
      });
      
      if (selectedGame) {
        params.append('game', selectedGame);
      }

      const response = await fetch(`/api/arcade/stats?${params}`);
      if (response.ok) {
        const data = await response.json();
        setStatsData(data);
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const getGameColor = (gameTitle: GameTitle) => {
    switch (gameTitle) {
      case GameTitle.VALORANT:
        return '#FF4655';
      case GameTitle.CS2:
        return '#F7931E';
      case GameTitle.LEAGUE_OF_LEGENDS:
        return '#C89B3C';
      default:
        return '#6B7280';
    }
  };

  const formatRecentForm = (form: string | null) => {
    if (!form) return [];
    return form.split('-').map((result, index) => ({
      index,
      result,
      color: result === 'W' ? '#10B981' : '#EF4444',
    }));
  };

  if (loading) {
    return (
      <div className="space-y-6">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-64 w-full" />
        ))}
      </div>
    );
  }

  if (!statsData) {
    return (
      <div className="text-center py-12">
        <TrendingUp className="h-16 w-16 text-slate-400 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-slate-300 mb-2">
          No Stats Available
        </h3>
        <p className="text-slate-400">
          Play some matches to see your statistics
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Controls */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Player Statistics
            {selectedGame && (
              <Badge variant="secondary" className="ml-2">
                {selectedGame}
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Period</label>
              <Select value={period} onValueChange={setPeriod}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">7 Days</SelectItem>
                  <SelectItem value="30">30 Days</SelectItem>
                  <SelectItem value="90">90 Days</SelectItem>
                  <SelectItem value="365">1 Year</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Current Rank (if game-specific) */}
      {statsData.currentRank && (
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Crown className="h-5 w-5" />
              Current Rank - {statsData.currentRank.gameTitle}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-white mb-2">
                  {statsData.currentRank.currentRank}
                </div>
                <div className="text-sm text-slate-400">Current Rank</div>
                <div className="text-lg font-semibold text-purple-300 mt-1">
                  {statsData.currentRank.rankPoints} RP
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Season Record</span>
                  <span className="text-white">
                    {statsData.currentRank.seasonWins}W / {statsData.currentRank.seasonLosses}L
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Win Rate</span>
                  <span className="text-white">
                    {((statsData.currentRank.seasonWins / 
                      (statsData.currentRank.seasonWins + statsData.currentRank.seasonLosses)) * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Peak Rank</span>
                  <span className="text-white">{statsData.currentRank.peakRank || 'N/A'}</span>
                </div>
              </div>

              <div>
                <div className="text-sm text-slate-400 mb-2">Recent Form</div>
                <div className="flex gap-1">
                  {formatRecentForm(statsData.currentRank.recentForm).map((game) => (
                    <div
                      key={game.index}
                      className="w-6 h-6 rounded flex items-center justify-center text-xs font-bold text-white"
                      style={{ backgroundColor: game.color }}
                    >
                      {game.result}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">K/D/A Ratio</p>
                <p className="text-2xl font-bold text-white">
                  {statsData.averages.kdaRatio}
                </p>
              </div>
              <Zap className="h-8 w-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Headshot %</p>
                <p className="text-2xl font-bold text-white">
                  {statsData.averages.headshotPercentage.toFixed(1)}%
                </p>
              </div>
              <Crosshair className="h-8 w-8 text-red-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Avg Points</p>
                <p className="text-2xl font-bold text-white">
                  {statsData.averages.pointsPerMatch.toLocaleString()}
                </p>
              </div>
              <Trophy className="h-8 w-8 text-yellow-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Accuracy</p>
                <p className="text-2xl font-bold text-white">
                  {statsData.averages.accuracy.toFixed(1)}%
                </p>
              </div>
              <Target className="h-8 w-8 text-green-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Performance */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Recent Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={statsData.recentPerformance.slice(0, 10).reverse()}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis 
                  dataKey="date" 
                  stroke="#9CA3AF"
                  fontSize={10}
                  tickFormatter={(value) => new Date(value).toLocaleDateString()}
                />
                <YAxis stroke="#9CA3AF" fontSize={10} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1F2937', 
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    fontSize: '12px'
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="kda" 
                  stroke="#60B5FF" 
                  strokeWidth={2}
                  dot={{ fill: '#60B5FF', strokeWidth: 2, r: 4 }}
                  name="K/D/A"
                />
                <Line 
                  type="monotone" 
                  dataKey="points" 
                  stroke="#FF9149" 
                  strokeWidth={2}
                  dot={{ fill: '#FF9149', strokeWidth: 2, r: 4 }}
                  name="Points"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Daily Stats */}
        {statsData.dailyStatsChart.length > 0 && (
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Daily Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={statsData.dailyStatsChart}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis 
                    dataKey="date" 
                    stroke="#9CA3AF"
                    fontSize={10}
                    tickFormatter={(value) => new Date(value).toLocaleDateString()}
                  />
                  <YAxis stroke="#9CA3AF" fontSize={10} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1F2937', 
                      border: '1px solid #374151',
                      borderRadius: '8px',
                      fontSize: '12px'
                    }}
                  />
                  <Bar dataKey="matchesPlayed" fill="#60B5FF" name="Matches" />
                  <Bar dataKey="matchesWon" fill="#FF9149" name="Wins" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Game Breakdown (if showing all games) */}
      {!selectedGame && statsData.gameBreakdown && statsData.gameBreakdown.length > 0 && (
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Game Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {statsData.gameBreakdown.map((game) => (
                <div
                  key={game.gameTitle}
                  className="p-4 rounded-lg border border-slate-600 bg-slate-800/30"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: getGameColor(game.gameTitle) }}
                    />
                    <h4 className="font-semibold text-white">{game.gameTitle}</h4>
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Matches</span>
                      <span className="text-white">{game.totalMatches}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Win Rate</span>
                      <span className="text-white">{game.winRate.toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">K/D/A</span>
                      <span className="text-white">{game.kda.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Avg Points</span>
                      <span className="text-white">{Math.round(game.averagePoints)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Detailed Stats */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Detailed Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="space-y-3">
              <h4 className="font-semibold text-slate-300">Combat Stats</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-400">Total Kills</span>
                  <span className="text-white">{statsData.matchStats.totalKills.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Total Deaths</span>
                  <span className="text-white">{statsData.matchStats.totalDeaths.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Total Assists</span>
                  <span className="text-white">{statsData.matchStats.totalAssists.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Headshots</span>
                  <span className="text-white">{statsData.matchStats.totalHeadshots.toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-semibold text-slate-300">Special Achievements</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-400">Aces</span>
                  <span className="text-white">{statsData.matchStats.totalAces}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Clutches</span>
                  <span className="text-white">{statsData.matchStats.totalClutches}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">First Bloods</span>
                  <span className="text-white">{statsData.matchStats.totalFirstBloods}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">MVP Count</span>
                  <span className="text-white">{statsData.player.mvpCount}</span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-semibold text-slate-300">Averages</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-400">Kills/Match</span>
                  <span className="text-white">{statsData.averages.killsPerMatch.toFixed(1)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Deaths/Match</span>
                  <span className="text-white">{statsData.averages.deathsPerMatch.toFixed(1)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Assists/Match</span>
                  <span className="text-white">{statsData.averages.assistsPerMatch.toFixed(1)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Match Duration</span>
                  <span className="text-white">{statsData.averages.matchDuration.toFixed(1)}m</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
