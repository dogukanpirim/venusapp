'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Computer, 
  ArrowRight, 
  CheckCircle, 
  AlertTriangle, 
  TrendingUp, 
  DollarSign,
  Zap,
  Settings
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SearchableSelect } from '@/components/ui/searchable-select';

interface SystemComponent {
  id: string;
  name: string;
  price: number;
  socket?: string;
  type?: string;
  power_consumption?: number;
  recommended_psu?: number;
  gaming_score?: number;
  [key: string]: any;
}

interface ComponentCategory {
  [key: string]: SystemComponent[];
}

interface CurrentSystem {
  cpu: string;
  gpu: string;
  ram: string;
  motherboard: string;
  storage: string;
  psu: string;
}

interface CompatibilityResult {
  compatibility: Array<{
    component: string;
    compatible: boolean;
    warnings: string[];
    requiresMotherboardChange: boolean;
  }>;
  tradeInValues: Array<{
    component: string;
    currentItem: string;
    tradeInValue: number;
    newItem: string;
    newPrice: number;
    netCost: number;
  }>;
  summary: {
    totalTradeInValue: number;
    totalUpgradeCost: number;
    netCost: number;
    requiresMotherboardChange: boolean;
    powerSufficient: boolean;
    warnings: string[];
  };
}

export default function UpgradeSimulatorPage() {
  const [mounted, setMounted] = useState(false);
  const [components, setComponents] = useState<ComponentCategory>({
    cpu: [],
    gpu: [],
    ram: [],
    motherboard: [],
    storage: [],
    psu: []
  });
  const [currentSystem, setCurrentSystem] = useState<CurrentSystem>({
    cpu: '',
    gpu: '',
    ram: '',
    motherboard: '',
    storage: '',
    psu: ''
  });
  const [upgradeComponents, setUpgradeComponents] = useState<{[key: string]: SystemComponent | null}>({
    cpu: null,
    gpu: null,
    ram: null,
    motherboard: null,
    storage: null,
    psu: null
  });
  const [compatibilityResult, setCompatibilityResult] = useState<CompatibilityResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);

  useEffect(() => {
    setMounted(true);
    fetchComponents();
  }, []);

  const fetchComponents = async () => {
    try {
      const response = await fetch('/api/upgrade/hardware');
      const result = await response.json();
      
      if (result.success && result.data && typeof result.data === 'object') {
        const safeComponents: ComponentCategory = {};
        
        // Ensure all categories exist with at least empty arrays
        const requiredCategories = ['cpu', 'gpu', 'ram', 'motherboard', 'storage', 'psu'];
        
        requiredCategories.forEach(category => {
          safeComponents[category] = [];
        });
        
        // Populate with actual data if available
        Object.keys(result.data).forEach(category => {
          if (Array.isArray(result.data[category])) {
            safeComponents[category] = result.data[category];
          }
        });
        
        setComponents(safeComponents);
      } else {
        // Set empty arrays for all categories if API fails
        setComponents({
          cpu: [],
          gpu: [],
          ram: [],
          motherboard: [],
          storage: [],
          psu: []
        });
      }
    } catch (error) {
      console.error('Error fetching components:', error);
      // Set empty arrays for all categories if fetch fails
      setComponents({
        cpu: [],
        gpu: [],
        ram: [],
        motherboard: [],
        storage: [],
        psu: []
      });
    }
  };

  const handleCurrentSystemChange = (component: string, value: string) => {
    setCurrentSystem(prev => ({
      ...prev,
      [component]: value
    }));
  };

  const handleUpgradeComponentChange = (category: string, componentId: string) => {
    const component = components[category]?.find(c => c.id === componentId);
    setUpgradeComponents(prev => ({
      ...prev,
      [category]: component || null
    }));
  };

  const checkCompatibility = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/upgrade/compatibility', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentSystem,
          upgradeComponents: Object.fromEntries(
            Object.entries(upgradeComponents).filter(([_, component]) => component !== null)
          )
        })
      });
      const result = await response.json();
      if (result.success) {
        setCompatibilityResult(result.data);
        setStep(3);
      }
    } catch (error) {
      console.error('Error checking compatibility:', error);
    } finally {
      setLoading(false);
    }
  };

  // Helper function to convert components to searchable select options
  const getComponentOptions = (category: string) => {
    const categoryComponents = components[category];
    
    // Ensure we have a valid array
    if (!Array.isArray(categoryComponents)) {
      return [];
    }
    
    return categoryComponents.map(component => {
      // Add safety checks for component properties
      if (!component || typeof component !== 'object') {
        return {
          value: '',
          label: 'Invalid component',
          brand: '',
          price: 0,
          searchTerms: []
        };
      }
      
      return {
        value: component.id || '',
        label: component.name || 'Unknown',
        brand: component.brand || '',
        price: component.price || 0,
        searchTerms: [
          component.name || '',
          component.brand || '',
          category,
          component.socket || '',
          component.type || ''
        ].filter(Boolean)
      };
    }).filter(option => option.value !== ''); // Remove invalid entries
  };

  const isCurrentSystemComplete = Object.values(currentSystem ?? {}).every(value => 
    value && typeof value === 'string' && value.trim() !== ''
  );
  const hasUpgradeSelections = Object.values(upgradeComponents ?? {}).some(component => 
    component !== null && component !== undefined
  );

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        {mounted ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-8"
          >
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              <span className="text-green-400">UPGRADE</span> SİMÜLATÖRÜ
            </h1>
            <p className="text-gray-300 text-lg max-w-2xl mx-auto">
              Mevcut sisteminizi girin, uyumlu upgrade seçenekleri görün ve trade-in değerlerini keşfedin
            </p>
          </motion.div>
        ) : (
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              <span className="text-green-400">UPGRADE</span> SİMÜLATÖRÜ
            </h1>
            <p className="text-gray-300 text-lg max-w-2xl mx-auto">
              Mevcut sisteminizi girin, uyumlu upgrade seçenekleri görün ve trade-in değerlerini keşfedin
            </p>
          </div>
        )}

        {/* Progress Steps */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center space-x-4">
            {[1, 2, 3].map((stepNumber) => (
              <div key={stepNumber} className="flex items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 
                  ${step >= stepNumber 
                    ? 'bg-green-600 border-green-600 text-white' 
                    : 'border-gray-600 text-gray-400'
                  }`}
                >
                  {stepNumber}
                </div>
                {stepNumber < 3 && (
                  <div className={`w-12 h-0.5 ${step > stepNumber ? 'bg-green-600' : 'bg-gray-600'}`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step 1: Current System Input */}
        {step === 1 && (
          mounted ? (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <Card className="gaming-card border-blue-400/20">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <Computer className="h-5 w-5 mr-2 text-blue-400" />
                    Mevcut Sisteminizi Girin
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      { key: 'cpu', label: 'İşlemci (CPU)', placeholder: 'CPU seçin...', searchPlaceholder: 'Intel, AMD ara...' },
                      { key: 'gpu', label: 'Ekran Kartı (GPU)', placeholder: 'GPU seçin...', searchPlaceholder: 'NVIDIA, AMD ara...' },
                      { key: 'ram', label: 'RAM', placeholder: 'RAM seçin...', searchPlaceholder: 'DDR4, DDR5 ara...' },
                      { key: 'motherboard', label: 'Anakart', placeholder: 'Anakart seçin...', searchPlaceholder: 'ASUS, MSI ara...' },
                      { key: 'storage', label: 'Depolama', placeholder: 'Depolama seçin...', searchPlaceholder: 'SSD, NVMe ara...' },
                      { key: 'psu', label: 'Güç Kaynağı (PSU)', placeholder: 'PSU seçin...', searchPlaceholder: 'Corsair, EVGA ara...' }
                    ].map(({ key, label, placeholder, searchPlaceholder }) => (
                      <div key={key} className="space-y-2">
                        <Label htmlFor={key} className="text-gray-300">{label}</Label>
                        <SearchableSelect
                          options={getComponentOptions(key)}
                          value={currentSystem[key as keyof CurrentSystem]}
                          onValueChange={(value) => handleCurrentSystemChange(key, value)}
                          placeholder={placeholder}
                          searchPlaceholder={searchPlaceholder}
                          emptyMessage={`${label} bulunamadı`}
                          className="w-full"
                        />
                      </div>
                    ))}
                  </div>
                  
                  <Button 
                    onClick={() => setStep(2)}
                    disabled={!isCurrentSystemComplete}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3"
                  >
                    <ArrowRight className="h-4 w-4 mr-2" />
                    Upgrade Seçeneklerini Gör
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ) : (
            <div>
              <Card className="gaming-card border-blue-400/20">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <Computer className="h-5 w-5 mr-2 text-blue-400" />
                    Mevcut Sisteminizi Girin
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      { key: 'cpu', label: 'İşlemci (CPU)', placeholder: 'CPU seçin...', searchPlaceholder: 'Intel, AMD ara...' },
                      { key: 'gpu', label: 'Ekran Kartı (GPU)', placeholder: 'GPU seçin...', searchPlaceholder: 'NVIDIA, AMD ara...' },
                      { key: 'ram', label: 'RAM', placeholder: 'RAM seçin...', searchPlaceholder: 'DDR4, DDR5 ara...' },
                      { key: 'motherboard', label: 'Anakart', placeholder: 'Anakart seçin...', searchPlaceholder: 'ASUS, MSI ara...' },
                      { key: 'storage', label: 'Depolama', placeholder: 'Depolama seçin...', searchPlaceholder: 'SSD, NVMe ara...' },
                      { key: 'psu', label: 'Güç Kaynağı (PSU)', placeholder: 'PSU seçin...', searchPlaceholder: 'Corsair, EVGA ara...' }
                    ].map(({ key, label, placeholder, searchPlaceholder }) => (
                      <div key={key} className="space-y-2">
                        <Label htmlFor={key} className="text-gray-300">{label}</Label>
                        <SearchableSelect
                          options={getComponentOptions(key)}
                          value={currentSystem[key as keyof CurrentSystem]}
                          onValueChange={(value) => handleCurrentSystemChange(key, value)}
                          placeholder={placeholder}
                          searchPlaceholder={searchPlaceholder}
                          emptyMessage={`${label} bulunamadı`}
                          className="w-full"
                        />
                      </div>
                    ))}
                  </div>
                  
                  <Button 
                    onClick={() => setStep(2)}
                    disabled={!isCurrentSystemComplete}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3"
                  >
                    <ArrowRight className="h-4 w-4 mr-2" />
                    Upgrade Seçeneklerini Gör
                  </Button>
                </CardContent>
              </Card>
            </div>
          )
        )}

        {/* Step 2: Upgrade Selection */}
        {step === 2 && (
          mounted ? (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="space-y-6"
            >
            {/* Current System Summary */}
            <Card className="gaming-card border-red-400/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Settings className="h-5 w-5 mr-2 text-red-400" />
                  Mevcut Sisteminiz
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(currentSystem).map(([key, value]) => {
                    // Find the component name from the selected ID
                    const component = components[key]?.find(c => c.id === value);
                    const displayName = component ? component.name : value;
                    
                    return (
                      <div key={key} className="flex justify-between items-center p-3 rounded-lg bg-gray-800/50">
                        <span className="text-gray-400 capitalize">{key}:</span>
                        <span className="text-white text-sm">{displayName}</span>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Upgrade Selection */}
            <Card className="gaming-card border-green-400/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2 text-green-400" />
                  Upgrade Seçenekleri
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {Object.entries(components).map(([category, items]) => {
                  const safeItems = Array.isArray(items) ? items : [];
                  
                  return (
                    <div key={category} className="space-y-2">
                      <Label className="text-gray-300 capitalize">{category} Upgrade:</Label>
                      <Select
                        value={upgradeComponents[category]?.id || 'none'}
                        onValueChange={(value) => handleUpgradeComponentChange(category, value === 'none' ? '' : value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder={`${category} seçin (opsiyonel)`} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">Upgrade yapmayacağım</SelectItem>
                          {safeItems.map((component) => (
                            <SelectItem key={component.id} value={component.id}>
                              {component.name} - ₺{component.price.toLocaleString('tr-TR')}
                              {component.gaming_score && ` (${component.gaming_score}/100)`}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  );
                })}
                
                <div className="flex space-x-4 pt-4">
                  <Button 
                    onClick={() => setStep(1)}
                    variant="outline"
                    className="flex-1"
                  >
                    Geri
                  </Button>
                  <Button 
                    onClick={checkCompatibility}
                    disabled={!hasUpgradeSelections || loading}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                  >
                    {loading ? (
                      <>
                        <Settings className="h-4 w-4 mr-2 animate-spin" />
                        Kontrol Ediliyor...
                      </>
                    ) : (
                      <>
                        <Zap className="h-4 w-4 mr-2" />
                        Uyumluluk Kontrolü Yap
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
            </motion.div>
          ) : (
            <div className="space-y-6">
              {/* Current System Summary */}
              <Card className="gaming-card border-red-400/20">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <Settings className="h-5 w-5 mr-2 text-red-400" />
                    Mevcut Sisteminiz
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(currentSystem).map(([key, value]) => {
                      // Find the component name from the selected ID
                      const component = components[key]?.find(c => c.id === value);
                      const displayName = component ? component.name : value;
                      
                      return (
                        <div key={key} className="flex justify-between items-center p-3 rounded-lg bg-gray-800/50">
                          <span className="text-gray-400 capitalize">{key}:</span>
                          <span className="text-white text-sm">{displayName}</span>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Upgrade Selection */}
              <Card className="gaming-card border-green-400/20">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <TrendingUp className="h-5 w-5 mr-2 text-green-400" />
                    Upgrade Seçenekleri
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {Object.entries(components).map(([category, items]) => {
                    const safeItems = Array.isArray(items) ? items : [];
                    
                    return (
                      <div key={category} className="space-y-2">
                        <Label className="text-gray-300 capitalize">{category} Upgrade:</Label>
                        <Select
                          value={upgradeComponents[category]?.id || 'none'}
                          onValueChange={(value) => handleUpgradeComponentChange(category, value === 'none' ? '' : value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder={`${category} seçin (opsiyonel)`} />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">Upgrade yapmayacağım</SelectItem>
                            {safeItems.map((component) => (
                              <SelectItem key={component.id} value={component.id}>
                                {component.name} - ₺{component.price.toLocaleString('tr-TR')}
                                {component.gaming_score && ` (${component.gaming_score}/100)`}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    );
                  })}
                  
                  <div className="flex space-x-4 pt-4">
                    <Button 
                      onClick={() => setStep(1)}
                      variant="outline"
                      className="flex-1"
                    >
                      Geri
                    </Button>
                    <Button 
                      onClick={checkCompatibility}
                      disabled={!hasUpgradeSelections || loading}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                    >
                      {loading ? (
                        <>
                          <Settings className="h-4 w-4 mr-2 animate-spin" />
                          Kontrol Ediliyor...
                        </>
                      ) : (
                        <>
                          <Zap className="h-4 w-4 mr-2" />
                          Uyumluluk Kontrolü Yap
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )
        )}

        {/* Step 3: Results */}
        {step === 3 && compatibilityResult && (
          mounted ? (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="space-y-6"
            >
            {/* Compatibility Status */}
            <Card className="gaming-card border-yellow-400/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <CheckCircle className="h-5 w-5 mr-2 text-yellow-400" />
                  Uyumluluk Durumu
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {compatibilityResult.compatibility.map((comp, index) => (
                    <div key={index} className={`p-4 rounded-lg border ${
                      comp.compatible 
                        ? 'bg-green-900/20 border-green-400/30' 
                        : 'bg-red-900/20 border-red-400/30'
                    }`}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-white font-medium capitalize">{comp.component}</span>
                        {comp.compatible ? (
                          <CheckCircle className="h-5 w-5 text-green-400" />
                        ) : (
                          <AlertTriangle className="h-5 w-5 text-red-400" />
                        )}
                      </div>
                      {comp.warnings.length > 0 && (
                        <div className="space-y-1">
                          {comp.warnings.map((warning, idx) => (
                            <p key={idx} className="text-sm text-yellow-400">{warning}</p>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                  
                  {compatibilityResult.summary.warnings.length > 0 && (
                    <div className="p-4 rounded-lg bg-orange-900/20 border border-orange-400/30">
                      <h4 className="text-orange-400 font-medium mb-2">Genel Uyarılar:</h4>
                      {compatibilityResult.summary.warnings.map((warning, index) => (
                        <p key={index} className="text-sm text-orange-300">{warning}</p>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Trade-in Values */}
            <Card className="gaming-card border-green-400/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <DollarSign className="h-5 w-5 mr-2 text-green-400" />
                  Trade-in Değerleri & Maliyetler
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {compatibilityResult.tradeInValues.map((item, index) => (
                    <div key={index} className="p-4 rounded-lg bg-gray-800/50 border border-gray-700">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <div className="text-sm text-gray-400 capitalize">{item.component}</div>
                          <div className="text-white">{item.currentItem} → {item.newItem}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-green-400 text-sm">Trade-in: ₺{item.tradeInValue.toLocaleString('tr-TR')}</div>
                          <div className="text-blue-400 text-sm">Yeni Fiyat: ₺{item.newPrice.toLocaleString('tr-TR')}</div>
                          <div className="text-white font-bold">Net: ₺{item.netCost.toLocaleString('tr-TR')}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  <div className="border-t border-gray-700 pt-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="text-center p-4 rounded-lg bg-green-900/20 border border-green-400/30">
                        <div className="text-2xl font-bold text-green-400">
                          ₺{compatibilityResult.summary.totalTradeInValue.toLocaleString('tr-TR')}
                        </div>
                        <div className="text-sm text-gray-400">Toplam Trade-in</div>
                      </div>
                      
                      <div className="text-center p-4 rounded-lg bg-blue-900/20 border border-blue-400/30">
                        <div className="text-2xl font-bold text-blue-400">
                          ₺{compatibilityResult.summary.totalUpgradeCost.toLocaleString('tr-TR')}
                        </div>
                        <div className="text-sm text-gray-400">Toplam Upgrade</div>
                      </div>
                      
                      <div className="text-center p-4 rounded-lg bg-purple-900/20 border border-purple-400/30">
                        <div className="text-2xl font-bold text-purple-400">
                          ₺{compatibilityResult.summary.netCost.toLocaleString('tr-TR')}
                        </div>
                        <div className="text-sm text-gray-400">Net Maliyet</div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex space-x-4">
              <Button 
                onClick={() => setStep(2)}
                variant="outline"
                className="flex-1"
              >
                Upgrade Seçimlerini Değiştir
              </Button>
              <Button 
                onClick={() => {
                  setStep(1);
                  setCompatibilityResult(null);
                }}
                variant="outline"
                className="flex-1"
              >
                Yeni Sistem Gir
              </Button>
            </div>
          </motion.div>
          ) : (
            <div className="space-y-6">
              {/* Compatibility Status */}
              <Card className="gaming-card border-yellow-400/20">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <CheckCircle className="h-5 w-5 mr-2 text-yellow-400" />
                    Uyumluluk Durumu
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {compatibilityResult.compatibility.map((comp, index) => (
                      <div key={index} className={`p-4 rounded-lg border ${
                        comp.compatible 
                          ? 'bg-green-900/20 border-green-400/30' 
                          : 'bg-red-900/20 border-red-400/30'
                      }`}>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-white font-medium capitalize">{comp.component}</span>
                          {comp.compatible ? (
                            <CheckCircle className="h-5 w-5 text-green-400" />
                          ) : (
                            <AlertTriangle className="h-5 w-5 text-red-400" />
                          )}
                        </div>
                        {comp.warnings.length > 0 && (
                          <div className="space-y-1">
                            {comp.warnings.map((warning, idx) => (
                              <p key={idx} className="text-sm text-yellow-400">{warning}</p>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                    
                    {compatibilityResult.summary.warnings.length > 0 && (
                      <div className="p-4 rounded-lg bg-orange-900/20 border border-orange-400/30">
                        <h4 className="text-orange-400 font-medium mb-2">Genel Uyarılar:</h4>
                        {compatibilityResult.summary.warnings.map((warning, index) => (
                          <p key={index} className="text-sm text-orange-300">{warning}</p>
                        ))}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Trade-in Values */}
              <Card className="gaming-card border-green-400/20">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <DollarSign className="h-5 w-5 mr-2 text-green-400" />
                    Trade-in Değerleri & Maliyetler
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {compatibilityResult.tradeInValues.map((item, index) => (
                      <div key={index} className="p-4 rounded-lg bg-gray-800/50 border border-gray-700">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <div className="text-sm text-gray-400 capitalize">{item.component}</div>
                            <div className="text-white">{item.currentItem} → {item.newItem}</div>
                          </div>
                          <div className="text-right">
                            <div className="text-green-400 text-sm">Trade-in: ₺{item.tradeInValue.toLocaleString('tr-TR')}</div>
                            <div className="text-blue-400 text-sm">Yeni Fiyat: ₺{item.newPrice.toLocaleString('tr-TR')}</div>
                            <div className="text-white font-bold">Net: ₺{item.netCost.toLocaleString('tr-TR')}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    <div className="border-t border-gray-700 pt-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="text-center p-4 rounded-lg bg-green-900/20 border border-green-400/30">
                          <div className="text-2xl font-bold text-green-400">
                            ₺{compatibilityResult.summary.totalTradeInValue.toLocaleString('tr-TR')}
                          </div>
                          <div className="text-sm text-gray-400">Toplam Trade-in</div>
                        </div>
                        
                        <div className="text-center p-4 rounded-lg bg-blue-900/20 border border-blue-400/30">
                          <div className="text-2xl font-bold text-blue-400">
                            ₺{compatibilityResult.summary.totalUpgradeCost.toLocaleString('tr-TR')}
                          </div>
                          <div className="text-sm text-gray-400">Toplam Upgrade</div>
                        </div>
                        
                        <div className="text-center p-4 rounded-lg bg-purple-900/20 border border-purple-400/30">
                          <div className="text-2xl font-bold text-purple-400">
                            ₺{compatibilityResult.summary.netCost.toLocaleString('tr-TR')}
                          </div>
                          <div className="text-sm text-gray-400">Net Maliyet</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Action Buttons */}
              <div className="flex space-x-4">
                <Button 
                  onClick={() => setStep(2)}
                  variant="outline"
                  className="flex-1"
                >
                  Upgrade Seçimlerini Değiştir
                </Button>
                <Button 
                  onClick={() => {
                    setStep(1);
                    setCompatibilityResult(null);
                  }}
                  variant="outline"
                  className="flex-1"
                >
                  Yeni Sistem Gir
                </Button>
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );
}
