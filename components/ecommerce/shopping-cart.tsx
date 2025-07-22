
'use client';

import { useState, useEffect } from 'react';
import { ShoppingCart as ShoppingCartIcon, Plus, Minus, Trash2, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import Image from 'next/image';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';

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

export default function ShoppingCart() {
  const { data: session } = useSession();
  const [cartData, setCartData] = useState<CartData>({ items: [], total: 0, itemCount: 0 });
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const fetchCart = async () => {
    if (!session?.user) return;
    
    try {
      const response = await fetch('/api/ecommerce/cart');
      const result = await response.json();
      
      if (result.success) {
        setCartData(result.data);
      }
    } catch (error) {
      console.error('Sepet yüklenirken hata:', error);
    }
  };

  useEffect(() => {
    fetchCart();
  }, [session]);

  const updateQuantity = async (cartItemId: string, newQuantity: number) => {
    setLoading(true);
    try {
      const response = await fetch('/api/ecommerce/cart', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cartItemId, quantity: newQuantity }),
      });

      const result = await response.json();
      if (result.success) {
        await fetchCart();
        toast.success(result.message);
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      toast.error('Sepet güncellenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const removeItem = async (cartItemId: string) => {
    await updateQuantity(cartItemId, 0);
  };

  const clearCart = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/ecommerce/cart', {
        method: 'DELETE',
      });

      const result = await response.json();
      if (result.success) {
        setCartData({ items: [], total: 0, itemCount: 0 });
        toast.success(result.message);
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      toast.error('Sepet temizlenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number, currency: string = 'TRY') => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: currency,
    }).format(price);
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="relative">
          <ShoppingCartIcon className="h-4 w-4" />
          {cartData.itemCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {cartData.itemCount}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      
      <SheetContent className="w-full sm:max-w-lg">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <ShoppingCartIcon className="h-5 w-5" />
            Sepetim ({cartData.itemCount} ürün)
          </SheetTitle>
        </SheetHeader>

        <div className="flex flex-col h-full">
          <div className="flex-1 overflow-auto py-4">
            {cartData.items.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <Package className="h-16 w-16 text-gray-400 mb-4" />
                <p className="text-gray-500 mb-2">Sepetiniz boş</p>
                <p className="text-sm text-gray-400">
                  Upgrade Center'dan ürün ekleyerek başlayın
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {cartData.items.map((item) => (
                  <Card key={item.id} className="overflow-hidden">
                    <CardContent className="p-4">
                      <div className="flex gap-3">
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
                            <div className="w-full h-full bg-gray-300 flex items-center justify-center">
                              <Package className="h-6 w-6 text-gray-500" />
                            </div>
                          )}
                        </div>
                        
                        <div className="flex-1">
                          <h4 className="font-medium text-sm leading-5 mb-2">
                            {item.product.name}
                          </h4>
                          <p className="text-purple-400 font-semibold text-sm mb-2">
                            {formatPrice(item.product.price)}
                          </p>
                          
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1">
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-8 w-8 p-0"
                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                disabled={loading}
                              >
                                <Minus className="h-3 w-3" />
                              </Button>
                              <span className="px-2 py-1 text-sm font-medium">
                                {item.quantity}
                              </span>
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-8 w-8 p-0"
                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                disabled={loading || item.quantity >= item.product.stock}
                              >
                                <Plus className="h-3 w-3" />
                              </Button>
                            </div>
                            
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                              onClick={() => removeItem(item.id)}
                              disabled={loading}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {cartData.items.length > 0 && (
            <div className="border-t pt-4 space-y-4">
              <div className="flex justify-between items-center">
                <span className="font-semibold">Toplam:</span>
                <span className="text-xl font-bold text-purple-400">
                  {formatPrice(cartData.total)}
                </span>
              </div>
              
              <div className="space-y-2">
                <Button 
                  className="w-full bg-purple-600 hover:bg-purple-700"
                  onClick={() => {
                    setIsOpen(false);
                    window.location.href = '/ecommerce/checkout';
                  }}
                >
                  Siparişi Tamamla
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={clearCart}
                  disabled={loading}
                >
                  Sepeti Temizle
                </Button>
              </div>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
