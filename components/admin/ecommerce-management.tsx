
'use client';

import { useState, useEffect } from 'react';
import { 
  ShoppingBag, 
  Package, 
  RefreshCw, 
  TrendingUp, 
  AlertCircle, 
  CheckCircle, 
  Clock,
  Database,
  ExternalLink
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';

interface SyncResult {
  success: number;
  failed: number;
  results: Array<{
    action: 'created' | 'updated' | 'failed';
    product?: any;
    error?: string;
  }>;
}

interface SyncStatus {
  status: string;
  lastSync: string;
}

export default function EcommerceManagement() {
  const [syncStatus, setSyncStatus] = useState<SyncStatus | null>(null);
  const [syncResult, setSyncResult] = useState<SyncResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  const fetchSyncStatus = async () => {
    try {
      const response = await fetch('/api/ikas/sync');
      const result = await response.json();
      if (result.success) {
        setSyncStatus(result.data);
      }
    } catch (error) {
      console.error('Sync status fetch error:', error);
    }
  };

  useEffect(() => {
    fetchSyncStatus();
  }, []);

  const syncProductsToIkas = async () => {
    setIsSyncing(true);
    try {
      const response = await fetch('/api/ikas/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'sync_products' }),
      });

      const result = await response.json();
      if (result.success) {
        setSyncResult(result.data);
        await fetchSyncStatus();
        toast.success('Ürünler başarıyla İkas\'a aktarıldı!');
      } else {
        toast.error(result.error || 'Senkronizasyon başarısız');
      }
    } catch (error) {
      toast.error('Senkronizasyon sırasında hata oluştu');
    } finally {
      setIsSyncing(false);
    }
  };

  const syncUserToIkas = async () => {
    setIsLoading(true);
    try {
      // Example sync - in real implementation this would be dynamic
      const response = await fetch('/api/ikas/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action: 'sync_user',
          gizmoUserId: 'test-user-id',
          userEmail: 'test@venusespor.com',
          userName: 'Test User'
        }),
      });

      const result = await response.json();
      if (result.success) {
        toast.success('Kullanıcı İkas\'a aktarıldı!');
      } else {
        toast.error(result.error || 'Kullanıcı aktarımı başarısız');
      }
    } catch (error) {
      toast.error('Kullanıcı aktarımı sırasında hata oluştu');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Bilinmiyor';
    return new Date(dateString).toLocaleString('tr-TR');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">E-ticaret Yönetimi</h2>
          <p className="text-gray-400">İkas entegrasyonu ve ürün senkronizasyonu</p>
        </div>
        <Badge variant="outline" className="bg-purple-900/20 text-purple-300 border-purple-500">
          <Database className="h-3 w-3 mr-1" />
          İkas Entegrasyonu
        </Badge>
      </div>

      <Tabs defaultValue="sync" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="sync">Senkronizasyon</TabsTrigger>
          <TabsTrigger value="products">Ürün Yönetimi</TabsTrigger>
          <TabsTrigger value="orders">Sipariş Yönetimi</TabsTrigger>
        </TabsList>

        <TabsContent value="sync" className="space-y-6">
          {/* Sync Status Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="gaming-card">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-300">
                  Sync Durumu
                </CardTitle>
                <CheckCircle className="h-4 w-4 text-green-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">
                  {syncStatus?.status === 'active' ? 'Aktif' : 'Pasif'}
                </div>
                <p className="text-xs text-gray-500">
                  Son güncelleme: {formatDate(syncStatus?.lastSync)}
                </p>
              </CardContent>
            </Card>

            <Card className="gaming-card">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-300">
                  Başarılı Sync
                </CardTitle>
                <TrendingUp className="h-4 w-4 text-blue-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-400">
                  {syncResult?.success || 0}
                </div>
                <p className="text-xs text-gray-500">
                  Son senkronizasyonda
                </p>
              </CardContent>
            </Card>

            <Card className="gaming-card">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-300">
                  Başarısız Sync
                </CardTitle>
                <AlertCircle className="h-4 w-4 text-red-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-400">
                  {syncResult?.failed || 0}
                </div>
                <p className="text-xs text-gray-500">
                  Son senkronizasyonda
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Sync Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="gaming-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <Package className="h-5 w-5" />
                  Ürün Senkronizasyonu
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-400 text-sm">
                  Hardware inventory'den İkas mağazasına ürün aktarımı yapın. 
                  Tüm kategoriler (CPU, GPU, RAM, Storage, Motherboard, PSU) aktarılacak.
                </p>
                <Button 
                  onClick={syncProductsToIkas}
                  disabled={isSyncing}
                  className="w-full bg-purple-600 hover:bg-purple-700"
                >
                  {isSyncing ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Senkronize Ediliyor...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Ürünleri İkas'a Aktar
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            <Card className="gaming-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <ExternalLink className="h-5 w-5" />
                  Kullanıcı Senkronizasyonu
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-400 text-sm">
                  Gizmo kullanıcılarını İkas müşteri sistemine aktarın. 
                  Bu demo amaçlı test kullanıcısı aktarımıdır.
                </p>
                <Button 
                  onClick={syncUserToIkas}
                  disabled={isLoading}
                  variant="outline"
                  className="w-full"
                >
                  {isLoading ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Aktarılıyor...
                    </>
                  ) : (
                    <>
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Test Kullanıcı Aktar
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Sync Results */}
          {syncResult && (
            <Card className="gaming-card">
              <CardHeader>
                <CardTitle className="text-white">Son Senkronizasyon Sonuçları</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Toplam İşlem:</span>
                    <Badge>{syncResult.success + syncResult.failed}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Başarılı:</span>
                    <Badge variant="default" className="bg-green-600">
                      {syncResult.success}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Başarısız:</span>
                    <Badge variant="destructive">{syncResult.failed}</Badge>
                  </div>
                </div>

                {syncResult.results.length > 0 && (
                  <div className="mt-4 space-y-2">
                    <h4 className="font-medium text-white">Detaylı Sonuçlar:</h4>
                    <div className="max-h-40 overflow-y-auto space-y-1">
                      {syncResult.results.map((result, index) => (
                        <div key={index} className="flex items-center justify-between text-sm p-2 bg-gray-800 rounded">
                          <span className="text-gray-300">
                            {result.product?.name || `İşlem ${index + 1}`}
                          </span>
                          <Badge 
                            variant={result.action === 'failed' ? 'destructive' : 'default'}
                            className={result.action === 'created' ? 'bg-green-600' : result.action === 'updated' ? 'bg-blue-600' : ''}
                          >
                            {result.action === 'created' ? 'Oluşturuldu' : 
                             result.action === 'updated' ? 'Güncellendi' : 'Başarısız'}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="products">
          <Card className="gaming-card">
            <CardHeader>
              <CardTitle className="text-white">Ürün Yönetimi</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-400">Ürün yönetimi özellikleri geliştirme aşamasında...</p>
                <p className="text-gray-500 text-sm mt-2">
                  İkas dashboard'unu kullanarak ürünleri yönetebilirsiniz.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="orders">
          <Card className="gaming-card">
            <CardHeader>
              <CardTitle className="text-white">Sipariş Yönetimi</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <ShoppingBag className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-400">Sipariş yönetimi özellikleri geliştirme aşamasında...</p>
                <p className="text-gray-500 text-sm mt-2">
                  Webhook entegrasyonu ile siparişler otomatik olarak işlenecek.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
