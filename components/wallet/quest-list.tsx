'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Target, CheckCircle2, Loader2 } from 'lucide-react';

interface Quest {
  id: string;
  title: string;
  description: string;
  icon: string | null;
  type: string;
  difficulty: string;
  target: string;
  targetValue: number;
  xpReward: number;
  creditsReward: number;
  progress: number;
  progressPercent: number;
  completed: boolean;
}

interface QuestData {
  daily: Quest[];
  weekly: Quest[];
  special: Quest[];
}

const DIFFICULTY_COLORS: Record<string, string> = {
  easy: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
  medium: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
  hard: 'bg-orange-500/10 text-orange-400 border-orange-500/30',
  expert: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
};

function QuestRow({ quest }: { quest: Quest }) {
  return (
    <div
      className={`rounded-lg border p-4 transition ${
        quest.completed
          ? 'border-emerald-500/30 bg-emerald-500/5'
          : 'border-border/60 hover:border-fuchsia-500/30'
      }`}
    >
      <div className="flex items-start gap-3">
        <div className="text-2xl">{quest.icon || '🎯'}</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h4 className="font-semibold text-sm truncate">{quest.title}</h4>
                {quest.completed && (
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 flex-shrink-0" />
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                {quest.description}
              </p>
            </div>
            <Badge
              variant="outline"
              className={`text-[10px] px-1.5 py-0 flex-shrink-0 ${
                DIFFICULTY_COLORS[quest.difficulty] ?? ''
              }`}
            >
              {quest.difficulty}
            </Badge>
          </div>

          <div className="mt-3 flex items-center gap-3">
            <div className="flex-1">
              <div className="mb-1 flex justify-between text-xs">
                <span className="text-muted-foreground">
                  {quest.progress} / {quest.targetValue}
                </span>
                <span className="font-medium">
                  {quest.progressPercent}%
                </span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-background/60">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    quest.completed
                      ? 'bg-gradient-to-r from-emerald-400 to-emerald-500'
                      : 'bg-gradient-to-r from-fuchsia-400 to-cyan-400'
                  }`}
                  style={{ width: `${quest.progressPercent}%` }}
                />
              </div>
            </div>

            <div className="flex flex-col items-end text-xs">
              {quest.xpReward > 0 && (
                <span className="text-cyan-300 font-medium">+{quest.xpReward} XP</span>
              )}
              {quest.creditsReward > 0 && (
                <span className="text-amber-300 font-medium">
                  +{quest.creditsReward} coin
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function QuestList() {
  const [data, setData] = useState<QuestData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/gamification/quests')
      .then((r) => r.json())
      .then((j) => {
        if (j.success) setData(j.grouped);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-10 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  if (!data) {
    return (
      <Card>
        <CardContent className="py-10 text-center text-muted-foreground">
          Görev bilgisi yüklenemedi
        </CardContent>
      </Card>
    );
  }

  const totalCount = data.daily.length + data.weekly.length + data.special.length;

  if (totalCount === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Target className="h-4 w-4 text-fuchsia-400" />
            Görevler
          </CardTitle>
        </CardHeader>
        <CardContent className="py-6 text-center text-sm text-muted-foreground">
          Şu an aktif görev yok. Admin panelinden ekleyebilirsin.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Target className="h-4 w-4 text-fuchsia-400" />
          Görevler
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="daily">
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="daily">Günlük ({data.daily.length})</TabsTrigger>
            <TabsTrigger value="weekly">Haftalık ({data.weekly.length})</TabsTrigger>
            <TabsTrigger value="special">Özel ({data.special.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="daily" className="space-y-3 mt-0">
            {data.daily.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">
                Bugün için görev yok
              </p>
            ) : (
              data.daily.map((q) => <QuestRow key={q.id} quest={q} />)
            )}
          </TabsContent>

          <TabsContent value="weekly" className="space-y-3 mt-0">
            {data.weekly.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">
                Haftalık görev yok
              </p>
            ) : (
              data.weekly.map((q) => <QuestRow key={q.id} quest={q} />)
            )}
          </TabsContent>

          <TabsContent value="special" className="space-y-3 mt-0">
            {data.special.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">
                Özel görev yok
              </p>
            ) : (
              data.special.map((q) => <QuestRow key={q.id} quest={q} />)
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
