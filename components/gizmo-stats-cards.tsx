
'use client';

import { motion } from 'framer-motion';
import { 
  Clock, 
  CreditCard, 
  TrendingUp,
  Monitor,
  Wallet,
  Calendar,
  Activity
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency, formatDuration } from '@/lib/utils';

interface GizmoStatsCardsProps {
  profile: any;
}

export function GizmoStatsCards({ profile }: GizmoStatsCardsProps) {
  if (!profile) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-400">Gizmo profil bilgileri yüklenemedi.</p>
      </div>
    );
  }

  const stats = [
    {
      title: 'Toplam Oyun Süresi',
      value: formatDuration(profile.totalPlayTime || 0),
      description: `${profile.totalSessions || 0} oturum`,
      icon: Clock,
      color: 'text-blue-400',
      bgColor: 'bg-blue-900/50',
    },
    {
      title: 'Mevcut Bakiye',
      value: formatCurrency(profile.currentBalance || 0),
      description: 'Kullanılabilir bakiye',
      icon: Wallet,
      color: 'text-green-400',
      bgColor: 'bg-green-900/50',
    },
    {
      title: 'Toplam Harcama',
      value: formatCurrency(profile.totalSpending || 0),
      description: 'Tüm zamanlar',
      icon: CreditCard,
      color: 'text-purple-400',
      bgColor: 'bg-purple-900/50',
    },
    {
      title: 'Ortalama Oturum',
      value: formatDuration(profile.averageSession || 0),
      description: 'Oturum başına',
      icon: TrendingUp,
      color: 'text-yellow-400',
      bgColor: 'bg-yellow-900/50',
    },
    {
      title: 'Üyelik Türü',
      value: profile.membershipType || 'Standard',
      description: profile.membershipExpiry ? 
        `${new Date(profile.membershipExpiry).toLocaleDateString('tr-TR')} tarihine kadar` : 
        'Sınırsız',
      icon: Monitor,
      color: 'text-pink-400',
      bgColor: 'bg-pink-900/50',
    },
    {
      title: 'Sadakat Puanı',
      value: profile.loyaltyPoints?.toLocaleString('tr-TR') || '0',
      description: 'Toplam puan',
      icon: Activity,
      color: 'text-orange-400',
      bgColor: 'bg-orange-900/50',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {stats.map((stat, index) => (
        <motion.div
          key={stat.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: index * 0.1 }}
        >
          <Card className="gaming-card hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-400 mb-1">{stat.title}</p>
                  <p className="text-2xl font-bold text-white mb-1">{stat.value}</p>
                  <p className="text-xs text-gray-500">{stat.description}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}
