'use client';

import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Coins, TrendingUp, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface WalletCardProps {
  coinBalance: number;
  todayEarned: number;
  lootboxBalance: number;
  onDepositClick?: () => void;
}

export function WalletCard({
  coinBalance,
  todayEarned,
  lootboxBalance,
  onDepositClick,
}: WalletCardProps) {
  return (
    <Card className="relative overflow-hidden border-fuchsia-500/20 bg-gradient-to-br from-fuchsia-950/40 via-background to-cyan-950/40">
      <div className="absolute inset-0 bg-grid-white/[0.02] [mask-image:linear-gradient(to_bottom,transparent,black,transparent)]" />

      <CardContent className="relative p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Cüzdan Bakiyesi</p>
            <motion.div
              key={coinBalance}
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="mt-2 flex items-baseline gap-2"
            >
              <Coins className="h-7 w-7 text-amber-400" />
              <span className="text-4xl font-bold tracking-tight bg-gradient-to-r from-amber-300 to-amber-500 bg-clip-text text-transparent">
                {coinBalance.toLocaleString('tr-TR')}
              </span>
              <span className="text-sm font-medium text-amber-400/70">coin</span>
            </motion.div>
          </div>

          {onDepositClick && (
            <Button
              size="sm"
              onClick={onDepositClick}
              className="bg-gradient-to-r from-fuchsia-600 to-cyan-500 hover:from-fuchsia-500 hover:to-cyan-400"
            >
              Bakiye Yükle
            </Button>
          )}
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3">
          <div className="rounded-lg bg-background/50 p-3 backdrop-blur">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <TrendingUp className="h-3.5 w-3.5 text-emerald-400" />
              Bugün
            </div>
            <p className="mt-1 text-xl font-semibold text-emerald-400">
              +{todayEarned.toLocaleString('tr-TR')}
            </p>
          </div>

          <div className="rounded-lg bg-background/50 p-3 backdrop-blur">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Sparkles className="h-3.5 w-3.5 text-fuchsia-400" />
              Lootbox
            </div>
            <p className="mt-1 text-xl font-semibold text-fuchsia-300">
              {lootboxBalance}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
