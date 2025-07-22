
'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Gamepad2, Target, Monitor, Users, Search, Filter, TrendingUp, Star } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';

interface GameRecommendation {
  game: {
    name: string;
    category: string;
    requirements: {
      minimum: any;
      recommended: any;
      competitive?: any;
    };
    optimization_tips: string[];
  };
  recommended_level: string;
  target_resolution: string;
  specific_builds: any[];
  performance_estimate: number;
  peripherals: string[];
}

interface UseCaseRecommendation {
  use_case: {
    name: string;
    primary_focus: string;
    recommended_specs: any;
    budget_ranges: any;
    optimization_tips: string[];
  };
  builds: any[];
  workflow_optimization: string[];
}

export default function RecommendationsPage() {
  const [activeTab, setActiveTab] = useState('games');
  const [gameRecommendations, setGameRecommendations] = useState<GameRecommendation | null>(null);
  const [useCaseRecommendations, setUseCaseRecommendations] = useState<UseCaseRecommendation | null>(null);
  const [selectedGame, setSelectedGame] = useState<string>('cs2');
  const [selectedUseCase, setSelectedUseCase] = useState<string>('streaming');
  const [targetFPS, setTargetFPS] = useState<number[]>([144]);
  const [budget, setBudget] = useState<string>('mid_range');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (activeTab === 'games' && selectedGame) {
      fetchGameRecommendations();
    } else if (activeTab === 'use_cases' && selectedUseCase) {
      fetchUseCaseRecommendations();
    }
  }, [activeTab, selectedGame, selectedUseCase, targetFPS, budget]);

  const fetchGameRecommendations = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/upgrade/recommendations?game=${selectedGame}&target_fps=${targetFPS[0]}&budget=${budget}`);
      const result = await response.json();
      if (result.success) {
        setGameRecommendations(result.data);
      }
    } catch (error) {
      console.error('Error fetching game recommendations:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUseCaseRecommendations = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/upgrade/recommendations?use_case=${selectedUseCase}&budget=${budget}`);
      const result = await response.json();
      if (result.success) {
        setUseCaseRecommendations(result.data);
      }
    } catch (error) {
      console.error('Error fetching use case recommendations:', error);
    } finally {
      setLoading(false);
    }
  };

  const gameOptions = [
    { value: 'cs2', label: 'Counter-Strike 2', category: 'Competitive FPS' },
    { value: 'valorant', label: 'Valorant', category: 'Competitive FPS' },
    { value: 'apex_legends', label: 'Apex Legends', category: 'Battle Royale' },
    { value: 'cyberpunk2077', label: 'Cyberpunk 2077', category: 'AAA RPG' }
  ];

  const useCaseOptions = [
    { value: 'streaming', label: 'Streaming & Content Creation', icon: Users },
    { value: 'vr_gaming', label: 'VR Gaming', icon: Monitor },
    { value: 'workstation', label: 'Professional Workstation', icon: Target }
  ];

  const getRecommendationLevel = (level: string) => {
    switch (level) {
      case 'minimum': return { color: 'bg-red-900/20 text-red-400 border-red-400/30', label: 'Minimum' };
      case 'recommended': return { color: 'bg-yellow-900/20 text-yellow-400 border-yellow-400/30', label: 'Önerilen' };
      case 'competitive': return { color: 'bg-green-900/20 text-green-400 border-green-400/30', label: 'Competitive' };
      default: return { color: 'bg-gray-900/20 text-gray-400 border-gray-400/30', label: 'Standard' };
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
            <span className="text-cyan-400">GAMING</span> ÖNERİLERİ
          </h1>
          <p className="text-gray-300 text-lg max-w-2xl mx-auto">
            Oyun bazlı donanım önerileri ve kullanım durumuna özel sistem tasarımları
          </p>
        </motion.div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="games" className="flex items-center">
              <Gamepad2 className="h-4 w-4 mr-2" />
              Oyun Bazlı
            </TabsTrigger>
            <TabsTrigger value="use_cases" className="flex items-center">
              <Target className="h-4 w-4 mr-2" />
              Kullanım Durumu
            </TabsTrigger>
            <TabsTrigger value="trending" className="flex items-center">
              <TrendingUp className="h-4 w-4 mr-2" />
              Trending Builds
            </TabsTrigger>
          </TabsList>

          {/* Game-Based Recommendations */}
          <TabsContent value="games">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Filters */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                className="lg:col-span-1"
              >
                <Card className="gaming-card border-cyan-400/20 sticky top-8">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center">
                      <Filter className="h-5 w-5 mr-2 text-cyan-400" />
                      Filtreler
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Game Selection */}
                    <div className="space-y-2">
                      <label className="text-sm text-gray-400">Oyun Seçin:</label>
                      <Select value={selectedGame} onValueChange={setSelectedGame}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {gameOptions.map(game => (
                            <SelectItem key={game.value} value={game.value}>
                              <div>
                                <div>{game.label}</div>
                                <div className="text-xs text-gray-400">{game.category}</div>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Target FPS */}
                    <div className="space-y-2">
                      <label className="text-sm text-gray-400">
                        Hedef FPS: {targetFPS[0]}
                      </label>
                      <Slider
                        value={targetFPS}
                        onValueChange={setTargetFPS}
                        max={500}
                        min={60}
                        step={30}
                        className="w-full"
                      />
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>60</span>
                        <span>300</span>
                        <span>500+</span>
                      </div>
                    </div>

                    {/* Budget Range */}
                    <div className="space-y-2">
                      <label className="text-sm text-gray-400">Budget:</label>
                      <Select value={budget} onValueChange={setBudget}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="budget">Budget (15-25k ₺)</SelectItem>
                          <SelectItem value="mid_range">Mid-Range (25-40k ₺)</SelectItem>
                          <SelectItem value="high_end">High-End (40k+ ₺)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Recommendations Content */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="lg:col-span-3 space-y-6"
              >
                {loading ? (
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400 mx-auto mb-4"></div>
                    <p className="text-gray-300">Öneriler hazırlanıyor...</p>
                  </div>
                ) : gameRecommendations ? (
                  <>
                    {/* Game Info */}
                    <Card className="gaming-card border-cyan-400/20">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-white flex items-center">
                            <Gamepad2 className="h-5 w-5 mr-2 text-cyan-400" />
                            {gameRecommendations.game.name}
                          </CardTitle>
                          <Badge variant="outline" className="border-cyan-400/50 text-cyan-400">
                            {gameRecommendations.game.category}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {/* Requirements */}
                          <div>
                            <h3 className="text-white font-semibold mb-3">Sistem Gereksinimleri:</h3>
                            <div className="space-y-3">
                              {Object.entries(gameRecommendations.game.requirements).map(([level, specs]: [string, any]) => {
                                const levelInfo = getRecommendationLevel(level);
                                return (
                                  <div key={level} className={`p-3 rounded-lg border ${levelInfo.color}`}>
                                    <div className="font-semibold mb-2">{levelInfo.label}</div>
                                    <div className="text-sm space-y-1">
                                      <div>CPU: {specs.cpu}</div>
                                      <div>GPU: {specs.gpu}</div>
                                      <div>RAM: {specs.ram}</div>
                                      <div>Target: {specs.fps_target} FPS</div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>

                          {/* Optimization Tips */}
                          <div>
                            <h3 className="text-white font-semibold mb-3">Optimizasyon İpuçları:</h3>
                            <ul className="space-y-2">
                              {gameRecommendations.game.optimization_tips.map((tip, index) => (
                                <li key={index} className="text-sm text-gray-300 flex items-start">
                                  <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-2 mr-3 flex-shrink-0"></div>
                                  {tip}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Performance Estimate */}
                    <Card className="gaming-card border-green-400/20">
                      <CardHeader>
                        <CardTitle className="text-white flex items-center">
                          <TrendingUp className="h-5 w-5 mr-2 text-green-400" />
                          Tahmini Performans
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-center mb-4">
                          <div className="text-4xl font-bold text-green-400 mb-2">
                            {gameRecommendations.performance_estimate} FPS
                          </div>
                          <div className="text-sm text-gray-400">
                            {gameRecommendations.target_resolution} @ {gameRecommendations.recommended_level} settings
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div className="text-center p-3 rounded-lg bg-gray-800/50">
                            <div className="text-lg font-bold text-white">280</div>
                            <div className="text-xs text-gray-400">CS2</div>
                          </div>
                          <div className="text-center p-3 rounded-lg bg-gray-800/50">
                            <div className="text-lg font-bold text-white">320</div>
                            <div className="text-xs text-gray-400">Valorant</div>
                          </div>
                          <div className="text-center p-3 rounded-lg bg-gray-800/50">
                            <div className="text-lg font-bold text-white">140</div>
                            <div className="text-xs text-gray-400">Apex</div>
                          </div>
                          <div className="text-center p-3 rounded-lg bg-gray-800/50">
                            <div className="text-lg font-bold text-white">75</div>
                            <div className="text-xs text-gray-400">Cyberpunk</div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Peripheral Recommendations */}
                    <Card className="gaming-card border-purple-400/20">
                      <CardHeader>
                        <CardTitle className="text-white flex items-center">
                          <Monitor className="h-5 w-5 mr-2 text-purple-400" />
                          Önerilen Çevre Birimleri
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-2">
                          {gameRecommendations.peripherals.map((peripheral, index) => (
                            <li key={index} className="text-sm text-gray-300 flex items-start">
                              <div className="w-1.5 h-1.5 rounded-full bg-purple-400 mt-2 mr-3 flex-shrink-0"></div>
                              {peripheral}
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  </>
                ) : null}
              </motion.div>
            </div>
          </TabsContent>

          {/* Use Case Recommendations */}
          <TabsContent value="use_cases">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Use Case Selection */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                className="lg:col-span-1"
              >
                <Card className="gaming-card border-cyan-400/20 sticky top-8">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center">
                      <Target className="h-5 w-5 mr-2 text-cyan-400" />
                      Kullanım Alanı
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {useCaseOptions.map(useCase => {
                      const Icon = useCase.icon;
                      return (
                        <button
                          key={useCase.value}
                          onClick={() => setSelectedUseCase(useCase.value)}
                          className={`w-full p-3 rounded-lg border transition-all duration-200 ${
                            selectedUseCase === useCase.value
                              ? 'border-cyan-400/50 bg-cyan-900/20'
                              : 'border-gray-700/50 hover:border-gray-600/50'
                          }`}
                        >
                          <div className="flex items-center space-x-3">
                            <Icon className="h-5 w-5 text-cyan-400" />
                            <span className="text-white text-sm font-medium">
                              {useCase.label}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </CardContent>
                </Card>
              </motion.div>

              {/* Use Case Content */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="lg:col-span-3 space-y-6"
              >
                {loading ? (
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400 mx-auto mb-4"></div>
                    <p className="text-gray-300">Öneriler hazırlanıyor...</p>
                  </div>
                ) : useCaseRecommendations ? (
                  <>
                    {/* Use Case Info */}
                    <Card className="gaming-card border-cyan-400/20">
                      <CardHeader>
                        <CardTitle className="text-white">{useCaseRecommendations.use_case.name}</CardTitle>
                        <p className="text-gray-300">
                          Odak: {useCaseRecommendations.use_case.primary_focus}
                        </p>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {/* Recommended Specs */}
                          <div>
                            <h3 className="text-white font-semibold mb-3">Önerilen Özellikler:</h3>
                            <div className="space-y-2">
                              {Object.entries(useCaseRecommendations.use_case.recommended_specs).map(([key, value]) => (
                                <div key={key} className="flex justify-between text-sm">
                                  <span className="text-gray-400 capitalize">{key.replace('_', ' ')}:</span>
                                  <span className="text-white">{value as string}</span>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Budget Ranges */}
                          <div>
                            <h3 className="text-white font-semibold mb-3">Budget Aralıkları:</h3>
                            <div className="space-y-2">
                              {Object.entries(useCaseRecommendations.use_case.budget_ranges).map(([range, prices]: [string, any]) => (
                                <div key={range} className="p-2 rounded bg-gray-800/50 border border-gray-700/50">
                                  <div className="flex justify-between">
                                    <span className="text-gray-400 capitalize">{range}:</span>
                                    <span className="text-white font-medium">
                                      ₺{prices.min?.toLocaleString('tr-TR')} - ₺{prices.max?.toLocaleString('tr-TR')}
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Optimization Tips */}
                    <Card className="gaming-card border-green-400/20">
                      <CardHeader>
                        <CardTitle className="text-white flex items-center">
                          <Star className="h-5 w-5 mr-2 text-green-400" />
                          Optimizasyon İpuçları
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-2">
                          {useCaseRecommendations.use_case.optimization_tips.map((tip, index) => (
                            <li key={index} className="text-sm text-gray-300 flex items-start">
                              <div className="w-1.5 h-1.5 rounded-full bg-green-400 mt-2 mr-3 flex-shrink-0"></div>
                              {tip}
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>

                    {/* Workflow Optimization */}
                    {useCaseRecommendations.workflow_optimization.length > 0 && (
                      <Card className="gaming-card border-purple-400/20">
                        <CardHeader>
                          <CardTitle className="text-white flex items-center">
                            <Target className="h-5 w-5 mr-2 text-purple-400" />
                            Workflow Optimizasyonu
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <ul className="space-y-2">
                            {useCaseRecommendations.workflow_optimization.map((item, index) => (
                              <li key={index} className="text-sm text-gray-300 flex items-start">
                                <div className="w-1.5 h-1.5 rounded-full bg-purple-400 mt-2 mr-3 flex-shrink-0"></div>
                                {item}
                              </li>
                            ))}
                          </ul>
                        </CardContent>
                      </Card>
                    )}
                  </>
                ) : null}
              </motion.div>
            </div>
          </TabsContent>

          {/* Trending Builds */}
          <TabsContent value="trending">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-6"
            >
              {[
                {
                  name: 'Competitive FPS Build',
                  price: '25.000 - 35.000 ₺',
                  target: '300+ FPS CS2/Valorant',
                  popularity: 95,
                  color: 'red'
                },
                {
                  name: 'AAA Gaming Build',
                  price: '40.000 - 55.000 ₺',
                  target: '4K 60+ FPS',
                  popularity: 88,
                  color: 'purple'
                },
                {
                  name: 'Content Creator Build',
                  price: '50.000 - 70.000 ₺',
                  target: 'Streaming + Gaming',
                  popularity: 78,
                  color: 'green'
                }
              ].map((build, index) => (
                <Card key={index} className="gaming-card border-gray-400/20 hover:border-gray-400/40 hover:scale-105 transition-all duration-300">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-lg font-bold text-white">{build.name}</h3>
                      <Badge variant="outline" className="border-yellow-400/50 text-yellow-400">
                        {build.popularity}% Popüler
                      </Badge>
                    </div>
                    
                    <div className="space-y-3">
                      <div>
                        <div className="text-sm text-gray-400">Fiyat Aralığı:</div>
                        <div className="text-white font-semibold">{build.price}</div>
                      </div>
                      
                      <div>
                        <div className="text-sm text-gray-400">Hedef Performans:</div>
                        <div className="text-white font-semibold">{build.target}</div>
                      </div>
                    </div>
                    
                    <Button className="w-full mt-4 bg-gray-600 hover:bg-gray-700 text-white">
                      Detaylı Bilgi
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </motion.div>
          </TabsContent>
        </Tabs>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mt-12 text-center"
        >
          <Card className="gaming-card border-cyan-400/30 bg-gradient-to-r from-cyan-900/20 to-purple-900/20 p-8">
            <h3 className="text-2xl font-bold text-white mb-4">
              Kişisel Öneriler İçin Danışmanlık
            </h3>
            <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
              Sizin için en uygun gaming setup'ını belirlemek için uzman ekibimizle görüşün. 
              Oyun tercihleriniz ve budget'ınıza göre özel öneriler hazırlayalım.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button className="bg-cyan-600 hover:bg-cyan-700 text-white px-8 py-3">
                Uzman Danışmanlığı
              </Button>
              <Button variant="outline" className="border-cyan-400 text-cyan-400 hover:bg-cyan-400 hover:text-black px-8 py-3">
                Sistem Analizi Yaptır
              </Button>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
