
'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calculator, TrendingUp, Zap, DollarSign } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

interface PricingTier {
  name: string;
  price_range: string;
  description: string;
  target_fps: string;
  popular: boolean;
  features: string[];
  color: string;
}

export default function PricingWidget() {
  const [pricingTiers, setPricingTiers] = useState<PricingTier[]>([]);
  const [currentPrices, setCurrentPrices] = useState({
    cpu_avg: 0,
    gpu_avg: 0,
    ram_avg: 0,
    total_builds: 0
  });

  useEffect(() => {
    // Mock pricing data
    const mockTiers: PricingTier[] = [
      {
        name: 'Budget Gaming',
        price_range: '15.000 - 25.000 ₺',
        description: '1080p gaming ve esports için ideal',
        target_fps: '144+ FPS (Competitive)',
        popular: false,
        features: ['RTX 4060 / RX 7600', 'Ryzen 5 / i5', '16GB DDR4', '500GB SSD'],
        color: 'blue'
      },
      {
        name: 'Performance',
        price_range: '25.000 - 40.000 ₺',
        description: '1440p yüksek ayarlar gaming',
        target_fps: '120+ FPS (High Settings)',
        popular: true,
        features: ['RTX 4070 / RX 7700 XT', 'Ryzen 7 / i7', '32GB DDR5', '1TB NVMe'],
        color: 'purple'
      },
      {
        name: 'Enthusiast',
        price_range: '40.000 - 60.000 ₺',
        description: '4K gaming ve content creation',
        target_fps: '4K 60+ FPS',
        popular: false,
        features: ['RTX 4080 / RX 7900 XTX', 'Ryzen 9 / i9', '64GB DDR5', '2TB NVMe'],
        color: 'green'
      }
    ];

    // Mock current market prices
    const mockPrices = {
      cpu_avg: 8500,
      gpu_avg: 22000,
      ram_avg: 3500,
      total_builds: 156
    };

    setPricingTiers(mockTiers);
    setCurrentPrices(mockPrices);
  }, []);

  const colorClasses = {
    blue: 'border-blue-400/30 hover:border-blue-400/50',
    purple: 'border-purple-400/30 hover:border-purple-400/50 ring-2 ring-purple-400/20',
    green: 'border-green-400/30 hover:border-green-400/50'
  };

  const badgeColors = {
    blue: 'border-blue-400/50 text-blue-400',
    purple: 'border-purple-400/50 text-purple-400',
    green: 'border-green-400/50 text-green-400'
  };

  return (
    <section className="py-20 bg-gradient-to-b from-gray-900/20 to-background">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            <span className="text-yellow-400">FİYAT</span> REHBERİ
          </h2>
          <p className="text-gray-300 text-lg max-w-2xl mx-auto">
            Bütçenize uygun upgrade seçenekleri ve güncel market fiyatları
          </p>
        </motion.div>

        {/* Market Prices Overview */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12"
        >
          <Card className="gaming-card border-yellow-400/20 hover:border-yellow-400/40">
            <CardContent className="p-4 text-center">
              <DollarSign className="h-6 w-6 text-yellow-400 mx-auto mb-2" />
              <div className="text-lg font-bold text-white">₺{currentPrices.cpu_avg.toLocaleString('tr-TR')}</div>
              <div className="text-xs text-gray-400">Ortalama CPU</div>
            </CardContent>
          </Card>
          
          <Card className="gaming-card border-yellow-400/20 hover:border-yellow-400/40">
            <CardContent className="p-4 text-center">
              <TrendingUp className="h-6 w-6 text-yellow-400 mx-auto mb-2" />
              <div className="text-lg font-bold text-white">₺{currentPrices.gpu_avg.toLocaleString('tr-TR')}</div>
              <div className="text-xs text-gray-400">Ortalama GPU</div>
            </CardContent>
          </Card>
          
          <Card className="gaming-card border-yellow-400/20 hover:border-yellow-400/40">
            <CardContent className="p-4 text-center">
              <Zap className="h-6 w-6 text-yellow-400 mx-auto mb-2" />
              <div className="text-lg font-bold text-white">₺{currentPrices.ram_avg.toLocaleString('tr-TR')}</div>
              <div className="text-xs text-gray-400">DDR5 32GB</div>
            </CardContent>
          </Card>
          
          <Card className="gaming-card border-yellow-400/20 hover:border-yellow-400/40">
            <CardContent className="p-4 text-center">
              <Calculator className="h-6 w-6 text-yellow-400 mx-auto mb-2" />
              <div className="text-lg font-bold text-white">{currentPrices.total_builds}</div>
              <div className="text-xs text-gray-400">Toplam Build</div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Pricing Tiers */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {pricingTiers.map((tier, index) => (
            <motion.div
              key={tier.name}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 + index * 0.1 }}
              className="relative"
            >
              {tier.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10">
                  <Badge className="bg-purple-600 text-white px-4 py-1">
                    En Popüler
                  </Badge>
                </div>
              )}
              
              <Card className={`h-full gaming-card ${colorClasses[tier.color as keyof typeof colorClasses]} transition-all duration-300 hover:scale-105`}>
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xl font-bold text-white">
                      {tier.name}
                    </CardTitle>
                    <Badge variant="outline" className={badgeColors[tier.color as keyof typeof badgeColors]}>
                      {tier.color === 'blue' ? 'Başlangıç' : tier.color === 'purple' ? 'Önerilen' : 'Premium'}
                    </Badge>
                  </div>
                  <div className="text-2xl font-bold text-white mb-2">
                    {tier.price_range}
                  </div>
                  <p className="text-gray-300 text-sm">{tier.description}</p>
                </CardHeader>
                
                <CardContent className="pt-0">
                  <div className="mb-4 p-3 rounded-lg bg-gray-800/50 border border-gray-700/50">
                    <div className="text-sm text-gray-400 mb-1">Hedef Performans</div>
                    <div className="font-semibold text-white">{tier.target_fps}</div>
                  </div>
                  
                  <div className="space-y-2 mb-6">
                    {tier.features.map((feature, idx) => (
                      <div key={idx} className="flex items-center text-sm text-gray-300">
                        <div className={`w-2 h-2 rounded-full mr-3 ${
                          tier.color === 'blue' ? 'bg-blue-400' : 
                          tier.color === 'purple' ? 'bg-purple-400' : 'bg-green-400'
                        }`}></div>
                        {feature}
                      </div>
                    ))}
                  </div>
                  
                  <Link href={`/upgrade-center/calculator?preset=${tier.name.toLowerCase().replace(' ', '_')}`}>
                    <Button className={`w-full ${
                      tier.color === 'blue' ? 'bg-blue-600 hover:bg-blue-700' : 
                      tier.color === 'purple' ? 'bg-purple-600 hover:bg-purple-700' : 
                      'bg-green-600 hover:bg-green-700'
                    } text-white`}>
                      Detaylı Hesaplama
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="text-center"
        >
          <Card className="gaming-card border-yellow-400/30 bg-gradient-to-r from-yellow-900/20 to-orange-900/20 p-8">
            <h3 className="text-2xl font-bold text-white mb-4">
              Özel Teklif Almak İster misiniz?
            </h3>
            <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
              Size özel upgrade paketi hazırlayalım. Mevcut sisteminizi analiz edip 
              en uygun upgrade seçeneklerini önererek detaylı fiyat teklifi sunarız.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/upgrade-center/analysis">
                <Button className="bg-yellow-600 hover:bg-yellow-700 text-black font-semibold px-8 py-3">
                  Ücretsiz Sistem Analizi
                </Button>
              </Link>
              <Link href="/upgrade-center/calculator">
                <Button variant="outline" className="border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-black px-8 py-3">
                  Özel Teklif Al
                </Button>
              </Link>
            </div>
          </Card>
        </motion.div>
      </div>
    </section>
  );
}
