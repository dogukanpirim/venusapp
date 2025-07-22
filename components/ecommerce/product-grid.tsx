
'use client';

import { useState, useEffect } from 'react';
import { ShoppingCart, Star, Cpu, Monitor, HardDrive, Zap, MemoryStick, CircuitBoard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import Image from 'next/image';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';

interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  currency: string;
  sku: string;
  stock: number;
  images: string[];
  brand?: string;
  category?: string;
  categoryName?: string;
  gamingScore?: number;
  metadata?: string;
}

const categoryIcons = {
  cpu: Cpu,
  gpu: Monitor,
  ram: MemoryStick,
  storage: HardDrive,
  motherboard: CircuitBoard,
  psu: Zap,
};

const categoryNames = {
  cpu: 'İşlemci',
  gpu: 'Ekran Kartı',
  ram: 'RAM Bellek',
  storage: 'Depolama',
  motherboard: 'Anakart',
  psu: 'Güç Kaynağı',
};

export default function ProductGrid() {
  const { data: session } = useSession();
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });

  const fetchProducts = async () => {
    try {
      const params = new URLSearchParams();
      if (selectedCategory !== 'all') params.append('category', selectedCategory);
      if (searchTerm) params.append('search', searchTerm);
      if (priceRange.min) params.append('minPrice', priceRange.min);
      if (priceRange.max) params.append('maxPrice', priceRange.max);

      const response = await fetch(`/api/ecommerce/products?${params}`);
      const result = await response.json();
      
      if (result.success) {
        setProducts(result.data);
        setFilteredProducts(result.data);
      }
    } catch (error) {
      console.error('Ürünler yüklenirken hata:', error);
      toast.error('Ürünler yüklenemedi');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [selectedCategory, searchTerm, priceRange]);

  const addToCart = async (productId: string) => {
    if (!session?.user) {
      toast.error('Sepete eklemek için giriş yapmalısınız');
      return;
    }

    try {
      const response = await fetch('/api/ecommerce/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, quantity: 1 }),
      });

      const result = await response.json();
      if (result.success) {
        toast.success(result.message);
      } else {
        toast.error(result.error);
      }
    } catch (error) {
      toast.error('Ürün sepete eklenirken hata oluştu');
    }
  };

  const formatPrice = (price: number, currency: string = 'TRY') => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: currency,
    }).format(price);
  };

  const getScoreColor = (score?: number) => {
    if (!score) return 'text-gray-400';
    if (score >= 90) return 'text-green-400';
    if (score >= 75) return 'text-yellow-400';
    return 'text-orange-400';
  };

  if (loading) {
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

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Filters */}
      <div className="mb-8 space-y-4">
        <div className="flex flex-wrap gap-4">
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Kategori Seçin" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tüm Kategoriler</SelectItem>
              {Object.entries(categoryNames).map(([key, name]) => (
                <SelectItem key={key} value={key}>{name}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Input
            placeholder="Ürün ara..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-xs"
          />

          <div className="flex gap-2">
            <Input
              placeholder="Min fiyat"
              type="number"
              value={priceRange.min}
              onChange={(e) => setPriceRange(prev => ({ ...prev, min: e.target.value }))}
              className="w-24"
            />
            <Input
              placeholder="Max fiyat"
              type="number"
              value={priceRange.max}
              onChange={(e) => setPriceRange(prev => ({ ...prev, max: e.target.value }))}
              className="w-24"
            />
          </div>
        </div>
      </div>

      {/* Product Grid */}
      {filteredProducts.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-gray-400 text-lg">Henüz ürün bulunmuyor</p>
          <p className="text-gray-500 text-sm mt-2">
            Filtreleri değiştirerek tekrar deneyin
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product) => {
            const IconComponent = categoryIcons[product.category as keyof typeof categoryIcons] || Cpu;
            
            return (
              <Card key={product.id} className="gaming-card overflow-hidden hover:scale-105 transition-transform">
                <CardHeader className="p-0">
                  <div className="relative aspect-square bg-gray-200">
                    {product.images[0] ? (
                      <Image
                        src={product.images[0]}
                        alt={product.name}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                        <IconComponent className="h-16 w-16 text-gray-500" />
                      </div>
                    )}
                    
                    {product.gamingScore && (
                      <Badge 
                        className={`absolute top-2 right-2 ${getScoreColor(product.gamingScore)}`}
                      >
                        <Star className="h-3 w-3 mr-1" />
                        {product.gamingScore}
                      </Badge>
                    )}
                    
                    <Badge variant="secondary" className="absolute top-2 left-2">
                      {categoryNames[product.category as keyof typeof categoryNames] || 'Ürün'}
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div>
                      <h3 className="font-semibold text-white text-sm leading-5 mb-1">
                        {product.name}
                      </h3>
                      {product.brand && (
                        <p className="text-gray-400 text-xs">{product.brand}</p>
                      )}
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold text-purple-400">
                        {formatPrice(product.price)}
                      </span>
                      <Badge variant={product.stock > 0 ? "default" : "destructive"}>
                        {product.stock > 0 ? `${product.stock} adet` : 'Stokta yok'}
                      </Badge>
                    </div>
                    
                    <Button 
                      className="w-full bg-purple-600 hover:bg-purple-700"
                      onClick={() => addToCart(product.id)}
                      disabled={product.stock === 0 || !session?.user}
                    >
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      {!session?.user ? 'Giriş Yapın' : product.stock === 0 ? 'Stokta Yok' : 'Sepete Ekle'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
