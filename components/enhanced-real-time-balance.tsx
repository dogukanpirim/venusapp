
'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  CreditCard, 
  DollarSign, 
  RefreshCw, 
  TrendingUp, 
  Clock,
  Activity,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { toast } from 'sonner';

interface BalanceData {
  balance: number;
  credit: number;
  total: number;
  lastTransaction?: {
    amount: number;
    type: string;
    date: string;
  };
  sessionActive?: boolean;
  sessionDuration?: number;
  sessionCost?: number;
}

interface EnhancedRealTimeBalanceProps {
  username: string;
  showFullWidget?: boolean;
  refreshInterval?: number;
}

export function EnhancedRealTimeBalance({ 
  username, 
  showFullWidget = false, 
  refreshInterval = 30000 
}: EnhancedRealTimeBalanceProps) {
  const [balanceData, setBalanceData] = useState<BalanceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

  const fetchBalance = useCallback(async () => {
    try {
      console.log('Fetching balance for user:', username);
      const response = await fetch(`/api/gizmo/balance/${username}`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const result = await response.json();
      console.log('Balance API response:', result);
      
      if (result.success) {
        setBalanceData(result.data);
        setError(null);
        setLastRefresh(new Date());
      } else {
        throw new Error(result.error || 'Failed to fetch balance');
      }
    } catch (err) {
      console.error('Balance fetch error:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch balance');
      toast.error('Bakiye güncellenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  }, [username]);

  useEffect(() => {
    fetchBalance();
    
    if (refreshInterval > 0) {
      const interval = setInterval(fetchBalance, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [fetchBalance, refreshInterval]);

  const handleRefresh = () => {
    setLoading(true);
    fetchBalance();
  };

  const getBalanceStatus = () => {
    if (!balanceData) return 'unknown';
    if (balanceData.total <= 0) return 'low';
    if (balanceData.total < 10) return 'warning';
    return 'good';
  };

  const getStatusIcon = () => {
    const status = getBalanceStatus();
    switch (status) {
      case 'good':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'warning':
        return <AlertCircle className="h-4 w-4 text-yellow-600" />;
      case 'low':
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Activity className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusBadge = () => {
    const status = getBalanceStatus();
    switch (status) {
      case 'good':
        return <Badge className="bg-green-100 text-green-800">Yeterli</Badge>;
      case 'warning':
        return <Badge className="bg-yellow-100 text-yellow-800">Düşük</Badge>;
      case 'low':
        return <Badge className="bg-red-100 text-red-800">Yetersiz</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">Bilinmiyor</Badge>;
    }
  };

  if (loading && !balanceData) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center space-x-2">
            <RefreshCw className="h-4 w-4 animate-spin" />
            <span>Bakiye yükleniyor...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error && !balanceData) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-red-600">
              <AlertCircle className="h-4 w-4" />
              <span>Bakiye yüklenemedi</span>
            </div>
            <Button variant="outline" size="sm" onClick={handleRefresh}>
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!showFullWidget) {
    // Compact widget
    return (
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <CreditCard className="h-4 w-4 text-blue-600" />
              <span className="font-medium">
                {balanceData ? formatCurrency(balanceData.total) : formatCurrency(0)}
              </span>
              {getStatusIcon()}
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleRefresh}
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Full widget
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center space-x-2">
              <CreditCard className="h-5 w-5" />
              <span>Hesap Bakiyesi</span>
            </CardTitle>
            <CardDescription>
              {username} - {lastRefresh ? `Son güncelleme: ${lastRefresh.toLocaleTimeString('tr-TR')}` : 'Güncelleniyor...'}
            </CardDescription>
          </div>
          <div className="flex items-center space-x-2">
            {getStatusBadge()}
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleRefresh}
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Yenile
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {balanceData && (
          <>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="text-center p-3 border rounded-lg">
                <div className="text-sm text-muted-foreground mb-1">Bakiye</div>
                <div className="text-lg font-bold text-green-600">
                  {formatCurrency(balanceData.balance)}
                </div>
              </div>
              
              <div className="text-center p-3 border rounded-lg">
                <div className="text-sm text-muted-foreground mb-1">Kredi</div>
                <div className="text-lg font-bold text-blue-600">
                  {formatCurrency(balanceData.credit)}
                </div>
              </div>
              
              <div className="text-center p-3 border rounded-lg">
                <div className="text-sm text-muted-foreground mb-1">Toplam</div>
                <div className="text-xl font-bold">
                  {formatCurrency(balanceData.total)}
                </div>
              </div>
            </div>

            {balanceData.sessionActive && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Activity className="h-4 w-4 text-blue-600" />
                    <span className="font-medium text-blue-800">Aktif Oturum</span>
                  </div>
                  <Badge className="bg-blue-100 text-blue-800">
                    {balanceData.sessionDuration ? `${Math.floor(balanceData.sessionDuration / 60)} dk` : 'Aktif'}
                  </Badge>
                </div>
                {balanceData.sessionCost && (
                  <div className="mt-2 text-sm text-blue-600">
                    Mevcut oturum maliyeti: {formatCurrency(balanceData.sessionCost)}
                  </div>
                )}
              </div>
            )}

            {balanceData.lastTransaction && (
              <div className="p-3 border rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="h-4 w-4 text-gray-600" />
                    <span className="font-medium">Son İşlem</span>
                  </div>
                  <div className="text-right">
                    <div className={`font-medium ${balanceData.lastTransaction.amount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {balanceData.lastTransaction.amount >= 0 ? '+' : ''}{formatCurrency(balanceData.lastTransaction.amount)}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {balanceData.lastTransaction.type}
                    </div>
                  </div>
                </div>
                <div className="text-xs text-muted-foreground mt-1 flex items-center">
                  <Clock className="h-3 w-3 mr-1" />
                  {new Date(balanceData.lastTransaction.date).toLocaleString('tr-TR')}
                </div>
              </div>
            )}
          </>
        )}

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center space-x-2 text-red-600">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm">{error}</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
