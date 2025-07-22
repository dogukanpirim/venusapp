
'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calculator, DollarSign, CreditCard, Download, Share, CheckCircle, AlertTriangle, Zap } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';

interface ComponentSelection {
  [key: string]: any;
}

interface PricingConfig {
  base_prices: any;
  discount_codes: Array<{
    code: string;
    discount: number;
    description: string;
  }>;
  payment_options: Array<{
    installments: number;
    interest_rate: number;
    description: string;
  }>;
}

interface Quote {
  quote_id: string;
  timestamp: string;
  components: {
    items: any[];
    subtotal: number;
  };
  services: {
    items: any[];
    subtotal: number;
  };
  pricing: {
    components_cost: number;
    services_cost: number;
    subtotal: number;
    tax_rate: number;
    tax_amount: number;
    discount_code?: string;
    discount_percentage: number;
    discount_amount: number;
    final_total: number;
  };
  payment_plan?: {
    installments: number;
    amount_per_installment: number;
    total_with_interest: number;
    interest_rate: number;
  };
  estimated_installation_time: string;
  compatibility_check: {
    passed: boolean;
    warnings: string[];
    recommendations: string[];
  };
  performance_estimate: {
    overall_score: number;
    gaming_fps: {[key: string]: number};
  };
  valid_until: string;
}

