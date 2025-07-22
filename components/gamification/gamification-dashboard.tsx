
'use client';

import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { XpWidget } from './xp-widget';
import { TaskList } from './task-list';
import { CardCollection } from './card-collection';
import { Trophy, Target, CreditCard, Star } from 'lucide-react';

interface GamificationData {
  xp: any;
  tasks: any;
  cards: any;
}

// Mock data for demonstration
const mockData: GamificationData = {
  xp: {
    currentXP: 340,
    totalXP: 1250,
    level: 4,
    tasksXP: 800,
    gamesXP: 300,
    bonusXP: 150,
    progressToNextLevel: 40,
    xpNeededForNext: 60,
    progressPercentage: 40
  },
  tasks: {
    daily: [
      {
        id: '1',
        title: "Café'de 30 Dakika Geçir",
        description: "Venusespor café'de keyifli zaman geçir",
        icon: "☕",
        type: "daily",
        difficulty: "easy",
        category: "cafe",
        target: "time_spent",
        targetValue: 30,
        xpReward: 20,
        creditsReward: 0,
        progress: 15,
        completed: false,
        canClaim: false
      },
      {
        id: '2',
        title: "Günde 2 Oyun Oyna",
        description: "Herhangi bir oyundan 2 maç tamamla",
        icon: "🎮",
        type: "daily",
        difficulty: "easy",
        category: "gaming",
        target: "games_played",
        targetValue: 2,
        xpReward: 30,
        creditsReward: 5,
        progress: 2,
        completed: true,
        canClaim: true
      }
    ],
    weekly: [
      {
        id: '3',
        title: "Haftada 5 Farklı Oyun",
        description: "Hafta boyunca 5 farklı oyun oyna",
        icon: "🎯",
        type: "weekly",
        difficulty: "medium",
        category: "gaming",
        target: "unique_games",
        targetValue: 5,
        xpReward: 100,
        creditsReward: 25,
        progress: 3,
        completed: false,
        canClaim: false
      }
    ],
    special: [
      {
        id: '4',
        title: "Instant Ramen Koleksiyonu",
        description: "5 farklı instant ramen kartı topla",
        icon: "🍜",
        type: "special",
        difficulty: "hard",
        category: "general",
        target: "ramen_cards",
        targetValue: 5,
        xpReward: 300,
        creditsReward: 100,
        progress: 2,
        completed: false,
        canClaim: false
      }
    ]
  },
  cards: {
    availableCards: [
      {
        id: '1',
        name: "Klasik Tavuk Ramen",
        description: "En sevilen klasik lezzet. Sade ama etkili!",
        rarity: "common",
        category: "food",
        flavor: "mild",
        power: 3,
        unlockLevel: 1,
        unlockCost: 50,
        owned: true,
        quantity: 1,
        canUnlock: false
      },
      {
        id: '2',
        name: "Acılı Kimchi Ramen",
        description: "Kore usulü fermente lahana ile hazırlanmış özel ramen",
        rarity: "rare",
        category: "food",
        flavor: "spicy",
        power: 6,
        unlockLevel: 3,
        unlockCost: 150,
        owned: false,
        quantity: 0,
        canUnlock: true
      },
      {
        id: '3',
        name: "Ejder Nefesi Ramen",
        description: "UYARI: Sadece cesurlar için! 🔥🔥🔥",
        rarity: "epic",
        category: "food",
        flavor: "extra_hot",
        power: 9,
        unlockLevel: 8,
        unlockCost: 500,
        owned: false,
        quantity: 0,
        canUnlock: false
      }
    ],
    collection: [
      {
        id: '1',
        card: {
          id: '1',
          name: "Klasik Tavuk Ramen",
          description: "En sevilen klasik lezzet. Sade ama etkili!",
          rarity: "common",
          category: "food",
          flavor: "mild",
          power: 3
        },
        quantity: 1,
        unlockedAt: "2024-01-15T10:30:00Z",
        isFavorite: true
      }
    ],
    stats: {
      totalCards: 15,
      ownedCards: 3,
      completionPercentage: 20,
      favoriteCount: 1,
      rarityBreakdown: {
        common: 2,
        rare: 1,
        epic: 0,
        legendary: 0
      }
    },
    userLevel: 4
  }
};

