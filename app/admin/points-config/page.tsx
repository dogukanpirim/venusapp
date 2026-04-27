// /admin/points-config — Overwolf maç olayları için puan kuralları
// (PointsConfig tablosu — gameTitle × eventType başına)
'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2, Save, Plus } from 'lucide-react';

const GAME_TITLES = ['CS2', 'VALORANT', 'LEAGUE_OF_LEGENDS', 'DOTA2', 'FORTNITE', 'PUBG', 'APEX_LEGENDS', 'OVERWATCH'];
const EVENT_TYPES = ['KILL', 'DEATH', 'ASSIST', 'HEADSHOT', 'ACE', 'CLUTCH', 'MVP', 'MATCH_WIN', 'MATCH_LOSS', 'ROUND_WIN', 'PLANT', 'DEFUSE'];

interface PointsRule {
  id: string;
  gameTitle: string;
  eventType: string;
  basePoints: number;
  multiplier: number;
  minValue: number | null;
  maxPoints: number | null;
  cooldown: number | null;
  rankedMultiplier: number;
  competitiveMultiplier: number;
  casualMultiplier: number;
  isActive: boolean;
}

const EMPTY: Partial<PointsRule> = {
  gameTitle: 'CS2',
  eventType: 'KILL',
  basePoints: 5,
  multiplier: 1.0,
  rankedMultiplier: 1.5,
  competitiveMultiplier: 1.2,
  casualMultiplier: 1.0,
  isActive: true,
};