export default function PriceCalculatorPage() {
  const [selectedComponents, setSelectedComponents] = useState<ComponentSelection>({});
  const [availableComponents, setAvailableComponents] = useState<any>({});
  const [pricingConfig, setPricingConfig] = useState<PricingConfig | null>(null);
  const [quote, setQuote] = useState<Quote | null>(null);
  
  // Service options
  const [installationType, setInstallationType] = useState<string>('basic');
  const [testingLevel, setTestingLevel] = useState<string>('basic');
  const [warrantyExtension, setWarrantyExtension] = useState<string>('');
  const [supportDuration, setSupportDuration] = useState<string>('');
  const [discountCode, setDiscountCode] = useState<string>('');
  const [paymentPlan, setPaymentPlan] = useState<any>({ installments: 1, interest_rate: 0 });
  
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('components');

  useEffect(() => {
    fetchComponents();
    fetchPricingConfig();
  }, []);

  const fetchComponents = async () => {
    try {
      const response = await fetch('/api/upgrade/hardware');
      const result = await response.json();
      if (result.success) {
        setAvailableComponents(result.data);
      }
    } catch (error) {
      console.error('Error fetching components:', error);
    }
  };

  const fetchPricingConfig = async () => {
    try {
      const response = await fetch('/api/upgrade/calculator?type=pricing_config');
      const result = await response.json();
      if (result.success) {
        setPricingConfig(result.data);
      }
    } catch (error) {
      console.error('Error fetching pricing config:', error);
    }
  };

  const handleComponentSelect = (category: string, componentId: string) => {
    const component = availableComponents[category]?.find((c: any) => c.id === componentId);
    if (component) {
      setSelectedComponents(prev => ({
        ...prev,
        [category]: component
      }));
    }
  };

  const calculateQuote = async () => {
    setLoading(true);
    try {
      const requestData = {
        components: selectedComponents,
        installation_type: installationType,
        testing_level: testingLevel,
        warranty_extension: warrantyExtension || undefined,
        support_duration: supportDuration || undefined,
        discount_code: discountCode || undefined,
        payment_plan: paymentPlan.installments > 1 ? paymentPlan : undefined
      };

      const response = await fetch('/api/upgrade/calculator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestData)
      });

      const result = await response.json();
      if (result.success) {
        setQuote(result.data);
        setActiveTab('quote');
      }
    } catch (error) {
      console.error('Error calculating quote:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTotalComponentsPrice = () => {
    return Object.values(selectedComponents).reduce((total: number, component: any) => {
      return total + (component?.price || 0);
    }, 0);
  };

  const shareQuote = async () => {
    if (quote && navigator.share) {
      try {
        await navigator.share({
          title: 'Venus eSports Upgrade Teklifi',
          text: `Upgrade Teklifi: ₺${quote.pricing.final_total.toLocaleString('tr-TR')}`,
          url: window.location.href
        });
      } catch (error) {
        console.error('Error sharing quote:', error);
      }
    }
  };

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
            <span className="text-yellow-400">FİYAT</span> HESAPLAYICI
          </h1>
          <p className="text-gray-300 text-lg max-w-2xl mx-auto">
            Custom build fiyatlarınızı hesaplayın ve anında detaylı teklif alın
          </p>
        </motion.div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-8">
            <TabsTrigger value="components">Bileşenler</TabsTrigger>
            <TabsTrigger value="services">Servisler</TabsTrigger>
            <TabsTrigger value="payment">Ödeme</TabsTrigger>
            <TabsTrigger value="quote" disabled={!quote}>Teklif</TabsTrigger>
          </TabsList>

          {/* Components Selection */}
          <TabsContent value="components">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Component Categories */}
              <div className="lg:col-span-2 space-y-6">
                {Object.entries(availableComponents).map(([category, components]: [string, any]) => (
                  <motion.div
                    key={category}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                  >
                    <Card className="gaming-card border-yellow-400/20">
                      <CardHeader>
                        <CardTitle className="text-white capitalize">
                          {category.replace('_', ' ').toUpperCase()}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <Select
                          value={selectedComponents[category]?.id || ''}
                          onValueChange={(value) => handleComponentSelect(category, value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder={`${category} seçin...`} />
                          </SelectTrigger>
                          <SelectContent>
                            {components.map((component: any) => (
                              <SelectItem key={component.id} value={component.id}>
                                <div className="flex justify-between items-center w-full">
                                  <span>{component.name}</span>
                                  <span className="ml-4 text-yellow-400">
                                    ₺{component.price.toLocaleString('tr-TR')}
                                  </span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        
                        {selectedComponents[category] && (
                          <div className="mt-3 p-3 rounded-lg bg-yellow-900/20 border border-yellow-400/30">
                            <div className="flex justify-between items-center">
                              <span className="text-white font-medium">
                                {selectedComponents[category].name}
                              </span>
                              <div className="text-right">
                                <div className="text-yellow-400 font-bold">
                                  ₺{selectedComponents[category].price.toLocaleString('tr-TR')}
                                </div>
                                {selectedComponents[category].gaming_score && (
                                  <div className="text-xs text-gray-400">
                                    Gaming Score: {selectedComponents[category].gaming_score}/100
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>

              {/* Build Summary */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="lg:col-span-1"
              >
                <Card className="gaming-card border-green-400/20 sticky top-8">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center">
                      <Calculator className="h-5 w-5 mr-2 text-green-400" />
                      Build Özeti
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {Object.entries(selectedComponents).map(([category, component]) => (
                        <div key={category} className="flex justify-between items-center text-sm">
                          <span className="text-gray-400 capitalize">{category}:</span>
                          <span className="text-white">
                            ₺{component.price.toLocaleString('tr-TR')}
                          </span>
                        </div>
                      ))}
                      
                      <div className="border-t border-gray-700/50 pt-3 mt-3">
                        <div className="flex justify-between items-center">
                          <span className="text-white font-semibold">Toplam:</span>
                          <span className="text-2xl font-bold text-green-400">
                            ₺{getTotalComponentsPrice().toLocaleString('tr-TR')}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <Button 
                      onClick={() => setActiveTab('services')}
                      disabled={Object.keys(selectedComponents).length === 0}
                      className="w-full mt-4 bg-green-600 hover:bg-green-700 text-white"
                    >
                      Servis Seçenekleri →
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </TabsContent>

          {/* Services Selection */}
          <TabsContent value="services">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                className="space-y-6"
              >
                {/* Installation Type */}
                <Card className="gaming-card border-blue-400/20">
                  <CardHeader>
                    <CardTitle className="text-white">Kurulum Türü</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Select value={installationType} onValueChange={setInstallationType}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="basic">Basic Kurulum (₺500)</SelectItem>
                        <SelectItem value="premium">Premium Kurulum (₺750)</SelectItem>
                        <SelectItem value="professional">Professional Kurulum (₺1000)</SelectItem>
                      </SelectContent>
                    </Select>
                  </CardContent>
                </Card>

                {/* Testing Level */}
                <Card className="gaming-card border-purple-400/20">
                  <CardHeader>
                    <CardTitle className="text-white">Test ve Optimizasyon</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Select value={testingLevel} onValueChange={setTestingLevel}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="basic">Basic Test (₺200)</SelectItem>
                        <SelectItem value="stress_test">Stress Test (₺400)</SelectItem>
                        <SelectItem value="benchmark_suite">Full Benchmark Suite (₺600)</SelectItem>
                      </SelectContent>
                    </Select>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="space-y-6"
              >
                {/* Warranty Extension */}
                <Card className="gaming-card border-green-400/20">
                  <CardHeader>
                    <CardTitle className="text-white">Garanti Uzatma (Opsiyonel)</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Select value={warrantyExtension} onValueChange={setWarrantyExtension}>
                      <SelectTrigger>
                        <SelectValue placeholder="Garanti uzatma seçin..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Uzatma Yok</SelectItem>
                        <SelectItem value="1_year">+1 Yıl (₺500)</SelectItem>
                        <SelectItem value="2_year">+2 Yıl (₺900)</SelectItem>
                        <SelectItem value="3_year">+3 Yıl (₺1300)</SelectItem>
                      </SelectContent>
                    </Select>
                  </CardContent>
                </Card>

                {/* Support Duration */}
                <Card className="gaming-card border-cyan-400/20">
                  <CardHeader>
                    <CardTitle className="text-white">Teknik Destek (Opsiyonel)</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Select value={supportDuration} onValueChange={setSupportDuration}>
                      <SelectTrigger>
                        <SelectValue placeholder="Destek süresi seçin..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Destek Yok</SelectItem>
                        <SelectItem value="6_months">6 Ay (₺300)</SelectItem>
                        <SelectItem value="1_year">1 Yıl (₺600)</SelectItem>
                        <SelectItem value="2_years">2 Yıl (₺1000)</SelectItem>
                      </SelectContent>
                    </Select>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="mt-8 text-center"
            >
              <Button 
                onClick={() => setActiveTab('payment')}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3"
              >
                Ödeme Seçenekleri →
              </Button>
            </motion.div>
          </TabsContent>

          {/* Payment Options */}
          <TabsContent value="payment">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                className="space-y-6"
              >
                {/* Discount Code */}
                <Card className="gaming-card border-yellow-400/20">
                  <CardHeader>
                    <CardTitle className="text-white">İndirim Kodu</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Input
                      placeholder="İndirim kodunuzu girin..."
                      value={discountCode}
                      onChange={(e) => setDiscountCode(e.target.value)}
                      className="mb-3"
                    />
                    {pricingConfig && (
                      <div className="space-y-2">
                        <div className="text-sm text-gray-400">Mevcut kodlar:</div>
                        {pricingConfig.discount_codes.map((code) => (
                          <div key={code.code} className="text-xs text-gray-500 flex justify-between">
                            <span>{code.code}</span>
                            <span>%{code.discount}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Payment Plan */}
                <Card className="gaming-card border-green-400/20">
                  <CardHeader>
                    <CardTitle className="text-white">Ödeme Planı</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {pricingConfig && (
                      <div className="space-y-3">
                        {pricingConfig.payment_options.map((option) => (
                          <button
                            key={option.installments}
                            onClick={() => setPaymentPlan(option)}
                            className={`w-full p-3 rounded-lg border transition-all duration-200 ${
                              paymentPlan.installments === option.installments
                                ? 'border-green-400/50 bg-green-900/20'
                                : 'border-gray-700/50 hover:border-gray-600/50'
                            }`}
                          >
                            <div className="text-left">
                              <div className="font-medium text-white">{option.description}</div>
                              {option.interest_rate > 0 && (
                                <div className="text-sm text-yellow-400">
                                  %{option.interest_rate} faiz
                                </div>
                              )}
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                <Card className="gaming-card border-purple-400/20">
                  <CardHeader>
                    <CardTitle className="text-white">Ödeme Özeti</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Bileşenler:</span>
                        <span className="text-white">₺{getTotalComponentsPrice().toLocaleString('tr-TR')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Kurulum:</span>
                        <span className="text-white">
                          ₺{pricingConfig?.base_prices.installation[installationType as keyof typeof pricingConfig.base_prices.installation]?.toLocaleString('tr-TR') || '0'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Test:</span>
                        <span className="text-white">
                          ₺{pricingConfig?.base_prices.testing[testingLevel as keyof typeof pricingConfig.base_prices.testing]?.toLocaleString('tr-TR') || '0'}
                        </span>
                      </div>
                      
                      {discountCode && (
                        <div className="flex justify-between text-green-400">
                          <span>İndirim ({discountCode}):</span>
                          <span>
                            -{pricingConfig?.discount_codes.find(c => c.code === discountCode)?.discount || 0}%
                          </span>
                        </div>
                      )}
                      
                      <div className="border-t border-gray-700/50 pt-3">
                        <div className="flex justify-between items-center">
                          <span className="text-white font-semibold">Tahmini Toplam:</span>
                          <span className="text-2xl font-bold text-purple-400">
                            ₺{(getTotalComponentsPrice() + 500 + 200).toLocaleString('tr-TR')}
                          </span>
                        </div>
                        <div className="text-xs text-gray-400 mt-1">
                          *KDV ve diğer ücretler dahil değil
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="mt-8 text-center"
            >
              <Button 
                onClick={calculateQuote}
                disabled={loading || Object.keys(selectedComponents).length === 0}
                className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3"
              >
                {loading ? (
                  <>
                    <Calculator className="h-4 w-4 mr-2 animate-spin" />
                    Hesaplanıyor...
                  </>
                ) : (
                  <>
                    <DollarSign className="h-4 w-4 mr-2" />
                    Detaylı Teklif Hesapla
                  </>
                )}
              </Button>
            </motion.div>
          </TabsContent>

          {/* Quote Results */}
          <TabsContent value="quote">
            {quote && (
              <div className="space-y-6">
                {/* Quote Header */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8 }}
                >
                  <Card className="gaming-card border-green-400/20">
                    <CardHeader>
                      <div className="flex justify-between items-center">
                        <CardTitle className="text-white flex items-center">
                          <CheckCircle className="h-5 w-5 mr-2 text-green-400" />
                          Teklif #{quote.quote_id}
                        </CardTitle>
                        <Badge variant="outline" className="border-green-400/50 text-green-400">
                          {new Date(quote.valid_until).toLocaleDateString('tr-TR')} tarihine kadar geçerli
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="text-center">
                          <div className="text-3xl font-bold text-green-400 mb-2">
                            ₺{quote.pricing.final_total.toLocaleString('tr-TR')}
                          </div>
                          <div className="text-sm text-gray-400">Final Toplam</div>
                        </div>
                        
                        <div className="text-center">
                          <div className="text-2xl font-bold text-blue-400 mb-2">
                            {quote.estimated_installation_time}
                          </div>
                          <div className="text-sm text-gray-400">Tahmini Kurulum Süresi</div>
                        </div>
                        
                        <div className="text-center">
                          <div className="text-2xl font-bold text-purple-400 mb-2">
                            {quote.performance_estimate.overall_score}/100
                          </div>
                          <div className="text-sm text-gray-400">Tahmini Performans</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                {/* Pricing Breakdown */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                  className="grid grid-cols-1 lg:grid-cols-2 gap-6"
                >
                  <Card className="gaming-card border-blue-400/20">
                    <CardHeader>
                      <CardTitle className="text-white">Fiyat Detayları</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Bileşenler:</span>
                          <span className="text-white">₺{quote.pricing.components_cost.toLocaleString('tr-TR')}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Servisler:</span>
                          <span className="text-white">₺{quote.pricing.services_cost.toLocaleString('tr-TR')}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Ara Toplam:</span>
                          <span className="text-white">₺{quote.pricing.subtotal.toLocaleString('tr-TR')}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">KDV (%{(quote.pricing.tax_rate * 100).toFixed(0)}):</span>
                          <span className="text-white">₺{quote.pricing.tax_amount.toLocaleString('tr-TR')}</span>
                        </div>
                        {quote.pricing.discount_amount > 0 && (
                          <div className="flex justify-between text-green-400">
                            <span>İndirim (%{quote.pricing.discount_percentage}):</span>
                            <span>-₺{quote.pricing.discount_amount.toLocaleString('tr-TR')}</span>
                          </div>
                        )}
                        <div className="border-t border-gray-700/50 pt-3 flex justify-between">
                          <span className="text-white font-bold">TOPLAM:</span>
                          <span className="text-2xl font-bold text-green-400">
                            ₺{quote.pricing.final_total.toLocaleString('tr-TR')}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="gaming-card border-purple-400/20">
                    <CardHeader>
                      <CardTitle className="text-white">Gaming Performansı</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {Object.entries(quote.performance_estimate.gaming_fps).map(([game, fps]) => (
                          <div key={game} className="flex justify-between items-center">
                            <span className="text-gray-400 uppercase">{game}:</span>
                            <span className="text-white font-bold">{fps} FPS</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                {/* Compatibility Check */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.4 }}
                >
                  <Card className="gaming-card border-yellow-400/20">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center">
                        {quote.compatibility_check.passed ? (
                          <CheckCircle className="h-5 w-5 mr-2 text-green-400" />
                        ) : (
                          <AlertTriangle className="h-5 w-5 mr-2 text-yellow-400" />
                        )}
                        Uyumluluk Kontrolü
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <h4 className="text-white font-semibold mb-3">Öneriler:</h4>
                          <ul className="space-y-1">
                            {quote.compatibility_check.recommendations.map((rec, index) => (
                              <li key={index} className="text-sm text-green-400 flex items-start">
                                <CheckCircle className="h-3 w-3 mt-0.5 mr-2 flex-shrink-0" />
                                {rec}
                              </li>
                            ))}
                          </ul>
                        </div>
                        
                        {quote.compatibility_check.warnings.length > 0 && (
                          <div>
                            <h4 className="text-white font-semibold mb-3">Uyarılar:</h4>
                            <ul className="space-y-1">
                              {quote.compatibility_check.warnings.map((warning, index) => (
                                <li key={index} className="text-sm text-yellow-400 flex items-start">
                                  <AlertTriangle className="h-3 w-3 mt-0.5 mr-2 flex-shrink-0" />
                                  {warning}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                {/* Payment Plan */}
                {quote.payment_plan && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.6 }}
                  >
                    <Card className="gaming-card border-cyan-400/20">
                      <CardHeader>
                        <CardTitle className="text-white flex items-center">
                          <CreditCard className="h-5 w-5 mr-2 text-cyan-400" />
                          Taksit Planı
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="text-center">
                            <div className="text-2xl font-bold text-cyan-400">
                              {quote.payment_plan.installments}
                            </div>
                            <div className="text-sm text-gray-400">Taksit Sayısı</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-cyan-400">
                              ₺{quote.payment_plan.amount_per_installment.toLocaleString('tr-TR')}
                            </div>
                            <div className="text-sm text-gray-400">Aylık Ödeme</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-cyan-400">
                              %{quote.payment_plan.interest_rate}
                            </div>
                            <div className="text-sm text-gray-400">Faiz Oranı</div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}

                {/* Action Buttons */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.8 }}
                  className="flex flex-col sm:flex-row gap-4 justify-center"
                >
                  <Button className="bg-green-600 hover:bg-green-700 text-white px-8 py-3">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Teklifi Onayla
                  </Button>
                  <Button variant="outline" className="border-blue-400 text-blue-400 hover:bg-blue-400 hover:text-black px-8 py-3">
                    <Download className="h-4 w-4 mr-2" />
                    PDF İndir
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={shareQuote}
                    className="border-purple-400 text-purple-400 hover:bg-purple-400 hover:text-black px-8 py-3"
                  >
                    <Share className="h-4 w-4 mr-2" />
                    Paylaş
                  </Button>
                </motion.div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
