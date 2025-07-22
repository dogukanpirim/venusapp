
'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Package, Star, Clock, Shield, CheckCircle, Crown, Gamepad2, Monitor, Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface ServicePackage {
  id: string;
  name: string;
  description: string;
  target_audience: string;
  price: number;
  installation_fee: number;
  components: {[key: string]: string};
  performance_targets: {[key: string]: string};
  features: string[];
  installation_time: string;
  warranty: string;
  support_duration: string;
  recommended_for: string[];
}

export default function ServicePackagesPage() {
  const [packages, setPackages] = useState<ServicePackage[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchServicePackages();
  }, []);

  const fetchServicePackages = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/upgrade/services');
      const result = await response.json();
      if (result.success) {
        setPackages(result.data);
      }
    } catch (error) {
      console.error('Error fetching service packages:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPackageIcon = (id: string) => {
    switch (id) {
      case 'budget_gaming': return Gamepad2;
      case 'mid_range': return Monitor;
      case 'high_end': return Crown;
      case 'content_creator': return Users;
      case 'competitive_esports': return Star;
      default: return Package;
    }
  };

  const getPackageColor = (id: string) => {
    switch (id) {
      case 'budget_gaming': return 'blue';
      case 'mid_range': return 'purple';
      case 'high_end': return 'yellow';
      case 'content_creator': return 'green';
      case 'competitive_esports': return 'red';
      default: return 'gray';
    }
  };

  const colorClasses = {
    blue: 'border-blue-400/30 hover:border-blue-400/50',
    purple: 'border-purple-400/30 hover:border-purple-400/50 ring-2 ring-purple-400/20',
    yellow: 'border-yellow-400/30 hover:border-yellow-400/50',
    green: 'border-green-400/30 hover:border-green-400/50',
    red: 'border-red-400/30 hover:border-red-400/50',
    gray: 'border-gray-400/30 hover:border-gray-400/50'
  };

  const badgeColors = {
    blue: 'bg-blue-900/20 text-blue-400 border-blue-400/30',
    purple: 'bg-purple-900/20 text-purple-400 border-purple-400/30',
    yellow: 'bg-yellow-900/20 text-yellow-400 border-yellow-400/30',
    green: 'bg-green-900/20 text-green-400 border-green-400/30',
    red: 'bg-red-900/20 text-red-400 border-red-400/30',
    gray: 'bg-gray-900/20 text-gray-400 border-gray-400/30'
  };

  const buttonColors = {
    blue: 'bg-blue-600 hover:bg-blue-700',
    purple: 'bg-purple-600 hover:bg-purple-700',
    yellow: 'bg-yellow-600 hover:bg-yellow-700',
    green: 'bg-green-600 hover:bg-green-700',
    red: 'bg-red-600 hover:bg-red-700',
    gray: 'bg-gray-600 hover:bg-gray-700'
  };

  const filteredPackages = selectedCategory === 'all' 
    ? packages 
    : packages.filter(pkg => pkg.target_audience.toLowerCase().includes(selectedCategory));

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400 mx-auto mb-4"></div>
          <p className="text-gray-300">Servis paketleri yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            <span className="text-purple-400">SERVİS</span> PAKETLERİ
          </h1>
          <p className="text-gray-300 text-lg max-w-2xl mx-auto">
            İhtiyaçlarınıza özel hazırlanmış upgrade paketleri ve professional kurulum hizmetleri
          </p>
        </motion.div>

        {/* Category Filter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mb-8"
        >
          <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="w-full">
            <TabsList className="grid grid-cols-2 md:grid-cols-6 w-full max-w-4xl mx-auto">
              <TabsTrigger value="all">Tümü</TabsTrigger>
              <TabsTrigger value="gamers">Gamers</TabsTrigger>
              <TabsTrigger value="creators">Creators</TabsTrigger>
              <TabsTrigger value="competitive">Competitive</TabsTrigger>
              <TabsTrigger value="enthusiast">Enthusiast</TabsTrigger>
              <TabsTrigger value="budget">Budget</TabsTrigger>
            </TabsList>
          </Tabs>
        </motion.div>

        {/* Service Packages Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8 mb-12">
          {filteredPackages.map((pkg, index) => {
            const PackageIcon = getPackageIcon(pkg.id);
            const color = getPackageColor(pkg.id);
            const colorClass = colorClasses[color as keyof typeof colorClasses];
            const badgeColor = badgeColors[color as keyof typeof badgeColors];
            const buttonColor = buttonColors[color as keyof typeof buttonColors];
            
            return (
              <motion.div
                key={pkg.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.3 + index * 0.1 }}
                className="relative"
              >
                {pkg.id === 'mid_range' && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10">
                    <Badge className="bg-purple-600 text-white px-4 py-1">
                      En Popüler
                    </Badge>
                  </div>
                )}
                
                <Card className={`h-full gaming-card ${colorClass} transition-all duration-300 hover:scale-105`}>
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between mb-4">
                      <div className={`p-3 rounded-full bg-gradient-to-r ${colorClass.includes('purple') ? 'from-purple-500 to-purple-700' : colorClass.includes('blue') ? 'from-blue-500 to-blue-700' : colorClass.includes('yellow') ? 'from-yellow-500 to-yellow-700' : colorClass.includes('green') ? 'from-green-500 to-green-700' : 'from-red-500 to-red-700'}`}>
                        <PackageIcon className="h-6 w-6 text-white" />
                      </div>
                      <Badge variant="outline" className={badgeColor}>
                        {pkg.target_audience.split(',')[0]}
                      </Badge>
                    </div>
                    
                    <CardTitle className="text-xl font-bold text-white mb-2">
                      {pkg.name}
                    </CardTitle>
                    
                    <p className="text-gray-300 text-sm leading-relaxed">
                      {pkg.description}
                    </p>
                    
                    <div className="flex items-baseline space-x-2 mt-4">
                      <span className="text-3xl font-bold text-white">
                        ₺{pkg.price.toLocaleString('tr-TR')}
                      </span>
                      <span className="text-sm text-gray-400">
                        + ₺{pkg.installation_fee} kurulum
                      </span>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="pt-0">
                    {/* Performance Targets */}
                    <div className="mb-6 p-4 rounded-lg bg-gray-800/50 border border-gray-700/50">
                      <h4 className="text-sm font-semibold text-white mb-3 flex items-center">
                        <Star className="h-4 w-4 mr-2 text-yellow-400" />
                        Hedef Performans
                      </h4>
                      <div className="space-y-2">
                        {Object.entries(pkg.performance_targets).map(([key, value]) => (
                          <div key={key} className="flex justify-between text-sm">
                            <span className="text-gray-400">{key.replace('_', ' ').toUpperCase()}:</span>
                            <span className="text-white font-medium">{value}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Components */}
                    <div className="mb-6">
                      <h4 className="text-sm font-semibold text-white mb-3 flex items-center">
                        <Package className="h-4 w-4 mr-2 text-blue-400" />
                        Dahil Olan Bileşenler
                      </h4>
                      <div className="space-y-2">
                        {Object.entries(pkg.components).map(([key, value]) => (
                          <div key={key} className="text-sm">
                            <span className="text-gray-400 capitalize">{key}:</span>
                            <span className="text-white ml-2">{value}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Features */}
                    <div className="mb-6">
                      <h4 className="text-sm font-semibold text-white mb-3 flex items-center">
                        <CheckCircle className="h-4 w-4 mr-2 text-green-400" />
                        Özellikler
                      </h4>
                      <ul className="space-y-2">
                        {pkg.features.slice(0, 4).map((feature, idx) => (
                          <li key={idx} className="text-sm text-gray-300 flex items-start">
                            <div className="w-1.5 h-1.5 rounded-full bg-green-400 mt-2 mr-3 flex-shrink-0"></div>
                            {feature}
                          </li>
                        ))}
                        {pkg.features.length > 4 && (
                          <li className="text-sm text-blue-400">
                            +{pkg.features.length - 4} özellik daha...
                          </li>
                        )}
                      </ul>
                    </div>

                    {/* Service Info */}
                    <div className="mb-6 grid grid-cols-3 gap-3 text-center">
                      <div className="p-2 rounded bg-gray-800/50">
                        <Clock className="h-4 w-4 text-purple-400 mx-auto mb-1" />
                        <div className="text-xs text-gray-400">{pkg.installation_time}</div>
                      </div>
                      <div className="p-2 rounded bg-gray-800/50">
                        <Shield className="h-4 w-4 text-green-400 mx-auto mb-1" />
                        <div className="text-xs text-gray-400">{pkg.warranty}</div>
                      </div>
                      <div className="p-2 rounded bg-gray-800/50">
                        <Users className="h-4 w-4 text-blue-400 mx-auto mb-1" />
                        <div className="text-xs text-gray-400">{pkg.support_duration}</div>
                      </div>
                    </div>

                    {/* Recommended Games */}
                    <div className="mb-6">
                      <h4 className="text-sm font-semibold text-white mb-2">Önerilen Oyunlar:</h4>
                      <div className="flex flex-wrap gap-1">
                        {pkg.recommended_for.slice(0, 3).map((game, idx) => (
                          <Badge key={idx} variant="secondary" className="text-xs">
                            {game}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* Action Button */}
                    <Button className={`w-full ${buttonColor} text-white`}>
                      Paket Detayları & Sipariş
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Why Choose Our Services */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mb-12"
        >
          <Card className="gaming-card border-purple-400/30 bg-gradient-to-r from-purple-900/20 to-blue-900/20">
            <CardHeader>
              <CardTitle className="text-center text-2xl font-bold text-white mb-6">
                Neden Venus eSports Upgrade Servisleri?
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="text-center">
                  <Shield className="h-8 w-8 text-green-400 mx-auto mb-3" />
                  <h3 className="font-semibold text-white mb-2">Garanti Güvencesi</h3>
                  <p className="text-sm text-gray-400">
                    Tüm upgrade'lerde 2-5 yıl garanti ve ücretsiz teknik destek
                  </p>
                </div>
                
                <div className="text-center">
                  <Users className="h-8 w-8 text-blue-400 mx-auto mb-3" />
                  <h3 className="font-semibold text-white mb-2">Uzman Ekip</h3>
                  <p className="text-sm text-gray-400">
                    Professional gaming ve hardware konusunda uzman teknisyenler
                  </p>
                </div>
                
                <div className="text-center">
                  <Clock className="h-8 w-8 text-yellow-400 mx-auto mb-3" />
                  <h3 className="font-semibold text-white mb-2">Hızlı Kurulum</h3>
                  <p className="text-sm text-gray-400">
                    Same-day kurulum ve optimizasyon hizmetleri
                  </p>
                </div>
                
                <div className="text-center">
                  <Star className="h-8 w-8 text-purple-400 mx-auto mb-3" />
                  <h3 className="font-semibold text-white mb-2">%98 Memnuniyet</h3>
                  <p className="text-sm text-gray-400">
                    500+ başarılı upgrade ve yüksek müşteri memnuniyeti
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="text-center"
        >
          <Card className="gaming-card border-green-400/30 bg-gradient-to-r from-green-900/20 to-purple-900/20 p-8">
            <h3 className="text-2xl font-bold text-white mb-4">
              Size Özel Paket Hazırlayalım mı?
            </h3>
            <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
              Mevcut sisteminizi analiz ederek, budget'ınıza ve ihtiyaçlarınıza 
              en uygun upgrade paketini özel olarak tasarlayabiliriz.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button className="bg-green-600 hover:bg-green-700 text-white px-8 py-3">
                Ücretsiz Konsültasyon
              </Button>
              <Button variant="outline" className="border-purple-400 text-purple-400 hover:bg-purple-400 hover:text-black px-8 py-3">
                Sistem Analizi Yaptır
              </Button>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
