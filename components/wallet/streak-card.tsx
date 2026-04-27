'use client';

import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Flame, Calendar } from 'lucide-react';

interface StreakCardProps {
  current: number;
  longest: number;
  checkedInToday: boolean;
}

const MILESTONES = [3, 7, 14, 30, 100];

export function StreakCard({ current, longest, checkedInToday }: StreakCardProps) {
  // Find next milestone
  const nextMilestone = MILESTONES.find((m) => m > current);
  const daysToNext = nextMilestone ? nextMilestone - current : 0;

  return (
    <Card className="border-orange-500/20 bg-gradient-to-br from-orange-950/30 to-background">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base font-medium">
          <Flame
            className={`h-4 w-4 ${
              checkedInToday ? 'text-orange-400' : 'text-muted-foreground'
            }`}
          />
          Günlük Seri
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <motion.div
            key={current}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
          >
            <div className="flex items-baseline gap-2">
              <span className="text-5xl font-bold bg-gradient-to-b from-orange-300 to-red-500 bg-clip-text text-transparent">
                {current}
              </span>
              <span className="text-sm text-muted-foreground">gün</span>
            </div>
            <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
              <Calendar className="h-3 w-3" />
              En uzun: {longest} gün
            </div>
          </motion.div>

          {checkedInToday ? (
            <div className="rounded-full border border-emerald-500/40 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-400">
              ✓ Bugün gelindi
            </div>
          ) : (
            <div className="rounded-full border border-orange-500/40 bg-orange-500/10 px-3 py-1 text-xs font-medium text-orange-300">
              Bugün cafe'ye gel
            </div>
          )}
        </div>

        {nextMilestone && (
          <div className="rounded-lg border border-orange-500/20 bg-background/40 p-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">
                Bir sonraki ödül:{' '}
                <span className="font-medium text-orange-300">
                  {nextMilestone} gün serisi
                </span>
              </span>
              <span className="font-medium text-orange-300">
                {daysToNext} gün kaldı
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
