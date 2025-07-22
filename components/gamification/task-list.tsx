
'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CheckCircle, Clock, Star, Target, Trophy, Gift } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

interface Task {
  id: string;
  title: string;
  description: string;
  icon?: string;
  type: string;
  difficulty: string;
  category: string;
  target: string;
  targetValue: number;
  xpReward: number;
  creditsReward: number;
  progress: number;
  completed: boolean;
  completedAt?: string;
  canClaim: boolean;
}

interface TaskListProps {
  tasks: {
    daily: Task[];
    weekly: Task[];
    special: Task[];
  };
  onTaskUpdate: () => void;
}

export function TaskList({ tasks, onTaskUpdate }: TaskListProps) {
  const [claiming, setClaiming] = useState<string | null>(null);

  const claimReward = async (taskId: string) => {
    setClaiming(taskId);
    try {
      // Simulate claiming reward with mock data
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Find the task to get reward amount
      const allTasks = [...tasks.daily, ...tasks.weekly, ...tasks.special];
      const task = allTasks.find(t => t.id === taskId);
      
      if (task) {
        toast.success(`🎉 ${task.xpReward} XP kazandınız!`);
        onTaskUpdate();
      }
    } catch (error) {
      console.error('Error claiming reward:', error);
      toast.error('Bir hata oluştu');
    } finally {
      setClaiming(null);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-500/20 text-green-500';
      case 'medium': return 'bg-yellow-500/20 text-yellow-500';
      case 'hard': return 'bg-red-500/20 text-red-500';
      default: return 'bg-gray-500/20 text-gray-500';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'gaming': return '🎮';
      case 'social': return '👥';
      case 'cafe': return '☕';
      default: return '🎯';
    }
  };

  const renderTaskCard = (task: Task) => (
    <motion.div
      key={task.id}
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="group"
    >
      <Card className={`transition-all duration-300 hover:shadow-lg ${
        task.completed ? 'border-green-500/50 bg-green-500/5' : ''
      }`}>
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="text-2xl">
                {task.icon || getCategoryIcon(task.category)}
              </div>
              <div>
                <h3 className="font-medium text-sm">{task.title}</h3>
                <p className="text-xs text-muted-foreground">{task.description}</p>
              </div>
            </div>
            
            <div className="flex flex-col items-end gap-1">
              <Badge variant="outline" className={getDifficultyColor(task.difficulty)}>
                {task.difficulty}
              </Badge>
              {task.completed && (
                <CheckCircle className="h-4 w-4 text-green-500" />
              )}
            </div>
          </div>

          {/* Progress */}
          <div className="space-y-2 mb-3">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">İlerleme</span>
              <span>{task.progress}/{task.targetValue}</span>
            </div>
            <Progress 
              value={(task.progress / task.targetValue) * 100} 
              className="h-2"
            />
          </div>

          {/* Rewards */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 text-xs">
              {task.xpReward > 0 && (
                <div className="flex items-center gap-1">
                  <Star className="h-3 w-3 text-yellow-500" />
                  <span>{task.xpReward} XP</span>
                </div>
              )}
              {task.creditsReward > 0 && (
                <div className="flex items-center gap-1">
                  <Trophy className="h-3 w-3 text-blue-500" />
                  <span>{task.creditsReward} krediler</span>
                </div>
              )}
            </div>

            {task.canClaim && (
              <Button
                size="sm"
                onClick={() => claimReward(task.id)}
                disabled={claiming === task.id}
                className="h-6 px-2 text-xs"
              >
                {claiming === task.id ? (
                  <div className="animate-spin h-3 w-3 border border-white/30 border-t-white rounded-full" />
                ) : (
                  <>
                    <Gift className="h-3 w-3 mr-1" />
                    Al
                  </>
                )}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );

  const getTaskStats = (taskList: Task[]) => {
    const completed = taskList.filter(t => t.completed).length;
    const total = taskList.length;
    const canClaim = taskList.filter(t => t.canClaim).length;
    
    return { completed, total, canClaim };
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="daily" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="daily" className="relative">
            Günlük
            {getTaskStats(tasks.daily).canClaim > 0 && (
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full" />
            )}
          </TabsTrigger>
          <TabsTrigger value="weekly" className="relative">
            Haftalık
            {getTaskStats(tasks.weekly).canClaim > 0 && (
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full" />
            )}
          </TabsTrigger>
          <TabsTrigger value="special" className="relative">
            Özel
            {getTaskStats(tasks.special).canClaim > 0 && (
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full" />
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="daily" className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Günlük Görevler
              </h3>
              <p className="text-sm text-muted-foreground">
                Her gün yenilenen görevler
              </p>
            </div>
            <div className="text-sm text-muted-foreground">
              {getTaskStats(tasks.daily).completed}/{getTaskStats(tasks.daily).total} tamamlandı
            </div>
          </div>
          
          <div className="grid gap-3">
            {tasks.daily.map(renderTaskCard)}
          </div>
        </TabsContent>

        <TabsContent value="weekly" className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium flex items-center gap-2">
                <Target className="h-5 w-5" />
                Haftalık Görevler
              </h3>
              <p className="text-sm text-muted-foreground">
                Daha büyük ödüller için haftalık hedefler
              </p>
            </div>
            <div className="text-sm text-muted-foreground">
              {getTaskStats(tasks.weekly).completed}/{getTaskStats(tasks.weekly).total} tamamlandı
            </div>
          </div>
          
          <div className="grid gap-3">
            {tasks.weekly.map(renderTaskCard)}
          </div>
        </TabsContent>

        <TabsContent value="special" className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium flex items-center gap-2">
                <Trophy className="h-5 w-5" />
                Özel Görevler
              </h3>
              <p className="text-sm text-muted-foreground">
                Sınırlı süreli özel etkinlikler
              </p>
            </div>
            <div className="text-sm text-muted-foreground">
              {getTaskStats(tasks.special).completed}/{getTaskStats(tasks.special).total} tamamlandı
            </div>
          </div>
          
          <div className="grid gap-3">
            {tasks.special.map(renderTaskCard)}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
