
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { 
  CreditCard, 
  MapPin, 
  User, 
  Phone, 
  Mail, 
  Package, 
  ArrowLeft,
  CheckCircle,
  Truck 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import Image from 'next/image';

interface CartItem {
  id: string;
  quantity: number;
  product: {
    id: string;
    name: string;
    price: number;
    currency: string;
    sku: string;
    images: string[];
    stock: number;
  };
}

interface CartData {
  items: CartItem[];
  total: number;
  itemCount: number;
}

export default function CheckoutPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [cartData, setCartData] = useState<CartData>({ items: [], total: 0, itemCount: 0 });
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [formData, setFormData] = useState({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    shippingAddress: '',
    notes: ''
  });

  useEffect(() => {
    if (!session?.user) {
      router.push('/auth/signin');
      return;
    }
    
    fetchCart();
  }, [session, router]);

  const fetchCart = async () => {
    try {
      const response = await fetch('/api/ecommerce/cart');
      const result = await response.json();
      
      if (result.success) {
        setCartData(result.data);
        // Pre-fill form with user data
        setFormData(prev => ({
          ...prev,
          customerName: session?.user?.name || '',
          customerEmail: session?.user?.email || '',
        }));
      }
    } catch (error) {
      console.error('Sepet yüklenirken hata:', error);
      toast.error('Sepet bilgileri alınamadı');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const processOrder = async () => {
    if (!formData.customerName || !formData.customerEmail || !formData.customerPhone) {
      toast.error('Lütfen tüm zorunlu alanları doldurun');
      return;
    }

    setIsProcessing(true);
    try {
      // In a real implementation, this would create an order in the database
      // and potentially process payment, then redirect to success page
      
      // Simulate order processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Clear cart after successful order
      await fetch('/api/ecommerce/cart', { method: 'DELETE' });
      
      toast.success('Siparişiniz başarıyla alındı!');
      router.push('/ecommerce/order-success');
      
    } catch (error) {
      toast.error('Sipariş işlenirken hata oluştu');
    } finally {
      setIsProcessing(false);
    }
  };

  const formatPrice = (price: number, currency: string = 'TRY') => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: currency,
    }).format(price);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (cartData.items.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-16">
            <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">Sepetiniz Boş</h2>
            <p className="text-gray-400 mb-6">Sipariş vermek için önce ürün eklemelisiniz</p>
            <Button onClick={() => router.push('/ecommerce')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Alışverişe Devam Et
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <Button variant="ghost" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Geri Dön
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Order Form */}
          <div className="space-y-6">
            <Card className="gaming-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <User className="h-5 w-5" />
                  Müşteri Bilgileri
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="customerName">Ad Soyad *</Label>
                  <Input
                    id="customerName"
                    name="customerName"
                    value={formData.customerName}
                    onChange={handleInputChange}
                    placeholder="Adınız ve soyadınız"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="customerEmail">E-posta *</Label>
                  <Input
                    id="customerEmail"
                    name="customerEmail"
                    type="email"
                    value={formData.customerEmail}
                    onChange={handleInputChange}
                    placeholder="email@example.com"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="customerPhone">Telefon *</Label>
                  <Input
                    id="customerPhone"
                    name="customerPhone"
                    type="tel"
                    value={formData.customerPhone}
                    onChange={handleInputChange}
                    placeholder="05XX XXX XX XX"
                    required
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="gaming-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <MapPin className="h-5 w-5" />
                  Teslimat Bilgileri
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="shippingAddress">Adres</Label>
                  <Textarea
                    id="shippingAddress"
                    name="shippingAddress"
                    value={formData.shippingAddress}
                    onChange={handleInputChange}
                    placeholder="Kurulum için adres bilgisi (Venus eSports'ta kurulum da yapılabilir)"
                    rows={3}
                  />
                </div>
                
                <div>
                  <Label htmlFor="notes">Özel Notlar</Label>
                  <Textarea
                    id="notes"
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    placeholder="Sipariş için özel talepleriniz..."
                    rows={2}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Order Features */}
            <Card className="gaming-card">
              <CardHeader>
                <CardTitle className="text-white">Sipariş Avantajları</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-400" />
                    <span className="text-gray-300">Ücretsiz profesyonel kurulum</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-400" />
                    <span className="text-gray-300">2 yıl garantili ürünler</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-400" />
                    <span className="text-gray-300">7/24 teknik destek</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Truck className="h-5 w-5 text-blue-400" />
                    <span className="text-gray-300">Hızlı teslimat</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div className="space-y-6">
            <Card className="gaming-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <Package className="h-5 w-5" />
                  Sipariş Özeti
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {cartData.items.map((item) => (
                  <div key={item.id} className="flex gap-3 p-3 bg-gray-800/50 rounded">
                    <div className="relative w-16 h-16 bg-gray-200 rounded overflow-hidden">
                      {item.product.images[0] ? (
                        <Image
                          src={item.product.images[0]}
                          alt={item.product.name}
                          fill
                          className="object-cover"
                          sizes="64px"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-700 flex items-center justify-center">
                          <Package className="h-6 w-6 text-gray-500" />
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1">
                      <h4 className="font-medium text-white text-sm mb-1">
                        {item.product.name}
                      </h4>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400 text-sm">
                          {item.quantity} adet
                        </span>
                        <span className="text-purple-400 font-semibold">
                          {formatPrice(item.product.price * item.quantity)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
                
                <div className="border-t border-gray-700 pt-4">
                  <div className="flex justify-between items-center text-lg font-bold">
                    <span className="text-white">Toplam:</span>
                    <span className="text-purple-400">{formatPrice(cartData.total)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Payment Info */}
            <Card className="gaming-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <CreditCard className="h-5 w-5" />
                  Ödeme Bilgisi
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-blue-900/20 border border-blue-500 rounded-lg p-4">
                  <p className="text-blue-300 text-sm">
                    🔒 Ödeme Venus eSports Cafe'de nakit veya kart ile yapılabilir. 
                    Sipariş onaylandıktan sonra sizinle iletişime geçilecektir.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Button 
              onClick={processOrder}
              disabled={isProcessing}
              className="w-full h-12 bg-purple-600 hover:bg-purple-700 text-lg"
            >
              {isProcessing ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  İşleniyor...
                </>
              ) : (
                <>
                  <CheckCircle className="h-5 w-5 mr-2" />
                  Siparişi Onayla
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
