
'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Trophy, 
  Target, 
  Clock,
  Gift,
  Award,
  Flame,
  Star,
  Crown,
  Zap,
  Calendar,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { GameTitle } from '@prisma/client';
import { ClientDate, ClientTimeRemaining } from './client-date';

interface Challenge {
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
}

interface ChallengesProps {
  challenges: Challenge[];
}

export function ArcadeChallenges({ challenges }: ChallengesProps) {
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'easy':
        return 'bg-green-500/20 text-green-300 border-green-500/30';
      case 'medium':
        return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
      case 'hard':
        return 'bg-red-500/20 text-red-300 border-red-500/30';
      case 'extreme':
        return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
      default:
        return 'bg-slate-500/20 text-slate-300 border-slate-500/30';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'combat':
        return <Zap className="h-4 w-4" />;
      case 'objective':
        return <Target className="h-4 w-4" />;
      case 'teamplay':
        return <Award className="h-4 w-4" />;
      default:
        return <Star className="h-4 w-4" />;
    }
  };

  const getGameColor = (gameTitle: GameTitle | null) => {
    if (!gameTitle) return '#6B7280';
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



  const filteredChallenges = challenges.filter(challenge => {
    switch (filter) {
      case 'active':
        return !challenge.completion.completed && new Date(challenge.endDate) > new Date();
      case 'completed':
        return challenge.completion.completed;
      default:
        return true;
    }
  });

  const completedCount = challenges.filter(c => c.completion.completed).length;
  const activeCount = challenges.filter(c => !c.completion.completed && new Date(c.endDate) > new Date()).length;

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border-blue-500/30">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-300">Total Challenges</p>
                <p className="text-3xl font-bold text-white">{challenges.length}</p>
              </div>
              <Target className="h-10 w-10 text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 border-green-500/30">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-300">Completed</p>
                <p className="text-3xl font-bold text-white">{completedCount}</p>
              </div>
              <CheckCircle className="h-10 w-10 text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-orange-500/20 to-red-500/20 border-orange-500/30">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-orange-300">Active</p>
                <p className="text-3xl font-bold text-white">{activeCount}</p>
              </div>
              <Flame className="h-10 w-10 text-orange-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter Buttons */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            Weekly Challenges
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Button
              variant={filter === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('all')}
              className={filter === 'all' ? 'bg-purple-600 hover:bg-purple-700' : ''}
            >
              All ({challenges.length})
            </Button>
            <Button
              variant={filter === 'active' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('active')}
              className={filter === 'active' ? 'bg-purple-600 hover:bg-purple-700' : ''}
            >
              Active ({activeCount})
            </Button>
            <Button
              variant={filter === 'completed' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('completed')}
              className={filter === 'completed' ? 'bg-purple-600 hover:bg-purple-700' : ''}
            >
              Completed ({completedCount})
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Challenges List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredChallenges.length > 0 ? (
          filteredChallenges.map((challenge, index) => {
            const progressPercentage = (challenge.completion.currentProgress / challenge.targetValue) * 100;
            const isExpired = new Date(challenge.endDate) < new Date();
            const isCompleted = challenge.completion.completed;
            
            return (
              <motion.div
                key={challenge.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card 
                  className={`transition-all duration-300 hover:scale-[1.02] ${
                    isCompleted 
                      ? 'bg-green-500/10 border-green-500/30' 
                      : isExpired 
                        ? 'bg-red-500/10 border-red-500/30'
                        : 'bg-slate-800/50 border-slate-700 hover:border-purple-500/50'
                  }`}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          {challenge.gameTitle && (
                            <div 
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: getGameColor(challenge.gameTitle) }}
                            />
                          )}
                          <Badge 
                            variant="secondary"
                            className={getDifficultyColor(challenge.difficulty)}
                          >
                            {challenge.difficulty}
                          </Badge>
                          <Badge variant="outline" className="text-slate-400 border-slate-600">
                            {getCategoryIcon(challenge.category)}
                            <span className="ml-1">{challenge.category}</span>
                          </Badge>
                        </div>
                        
                        <h3 className="text-lg font-semibold text-white">
                          {challenge.title}
                        </h3>
                        <p className="text-sm text-slate-400">
                          {challenge.description}
                        </p>
                      </div>

                      {isCompleted && (
                        <div className="flex items-center gap-1 text-green-400">
                          <CheckCircle className="h-5 w-5" />
                          <span className="text-sm font-medium">Complete</span>
                        </div>
                      )}
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    {/* Progress */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-400">Progress</span>
                        <span className="text-white">
                          {challenge.completion.currentProgress} / {challenge.targetValue}
                        </span>
                      </div>
                      <Progress 
                        value={Math.min(progressPercentage, 100)} 
                        className="h-2"
                      />
                      <div className="text-xs text-slate-400">
                        {progressPercentage.toFixed(1)}% Complete
                      </div>
                    </div>

                    {/* Rewards */}
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium text-slate-300">Rewards</h4>
                      <div className="flex flex-wrap gap-2">
                        {challenge.pointsReward > 0 && (
                          <div className="flex items-center gap-1 px-2 py-1 bg-purple-500/20 rounded text-xs">
                            <Trophy className="h-3 w-3 text-purple-400" />
                            <span className="text-purple-300">{challenge.pointsReward} pts</span>
                          </div>
                        )}
                        
                        {challenge.badgeReward && (
                          <div className="flex items-center gap-1 px-2 py-1 bg-yellow-500/20 rounded text-xs">
                            <Crown className="h-3 w-3 text-yellow-400" />
                            <span className="text-yellow-300">{challenge.badgeReward}</span>
                          </div>
                        )}
                        
                        {challenge.lootboxReward > 0 && (
                          <div className="flex items-center gap-1 px-2 py-1 bg-pink-500/20 rounded text-xs">
                            <Gift className="h-3 w-3 text-pink-400" />
                            <span className="text-pink-300">{challenge.lootboxReward} Lootbox</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Time Remaining */}
                    <div className="flex items-center justify-between pt-2 border-t border-slate-700">
                      <div className="flex items-center gap-1 text-xs text-slate-400">
                        <Clock className="h-3 w-3" />
                        {isExpired ? (
                          <span className="text-red-400">Expired</span>
                        ) : (
                          <ClientTimeRemaining endDate={challenge.endDate} />
                        )}
                      </div>
                      
                      {challenge.gameTitle && (
                        <Badge 
                          variant="secondary"
                          style={{
                            backgroundColor: `${getGameColor(challenge.gameTitle)}20`,
                            color: getGameColor(challenge.gameTitle),
                            borderColor: `${getGameColor(challenge.gameTitle)}40`
                          }}
                        >
                          {challenge.gameTitle}
                        </Badge>
                      )}
                    </div>

                    {/* Completion Date */}
                    {isCompleted && challenge.completion.completedAt && (
                      <div className="text-xs text-green-400 flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        Completed <ClientDate date={challenge.completion.completedAt} format="date" />
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            );
          })
        ) : (
          <div className="col-span-2 text-center py-12">
            <Target className="h-16 w-16 text-slate-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-300 mb-2">
              No Challenges Found
            </h3>
            <p className="text-slate-400">
              {filter === 'completed' 
                ? 'Complete some challenges to see them here'
                : 'Check back later for new challenges'
              }
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
