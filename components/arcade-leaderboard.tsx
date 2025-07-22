
'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Trophy, 
  Medal, 
  Award, 
  Crown,
  TrendingUp,
  Users,
  Zap,
  Target,
  RefreshCw
} from 'lucide-react';
import { GameTitle } from '@prisma/client';

interface LeaderboardEntry {
  rank: number;
  playerId: string;
  gamertag: string;
  displayName: string;
  avatar: string | null;
  title: string | null;
  value: number;
  currentRank: string | null;
  isOnline: boolean;
  favoriteGame: GameTitle | null;
}

interface LeaderboardData {
  data: LeaderboardEntry[];
  lastUpdated: string;
  cached: boolean;
}

interface LeaderboardProps {
  selectedGame: GameTitle | null;
}

export function ArcadeLeaderboard({ selectedGame }: LeaderboardProps) {
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('weekly');
  const [category, setCategory] = useState('points');

  useEffect(() => {
    fetchLeaderboard();
  }, [selectedGame, period, category]);

  const fetchLeaderboard = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        period,
        category,
      });
      
      if (selectedGame) {
        params.append('game', selectedGame);
      }

      const response = await fetch(`/api/arcade/leaderboards?${params}`);
      if (response.ok) {
        const data = await response.json();
        setLeaderboardData(data);
      }
    } catch (error) {
      console.error('Failed to fetch leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="h-5 w-5 text-yellow-400" />;
      case 2:
        return <Medal className="h-5 w-5 text-slate-300" />;
      case 3:
        return <Award className="h-5 w-5 text-amber-600" />;
      default:
        return <span className="text-sm font-bold text-slate-400">#{rank}</span>;
    }
  };

  const getRankBadgeColor = (rank: number) => {
    switch (rank) {
      case 1:
        return 'from-yellow-400 to-yellow-600';
      case 2:
        return 'from-slate-300 to-slate-400';
      case 3:
        return 'from-amber-500 to-amber-700';
      default:
        return 'from-slate-600 to-slate-700';
    }
  };

  const formatValue = (value: number, category: string) => {
    switch (category) {
      case 'points':
        return value.toLocaleString();
      case 'kills':
        return value.toString();
      case 'wins':
        return value.toString();
      case 'kda':
        return value.toFixed(2);
      default:
        return value.toString();
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'points':
        return <Trophy className="h-4 w-4" />;
      case 'kills':
        return <Zap className="h-4 w-4" />;
      case 'wins':
        return <Target className="h-4 w-4" />;
      case 'kda':
        return <TrendingUp className="h-4 w-4" />;
      default:
        return <Users className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Controls */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-white flex items-center gap-2">
              <Trophy className="h-5 w-5" />
              Leaderboards
              {selectedGame && (
                <Badge variant="secondary" className="ml-2">
                  {selectedGame}
                </Badge>
              )}
            </CardTitle>
            <div className="flex items-center gap-2">
              {leaderboardData && (
                <span className="text-xs text-slate-400">
                  Updated: {new Date(leaderboardData.lastUpdated).toLocaleTimeString()}
                  {leaderboardData.cached && ' (cached)'}
                </span>
              )}
              <Button 
                size="sm" 
                variant="outline" 
                onClick={fetchLeaderboard}
                disabled={loading}
              >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Period</label>
              <Select value={period} onValueChange={setPeriod}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="alltime">All Time</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Category</label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="points">Points</SelectItem>
                  <SelectItem value="kills">Kills</SelectItem>
                  <SelectItem value="wins">Wins</SelectItem>
                  <SelectItem value="kda">K/D/A</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Leaderboard */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            {getCategoryIcon(category)}
            Top Players - {category.charAt(0).toUpperCase() + category.slice(1)}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {[...Array(10)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : leaderboardData?.data?.length ? (
            <div className="space-y-2">
              <AnimatePresence mode="popLayout">
                {leaderboardData.data.map((entry, index) => (
                  <motion.div
                    key={entry.playerId}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ delay: index * 0.05 }}
                    className={`p-4 rounded-lg border transition-all duration-300 hover:scale-[1.02] cursor-pointer ${
                      entry.rank <= 3 
                        ? 'bg-gradient-to-r ' + getRankBadgeColor(entry.rank) + ' bg-opacity-10 border-opacity-30'
                        : 'bg-slate-800/30 border-slate-700 hover:bg-slate-800/50'
                    }`}
                  >
                    <div className="flex items-center space-x-4">
                      {/* Rank */}
                      <div className="w-12 flex justify-center">
                        {getRankIcon(entry.rank)}
                      </div>

                      {/* Avatar */}
                      <div className="relative">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-400 to-blue-400 p-0.5">
                          <div className="w-full h-full rounded-full bg-slate-800 flex items-center justify-center">
                            {entry.avatar ? (
                              <img 
                                src={entry.avatar} 
                                alt={entry.gamertag}
                                className="w-full h-full rounded-full object-cover"
                              />
                            ) : (
                              <span className="text-lg font-bold text-white">
                                {entry.gamertag.charAt(0).toUpperCase()}
                              </span>
                            )}
                          </div>
                        </div>
                        {entry.isOnline && (
                          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-slate-800" />
                        )}
                      </div>

                      {/* Player Info */}
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold text-white">
                            {entry.displayName}
                          </h4>
                          {entry.title && (
                            <Badge variant="secondary" className="text-xs bg-yellow-500/20 text-yellow-300 border-yellow-500/30">
                              <Crown className="h-3 w-3 mr-1" />
                              {entry.title}
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-slate-400">
                          <span>@{entry.gamertag}</span>
                          {entry.currentRank && (
                            <span>{entry.currentRank}</span>
                          )}
                          {entry.favoriteGame && (
                            <Badge variant="outline" className="text-xs">
                              {entry.favoriteGame}
                            </Badge>
                          )}
                        </div>
                      </div>

                      {/* Value */}
                      <div className="text-right">
                        <div className="text-2xl font-bold text-white">
                          {formatValue(entry.value, category)}
                        </div>
                        <div className="text-xs text-slate-400">
                          {category === 'kda' ? 'ratio' : category}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          ) : (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-slate-400 mx-auto mb-4" />
              <p className="text-slate-400">No leaderboard data available</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
