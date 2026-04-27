'use client';

import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Award, Zap } from 'lucide-react';

interface LevelCardProps {
  level: number;
  totalXP: number;
  xpInLevel: number;
  xpForLevelUp: number;
  progressToNextLevel: number; // 0-100
  rank: string;
}

export function LevelCard({
  level,
  totalXP,
  xpInLevel,
  xpForLevelUp,
  progressToNextLevel,
  rank,
}: LevelCardProps) {
  return (
    <Card className="border-cyan-500/20 bg-gradient-to-br from-cyan-950/30 to-background">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base font-medium">
          <Award className="h-4 w-4 text-cyan-400" />
          Seviye İlerlemesi
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="flex items-end justify-between">
          <div>
            <div className="text-xs uppercase tracking-wider text-muted-foreground">
              {rank}
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold text-cyan-300">Lv.</span>
              <span className="text-5xl font-bold bg-gradient-to-r from-cyan-300 to-fuchsia-400 bg-clip-text text-transparent">
                {level}
              </span>
            </div>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Zap className="h-3 w-3" />
              Toplam XP
            </div>
            <div className="text-lg font-semibold">
              {totalXP.toLocaleString('tr-TR')}
            </div>
          </div>
        </div>

        <div>
          <div className="mb-1.5 flex justify-between text-xs">
            <span className="text-muted-foreground">
              Lv. {level} → Lv. {level + 1}
            </span>
            <span className="font-medium text-cyan-300">
              {xpInLevel} / {xpForLevelUp} XP
            </span>
          </div>
          <div className="relative h-2.5 overflow-hidden rounded-full bg-background/60">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progressToNextLevel}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-cyan-400 via-fuchsia-400 to-amber-400 shadow-[0_0_10px_rgba(34,211,238,0.5)]"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
