
'use client';

import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Trophy, 
  Target, 
  TrendingUp, 
  Zap,
  Crown,
  Award,
  Flame,
  Shield
} from 'lucide-react';

interface StatsCardsProps {
  stats: {
    totalMatches: number;
    totalWins: number;
    winRate: number;
    totalKills: number;
    totalDeaths: number;
    totalAssists: number;
    kda: number | null;
  };
  player: {
    totalPoints: number;
    currentRank: string;
    skillRating: number;
    currentStreak: number;
    longestStreak: number;
    clutchWins: number;
    mvpCount: number;
  };
}

export function ArcadeStatsCards({ stats, player }: StatsCardsProps) {
  const statCards = [
    {
      title: 'Total Points',
      value: player.totalPoints.toLocaleString(),
      subtitle: 'All-time earnings',
      icon: Trophy,
      color: 'from-yellow-500 to-orange-500',
      bgColor: 'bg-yellow-500/20',
      borderColor: 'border-yellow-500/30',
      textColor: 'text-yellow-300',
    },
    {
      title: 'Win Rate',
      value: `${stats.winRate.toFixed(1)}%`,
      subtitle: `${stats.totalWins}W / ${stats.totalMatches - stats.totalWins}L`,
      icon: Target,
      color: 'from-green-500 to-emerald-500',
      bgColor: 'bg-green-500/20',
      borderColor: 'border-green-500/30',
      textColor: 'text-green-300',
    },
    {
      title: 'K/D/A Ratio',
      value: (stats.kda || 0).toFixed(2),
      subtitle: `${stats.totalKills}K / ${stats.totalDeaths}D / ${stats.totalAssists}A`,
      icon: Zap,
      color: 'from-blue-500 to-cyan-500',
      bgColor: 'bg-blue-500/20',
      borderColor: 'border-blue-500/30',
      textColor: 'text-blue-300',
    },
    {
      title: 'Current Streak',
      value: player.currentStreak.toString(),
      subtitle: `Best: ${player.longestStreak}`,
      icon: Flame,
      color: 'from-red-500 to-pink-500',
      bgColor: 'bg-red-500/20',
      borderColor: 'border-red-500/30',
      textColor: 'text-red-300',
    },
  ];

  const additionalStats = [
    {
      label: 'Skill Rating',
      value: player.skillRating.toLocaleString(),
      icon: Crown,
    },
    {
      label: 'Clutch Wins',
      value: player.clutchWins.toString(),
      icon: Shield,
    },
    {
      label: 'MVP Count',
      value: player.mvpCount.toString(),
      icon: Award,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Main Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, index) => (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className={`${card.bgColor} ${card.borderColor} border transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-purple-500/20`}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-slate-300">
                      {card.title}
                    </p>
                    <p className="text-3xl font-bold text-white">
                      {card.value}
                    </p>
                    <p className="text-xs text-slate-400">
                      {card.subtitle}
                    </p>
                  </div>
                  <div className={`p-3 rounded-lg bg-gradient-to-br ${card.color}`}>
                    <card.icon className="h-6 w-6 text-white" />
                  </div>
                </div>

                {/* Progress indicator for certain stats */}
                {card.title === 'Win Rate' && (
                  <div className="mt-4">
                    <div className="w-full bg-slate-700 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full transition-all duration-1000"
                        style={{ width: `${Math.min(stats.winRate, 100)}%` }}
                      />
                    </div>
                  </div>
                )}

                {card.title === 'Current Streak' && player.currentStreak > 0 && (
                  <div className="mt-3">
                    <Badge variant="secondary" className="bg-orange-500/20 text-orange-300 border-orange-500/30">
                      <TrendingUp className="h-3 w-3 mr-1" />
                      Hot Streak!
                    </Badge>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Additional Stats Row */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="flex flex-wrap gap-4 justify-center"
      >
        {additionalStats.map((stat, index) => (
          <div
            key={stat.label}
            className="flex items-center gap-2 px-4 py-2 bg-slate-800/50 rounded-lg border border-slate-700"
          >
            <stat.icon className="h-4 w-4 text-purple-400" />
            <span className="text-sm text-slate-300">{stat.label}:</span>
            <span className="text-sm font-bold text-white">{stat.value}</span>
          </div>
        ))}
      </motion.div>
    </div>
  );
}
