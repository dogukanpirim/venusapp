
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle, Package, Truck, Phone, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function OrderSuccessPage() {
  const router = useRouter();

  useEffect(() => {
    // Auto redirect after 30 seconds
    const timer = setTimeout(() => {
      router.push('/ecommerce');
    }, 30000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Success Message */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="h-12 w-12 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-4">
              Siparişiniz Başarıyla Alındı!
            </h1>
            <p className="text-gray-300 text-lg">
              Teşekkür ederiz! Siparişiniz işleme alınmıştır ve en kısa sürede sizinle iletişime geçeceğiz.
            </p>
          </div>

          {/* Order Status */}
          <Card className="gaming-card mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Package className="h-5 w-5" />
                Sipariş Durumu
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                    <CheckCircle className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <p className="text-white font-medium">Sipariş Alındı</p>
                    <p className="text-gray-400 text-sm">Siparişiniz başarıyla kaydedildi</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-yellow-600 rounded-full flex items-center justify-center">
                    <Phone className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <p className="text-white font-medium">İletişim</p>
                    <p className="text-gray-400 text-sm">24 saat içinde sizinle iletişime geçeceğiz</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center">
                    <Truck className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <p className="text-white font-medium">Kurulum & Teslimat</p>
                    <p className="text-gray-400 text-sm">Profesyonel kurulum hizmeti ile</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Next Steps */}
          <Card className="gaming-card mb-8">
            <CardHeader>
              <CardTitle className="text-white">Sonraki Adımlar</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center text-white text-sm font-bold mt-0.5">
                    1
                  </div>
                  <div>
                    <p className="text-white font-medium">Ödeme & Onay</p>
                    <p className="text-gray-400 text-sm">
                      Sizinle iletişime geçerek ödeme detaylarını ve kurulum tarihini belirleyeceğiz.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center text-white text-sm font-bold mt-0.5">
                    2
                  </div>
                  <div>
                    <p className="text-white font-medium">Profesyonel Kurulum</p>
                    <p className="text-gray-400 text-sm">
                      Uzman teknisyen ekibimiz ürünlerinizi profesyonelce kuracak ve test edecek.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center text-white text-sm font-bold mt-0.5">
                    3
                  </div>
                  <div>
                    <p className="text-white font-medium">Performans Testi</p>
                    <p className="text-gray-400 text-sm">
                      Sisteminizi test ederek optimal performans sağlanmasını garantileyeceğiz.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contact Info */}
          <Card className="gaming-card mb-8">
            <CardHeader>
              <CardTitle className="text-white">İletişim Bilgileri</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center space-y-2">
                <p className="text-gray-300">
                  Herhangi bir sorunuz için bizimle iletişime geçebilirsiniz:
                </p>
                <p className="text-purple-400 font-semibold">
                  📞 Venus eSports Cafe
                </p>
                <p className="text-gray-400 text-sm">
                  Profesyonel gaming hardware çözümleri
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Button 
              onClick={() => router.push('/ecommerce')}
              className="flex-1 bg-purple-600 hover:bg-purple-700"
            >
              <Package className="h-4 w-4 mr-2" />
              Alışverişe Devam Et
            </Button>
            <Button 
              onClick={() => router.push('/')}
              variant="outline"
              className="flex-1"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Ana Sayfaya Dön
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
