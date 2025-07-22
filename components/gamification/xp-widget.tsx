
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Star, TrendingUp, Zap, Target } from 'lucide-react';
import { motion } from 'framer-motion';

interface XPData {
  currentXP: number;
  totalXP: number;
  level: number;
  tasksXP: number;
  gamesXP: number;
  bonusXP: number;
  progressToNextLevel: number;
  xpNeededForNext: number;
  progressPercentage: number;
}

interface XpWidgetProps {
  xpData: XPData;
  onXpUpdate: () => void;
  detailed?: boolean;
}

export function XpWidget({ xpData, onXpUpdate, detailed = false }: XpWidgetProps) {
  const addTestXP = async (amount: number) => {
    try {
      // Simulate XP addition with mock data
      console.log(`Mock: Adding ${amount} XP`);
      // Simulate a delay
      await new Promise(resolve => setTimeout(resolve, 500));
      onXpUpdate();
    } catch (error) {
      console.error('Error adding XP:', error);
    }
  };

  if (!xpData) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-3/4"></div>
            <div className="h-8 bg-muted rounded"></div>
            <div className="h-4 bg-muted rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <Star className="h-5 w-5 text-yellow-500" />
          XP & Level
        </CardTitle>
        <CardDescription>
          Seviye {xpData.level} • {xpData.xpNeededForNext} XP daha lazım
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Level Circle */}
        <div className="flex items-center justify-center">
          <motion.div 
            className="relative"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <div className="w-24 h-24 rounded-full border-4 border-primary/20 flex items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5">
              <span className="text-2xl font-bold text-primary">{xpData.level}</span>
            </div>
            <div className="absolute -top-1 -right-1 w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center">
              <Star className="h-3 w-3 text-white" />
            </div>
          </motion.div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">
              {xpData.progressToNextLevel} XP
            </span>
            <span className="text-muted-foreground">
              {xpData.progressToNextLevel + xpData.xpNeededForNext} XP
            </span>
          </div>
          <Progress 
            value={xpData.progressPercentage} 
            className="h-3"
          />
          <div className="text-center text-sm text-muted-foreground">
            %{Math.round(xpData.progressPercentage)} tamamlandı
          </div>
        </div>

        {/* Total XP */}
        <div className="text-center">
          <div className="text-2xl font-bold text-foreground">
            {xpData.totalXP.toLocaleString()}
          </div>
          <div className="text-sm text-muted-foreground">Toplam XP</div>
        </div>

        {detailed && (
          <>
            {/* XP Sources Breakdown */}
            <div className="space-y-3 pt-4 border-t">
              <h4 className="font-medium flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                XP Kaynakları
              </h4>
              
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-3 rounded-lg bg-green-500/10">
                  <Target className="h-4 w-4 mx-auto mb-1 text-green-500" />
                  <div className="text-sm font-medium">{xpData.tasksXP}</div>
                  <div className="text-xs text-muted-foreground">Görevler</div>
                </div>
                
                <div className="p-3 rounded-lg bg-blue-500/10">
                  <Zap className="h-4 w-4 mx-auto mb-1 text-blue-500" />
                  <div className="text-sm font-medium">{xpData.gamesXP}</div>
                  <div className="text-xs text-muted-foreground">Oyunlar</div>
                </div>
                
                <div className="p-3 rounded-lg bg-purple-500/10">
                  <Star className="h-4 w-4 mx-auto mb-1 text-purple-500" />
                  <div className="text-sm font-medium">{xpData.bonusXP}</div>
                  <div className="text-xs text-muted-foreground">Bonus</div>
                </div>
              </div>
            </div>

            {/* Test Buttons (for development) */}
            <div className="flex gap-2 pt-4 border-t">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => addTestXP(10)}
                className="flex-1"
              >
                +10 XP
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => addTestXP(50)}
                className="flex-1"
              >
                +50 XP
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => addTestXP(100)}
                className="flex-1"
              >
                +100 XP
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
