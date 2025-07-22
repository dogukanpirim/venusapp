
'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Monitor, Cpu, HardDrive, MemoryStick, Thermometer, Zap, TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Link from 'next/link';

interface SystemData {
  pc_id: string;
  name: string;
  status: string;
  current_specs: {
    cpu: string;
    gpu: string;
    ram: string;
    storage: string;
    motherboard: string;
    psu: string;
  };
  performance_scores: {
    cpu_score: number;
    gpu_score: number;
    ram_score: number;
    storage_score: number;
    overall_score: number;
  };
  bottlenecks: Array<{
    component: string;
    severity: string;
    impact: number;
  }>;
  gaming_performance: {
    cs2: number;
    valorant: number;
    apex: number;
    cyberpunk: number;
  };
  upgrade_priority: Array<{
    component: string;
    priority: number;
    expected_gain: number;
  }>;
  temperature_data?: {
    cpu_temp: number;
    gpu_temp: number;
    status: string;
  };
  power_consumption?: {
    current: number;
    max: number;
    efficiency: number;
  };
}

export default function SystemAnalysisPage() {
  const [selectedPC, setSelectedPC] = useState<string>('');
  const [systemData, setSystemData] = useState<SystemData | null>(null);
  const [overviewData, setOverviewData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // Fetch overview data on component mount
  useEffect(() => {
    fetchSystemOverview();
  }, []);

  // Fetch detailed system data when PC is selected
  useEffect(() => {
    if (selectedPC) {
      fetchSystemDetails(selectedPC);
    }
  }, [selectedPC]);

  const fetchSystemOverview = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/upgrade/analysis');
      const result = await response.json();
      if (result.success) {
        setOverviewData(result.data);
        // Auto-select first PC if available
        if (result.data.systems?.length > 0) {
          setSelectedPC(result.data.systems[0].pc_id);
        }
      }
    } catch (error) {
      console.error('Error fetching overview:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSystemDetails = async (pcId: string) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/upgrade/analysis?pc_id=${pcId}`);
      const result = await response.json();
      if (result.success) {
        setSystemData(result.data);
      }
    } catch (error) {
      console.error('Error fetching system details:', error);
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-400';
    if (score >= 70) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 90) return 'bg-green-500';
    if (score >= 70) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'text-red-400 bg-red-900/20 border-red-400/30';
      case 'medium': return 'text-yellow-400 bg-yellow-900/20 border-yellow-400/30';
      case 'low': return 'text-green-400 bg-green-900/20 border-green-400/30';
      default: return 'text-gray-400 bg-gray-900/20 border-gray-400/30';
    }
  };

  if (loading && !systemData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400 mx-auto mb-4"></div>
          <p className="text-gray-300">Sistem analizi yapılıyor...</p>
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
            <span className="text-purple-400">SİSTEM</span> ANALİZİ
          </h1>
          <p className="text-gray-300 text-lg max-w-2xl mx-auto">
            PC'nizin performansını analiz edin, bottleneck'leri tespit edin ve upgrade önerilerini görün
          </p>
        </motion.div>

        {/* PC Selection & Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="lg:col-span-1"
          >
            <Card className="gaming-card border-purple-400/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Monitor className="h-5 w-5 mr-2 text-purple-400" />
                  PC Seçimi
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Select value={selectedPC} onValueChange={setSelectedPC}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="PC seçin..." />
                  </SelectTrigger>
                  <SelectContent>
                    {overviewData?.systems?.map((system: any) => (
                      <SelectItem key={system.pc_id} value={system.pc_id}>
                        {system.name} ({system.overall_score}/100)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                {overviewData && (
                  <div className="mt-4 space-y-2">
                    <div className="text-sm text-gray-400">Genel Durum:</div>
                    <div className="text-lg font-semibold text-white">
                      {overviewData.systems_needing_upgrade} / {overviewData.total_systems} PC upgrade gerekiyor
                    </div>
                    <div className="text-sm text-green-400">
                      Ortalama Skor: {overviewData.average_performance}/100
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* System Overview Cards */}
          {systemData && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="lg:col-span-3"
            >
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="gaming-card border-blue-400/20">
                  <CardContent className="p-4 text-center">
                    <Cpu className="h-8 w-8 text-blue-400 mx-auto mb-2" />
                    <div className={`text-2xl font-bold ${getScoreColor(systemData.performance_scores.cpu_score)}`}>
                      {systemData.performance_scores.cpu_score}
                    </div>
                    <div className="text-xs text-gray-400">CPU Score</div>
                  </CardContent>
                </Card>

                <Card className="gaming-card border-green-400/20">
                  <CardContent className="p-4 text-center">
                    <Monitor className="h-8 w-8 text-green-400 mx-auto mb-2" />
                    <div className={`text-2xl font-bold ${getScoreColor(systemData.performance_scores.gpu_score)}`}>
                      {systemData.performance_scores.gpu_score}
                    </div>
                    <div className="text-xs text-gray-400">GPU Score</div>
                  </CardContent>
                </Card>

                <Card className="gaming-card border-yellow-400/20">
                  <CardContent className="p-4 text-center">
                    <MemoryStick className="h-8 w-8 text-yellow-400 mx-auto mb-2" />
                    <div className={`text-2xl font-bold ${getScoreColor(systemData.performance_scores.ram_score)}`}>
                      {systemData.performance_scores.ram_score}
                    </div>
                    <div className="text-xs text-gray-400">RAM Score</div>
                  </CardContent>
                </Card>

                <Card className="gaming-card border-cyan-400/20">
                  <CardContent className="p-4 text-center">
                    <HardDrive className="h-8 w-8 text-cyan-400 mx-auto mb-2" />
                    <div className={`text-2xl font-bold ${getScoreColor(systemData.performance_scores.storage_score)}`}>
                      {systemData.performance_scores.storage_score}
                    </div>
                    <div className="text-xs text-gray-400">Storage Score</div>
                  </CardContent>
                </Card>
              </div>
            </motion.div>
          )}
        </div>

        {systemData && (
          <>
            {/* Overall Performance */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="mb-8"
            >
              <Card className="gaming-card border-purple-400/20">
                <CardHeader>
                  <CardTitle className="text-white flex items-center justify-between">
                    <span className="flex items-center">
                      <TrendingUp className="h-5 w-5 mr-2 text-purple-400" />
                      Genel Performans Skoru
                    </span>
                    <span className={`text-3xl font-bold ${getScoreColor(systemData.performance_scores.overall_score)}`}>
                      {systemData.performance_scores.overall_score}/100
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Progress 
                    value={systemData.performance_scores.overall_score} 
                    className="h-4 mb-4"
                  />
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {Object.entries(systemData.performance_scores).map(([key, value]) => {
                      if (key === 'overall_score') return null;
                      return (
                        <div key={key} className="text-center">
                          <div className="text-sm text-gray-400 capitalize">
                            {key.replace('_score', '').toUpperCase()}
                          </div>
                          <div className={`text-lg font-bold ${getScoreColor(value as number)}`}>
                            {value}%
                          </div>
                          <Progress value={value as number} className="h-2 mt-1" />
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Current Specifications */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8"
            >
              <Card className="gaming-card border-blue-400/20">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <Cpu className="h-5 w-5 mr-2 text-blue-400" />
                    Mevcut Sistem Özellikleri
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {Object.entries(systemData.current_specs).map(([key, value]) => (
                      <div key={key} className="flex justify-between items-center py-2 border-b border-gray-700/50">
                        <span className="text-gray-400 capitalize">
                          {key.replace('_', ' ').toUpperCase()}:
                        </span>
                        <span className="text-white font-medium">{value}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="gaming-card border-green-400/20">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <Zap className="h-5 w-5 mr-2 text-green-400" />
                    Gaming Performansı (FPS)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {Object.entries(systemData.gaming_performance).map(([game, fps]) => (
                      <div key={game} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-400 uppercase">{game}:</span>
                          <span className="text-white font-bold">{fps} FPS</span>
                        </div>
                        <Progress 
                          value={Math.min((fps as number) / 5, 100)} 
                          className="h-2"
                        />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Bottlenecks & Upgrade Priority */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8"
            >
              <Card className="gaming-card border-red-400/20">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <AlertTriangle className="h-5 w-5 mr-2 text-red-400" />
                    Tespit Edilen Bottleneck'ler
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {systemData.bottlenecks.length > 0 ? (
                      systemData.bottlenecks.map((bottleneck, index) => (
                        <div key={index} className={`p-3 rounded-lg border ${getSeverityColor(bottleneck.severity)}`}>
                          <div className="flex justify-between items-center">
                            <span className="font-semibold">{bottleneck.component}</span>
                            <Badge variant="outline" className={getSeverityColor(bottleneck.severity)}>
                              {bottleneck.severity.toUpperCase()}
                            </Badge>
                          </div>
                          <div className="text-sm mt-1">
                            Performans etkisi: %{bottleneck.impact}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-4 text-green-400">
                        <CheckCircle className="h-8 w-8 mx-auto mb-2" />
                        Önemli bottleneck tespit edilmedi!
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card className="gaming-card border-yellow-400/20">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <TrendingUp className="h-5 w-5 mr-2 text-yellow-400" />
                    Upgrade Öncelik Sırası
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {systemData.upgrade_priority.map((item, index) => (
                      <div key={index} className="p-3 rounded-lg bg-yellow-900/20 border border-yellow-400/30">
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-semibold text-white">
                            #{item.priority} - {item.component}
                          </span>
                          <span className="text-yellow-400 font-bold">
                            +%{item.expected_gain}
                          </span>
                        </div>
                        <Progress value={item.expected_gain * 3} className="h-2" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* System Monitoring */}
            {systemData.temperature_data && systemData.power_consumption && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.7 }}
                className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8"
              >
                <Card className="gaming-card border-orange-400/20">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center">
                      <Thermometer className="h-5 w-5 mr-2 text-orange-400" />
                      Sıcaklık Durumu
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400">CPU Sıcaklığı:</span>
                        <span className="text-white font-bold">
                          {systemData.temperature_data.cpu_temp}°C
                        </span>
                      </div>
                      <Progress value={(systemData.temperature_data.cpu_temp / 85) * 100} className="h-2" />
                      
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400">GPU Sıcaklığı:</span>
                        <span className="text-white font-bold">
                          {systemData.temperature_data.gpu_temp}°C
                        </span>
                      </div>
                      <Progress value={(systemData.temperature_data.gpu_temp / 85) * 100} className="h-2" />
                      
                      <Badge className={
                        systemData.temperature_data.status === 'normal' 
                          ? 'bg-green-900/20 text-green-400 border-green-400/30'
                          : 'bg-red-900/20 text-red-400 border-red-400/30'
                      }>
                        {systemData.temperature_data.status === 'normal' ? 'Normal' : 'Yüksek'}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>

                <Card className="gaming-card border-purple-400/20">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center">
                      <Zap className="h-5 w-5 mr-2 text-purple-400" />
                      Güç Tüketimi
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400">Mevcut Tüketim:</span>
                        <span className="text-white font-bold">
                          {systemData.power_consumption.current}W
                        </span>
                      </div>
                      <Progress value={(systemData.power_consumption.current / systemData.power_consumption.max) * 100} className="h-2" />
                      
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400">Maximum Kapasite:</span>
                        <span className="text-white font-bold">
                          {systemData.power_consumption.max}W
                        </span>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400">Verimlilik:</span>
                        <span className="text-green-400 font-bold">
                          %{systemData.power_consumption.efficiency}
                        </span>
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
              className="text-center"
            >
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/upgrade-center/simulator">
                  <Button className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3">
                    Upgrade Simülatörü
                  </Button>
                </Link>
                <Link href="/upgrade-center/recommendations">
                  <Button variant="outline" className="border-green-400 text-green-400 hover:bg-green-400 hover:text-black px-8 py-3">
                    Gaming Önerileri
                  </Button>
                </Link>
                <Link href="/upgrade-center/calculator">
                  <Button variant="outline" className="border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-black px-8 py-3">
                    Fiyat Hesapla
                  </Button>
                </Link>
              </div>
            </motion.div>
          </>
        )}
      </div>
    </div>
  );
}
