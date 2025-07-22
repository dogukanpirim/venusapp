
import { Suspense } from 'react';
import { ShoppingBag, Truck, Shield, Headphones } from 'lucide-react';
import ProductGrid from '@/components/ecommerce/product-grid';

function LoadingSkeleton() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="h-80 bg-gray-800/50 rounded-lg animate-pulse"></div>
        ))}
      </div>
    </div>
  );
}

export default function EcommercePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative py-20 bg-gradient-to-br from-purple-900/30 via-background to-cyan-900/20">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
              <span className="text-purple-400">VENUS</span> HARDWARE STORE
            </h1>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Gaming performansınızı üst seviyeye taşıyacak profesyonel donanım çözümleri. 
              Kurulum ve garanti dahil!
            </p>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
              <div className="gaming-card p-4 text-center">
                <Truck className="h-8 w-8 text-green-400 mx-auto mb-2" />
                <p className="text-sm text-white font-medium">Ücretsiz Kurulum</p>
              </div>
              
              <div className="gaming-card p-4 text-center">
                <Shield className="h-8 w-8 text-blue-400 mx-auto mb-2" />
                <p className="text-sm text-white font-medium">2 Yıl Garanti</p>
              </div>
              
              <div className="gaming-card p-4 text-center">
                <Headphones className="h-8 w-8 text-purple-400 mx-auto mb-2" />
                <p className="text-sm text-white font-medium">7/24 Destek</p>
              </div>
              
              <div className="gaming-card p-4 text-center">
                <ShoppingBag className="h-8 w-8 text-cyan-400 mx-auto mb-2" />
                <p className="text-sm text-white font-medium">Hızlı Teslimat</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Products Section */}
      <section className="py-12">
        <div className="container mx-auto px-4 mb-8">
          <h2 className="text-3xl font-bold text-white text-center mb-4">
            GAMING DONANIM MAĞAZASI
          </h2>
          <p className="text-gray-400 text-center max-w-2xl mx-auto">
            Venus eSports Cafe kalitesiyle donatılmış gaming hardware'ler. 
            Profesyonel kurulum ve performans testleri dahil.
          </p>
        </div>
        
        <Suspense fallback={<LoadingSkeleton />}>
          <ProductGrid />
        </Suspense>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gradient-to-b from-background to-purple-900/10">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">
              NEDEN <span className="text-purple-400">VENUS</span> HARDWARE?
            </h2>
            <p className="text-gray-300 max-w-2xl mx-auto">
              Gaming deneyiminde uzman ekibimiz ve kaliteli hizmet anlayışımızla 
              size en iyi alışveriş deneyimini sunuyoruz.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <div className="gaming-card p-6 text-center">
              <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Kalite Garantisi</h3>
              <p className="text-gray-400">
                Tüm ürünler orijinal ve garantili. 2 yıl tam garanti kapsamında.
              </p>
            </div>
            
            <div className="gaming-card p-6 text-center">
              <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Truck className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Profesyonel Kurulum</h3>
              <p className="text-gray-400">
                Uzman teknisyen ekibimiz tarafından profesyonel kurulum ve test.
              </p>
            </div>
            
            <div className="gaming-card p-6 text-center">
              <div className="w-16 h-16 bg-cyan-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Headphones className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Sürekli Destek</h3>
              <p className="text-gray-400">
                Satış sonrası 7/24 teknik destek ve bakım hizmetleri.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
