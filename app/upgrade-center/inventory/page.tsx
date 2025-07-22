
'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, ShoppingCart, Star, TrendingUp, Package, Cpu, Monitor, MemoryStick, HardDrive, Zap } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import Link from 'next/link';
import Image from 'next/image';

interface HardwareItem {
  id: string;
  name: string;
  brand: string;
  price: number;
  stock: number;
  gaming_score: number;
  image?: string;
  [key: string]: any;
}

interface HardwareInventory {
  [category: string]: HardwareItem[];
}

const categoryIcons = {
  cpu: Cpu,
  gpu: Monitor,
  ram: MemoryStick,
  storage: HardDrive,
  motherboard: Package,
  psu: Zap
};

const categoryNames = {
  cpu: 'İşlemci (CPU)',
  gpu: 'Ekran Kartı (GPU)',
  ram: 'Bellek (RAM)',
  storage: 'Depolama (SSD/HDD)',
  motherboard: 'Anakart',
  psu: 'Güç Kaynağı (PSU)'
};

export default function HardwareInventoryPage() {
  const [inventory, setInventory] = useState<HardwareInventory>({});
  const [filteredData, setFilteredData] = useState<HardwareInventory>({});
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedBrand, setSelectedBrand] = useState<string>('all');
  const [priceRange, setPriceRange] = useState<number[]>([0, 100000]);
  const [sortBy, setSortBy] = useState<string>('price');
  const [sortOrder, setSortOrder] = useState<string>('asc');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchInventory();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [inventory, selectedCategory, searchQuery, selectedBrand, priceRange, sortBy, sortOrder]);

  const fetchInventory = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/upgrade/hardware');
      const result = await response.json();
      
      if (result.success && result.data && typeof result.data === 'object') {
        // API now returns the full categorized structure
        const safeInventory: HardwareInventory = {};
        
        // Ensure all categories have arrays
        Object.keys(result.data).forEach(category => {
          const items = result.data[category];
          safeInventory[category] = Array.isArray(items) ? items : [];
        });
        
        setInventory(safeInventory);
        
        // Set initial price range based on data
        const allItems = Object.values(safeInventory).flat();
        if (allItems.length > 0) {
          const maxPrice = Math.max(...allItems.map(item => item?.price || 0));
          setPriceRange([0, maxPrice]);
        }
      } else {
        // Fallback to empty inventory
        setInventory({});
      }
    } catch (error) {
      console.error('Error fetching inventory:', error);
      setInventory({});
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered: HardwareInventory = {};

    // Category filter
    if (selectedCategory === 'all') {
      filtered = { ...inventory };
    } else {
      filtered = { [selectedCategory]: inventory?.[selectedCategory] || [] };
    }

    // Apply other filters to each category
    Object.keys(filtered).forEach(category => {
      let items = filtered[category] || [];

      // Search filter
      if (searchQuery) {
        items = items.filter(item =>
          item?.name?.toLowerCase()?.includes(searchQuery.toLowerCase()) ||
          item?.brand?.toLowerCase()?.includes(searchQuery.toLowerCase())
        );
      }

      // Brand filter
      if (selectedBrand !== 'all') {
        items = items.filter(item =>
          item?.brand?.toLowerCase() === selectedBrand.toLowerCase()
        );
      }

      // Price range filter
      items = items.filter(item =>
        item?.price >= priceRange[0] && item?.price <= priceRange[1]
      );

      // Sorting
      items.sort((a, b) => {
        let aVal = a?.[sortBy];
        let bVal = b?.[sortBy];

        if (typeof aVal === 'string') aVal = aVal.toLowerCase();
        if (typeof bVal === 'string') bVal = bVal.toLowerCase();

        if (sortOrder === 'desc') {
          return aVal < bVal ? 1 : -1;
        }
        return aVal > bVal ? 1 : -1;
      });

      filtered[category] = items;
    });

    setFilteredData(filtered);
  };

  const getAllBrands = () => {
    const brands = new Set<string>();
    
    // Add safety checks for inventory data
    const safeInventory = inventory && typeof inventory === 'object' ? inventory : {};
    
    try {
      const allItems = Object.values(safeInventory)
        .filter(items => Array.isArray(items)) // Ensure each value is an array
        .flat()
        .filter(item => item && typeof item === 'object'); // Ensure each item is a valid object
      
      allItems.forEach(item => {
        if (item?.brand && typeof item.brand === 'string') {
          brands.add(item.brand);
        }
      });
      
      // Add safety check for Set.prototype and Array.from
      if (!brands || typeof brands[Symbol.iterator] !== 'function') {
        return [];
      }
      
      return Array.from(brands);
    } catch (error) {
      console.error('Error getting brands:', error);
      return [];
    }
  };

  const getStockStatus = (stock: number) => {
    if (stock === 0) return { text: 'Stokta Yok', color: 'bg-red-500' };
    if (stock <= 5) return { text: 'Az Stok', color: 'bg-yellow-500' };
    return { text: 'Stokta', color: 'bg-green-500' };
  };

  const getPerformanceColor = (score: number) => {
    if (score >= 90) return 'text-green-400';
    if (score >= 70) return 'text-yellow-400';
    return 'text-red-400';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400 mx-auto mb-4"></div>
          <p className="text-gray-300">Hardware envanteri yükleniyor...</p>
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
            <span className="text-blue-400">HARDWARE</span> ENVANTERİ
          </h1>
          <p className="text-gray-300 text-lg max-w-2xl mx-auto">
            Güncel donanım listesi, fiyatlar ve stok durumu
          </p>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mb-8"
        >
          <Card className="gaming-card border-blue-400/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Filter className="h-5 w-5 mr-2 text-blue-400" />
                Filtreler ve Arama
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                {/* Search */}
                <div className="space-y-2">
                  <label className="text-sm text-gray-400">Arama</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Ürün veya marka ara..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                {/* Category */}
                <div className="space-y-2">
                  <label className="text-sm text-gray-400">Kategori</label>
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tüm Kategoriler</SelectItem>
                      {Object.keys(inventory).map(category => (
                        <SelectItem key={category} value={category}>
                          {categoryNames[category as keyof typeof categoryNames]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Brand */}
                <div className="space-y-2">
                  <label className="text-sm text-gray-400">Marka</label>
                  <Select value={selectedBrand} onValueChange={setSelectedBrand}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tüm Markalar</SelectItem>
                      {getAllBrands().map(brand => (
                        <SelectItem key={brand} value={brand.toLowerCase()}>
                          {brand}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Sort */}
                <div className="space-y-2">
                  <label className="text-sm text-gray-400">Sıralama</label>
                  <Select value={`${sortBy}_${sortOrder}`} onValueChange={(value) => {
                    const [sort, order] = value.split('_');
                    setSortBy(sort);
                    setSortOrder(order);
                  }}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="price_asc">Fiyat (Düşük → Yüksek)</SelectItem>
                      <SelectItem value="price_desc">Fiyat (Yüksek → Düşük)</SelectItem>
                      <SelectItem value="gaming_score_desc">Gaming Skoru (Yüksek → Düşük)</SelectItem>
                      <SelectItem value="name_asc">İsim (A → Z)</SelectItem>
                      <SelectItem value="brand_asc">Marka (A → Z)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Price Range */}
              <div className="space-y-2">
                <label className="text-sm text-gray-400">
                  Fiyat Aralığı: ₺{(priceRange?.[0] || 0).toLocaleString('tr-TR')} - ₺{(priceRange?.[1] || 100000).toLocaleString('tr-TR')}
                </label>
                <Slider
                  value={priceRange || [0, 100000]}
                  onValueChange={(value) => setPriceRange(value || [0, 100000])}
                  max={100000}
                  min={0}
                  step={500}
                  className="w-full"
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Inventory Grid */}
        <div className="space-y-8">
          {Object.entries(filteredData || {}).map(([category, items], categoryIndex) => {
            if (!items || items.length === 0) return null;

            const CategoryIcon = categoryIcons[category as keyof typeof categoryIcons];
            
            return (
              <motion.div
                key={category}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.3 + categoryIndex * 0.1 }}
              >
                <div className="flex items-center mb-6">
                  <CategoryIcon className="h-6 w-6 mr-3 text-blue-400" />
                  <h2 className="text-2xl font-bold text-white">
                    {categoryNames[category as keyof typeof categoryNames]}
                  </h2>
                  <Badge variant="outline" className="ml-3 border-blue-400/50 text-blue-400">
                    {items.length} ürün
                  </Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {items?.map((item, itemIndex) => {
                    if (!item) return null;
                    const stockStatus = getStockStatus(item?.stock || 0);
                    
                    return (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: itemIndex * 0.05 }}
                      >
                        <Card className="gaming-card border-blue-400/20 hover:border-blue-400/40 hover:scale-105 transition-all duration-300 h-full">
                          <CardContent className="p-6">
                            {/* Product Image */}
                            {item.image && (
                              <div className="relative w-full aspect-square mb-4 bg-gray-800/50 rounded-lg overflow-hidden">
                                <Image
                                  src={item.image}
                                  alt={item.name}
                                  fill
                                  className="object-contain hover:scale-105 transition-transform duration-300"
                                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                  onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    target.style.display = 'none';
                                  }}
                                />
                              </div>
                            )}
                            
                            {/* Header */}
                            <div className="flex items-start justify-between mb-4">
                              <div className="flex-1">
                                <h3 className="text-lg font-bold text-white mb-1 line-clamp-2">
                                  {item.name}
                                </h3>
                                <Badge variant="outline" className="text-blue-400 border-blue-400/50">
                                  {item.brand}
                                </Badge>
                              </div>
                              <div className="text-right">
                                <div className="text-2xl font-bold text-white">
                                  ₺{item.price.toLocaleString('tr-TR')}
                                </div>
                              </div>
                            </div>

                            {/* Performance Score */}
                            <div className="flex items-center justify-between mb-4 p-3 rounded-lg bg-blue-900/20 border border-blue-400/20">
                              <span className="text-gray-400">Gaming Skoru:</span>
                              <div className="flex items-center space-x-2">
                                <Star className="h-4 w-4 text-yellow-400" />
                                <span className={`font-bold ${getPerformanceColor(item.gaming_score)}`}>
                                  {item.gaming_score}/100
                                </span>
                              </div>
                            </div>

                            {/* Specifications */}
                            <div className="space-y-2 mb-4">
                              {category === 'cpu' && (
                                <>
                                  <div className="flex justify-between text-sm">
                                    <span className="text-gray-400">Çekirdek/Thread:</span>
                                    <span className="text-white">{item.cores}/{item.threads}</span>
                                  </div>
                                  <div className="flex justify-between text-sm">
                                    <span className="text-gray-400">Base/Boost Clock:</span>
                                    <span className="text-white">{item.baseClock}/{item.boostClock} GHz</span>
                                  </div>
                                </>
                              )}
                              
                              {category === 'gpu' && (
                                <>
                                  <div className="flex justify-between text-sm">
                                    <span className="text-gray-400">VRAM:</span>
                                    <span className="text-white">{item.memory}GB {item.memory_type}</span>
                                  </div>
                                  <div className="flex justify-between text-sm">
                                    <span className="text-gray-400">TDP:</span>
                                    <span className="text-white">{item.power_consumption}W</span>
                                  </div>
                                </>
                              )}
                              
                              {category === 'ram' && (
                                <>
                                  <div className="flex justify-between text-sm">
                                    <span className="text-gray-400">Kapasite:</span>
                                    <span className="text-white">{item.capacity}GB {item.type}</span>
                                  </div>
                                  <div className="flex justify-between text-sm">
                                    <span className="text-gray-400">Hız:</span>
                                    <span className="text-white">{item.speed} MHz</span>
                                  </div>
                                </>
                              )}
                            </div>

                            {/* Stock Status */}
                            <div className="flex items-center justify-between mb-4">
                              <div className="flex items-center space-x-2">
                                <div className={`w-2 h-2 rounded-full ${stockStatus.color}`}></div>
                                <span className="text-sm text-gray-400">{stockStatus.text}</span>
                              </div>
                              <span className="text-sm text-white font-medium">
                                {item.stock} adet
                              </span>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-2">
                              <Button 
                                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                                disabled={item.stock === 0}
                              >
                                <ShoppingCart className="h-4 w-4 mr-2" />
                                Sepete Ekle
                              </Button>
                              <Link href={`/upgrade-center/simulator?component=${category}&id=${item.id}`}>
                                <Button variant="outline" className="border-blue-400 text-blue-400 hover:bg-blue-400 hover:text-black">
                                  <TrendingUp className="h-4 w-4" />
                                </Button>
                              </Link>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Empty State */}
        {Object.values(filteredData || {}).every(items => !items || items.length === 0) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center py-12"
          >
            <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">Ürün bulunamadı</h3>
            <p className="text-gray-400 mb-6">
              Arama kriterlerinizi değiştirerek tekrar deneyin
            </p>
            <Button onClick={() => {
              setSearchQuery('');
              setSelectedCategory('all');
              setSelectedBrand('all');
              setPriceRange([0, 100000]);
            }}>
              Filtreleri Temizle
            </Button>
          </motion.div>
        )}

        {/* Action Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="mt-12 text-center"
        >
          <Card className="gaming-card border-blue-400/30 bg-gradient-to-r from-blue-900/20 to-purple-900/20 p-8">
            <h3 className="text-2xl font-bold text-white mb-4">
              Özel Build Hazırlatalım mı?
            </h3>
            <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
              İhtiyaçlarınıza uygun donanım seçimi konusunda size yardımcı olalım. 
              Gaming performansınızı optimize edecek en uygun bileşenleri önererek budget'ınıza uygun çözümler sunarız.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/upgrade-center/recommendations">
                <Button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3">
                  Gaming Önerileri Al
                </Button>
              </Link>
              <Link href="/upgrade-center/calculator">
                <Button variant="outline" className="border-blue-400 text-blue-400 hover:bg-blue-400 hover:text-black px-8 py-3">
                  Özel Build Hesapla
                </Button>
              </Link>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
