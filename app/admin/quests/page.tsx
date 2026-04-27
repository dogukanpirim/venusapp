// /admin/quests — Görev (GamificationTask) yönetimi
'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Loader2, Plus, Pencil, Trash2 } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const TARGETS = [
  { value: 'daily_login', label: 'Günlük Giriş' },
  { value: 'session_minutes', label: 'Oyun Süresi (dk)' },
  { value: 'session_milestones', label: 'Saat Dolumu (30dk blok)' },
  { value: 'spend_try', label: 'Cafe Harcaması (₺)' },
  { value: 'reservation', label: 'Tamamlanan Rezervasyon' },
  { value: 'match_won', label: 'Maç Kazanma (Overwolf)' },
  { value: 'match_played', label: 'Maç Oynama (Overwolf)' },
  { value: 'match_event:kill', label: 'Kill Sayısı' },
  { value: 'match_event:ace', label: 'Ace Sayısı' },
  { value: 'match_event:clutch', label: 'Clutch Sayısı' },
  { value: 'match_event:headshot', label: 'Headshot Sayısı' },
  { value: 'match_event:mvp', label: 'MVP Sayısı' },
];

interface Quest {
  id: string;
  title: string;
  description: string;
  icon: string | null;
  type: string;
  difficulty: string;
  category: string;
  target: string;
  targetValue: number;
  xpReward: number;
  creditsReward: number;
  isActive: boolean;
  isRepeatable: boolean;
  startDate: string;
  endDate: string | null;
  _count?: { completions: number };
}

const EMPTY: Partial<Quest> = {
  title: '',
  description: '',
  icon: '🎯',
  type: 'daily',
  difficulty: 'easy',
  category: 'general',
  target: 'session_minutes',
  targetValue: 30,
  xpReward: 50,
  creditsReward: 25,
  isActive: true,
  isRepeatable: true,
};

