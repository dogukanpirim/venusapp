
'use client';

import { Card } from '@/components/ui/card';
import { Server, Users, Wifi, Clock } from 'lucide-react';

const stats = [
  {
    title: 'Aktif Serverlar',
    value: '8',
    icon: Server,
    color: 'text-green-400',
  },
  {
    title: 'Toplam Oyuncu',
    value: '142',
    icon: Users,
    color: 'text-blue-400',
  },
  {
    title: 'Ortalama Ping',
    value: '15ms',
    icon: Wifi,
    color: 'text-purple-400',
  },
  {
    title: 'Uptime',
    value: '99.8%',
    icon: Clock,
    color: 'text-cyan-400',
  },
];

export function ServerStats() {
  return (
    <section className="py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.title} className="bg-gray-900/40 border-gray-700/50 p-4 text-center">
                <Icon className={`h-8 w-8 mx-auto mb-2 ${stat.color}`} />
                <div className="text-2xl font-bold text-white mb-1">
                  {stat.value}
                </div>
                <div className="text-sm text-gray-400">
                  {stat.title}
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
