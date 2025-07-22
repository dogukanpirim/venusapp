
'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Trophy, 
  Target, 
  Zap,
  Clock,
  MapPin,
  Users,
  TrendingUp,
  TrendingDown,
  Eye,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { GameTitle } from '@prisma/client';

interface MatchData {
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
}

interface MatchHistoryData {
  matches: MatchData[];
  summary: {
    totalMatches: number;
    wins: number;
    losses: number;
    totalKills: number;
    totalDeaths: number;
    totalAssists: number;
    totalPoints: number;
    avgKDA: number;
    winRate: number;
  };
  pagination: {
    page: number;
    limit: number;
    totalCount: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

interface MatchHistoryProps {
  selectedGame?: GameTitle | null;
  matches?: MatchData[];
  compact?: boolean;
}

export function ArcadeMatchHistory({ selectedGame, matches, compact = false }: MatchHistoryProps) {
  const [matchData, setMatchData] = useState<MatchHistoryData | null>(null);
  const [loading, setLoading] = useState(!matches);
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('COMPLETED');

  useEffect(() => {
    if (!matches) {
      fetchMatches();
    }
  }, [selectedGame, page, status, matches]);

  const fetchMatches = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: compact ? '5' : '10',
        status,
      });
      
      if (selectedGame) {
        params.append('game', selectedGame);
      }

      const response = await fetch(`/api/arcade/matches?${params}`);
      if (response.ok) {
        const data = await response.json();
        setMatchData(data);
      }
    } catch (error) {
      console.error('Failed to fetch matches:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return 'N/A';
    const minutes = Math.floor(seconds / 60);
    return `${minutes}m`;
  };

  const getResultBadge = (won: boolean | null) => {
    if (won === null) return <Badge variant="secondary">Draw</Badge>;
    if (won) return <Badge className="bg-green-500/20 text-green-300 border-green-500/30">Win</Badge>;
    return <Badge className="bg-red-500/20 text-red-300 border-red-500/30">Loss</Badge>;
  };

  const getKDAColor = (kda: number | null) => {
    if (!kda || kda < 1.0) return 'text-red-400';
    if (kda >= 2.0) return 'text-green-400';
    if (kda >= 1.0) return 'text-yellow-400';
    return 'text-red-400';
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

  // Use provided matches or fetched data
  const displayMatches = matches || matchData?.matches || [];
  const showPagination = !compact && !matches && matchData?.pagination;

  if (loading && !matches) {
    return (
      <div className="space-y-4">
        {[...Array(compact ? 3 : 5)].map((_, i) => (
          <Skeleton key={i} className="h-20 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Controls (only for non-compact view) */}
      {!compact && (
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Match History
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
                <label className="text-sm font-medium text-slate-300">Status</label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="COMPLETED">Completed</SelectItem>
                    <SelectItem value="LIVE">Live</SelectItem>
                    <SelectItem value="ABANDONED">Abandoned</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {matchData?.summary && (
                <div className="flex items-center gap-6 text-sm text-slate-300">
                  <div>
                    <span className="text-slate-400">Win Rate:</span>
                    <span className="ml-1 font-bold text-white">
                      {matchData.summary.winRate.toFixed(1)}%
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400">Avg K/D/A:</span>
                    <span className="ml-1 font-bold text-white">
                      {matchData.summary.avgKDA.toFixed(2)}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400">Total Points:</span>
                    <span className="ml-1 font-bold text-white">
                      {matchData.summary.totalPoints.toLocaleString()}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Matches List */}
      <div className="space-y-3">
        {displayMatches.length > 0 ? (
          displayMatches.map((match, index) => (
            <motion.div
              key={match.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className="bg-slate-800/30 border-slate-700 hover:bg-slate-800/50 transition-all duration-300">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    {/* Game Info */}
                    <div className="flex items-center space-x-4">
                      <div 
                        className="w-2 h-16 rounded-full"
                        style={{ backgroundColor: getGameColor(match.gameTitle) }}
                      />
                      
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <Badge 
                            variant="secondary"
                            style={{ 
                              backgroundColor: `${getGameColor(match.gameTitle)}20`,
                              color: getGameColor(match.gameTitle),
                              borderColor: `${getGameColor(match.gameTitle)}40`
                            }}
                          >
                            {match.gameTitle}
                          </Badge>
                          {getResultBadge(match.won)}
                        </div>
                        
                        <div className="text-sm text-slate-300">
                          {match.gameMode && (
                            <span className="mr-3">{match.gameMode}</span>
                          )}
                          {match.mapName && (
                            <span className="flex items-center gap-1 text-slate-400">
                              <MapPin className="h-3 w-3" />
                              {match.mapName}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Match Stats */}
                    <div className="flex items-center gap-6">
                      {/* K/D/A */}
                      <div className="text-center">
                        <div className="text-sm text-slate-400 mb-1">K/D/A</div>
                        <div className="font-bold text-white">
                          {match.kills}/{match.deaths}/{match.assists}
                        </div>
                        <div className={`text-sm font-medium ${getKDAColor(match.kda)}`}>
                          {(match.kda || 0).toFixed(2)}
                        </div>
                      </div>

                      {/* Score */}
                      {match.score && (
                        <div className="text-center">
                          <div className="text-sm text-slate-400 mb-1">Score</div>
                          <div className="font-bold text-white">{match.score}</div>
                        </div>
                      )}

                      {/* Duration */}
                      <div className="text-center">
                        <div className="text-sm text-slate-400 mb-1">Duration</div>
                        <div className="flex items-center gap-1 text-white">
                          <Clock className="h-4 w-4" />
                          {formatDuration(match.duration)}
                        </div>
                      </div>

                      {/* Points */}
                      <div className="text-center">
                        <div className="text-sm text-slate-400 mb-1">Points</div>
                        <div className="flex items-center gap-1 text-purple-300 font-bold">
                          <Trophy className="h-4 w-4" />
                          {match.totalPoints}
                        </div>
                      </div>
                    </div>

                    {/* Match Time */}
                    <div className="text-right text-sm text-slate-400">
                      {new Date(match.startedAt).toLocaleDateString()}
                      <br />
                      {new Date(match.startedAt).toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))
        ) : (
          <div className="text-center py-8">
            <Eye className="h-12 w-12 text-slate-400 mx-auto mb-4" />
            <p className="text-slate-400">No matches found</p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {showPagination && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-slate-400">
            Showing {((matchData!.pagination.page - 1) * matchData!.pagination.limit) + 1} to{' '}
            {Math.min(matchData!.pagination.page * matchData!.pagination.limit, matchData!.pagination.totalCount)} of{' '}
            {matchData!.pagination.totalCount} matches
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(page - 1)}
              disabled={!matchData?.pagination.hasPrev || loading}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            
            <span className="text-sm text-slate-300 px-3">
              Page {matchData?.pagination.page} of {matchData?.pagination.totalPages}
            </span>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(page + 1)}
              disabled={!matchData?.pagination.hasNext || loading}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
