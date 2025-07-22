
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  RefreshCw, 
  Monitor, 
  User, 
  Clock, 
  Wifi,
  WifiOff,
  CheckCircle,
  XCircle,
  AlertCircle,
  Activity,
  Settings
} from 'lucide-react';
import { ClientDate } from '@/components/client-date';

interface HostData {
  id: number;
  number: number;
  name: string;
  hostGroupId: number | null;
  state: number; // 0 = Available, 1 = In Use
  isDeleted: boolean;
  modifiedTime: string | null;
  createdTime: string;
  // Additional fields that might come from session info
  currentUser?: {
    name: string;
    id: string;
  };
  sessionInfo?: {
    startTime: string;
    endTime: string;
    remainingTime: number;
  };
  lastActivity?: string;
  groupName?: string;
}

interface ApiResponse {
  success: boolean;
  data?: HostData[];
  error?: string;
  fromCache?: boolean;
  retryCount?: number;
}

export default function PCDurumuPage() {
  const [pcData, setPcData] = useState<HostData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(30000); // 30 saniye
  const [filterStatus, setFilterStatus] = useState<'all' | 'online' | 'offline'>('all');

  const fetchPCData = async (showLoader = true) => {
    if (showLoader) setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/gizmo/hosts', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: ApiResponse = await response.json();
      
      if (result.success && result.data) {
        // Gizmo API'den gelen veri formatını kontrol et
        let hostData: HostData[] = [];
        
        if (Array.isArray(result.data)) {
          // Eğer data zaten array ise direkt kullan
          hostData = result.data;
        } else if (result.data && typeof result.data === 'object') {
          // Gizmo API'den gelen gerçek format: data.result array'i
          const dataObj = result.data as any;
          if (dataObj.result && Array.isArray(dataObj.result)) {
            // Sadece silinmemiş host'ları al
            hostData = dataObj.result.filter((host: any) => !host.isDeleted);
          } else if (dataObj.hosts && Array.isArray(dataObj.hosts)) {
            hostData = dataObj.hosts;
          } else if (dataObj.data && Array.isArray(dataObj.data)) {
            hostData = dataObj.data;
          } else {
            // Object içindeki tüm değerleri kontrol et
            const values = Object.values(dataObj);
            const arrayValue = values.find(value => Array.isArray(value));
            if (arrayValue) {
              hostData = arrayValue as HostData[];
            }
          }
        }
        
        setPcData(hostData);
        setLastUpdate(new Date());
      } else {
        setError(result.error || 'Veri alınırken hata oluştu');
      }
    } catch (err) {
      console.error('PC durumu fetch hatası:', err);
      setError(err instanceof Error ? err.message : 'Bilinmeyen hata');
    } finally {
      if (showLoader) setLoading(false);
    }
  };

  // Auto-refresh effect
  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(() => {
        fetchPCData(false); // Arka planda güncellemeler için loader gösterme
      }, refreshInterval);

      return () => clearInterval(interval);
    }
  }, [autoRefresh, refreshInterval]);

  // Initial fetch
  useEffect(() => {
    fetchPCData();
  }, []);

  const getStatusColor = (state: number) => {
    // state: 0 = Available (online), 1 = In Use (online)
    // Tüm aktif bilgisayarlar (isDeleted: false) online kabul edilir
    if (state === 1) return 'bg-green-500'; // Kullanımda
    if (state === 0) return 'bg-yellow-500'; // Müsait
    return 'bg-gray-500'; // Bilinmiyor
  };

  const getStatusText = (state: number) => {
    // state: 0 = Available (online), 1 = In Use (online)
    if (state === 1) return 'Kullanımda';
    if (state === 0) return 'Müsait';
    return 'Bilinmiyor';
  };

  const getStatusIcon = (state: number) => {
    // state: 0 = Available (online), 1 = In Use (online)
    if (state === 1) return <User className="h-4 w-4" />;
    if (state === 0) return <CheckCircle className="h-4 w-4" />;
    return <AlertCircle className="h-4 w-4" />;
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}s ${minutes}dk`;
  };

  const filteredPCs = (pcData || []).filter(pc => {
    if (filterStatus === 'all') return true;
    if (filterStatus === 'online') return pc?.state === 1; // Kullanımda olanlar
    if (filterStatus === 'offline') return pc?.state === 0; // Müsait olanlar
    return true;
  });

  // Tüm aktif bilgisayarlar (isDeleted: false) online kabul edilir
  const onlineCount = (pcData || []).length; // Tüm aktif bilgisayarlar
  const inUseCount = (pcData || []).filter(pc => pc?.state === 1).length; // Kullanımda
  const availableCount = (pcData || []).filter(pc => pc?.state === 0).length; // Müsait

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
              PC Durumu
            </h1>
            <p className="text-gray-400">
              Gerçek zamanlı bilgisayar durumu ve kullanım bilgileri
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-sm text-gray-400">
              <Clock className="h-4 w-4" />
              <span>Son güncelleme: </span>
              <ClientDate date={lastUpdate} />
            </div>
            <Button 
              onClick={() => fetchPCData()} 
              disabled={loading}
              variant="outline"
              size="sm"
            >
              {loading ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
              Yenile
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-r from-blue-600 to-blue-700 border-blue-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm font-medium">Toplam PC</p>
                  <p className="text-2xl font-bold text-white">{pcData?.length || 0}</p>
                </div>
                <Monitor className="h-8 w-8 text-blue-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-green-600 to-green-700 border-green-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm font-medium">Çevrimiçi</p>
                  <p className="text-2xl font-bold text-white">{onlineCount}</p>
                </div>
                <Wifi className="h-8 w-8 text-green-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-yellow-600 to-yellow-700 border-yellow-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-yellow-100 text-sm font-medium">Kullanımda</p>
                  <p className="text-2xl font-bold text-white">{inUseCount}</p>
                </div>
                <User className="h-8 w-8 text-yellow-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-purple-600 to-purple-700 border-purple-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm font-medium">Müsait</p>
                  <p className="text-2xl font-bold text-white">{availableCount}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-purple-200" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Controls */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 space-y-4 md:space-y-0">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium">Filtrele:</span>
              <Tabs value={filterStatus} onValueChange={(value) => setFilterStatus(value as any)}>
                <TabsList className="bg-black/20">
                  <TabsTrigger value="all">Tümü</TabsTrigger>
                  <TabsTrigger value="online">Kullanımda</TabsTrigger>
                  <TabsTrigger value="offline">Müsait</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium">Otomatik Yenile:</span>
              <Button
                variant={autoRefresh ? "default" : "outline"}
                size="sm"
                onClick={() => setAutoRefresh(!autoRefresh)}
              >
                <Activity className="h-4 w-4 mr-1" />
                {autoRefresh ? "Açık" : "Kapalı"}
              </Button>
            </div>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <Card className="mb-6 border-red-500 bg-red-900/20">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2 text-red-400">
                <XCircle className="h-5 w-5" />
                <span>Hata: {error}</span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* PC Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredPCs.map((pc) => (
            <Card key={pc.id} className="bg-black/40 border-gray-700 hover:border-purple-500/50 transition-all duration-300">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-semibold text-white">
                    {pc.name || `PC-${pc.id}`}
                  </CardTitle>
                  <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full ${getStatusColor(pc.state)}`} />
                    <Badge 
                      variant={pc.state === 1 ? "default" : "secondary"}
                      className="text-xs"
                    >
                      {getStatusText(pc.state)}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {/* PC Number */}
                  <div className="flex items-center space-x-2 text-sm text-gray-400">
                    <Settings className="h-4 w-4" />
                    <span>PC No: {pc.number}</span>
                  </div>

                  {/* Current User */}
                  {pc.currentUser && (
                    <div className="flex items-center space-x-2 text-sm">
                      <User className="h-4 w-4 text-blue-400" />
                      <span className="text-blue-300">{pc.currentUser.name}</span>
                    </div>
                  )}

                  {/* Session Info */}
                  {pc.sessionInfo && (
                    <div className="bg-gray-800/50 rounded-lg p-3 space-y-2">
                      <div className="flex items-center space-x-2 text-sm">
                        <Clock className="h-4 w-4 text-green-400" />
                        <span className="text-green-300">
                          Kalan: {formatTime(pc.sessionInfo.remainingTime)}
                        </span>
                      </div>
                      <div className="text-xs text-gray-400">
                        Başlangıç: {new Date(pc.sessionInfo.startTime).toLocaleString('tr-TR')}
                      </div>
                    </div>
                  )}

                  {/* Group Info */}
                  {pc.hostGroupId && (
                    <div className="flex items-center space-x-2 text-sm text-purple-400">
                      <Monitor className="h-4 w-4" />
                      <span>Grup ID: {pc.hostGroupId}</span>
                    </div>
                  )}

                  {/* Last Activity */}
                  {pc.modifiedTime && (
                    <div className="text-xs text-gray-500">
                      Son değişiklik: {new Date(pc.modifiedTime).toLocaleString('tr-TR')}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {filteredPCs.length === 0 && !loading && (
          <Card className="text-center py-12">
            <CardContent>
              <Monitor className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-300 mb-2">
                {filterStatus === 'all' ? 'PC bulunamadı' : `${filterStatus} PC bulunamadı`}
              </h3>
              <p className="text-gray-500">
                Seçili filtreye uygun PC bulunmuyor.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
