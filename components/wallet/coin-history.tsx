'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Coins, ArrowDownToLine, ArrowUpFromLine, Loader2 } from 'lucide-react';

interface CoinTransaction {
  id: string;
  type: 'EARN' | 'SPEND' | 'EXPIRE' | 'ADJUST' | 'REFUND';
  amount: number;
  balanceAfter: number;
  source: string;
  description: string | null;
  createdAt: string;
}

const SOURCE_LABELS: Record<string, string> = {
  daily_login: 'Günlük giriş',
  streak: 'Seri ödülü',
  session_duration: 'Oyun süresi',
  session_milestone: 'Saat dolumu',
  spend: 'Cafe harcaması',
  reservation: 'Rezervasyon',
  match_win: 'Maç zaferi',
  match_event: 'Maç olayı',
  challenge: 'Görev tamamlama',
  admin: 'Admin',
};

function formatRelativeTime(dateStr: string): string {
  const d = new Date(dateStr);
  const diff = Date.now() - d.getTime();
  const min = Math.floor(diff / 60000);
  if (min < 1) return 'şimdi';
  if (min < 60) return `${min} dk önce`;
  const hours = Math.floor(min / 60);
  if (hours < 24) return `${hours} saat önce`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} gün önce`;
  return d.toLocaleDateString('tr-TR');
}

export function CoinHistory({ initialData }: { initialData?: CoinTransaction[] }) {
  const [items, setItems] = useState<CoinTransaction[]>(initialData ?? []);
  const [cursor, setCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(!initialData);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    if (initialData) return;
    fetchPage(null);
  }, [initialData]);

  async function fetchPage(c: string | null) {
    const isInitial = c === null;
    if (isInitial) setLoading(true);
    else setLoadingMore(true);

    try {
      const url = new URL('/api/gamification/me/transactions', window.location.origin);
      url.searchParams.set('limit', '20');
      if (c) url.searchParams.set('cursor', c);

      const res = await fetch(url.toString());
      const json = await res.json();

      if (json.success) {
        setItems((prev) => (isInitial ? json.data : [...prev, ...json.data]));
        setCursor(json.nextCursor);
        setHasMore(!!json.nextCursor);
      }
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Coins className="h-4 w-4 text-amber-400" />
          Coin İşlem Geçmişi
        </CardTitle>
      </CardHeader>

      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-8 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
          </div>
        ) : items.length === 0 ? (
          <div className="py-8 text-center text-sm text-muted-foreground">
            Henüz işlem yok. Cafe'ye gel, kazanmaya başla!
          </div>
        ) : (
          <div className="divide-y divide-border/40">
            {items.map((tx) => {
              const isEarn = tx.type === 'EARN';
              return (
                <div key={tx.id} className="flex items-center gap-3 py-3">
                  <div
                    className={`flex h-9 w-9 items-center justify-center rounded-full ${
                      isEarn
                        ? 'bg-emerald-500/10 text-emerald-400'
                        : 'bg-rose-500/10 text-rose-400'
                    }`}
                  >
                    {isEarn ? (
                      <ArrowDownToLine className="h-4 w-4" />
                    ) : (
                      <ArrowUpFromLine className="h-4 w-4" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">
                      {tx.description || SOURCE_LABELS[tx.source] || tx.source}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {SOURCE_LABELS[tx.source] || tx.source} ·{' '}
                      {formatRelativeTime(tx.createdAt)}
                    </div>
                  </div>

                  <div
                    className={`text-sm font-semibold tabular-nums ${
                      isEarn ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    {isEarn ? '+' : '−'}
                    {tx.amount}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {hasMore && items.length > 0 && (
          <div className="mt-4 flex justify-center">
            <Button
              variant="ghost"
              size="sm"
              disabled={loadingMore}
              onClick={() => fetchPage(cursor)}
            >
              {loadingMore ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                'Daha fazla göster'
              )}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
