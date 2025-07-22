
'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Zap, Crown, Gamepad2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

interface FeaturedUpgrade {
  id: string;
  title: string;
  description: string;
  performance_gain: string;
  price: number;
  category: string;
  popularity: number;
  components: string[];
  games_improved: string[];
  before_fps: number;
  after_fps: number;
}

export default function FeaturedUpgrades() {
  const [featuredUpgrades, setFeaturedUpgrades] = useState<FeaturedUpgrade[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock featured upgrades data
    const mockData: FeaturedUpgrade[] = [
      {
        id: 'gpu_upgrade_1',
        title: 'RTX 4070 Super Gaming Boost',
        description: 'RTX 3060\'tan RTX 4070 Super\'a geçişle %60 performans artışı',
        performance_gain: '+60%',
        price: 25500,
        category: 'GPU Upgrade',
        popularity: 95,
        components: ['NVIDIA RTX 4070 Super 12GB', 'PSU Upgrade (750W)', 'Installation'],
        games_improved: ['Cyberpunk 2077', 'Call of Duty', 'Apex Legends'],
        before_fps: 85,
        after_fps: 140
      },
      {
        id: 'cpu_upgrade_1',
        title: 'Intel 13th Gen Performance',
        description: 'i5-12400\'den i7-13700K\'ya yükseltme paketi',
        performance_gain: '+35%',
        price: 18500,
        category: 'CPU Upgrade',
        popularity: 88,
        components: ['Intel Core i7-13700K', 'Z790 Motherboard', 'DDR5-5600 32GB'],
        games_improved: ['CS2', 'Valorant', 'Fortnite'],
        before_fps: 280,
        after_fps: 380
      },
      {
        id: 'complete_upgrade_1',
        title: 'Complete Gaming Overhaul',
        description: 'Mid-range sistemden high-end gaming PC\'ye tam dönüşüm',
        performance_gain: '+150%',
        price: 45000,
        category: 'Complete Build',
        popularity: 92,
        components: ['i9-13900K', 'RTX 4080 Super', '64GB DDR5', '2TB NVMe'],
        games_improved: ['4K Gaming', 'VR Ready', 'Content Creation'],
        before_fps: 60,
        after_fps: 150
      }
    ];

    setTimeout(() => {
      setFeaturedUpgrades(mockData);
      setLoading(false);
    }, 1000);
  }, []);

  if (loading) {
    return (
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-96 bg-gray-800/50 rounded-lg animate-pulse"></div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            <span className="text-green-400">ÖNERÍLEN</span> UPGRADE'LER
          </h2>
          <p className="text-gray-300 text-lg max-w-2xl mx-auto">
            En popüler ve etkili upgrade seçenekleri
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {featuredUpgrades.map((upgrade, index) => (
            <motion.div
              key={upgrade.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: index * 0.1 }}
            >
              <Card className="h-full gaming-card border-green-400/20 hover:border-green-400/40 hover:scale-105 transition-all duration-300">
                <CardContent className="p-6">
                  {/* Header */}
                  <div className="flex items-center justify-between mb-4">
                    <Badge 
                      variant="outline" 
                      className="border-green-400/50 text-green-400"
                    >
                      {upgrade.category}
                    </Badge>
                    <div className="flex items-center space-x-1">
                      <Crown className="h-4 w-4 text-yellow-400" />
                      <span className="text-sm text-yellow-400">{upgrade.popularity}%</span>
                    </div>
                  </div>

                  {/* Title & Description */}
                  <h3 className="text-xl font-bold text-white mb-2">
                    {upgrade.title}
                  </h3>
                  <p className="text-gray-300 text-sm mb-4">
                    {upgrade.description}
                  </p>

                  {/* Performance Gain */}
                  <div className="flex items-center justify-between mb-4 p-3 rounded-lg bg-green-900/20 border border-green-400/20">
                    <div className="flex items-center space-x-2">
                      <TrendingUp className="h-5 w-5 text-green-400" />
                      <span className="text-white font-semibold">Performans Artışı</span>
                    </div>
                    <span className="text-2xl font-bold text-green-400">{upgrade.performance_gain}</span>
                  </div>

                  {/* FPS Comparison */}
                  <div className="flex items-center justify-between mb-4 p-3 rounded-lg bg-cyan-900/20 border border-cyan-400/20">
                    <div className="text-center">
                      <div className="text-sm text-gray-400">Önce</div>
                      <div className="text-lg font-bold text-white">{upgrade.before_fps} FPS</div>
                    </div>
                    <Zap className="h-6 w-6 text-cyan-400" />
                    <div className="text-center">
                      <div className="text-sm text-gray-400">Sonra</div>
                      <div className="text-lg font-bold text-cyan-400">{upgrade.after_fps} FPS</div>
                    </div>
                  </div>

                  {/* Components */}
                  <div className="mb-4">
                    <h4 className="text-sm font-semibold text-white mb-2">Dahil Olan Bileşenler:</h4>
                    <ul className="space-y-1">
                      {upgrade.components.map((component, idx) => (
                        <li key={idx} className="text-xs text-gray-400 flex items-center">
                          <div className="w-1 h-1 rounded-full bg-green-400 mr-2"></div>
                          {component}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Games */}
                  <div className="mb-6">
                    <h4 className="text-sm font-semibold text-white mb-2">Gelişen Oyunlar:</h4>
                    <div className="flex flex-wrap gap-1">
                      {upgrade.games_improved.map((game, idx) => (
                        <Badge key={idx} variant="secondary" className="text-xs">
                          {game}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Price & Action */}
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-2xl font-bold text-white">
                        ₺{upgrade.price.toLocaleString('tr-TR')}
                      </div>
                      <div className="text-xs text-gray-400">Kurulum dahil</div>
                    </div>
                    <Link href={`/upgrade-center/services?package=${upgrade.id}`}>
                      <Button className="bg-green-600 hover:bg-green-700 text-white">
                        <Gamepad2 className="h-4 w-4 mr-2" />
                        Detay
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="text-center mt-12"
        >
          <Link href="/upgrade-center/services">
            <Button variant="outline" className="border-green-400 text-green-400 hover:bg-green-400 hover:text-black px-8 py-3">
              Tüm Upgrade Paketlerini Görüntüle
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
