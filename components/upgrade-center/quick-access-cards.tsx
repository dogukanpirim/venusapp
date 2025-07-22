
'use client';

import { motion } from 'framer-motion';
import { Search, Calculator, Wrench, Star, TrendingUp, Package } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import Link from 'next/link';

const quickAccessItems = [
  {
    title: 'Sistem Analizi',
    description: 'PC\'nizin mevcut performansını analiz edin ve bottleneck\'leri tespit edin',
    icon: Search,
    href: '/upgrade-center/analysis',
    color: 'purple',
    stats: 'Real-time monitoring'
  },
  {
    title: 'Hardware Envanteri',
    description: 'Güncel donanım listesi, fiyatlar ve stok durumu',
    icon: Package,
    href: '/upgrade-center/inventory',
    color: 'blue',
    stats: '500+ ürün'
  },
  {
    title: 'Upgrade Simülatörü',
    description: 'Yeni donanımlarla performans artışınızı önceden görün',
    icon: TrendingUp,
    href: '/upgrade-center/simulator',
    color: 'green',
    stats: 'Before/After karşılaştırma'
  },
  {
    title: 'Servis Paketleri',
    description: 'Hazır upgrade paketleri ve özel çözümler',
    icon: Star,
    href: '/upgrade-center/services',
    color: 'yellow',
    stats: '5 farklı paket'
  },
  {
    title: 'Gaming Önerileri',
    description: 'Oyun bazlı donanım önerileri ve FPS hedefleri',
    icon: Wrench,
    href: '/upgrade-center/recommendations',
    color: 'cyan',
    stats: 'Popüler oyunlar'
  },
  {
    title: 'Fiyat Hesaplayıcı',
    description: 'Custom build fiyatları ve anında teklif alın',
    icon: Calculator,
    href: '/upgrade-center/calculator',
    color: 'orange',
    stats: 'Anında teklif'
  }
];

const colorClasses = {
  purple: 'from-purple-500 to-purple-700 border-purple-400/20 hover:border-purple-400/40',
  blue: 'from-blue-500 to-blue-700 border-blue-400/20 hover:border-blue-400/40',
  green: 'from-green-500 to-green-700 border-green-400/20 hover:border-green-400/40',
  yellow: 'from-yellow-500 to-yellow-700 border-yellow-400/20 hover:border-yellow-400/40',
  cyan: 'from-cyan-500 to-cyan-700 border-cyan-400/20 hover:border-cyan-400/40',
  orange: 'from-orange-500 to-orange-700 border-orange-400/20 hover:border-orange-400/40'
};

export default function QuickAccessCards() {
  return (
    <section className="py-20 bg-gradient-to-b from-background to-gray-900/20">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            <span className="text-purple-400">HIZLI</span> ERİŞİM
          </h2>
          <p className="text-gray-300 text-lg max-w-2xl mx-auto">
            Upgrade merkezi özelliklerine hızlı erişim sağlayın
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {quickAccessItems.map((item, index) => {
            const Icon = item.icon;
            const colorClass = colorClasses[item.color as keyof typeof colorClasses];
            
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
              >
                <Link href={item.href}>
                  <Card className={`h-full gaming-card border transition-all duration-300 hover:scale-105 hover:shadow-2xl cursor-pointer ${colorClass}`}>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className={`p-3 rounded-full bg-gradient-to-r ${colorClass} shadow-lg`}>
                          <Icon className="h-6 w-6 text-white" />
                        </div>
                        <div className="text-right">
                          <div className="text-xs text-gray-400 uppercase tracking-wide">
                            {item.stats}
                          </div>
                        </div>
                      </div>
                      
                      <h3 className="text-xl font-bold text-white mb-3">
                        {item.title}
                      </h3>
                      
                      <p className="text-gray-300 text-sm leading-relaxed">
                        {item.description}
                      </p>
                      
                      <div className="mt-4 flex items-center text-sm text-gray-400">
                        <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${colorClass} mr-2`}></div>
                        Hemen Başla →
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
