
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Gamepad2, Trophy, Target, Clock, Zap, Award, TrendingUp, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';

interface MatchData {
  id: string;
  gameTitle: string;
  gameMode: string;
  mapName: string;
  won: boolean | null;
  score: string;
  duration: number;
  kda: number;
  kills: number;
  deaths: number;
  assists: number;
  headshots: number;
  aces: number;
  clutches: number;
  totalPoints: number;
  rank: string;
  startedAt: string;
  endedAt: string;
  events: Array<{
    eventType: string;
    pointsEarned: number;
    timestamp: string;
    weapon?: string;
    victim?: string;
  }>;
}

interface MatchHistoryData {
  matches: MatchData[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
  summary: {
    totalMatches: number;
    totalWins: number;
    winRate: number;
    totalKills: number;
    totalDeaths: number;
    totalAssists: number;
    totalPoints: number;
    totalAces: number;
    totalClutches: number;
    avgKDA: number;
    avgAccuracy: number;
  };
}

export default function MatchHistoryClient() {
  const [historyData, setHistoryData] = useState<MatchHistoryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedGame, setSelectedGame] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(0);

  const gameOptions = [
    { value: 'all', label: 'All Games' },
    { value: 'VALORANT', label: 'Valorant' },
    { value: 'CS2', label: 'CS2' },
    { value: 'LEAGUE_OF_LEGENDS', label: 'League of Legends' }
  ];

  const fetchMatchHistory = async (game?: string, offset?: number) => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (game && game !== 'all') params.append('gameTitle', game);
      if (offset) params.append('offset', offset.toString());
      params.append('limit', '20');

      const response = await fetch(`/api/overwolf/match-history?${params}`);
      const data = await response.json();

      if (data.success) {
        setHistoryData(data);
      }
    } catch (error) {
      console.error('Failed to fetch match history:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMatchHistory(selectedGame);
  }, [selectedGame]);

  const handleGameChange = (value: string) => {
    setSelectedGame(value);
    setCurrentPage(0);
  };

  const loadMore = () => {
    const newOffset = (currentPage + 1) * 20;
    setCurrentPage(currentPage + 1);
    fetchMatchHistory(selectedGame, newOffset);
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getGameIcon = (gameTitle: string) => {
    switch (gameTitle) {
      case 'VALORANT': return '🎯';
      case 'CS2': return '💣';
      case 'LEAGUE_OF_LEGENDS': return '⚔️';
      default: return '🎮';
    }
  };

  const getWinStatusColor = (won: boolean | null) => {
    if (won === null) return 'bg-yellow-500';
    return won ? 'bg-green-500' : 'bg-red-500';
  };

  if (loading && !historyData) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (!historyData) {
    return (
      <Card className="bg-slate-800/50 border-slate-700">
        <CardContent className="p-8 text-center">
          <Gamepad2 className="h-16 w-16 text-slate-500 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">No Match History</h3>
          <p className="text-slate-400">Start playing with Overwolf integration to track your matches!</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="bg-gradient-to-br from-purple-900/50 to-blue-900/50 border-purple-500/30">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-200 text-sm">Total Points</p>
                  <p className="text-2xl font-bold text-white">{historyData.summary.totalPoints.toLocaleString()}</p>
                </div>
                <Award className="h-8 w-8 text-purple-400" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="bg-gradient-to-br from-green-900/50 to-emerald-900/50 border-green-500/30">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-200 text-sm">Win Rate</p>
                  <p className="text-2xl font-bold text-white">{Math.round(historyData.summary.winRate * 100)}%</p>
                </div>
                <Trophy className="h-8 w-8 text-green-400" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="bg-gradient-to-br from-red-900/50 to-orange-900/50 border-red-500/30">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-red-200 text-sm">Avg K/D/A</p>
                  <p className="text-2xl font-bold text-white">{historyData.summary.avgKDA.toFixed(2)}</p>
                </div>
                <Target className="h-8 w-8 text-red-400" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="bg-gradient-to-br from-blue-900/50 to-cyan-900/50 border-blue-500/30">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-200 text-sm">Total Matches</p>
                  <p className="text-2xl font-bold text-white">{historyData.summary.totalMatches}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-blue-400" />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Game Filter */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-white flex items-center gap-2">
              <Gamepad2 className="h-5 w-5" />
              Match History
            </CardTitle>
            <Select value={selectedGame} onValueChange={handleGameChange}>
              <SelectTrigger className="w-48 bg-slate-700 border-slate-600 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-600">
                {gameOptions.map(option => (
                  <SelectItem key={option.value} value={option.value} className="text-white">
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {historyData.matches.map((match, index) => (
              <motion.div
                key={match.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="bg-slate-700/50 border-slate-600 hover:bg-slate-700/70 transition-colors">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="text-2xl">{getGameIcon(match.gameTitle)}</div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-white">{match.gameTitle.replace('_', ' ')}</h3>
                            <Badge variant="outline" className="text-slate-300 border-slate-500">
                              {match.gameMode}
                            </Badge>
                            <div className={`w-3 h-3 rounded-full ${getWinStatusColor(match.won)}`} />
                          </div>
                          <p className="text-sm text-slate-400">{match.mapName} • {match.score}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-6 text-sm">
                        <div className="text-center">
                          <p className="text-slate-400">K/D/A</p>
                          <p className="text-white font-semibold">{match.kills}/{match.deaths}/{match.assists}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-slate-400">KDA</p>
                          <p className="text-white font-semibold">{match.kda?.toFixed(2) || 'N/A'}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-slate-400">Points</p>
                          <p className="text-yellow-400 font-semibold">+{match.totalPoints}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-slate-400">Duration</p>
                          <p className="text-white font-semibold">{formatDuration(match.duration || 0)}</p>
                        </div>
                      </div>
                    </div>

                    {(match.aces > 0 || match.clutches > 0 || match.headshots > 5) && (
                      <div className="flex items-center gap-4 mt-3 pt-3 border-t border-slate-600">
                        {match.aces > 0 && (
                          <Badge className="bg-purple-600 hover:bg-purple-700">
                            <Zap className="h-3 w-3 mr-1" />
                            {match.aces} Ace{match.aces > 1 ? 's' : ''}
                          </Badge>
                        )}
                        {match.clutches > 0 && (
                          <Badge className="bg-orange-600 hover:bg-orange-700">
                            <Target className="h-3 w-3 mr-1" />
                            {match.clutches} Clutch{match.clutches > 1 ? 'es' : ''}
                          </Badge>
                        )}
                        {match.headshots > 5 && (
                          <Badge className="bg-red-600 hover:bg-red-700">
                            🎯 {match.headshots} HS
                          </Badge>
                        )}
                      </div>
                    )}

                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-600">
                      <div className="flex items-center gap-2 text-sm text-slate-400">
                        <Calendar className="h-4 w-4" />
                        {new Date(match.endedAt).toLocaleDateString()} at {new Date(match.endedAt).toLocaleTimeString()}
                      </div>
                      {match.rank && (
                        <Badge variant="outline" className="text-slate-300 border-slate-500">
                          {match.rank}
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {historyData.pagination.hasMore && (
            <div className="text-center mt-6">
              <Button 
                onClick={loadMore}
                variant="outline"
                className="bg-slate-700 border-slate-600 text-white hover:bg-slate-600"
                disabled={loading}
              >
                {loading ? 'Loading...' : 'Load More Matches'}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