export default function AdminQuestsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [quests, setQuests] = useState<Quest[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Partial<Quest> | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
      return;
    }
    if (status === 'authenticated' && !(session?.user as any)?.isAdmin) {
      router.push('/');
    }
  }, [status, session, router]);

  async function load() {
    setLoading(true);
    const res = await fetch('/api/admin/quests');
    const json = await res.json();
    if (json.success) setQuests(json.data);
    setLoading(false);
  }

  useEffect(() => {
    if (status === 'authenticated' && (session?.user as any)?.isAdmin) load();
  }, [status, session]);

  async function save() {
    if (!editing) return;
    setSaving(true);
    try {
      const isNew = !editing.id;
      const res = await fetch(
        isNew ? '/api/admin/quests' : `/api/admin/quests/${editing.id}`,
        {
          method: isNew ? 'POST' : 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(editing),
        },
      );
      const json = await res.json();
      if (json.success) {
        setDialogOpen(false);
        setEditing(null);
        await load();
      } else {
        alert(json.error || 'Kaydedilemedi');
      }
    } finally {
      setSaving(false);
    }
  }

  async function toggleActive(q: Quest) {
    await fetch(`/api/admin/quests/${q.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive: !q.isActive }),
    });
    await load();
  }

  async function deleteQuest(q: Quest) {
    if (!confirm(`"${q.title}" görevini silmek istediğine emin misin?`)) return;
    await fetch(`/api/admin/quests/${q.id}`, { method: 'DELETE' });
    await load();
  }

  if (status !== 'authenticated' || !(session?.user as any)?.isAdmin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto py-8 px-4">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Görev Yönetimi</h1>
            <p className="text-muted-foreground text-sm mt-1">
              Kullanıcılara verilen günlük/haftalık görevleri burada yönet
            </p>
          </div>
          <Button
            onClick={() => {
              setEditing({ ...EMPTY });
              setDialogOpen(true);
            }}
          >
            <Plus className="h-4 w-4 mr-2" />
            Yeni Görev
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Tüm Görevler ({quests.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="py-8 flex justify-center">
                <Loader2 className="h-5 w-5 animate-spin" />
              </div>
            ) : quests.length === 0 ? (
              <p className="py-8 text-center text-muted-foreground text-sm">
                Henüz görev yok. "Yeni Görev" ile başla.
              </p>
            ) : (
              <div className="space-y-2">
                {quests.map((q) => (
                  <div
                    key={q.id}
                    className={`flex items-start gap-3 p-3 rounded-lg border ${
                      q.isActive ? 'bg-card' : 'bg-muted/30 opacity-60'
                    }`}
                  >
                    <div className="text-2xl pt-0.5">{q.icon || '🎯'}</div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold">{q.title}</span>
                        <Badge variant="outline" className="text-[10px]">
                          {q.type}
                        </Badge>
                        <Badge variant="outline" className="text-[10px]">
                          {q.difficulty}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-1">
                        {q.description}
                      </p>
                      <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                        <span>
                          <span className="font-medium">{q.target}</span> →{' '}
                          {q.targetValue}
                        </span>
                        <span className="text-cyan-300">+{q.xpReward} XP</span>
                        <span className="text-amber-300">
                          +{q.creditsReward} coin
                        </span>
                        {q._count && (
                          <span>{q._count.completions} tamamlama</span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <Switch
                        checked={q.isActive}
                        onCheckedChange={() => toggleActive(q)}
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setEditing(q);
                          setDialogOpen(true);
                        }}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteQuest(q)}
                      >
                        <Trash2 className="h-4 w-4 text-rose-400" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      {/* ─── Edit / Create Dialog ─────────────────────────────────── */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editing?.id ? 'Görev Düzenle' : 'Yeni Görev'}
            </DialogTitle>
          </DialogHeader>

          {editing && (
            <div className="space-y-4">
              <div className="grid grid-cols-4 gap-2">
                <div>
                  <Label>İkon</Label>
                  <Input
                    value={editing.icon ?? ''}
                    onChange={(e) =>
                      setEditing({ ...editing, icon: e.target.value })
                    }
                    placeholder="🎯"
                    className="text-center text-xl"
                  />
                </div>
                <div className="col-span-3">
                  <Label>Başlık</Label>
                  <Input
                    value={editing.title ?? ''}
                    onChange={(e) =>
                      setEditing({ ...editing, title: e.target.value })
                    }
                    placeholder="2 saat oyna"
                  />
                </div>
              </div>

              <div>
                <Label>Açıklama</Label>
                <Textarea
                  value={editing.description ?? ''}
                  onChange={(e) =>
                    setEditing({ ...editing, description: e.target.value })
                  }
                  placeholder="Bugün cafe'de toplam 2 saat oyna ve ödülünü kap"
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <Label>Tip</Label>
                  <Select
                    value={editing.type}
                    onValueChange={(v) => setEditing({ ...editing, type: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Günlük</SelectItem>
                      <SelectItem value="weekly">Haftalık</SelectItem>
                      <SelectItem value="special">Özel</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Zorluk</Label>
                  <Select
                    value={editing.difficulty}
                    onValueChange={(v) =>
                      setEditing({ ...editing, difficulty: v })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="easy">Easy</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="hard">Hard</SelectItem>
                      <SelectItem value="expert">Expert</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Tekrarlanır</Label>
                  <div className="h-10 flex items-center">
                    <Switch
                      checked={editing.isRepeatable ?? true}
                      onCheckedChange={(v) =>
                        setEditing({ ...editing, isRepeatable: v })
                      }
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label>Tetikleyici (Target)</Label>
                  <Select
                    value={editing.target}
                    onValueChange={(v) =>
                      setEditing({ ...editing, target: v })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {TARGETS.map((t) => (
                        <SelectItem key={t.value} value={t.value}>
                          {t.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Hedef Değer</Label>
                  <Input
                    type="number"
                    min={1}
                    value={editing.targetValue ?? 1}
                    onChange={(e) =>
                      setEditing({
                        ...editing,
                        targetValue: Number(e.target.value),
                      })
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label>XP Ödülü</Label>
                  <Input
                    type="number"
                    min={0}
                    value={editing.xpReward ?? 0}
                    onChange={(e) =>
                      setEditing({
                        ...editing,
                        xpReward: Number(e.target.value),
                      })
                    }
                  />
                </div>
                <div>
                  <Label>Coin Ödülü</Label>
                  <Input
                    type="number"
                    min={0}
                    value={editing.creditsReward ?? 0}
                    onChange={(e) =>
                      setEditing({
                        ...editing,
                        creditsReward: Number(e.target.value),
                      })
                    }
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Switch
                  checked={editing.isActive ?? true}
                  onCheckedChange={(v) =>
                    setEditing({ ...editing, isActive: v })
                  }
                />
                <Label>Aktif</Label>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="ghost" onClick={() => setDialogOpen(false)}>
              İptal
            </Button>
            <Button onClick={save} disabled={saving}>
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              Kaydet
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
