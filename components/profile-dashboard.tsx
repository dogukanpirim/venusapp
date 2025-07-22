
'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  User, 
  Clock, 
  CreditCard, 
  Activity, 
  TrendingUp,
  Calendar,
  Monitor,
  Gamepad2,
  Wallet,
  Trophy,
  Gift,
  Settings
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { GizmoStatsCards } from '@/components/gizmo-stats-cards';
import { GizmoSessionsChart } from '@/components/gizmo-sessions-chart';
import { GizmoTransactionHistory } from '@/components/gizmo-transaction-history';
import { GizmoActivityFeed } from '@/components/gizmo-activity-feed';
import { formatCurrency, formatDuration } from '@/lib/utils';
import { RealTimeBalance } from '@/components/real-time-balance';

interface ProfileDashboardProps {
  user: any;
}

interface StatItem {
  title: string;
  value: string;
  description: string;
  icon: any;
  color: string;
  bgColor: string;
}

export function ProfileDashboard({ user }: ProfileDashboardProps) {
  const [activeTab, setActiveTab] = useState('overview');

  const player = user?.player;
  const gizmoProfile = player?.gizmoProfile;

  // Safety checks
  if (!user) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-400">Kullanıcı bilgileri yüklenemedi.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <Card className="gaming-card">
        <CardContent className="p-6">
          <div className="flex items-center space-x-6">
            <Avatar className="h-20 w-20">
              <AvatarImage src={user?.image || player?.avatar} />
              <AvatarFallback className="text-lg">
                {user?.name?.[0] || user?.email?.[0] || 'U'}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-white">
                {player?.displayName || user?.name || 'Üye'}
              </h2>
              <p className="text-gray-400">
                {player?.gamertag ? `@${player.gamertag}` : user?.email}
              </p>
              
              <div className="flex items-center space-x-4 mt-2">
                {player?.currentRank && (
                  <Badge variant="secondary" className="bg-purple-900/50">
                    <Trophy className="h-3 w-3 mr-1" />
                    {player.currentRank}
                  </Badge>
                )}
                {gizmoProfile?.membershipType && (
                  <Badge 
                    variant="secondary" 
                    className={
                      gizmoProfile.membershipType === 'VIP' 
                        ? 'bg-yellow-900/50 text-yellow-200' 
                        : 'bg-blue-900/50 text-blue-200'
                    }
                  >
                    {gizmoProfile.membershipType}
                  </Badge>
                )}
                <RealTimeBalance 
                  username={user?.name || user?.email?.split('@')[0] || player?.gamertag || player?.displayName || 'unknown'} 
                  initialBalance={gizmoProfile?.currentBalance || 0}
                  compact={true}
                />
              </div>
            </div>

            <div className="text-right space-y-2">
              <p className="text-sm text-gray-400">Toplam Oyun Süresi</p>
              <p className="text-xl font-bold text-green-400">
                {formatDuration(gizmoProfile?.totalPlayTime || 0)}
              </p>
              <p className="text-sm text-gray-400">
                {gizmoProfile?.totalSessions || 0} Oturum
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Gizmo Stats Overview */}
      {gizmoProfile && <GizmoStatsCards profile={gizmoProfile} />}

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview" className="flex items-center space-x-2">
            <Activity className="h-4 w-4" />
            <span>Genel</span>
          </TabsTrigger>
          <TabsTrigger value="sessions" className="flex items-center space-x-2">
            <Monitor className="h-4 w-4" />
            <span>Oturumlar</span>
          </TabsTrigger>
          <TabsTrigger value="transactions" className="flex items-center space-x-2">
            <CreditCard className="h-4 w-4" />
            <span>İşlemler</span>
          </TabsTrigger>
          <TabsTrigger value="gaming" className="flex items-center space-x-2">
            <Gamepad2 className="h-4 w-4" />
            <span>Oyun</span>
          </TabsTrigger>
          <TabsTrigger value="rewards" className="flex items-center space-x-2">
            <Gift className="h-4 w-4" />
            <span>Ödüller</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Real-time Balance Card */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <RealTimeBalance 
              username={user?.name || user?.email?.split('@')[0] || player?.gamertag || player?.displayName || 'unknown'} 
              initialBalance={gizmoProfile?.currentBalance || 0}
              compact={false}
            />
            <div className="lg:col-span-2">
              {gizmoProfile && <GizmoStatsCards profile={gizmoProfile} />}
            </div>
          </div>
          
          {gizmoProfile && (
            <>
              <GizmoSessionsChart profileId={gizmoProfile.id} />
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <GizmoActivityFeed 
                  activities={gizmoProfile.activities} 
                  showTitle={true}
                />
                <GizmoTransactionHistory 
                  transactions={gizmoProfile.transactions.slice(0, 5)} 
                  showTitle={true}
                />
              </div>
            </>
          )}
        </TabsContent>

        <TabsContent value="sessions" className="space-y-6">
          {gizmoProfile && (
            <div className="space-y-6">
              <GizmoSessionsChart profileId={gizmoProfile.id} />
              
              <Card className="gaming-card">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Clock className="h-5 w-5" />
                    <span>Son Oturumlar</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {gizmoProfile.sessions.map((session: any) => (
                      <div 
                        key={session.id} 
                        className="flex items-center justify-between p-4 rounded-lg bg-gray-800/50 border border-gray-700"
                      >
                        <div className="flex items-center space-x-4">
                          <div className="p-2 rounded-lg bg-purple-900/50">
                            <Monitor className="h-4 w-4 text-purple-400" />
                          </div>
                          <div>
                            <p className="font-medium text-white">
                              {session.computerName} - {session.zoneName}
                            </p>
                            <p className="text-sm text-gray-400">
                              {session.startTime.toLocaleDateString('tr-TR', {
                                day: 'numeric',
                                month: 'long',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-white">
                            {formatDuration(session.duration || 0)}
                          </p>
                          <p className="text-sm text-green-400">
                            {formatCurrency(session.finalCost)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="transactions" className="space-y-6">
          {gizmoProfile && (
            <GizmoTransactionHistory 
              transactions={gizmoProfile.transactions} 
              showTitle={false}
            />
          )}
        </TabsContent>

        <TabsContent value="gaming" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Game Stats */}
            <Card className="gaming-card">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Gamepad2 className="h-5 w-5" />
                  <span>Oyun İstatistikleri</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {player?.stats?.map((stat: any) => (
                    <div key={stat.id} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-white">{stat.game.name}</p>
                        <p className="text-sm text-gray-400">
                          {stat.gamesPlayed} Maç • %{(stat.winRate * 100).toFixed(1)} Kazanma
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-green-400">
                          {stat.wins}-{stat.losses}
                        </p>
                        {stat.kda && (
                          <p className="text-sm text-gray-400">
                            KDA: {stat.kda.toFixed(2)}
                          </p>
                        )}
                      </div>
                    </div>
                  )) || (
                    <p className="text-gray-400 text-center py-4">
                      Henüz oyun istatistiği bulunmuyor
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Achievements */}
            <Card className="gaming-card">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Trophy className="h-5 w-5" />
                  <span>Son Başarımlar</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {player?.achievements?.map((playerAchievement: any) => (
                    <div key={playerAchievement.id} className="flex items-center space-x-3">
                      <div className="p-2 rounded-lg bg-yellow-900/50">
                        <Trophy className="h-4 w-4 text-yellow-400" />
                      </div>
                      <div>
                        <p className="font-medium text-white">
                          {playerAchievement.achievement.name}
                        </p>
                        <p className="text-sm text-gray-400">
                          {playerAchievement.unlockedAt.toLocaleDateString('tr-TR')}
                        </p>
                      </div>
                    </div>
                  )) || (
                    <p className="text-gray-400 text-center py-4">
                      Henüz başarım bulunmuyor
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="rewards" className="space-y-6">
          <Card className="gaming-card">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Gift className="h-5 w-5" />
                <span>Son Loot Box Ödülleri</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {user?.lootboxOpenings?.map((opening: any) => (
                  <div key={opening.id} className="flex items-center justify-between p-4 rounded-lg bg-gray-800/50 border border-gray-700">
                    <div className="flex items-center space-x-4">
                      <div className={`p-2 rounded-lg ${
                        opening.rarity === 'LEGENDARY' ? 'bg-yellow-900/50' :
                        opening.rarity === 'EPIC' ? 'bg-purple-900/50' :
                        opening.rarity === 'RARE' ? 'bg-blue-900/50' : 'bg-gray-700/50'
                      }`}>
                        <Gift className={`h-4 w-4 ${
                          opening.rarity === 'LEGENDARY' ? 'text-yellow-400' :
                          opening.rarity === 'EPIC' ? 'text-purple-400' :
                          opening.rarity === 'RARE' ? 'text-blue-400' : 'text-gray-400'
                        }`} />
                      </div>
                      <div>
                        <p className="font-medium text-white">{opening.reward.name}</p>
                        <p className="text-sm text-gray-400">
                          {opening.createdAt.toLocaleDateString('tr-TR')}
                        </p>
                      </div>
                    </div>
                    <Badge 
                      variant="secondary"
                      className={
                        opening.rarity === 'LEGENDARY' ? 'bg-yellow-900/50 text-yellow-200' :
                        opening.rarity === 'EPIC' ? 'bg-purple-900/50 text-purple-200' :
                        opening.rarity === 'RARE' ? 'bg-blue-900/50 text-blue-200' : 'bg-gray-700/50'
                      }
                    >
                      {opening.rarity}
                    </Badge>
                  </div>
                )) || (
                  <p className="text-gray-400 text-center py-4">
                    Henüz loot box açılmamış
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
