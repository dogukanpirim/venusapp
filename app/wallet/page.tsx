// /wallet — Kullanıcının cüzdan / kazanç dashboard'ı
'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/header';
import { WalletCard } from '@/components/wallet/wallet-card';
import { LevelCard } from '@/components/wallet/level-card';
import { StreakCard } from '@/components/wallet/streak-card';
import { CoinHistory } from '@/components/wallet/coin-history';
import { QuestList } from '@/components/wallet/quest-list';
import { QrDepositModal } from '@/components/payment/qr-deposit-modal';
import { Loader2 } from 'lucide-react';

interface WalletData {
  wallet: { coinBalance: number; lootboxBalance: number; totalLootboxesOpened: number };
  progression: {
    totalXP: number;
    level: number;
    xpInLevel: number;
    xpForLevelUp: number;
    progressToNextLevel: number;
    rank: string;
  };
  streak: { current: number; longest: number; checkedInToday: boolean };
  today: { coinEarned: number; transactionCount: number };
  gizmo: { linked: boolean; gizmoUserId: number | null };
  recentTransactions: any[];
  user: { gamertag: string | null };
}

export default function WalletPage() {
  const { status } = useSession();
  const router = useRouter();
  const [data, setData] = useState<WalletData | null>(null);
  const [loading, setLoading] = useState(true);
  const [depositOpen, setDepositOpen] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin?callbackUrl=/wallet');
    }
  }, [status, router]);

  async function reload() {
    const res = await fetch('/api/gamification/me');
    const json = await res.json();
    if (json.success) setData(json);
    setLoading(false);
  }

  useEffect(() => {
    if (status !== 'authenticated') return;
    reload();
    // Light polling — every 30s reflect any backend changes (cron poller, lootbox open, etc.)
    const id = setInterval(reload, 30000);
    return () => clearInterval(id);
  }, [status]);

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto py-8 px-4">
        <div className="mb-6">
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-fuchsia-300 via-cyan-300 to-amber-300 bg-clip-text text-transparent">
            Cüzdan
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            {data.user.gamertag && (
              <>
                <span className="font-medium">{data.user.gamertag}</span> ·{' '}
              </>
            )}
            Coin, XP ve seri kazançların buradan
          </p>
        </div>

        {!data.gizmo.linked && (
          <div className="mb-6 rounded-lg border border-amber-500/30 bg-amber-500/10 p-4 text-sm">
            <p className="font-medium text-amber-300">Gizmo hesabın bağlı değil</p>
            <p className="text-amber-200/80 mt-1">
              Cafe'ye geldiğinde Gizmo'ya kullanıcı adınla giriş yap. Birikmiş kazançların
              otomatik aktarılır.
            </p>
          </div>
        )}

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-6">
          <div className="lg:col-span-2">
            <WalletCard
              coinBalance={data.wallet.coinBalance}
              todayEarned={data.today.coinEarned}
              lootboxBalance={data.wallet.lootboxBalance}
              onDepositClick={() => setDepositOpen(true)}
            />
          </div>

          <StreakCard
            current={data.streak.current}
            longest={data.streak.longest}
            checkedInToday={data.streak.checkedInToday}
          />
        </div>

        <div className="mb-6">
          <LevelCard
            level={data.progression.level}
            totalXP={data.progression.totalXP}
            xpInLevel={data.progression.xpInLevel}
            xpForLevelUp={data.progression.xpForLevelUp}
            progressToNextLevel={data.progression.progressToNextLevel}
            rank={data.progression.rank}
          />
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <QuestList />
          <CoinHistory initialData={data.recentTransactions} />
        </div>
      </main>

      <QrDepositModal
        open={depositOpen}
        onOpenChange={setDepositOpen}
        gizmoUserId={data.gizmo.gizmoUserId}
        onSuccess={() => {
          setDepositOpen(false);
          // Reload wallet to reflect new balance
          setTimeout(reload, 1000);
        }}
      />
    </div>
  );
}