export default function GamificationDashboard() {
  const [data, setData] = useState<GamificationData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading with mock data
    setTimeout(() => {
      setData(mockData);
      setLoading(false);
    }, 1000);
  }, []);

  const loadData = async () => {
    // Mock function for updates
    setLoading(true);
    setTimeout(() => {
      setData(mockData);
      setLoading(false);
    }, 500);
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-64 bg-card/50 rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  if (!data) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p className="text-muted-foreground">Gamification verileri yüklenirken bir hata oluştu.</p>
        </CardContent>
      </Card>
    );
  }

  const { xp, tasks, cards } = data;

  // Calculate task completion stats
  const allTasks = [...tasks.daily, ...tasks.weekly, ...tasks.special];
  const completedTasks = allTasks.filter(t => t.completed).length;
  const totalTasks = allTasks.length;

  return (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="text-center">
          <CardContent className="p-4">
            <div className="flex items-center justify-center mb-2">
              <Trophy className="h-6 w-6 text-yellow-500" />
            </div>
            <div className="text-2xl font-bold">{xp?.level || 1}</div>
            <div className="text-sm text-muted-foreground">Level</div>
          </CardContent>
        </Card>

        <Card className="text-center">
          <CardContent className="p-4">
            <div className="flex items-center justify-center mb-2">
              <Star className="h-6 w-6 text-blue-500" />
            </div>
            <div className="text-2xl font-bold">{xp?.totalXP || 0}</div>
            <div className="text-sm text-muted-foreground">Toplam XP</div>
          </CardContent>
        </Card>

        <Card className="text-center">
          <CardContent className="p-4">
            <div className="flex items-center justify-center mb-2">
              <Target className="h-6 w-6 text-green-500" />
            </div>
            <div className="text-2xl font-bold">{completedTasks}/{totalTasks}</div>
            <div className="text-sm text-muted-foreground">Görevler</div>
          </CardContent>
        </Card>

        <Card className="text-center">
          <CardContent className="p-4">
            <div className="flex items-center justify-center mb-2">
              <CreditCard className="h-6 w-6 text-purple-500" />
            </div>
            <div className="text-2xl font-bold">{cards?.stats?.ownedCards || 0}</div>
            <div className="text-sm text-muted-foreground">Kartlar</div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Genel Bakış</TabsTrigger>
          <TabsTrigger value="tasks">Görevler</TabsTrigger>
          <TabsTrigger value="cards">Kartlar</TabsTrigger>
          <TabsTrigger value="xp">XP Detayları</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <XpWidget xpData={xp} onXpUpdate={loadData} />
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Günlük Görevler
                </CardTitle>
                <CardDescription>
                  Bugünün görevlerini tamamla ve XP kazan
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {tasks.daily.slice(0, 3).map((task: any) => (
                    <div key={task.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{task.icon || '🎯'}</span>
                        <span className="text-sm">{task.title}</span>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {task.completed ? '✅' : `${task.progress}/${task.targetValue}`}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Son Açılan Kartlar
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {cards?.collection?.slice(0, 4).map((userCard: any) => (
                  <div key={userCard.id} className="text-center p-3 rounded-lg bg-muted/50">
                    <div className="text-2xl mb-2">🍜</div>
                    <div className="text-sm font-medium">{userCard.card.name}</div>
                    <div className={`text-xs px-2 py-1 rounded-full mt-1 ${
                      userCard.card.rarity === 'legendary' ? 'bg-yellow-500/20 text-yellow-500' :
                      userCard.card.rarity === 'epic' ? 'bg-purple-500/20 text-purple-500' :
                      userCard.card.rarity === 'rare' ? 'bg-blue-500/20 text-blue-500' :
                      'bg-gray-500/20 text-gray-500'
                    }`}>
                      {userCard.card.rarity}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tasks">
          <TaskList tasks={tasks} onTaskUpdate={loadData} />
        </TabsContent>

        <TabsContent value="cards">
          <CardCollection cards={cards} onCardUpdate={loadData} />
        </TabsContent>

        <TabsContent value="xp">
          <XpWidget xpData={xp} onXpUpdate={loadData} detailed />
        </TabsContent>
      </Tabs>
    </div>
  );
}