export default function AdminPointsConfigPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [rules, setRules] = useState<PointsRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null); // rule id being saved
  const [draft, setDraft] = useState<Partial<PointsRule> | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/auth/signin');
    if (status === 'authenticated' && !(session?.user as any)?.isAdmin) router.push('/');
  }, [status, session, router]);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/points-config');
      const json = await res.json();
      if (json.success || json.configs || Array.isArray(json)) {
        const data = json.configs || json.data || (Array.isArray(json) ? json : []);
        setRules(data);
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (status === 'authenticated' && (session?.user as any)?.isAdmin) load();
  }, [status, session]);

  async function saveRule(rule: Partial<PointsRule>) {
    setSaving(rule.id ?? '__new__');
    try {
      const res = await fetch('/api/admin/points-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(rule),
      });
      const json = await res.json();
      if (!res.ok) {
        alert(json.error || 'Kaydedilemedi');
        return;
      }
      await load();
      setDraft(null);
    } finally {
      setSaving(null);
    }
  }

  function updateRuleField(id: string, field: keyof PointsRule, value: any) {
    setRules((prev) =>
      prev.map((r) => (r.id === id ? { ...r, [field]: value } : r)),
    );
  }

  if (status !== 'authenticated' || !(session?.user as any)?.isAdmin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  // Group by game
  const byGame: Record<string, PointsRule[]> = {};
  for (const r of rules) {
    (byGame[r.gameTitle] ??= []).push(r);
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto py-8 px-4">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Puan Kuralları</h1>
            <p className="text-muted-foreground text-sm mt-1">
              Overwolf maç olayları için oyun bazında XP/puan miktarları
            </p>
          </div>
          <Button onClick={() => setDraft({ ...EMPTY })}>
            <Plus className="h-4 w-4 mr-2" />
            Yeni Kural
          </Button>
        </div>

        <div className="mb-6 rounded-lg border border-cyan-500/20 bg-cyan-500/5 p-4 text-sm">
          <p className="text-cyan-200">
            💡 <strong>Formül:</strong>{' '}
            <code className="text-cyan-300">
              basePoints × multiplier × modeMultiplier
            </code>
          </p>
          <p className="text-cyan-200/70 text-xs mt-1">
            modeMultiplier oyun moduna göre değişir: ranked 1.5x, competitive 1.2x, casual 1.0x
          </p>
        </div>

        {loading ? (
          <div className="py-10 flex justify-center">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : Object.keys(byGame).length === 0 ? (
          <Card>
            <CardContent className="py-10 text-center text-sm text-muted-foreground">
              Henüz kural yok. "Yeni Kural" ile başla.
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {Object.entries(byGame).map(([game, gameRules]) => (
              <Card key={game}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <span className="text-fuchsia-300">{game}</span>
                    <Badge variant="outline" className="text-[10px]">
                      {gameRules.length} kural
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b text-xs text-muted-foreground">
                          <th className="py-2 text-left">Olay</th>
                          <th className="py-2 text-right">Base</th>
                          <th className="py-2 text-right">×Mult</th>
                          <th className="py-2 text-right">Max</th>
                          <th className="py-2 text-right">Ranked</th>
                          <th className="py-2 text-center">Aktif</th>
                          <th className="py-2"></th>
                        </tr>
                      </thead>
                      <tbody>
                        {gameRules.map((r) => (
                          <tr key={r.id} className="border-b border-border/40">
                            <td className="py-2 font-medium">{r.eventType}</td>
                            <td className="py-1 text-right">
                              <Input
                                type="number"
                                value={r.basePoints}
                                onChange={(e) =>
                                  updateRuleField(
                                    r.id,
                                    'basePoints',
                                    Number(e.target.value),
                                  )
                                }
                                className="w-20 h-8 text-right text-sm"
                              />
                            </td>
                            <td className="py-1 text-right">
                              <Input
                                type="number"
                                step="0.1"
                                value={r.multiplier}
                                onChange={(e) =>
                                  updateRuleField(
                                    r.id,
                                    'multiplier',
                                    Number(e.target.value),
                                  )
                                }
                                className="w-20 h-8 text-right text-sm"
                              />
                            </td>
                            <td className="py-1 text-right">
                              <Input
                                type="number"
                                value={r.maxPoints ?? ''}
                                placeholder="—"
                                onChange={(e) =>
                                  updateRuleField(
                                    r.id,
                                    'maxPoints',
                                    e.target.value ? Number(e.target.value) : null,
                                  )
                                }
                                className="w-20 h-8 text-right text-sm"
                              />
                            </td>
                            <td className="py-1 text-right">
                              <Input
                                type="number"
                                step="0.1"
                                value={r.rankedMultiplier}
                                onChange={(e) =>
                                  updateRuleField(
                                    r.id,
                                    'rankedMultiplier',
                                    Number(e.target.value),
                                  )
                                }
                                className="w-20 h-8 text-right text-sm"
                              />
                            </td>
                            <td className="py-1 text-center">
                              <Switch
                                checked={r.isActive}
                                onCheckedChange={(v) =>
                                  updateRuleField(r.id, 'isActive', v)
                                }
                              />
                            </td>
                            <td className="py-1 text-right">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => saveRule(r)}
                                disabled={saving === r.id}
                              >
                                {saving === r.id ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <Save className="h-4 w-4" />
                                )}
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* ─── New rule inline form ─── */}
        {draft && (
          <Card className="mt-6 border-fuchsia-500/40">
            <CardHeader>
              <CardTitle className="text-base">Yeni Kural</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div>
                  <Label className="text-xs">Oyun</Label>
                  <Select
                    value={draft.gameTitle}
                    onValueChange={(v) => setDraft({ ...draft, gameTitle: v })}
                  >
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {GAME_TITLES.map((g) => (
                        <SelectItem key={g} value={g}>{g}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs">Event</Label>
                  <Select
                    value={draft.eventType}
                    onValueChange={(v) => setDraft({ ...draft, eventType: v })}
                  >
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {EVENT_TYPES.map((e) => (
                        <SelectItem key={e} value={e}>{e}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs">Base Points</Label>
                  <Input
                    type="number"
                    value={draft.basePoints ?? 0}
                    onChange={(e) =>
                      setDraft({ ...draft, basePoints: Number(e.target.value) })
                    }
                  />
                </div>
                <div>
                  <Label className="text-xs">Multiplier</Label>
                  <Input
                    type="number"
                    step="0.1"
                    value={draft.multiplier ?? 1}
                    onChange={(e) =>
                      setDraft({ ...draft, multiplier: Number(e.target.value) })
                    }
                  />
                </div>
              </div>

              <div className="mt-4 flex justify-end gap-2">
                <Button variant="ghost" onClick={() => setDraft(null)}>
                  İptal
                </Button>
                <Button onClick={() => saveRule(draft)} disabled={saving === '__new__'}>
                  {saving === '__new__' ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : null}
                  Ekle
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
