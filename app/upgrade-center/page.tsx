
import { Suspense } from 'react';
import { Cpu, HardDrive, Monitor, Zap, Calculator, Star, TrendingUp, Gamepad2 } from 'lucide-react';
import UpgradeCenterHero from '@/components/upgrade-center/hero-section';
import QuickAccessCards from '@/components/upgrade-center/quick-access-cards';
import FeaturedUpgrades from '@/components/upgrade-center/featured-upgrades';
import PricingWidget from '@/components/upgrade-center/pricing-widget';

function LoadingSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-64 bg-gray-800/50 rounded-lg animate-pulse"></div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function UpgradeCenterPage() {
  return (
    <div className="min-h-screen bg-background">
      <main>
        <UpgradeCenterHero />
        
        <Suspense fallback={<LoadingSkeleton />}>
          <QuickAccessCards />
        </Suspense>
        
        <Suspense fallback={<LoadingSkeleton />}>
          <FeaturedUpgrades />
        </Suspense>
        
        <Suspense fallback={<LoadingSkeleton />}>
          <PricingWidget />
        </Suspense>
        
        {/* Stats Section */}
        <section className="py-20 bg-gradient-to-b from-purple-900/20 to-background">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                <span className="text-purple-400">UPGRADE</span> İSTATİSTİKLERİ
              </h2>
              <p className="text-gray-300 text-lg max-w-2xl mx-auto">
                Venus eSports Cafe'de gerçekleştirilen upgrade'ler ve başarı oranları
              </p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
              <div className="gaming-card p-6 text-center">
                <TrendingUp className="h-8 w-8 text-green-400 mx-auto mb-3" />
                <div className="text-2xl font-bold text-white mb-1">500+</div>
                <div className="text-sm text-gray-400">Başarılı Upgrade</div>
              </div>
              
              <div className="gaming-card p-6 text-center">
                <Star className="h-8 w-8 text-yellow-400 mx-auto mb-3" />
                <div className="text-2xl font-bold text-white mb-1">98%</div>
                <div className="text-sm text-gray-400">Müşteri Memnuniyeti</div>
              </div>
              
              <div className="gaming-card p-6 text-center">
                <Zap className="h-8 w-8 text-cyan-400 mx-auto mb-3" />
                <div className="text-2xl font-bold text-white mb-1">+65%</div>
                <div className="text-sm text-gray-400">Ortalama Performans Artışı</div>
              </div>
              
              <div className="gaming-card p-6 text-center">
                <Gamepad2 className="h-8 w-8 text-purple-400 mx-auto mb-3" />
                <div className="text-2xl font-bold text-white mb-1">35</div>
                <div className="text-sm text-gray-400">Aktif Gaming PC</div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
