
'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Wallet, RefreshCw, AlertCircle, TrendingUp } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

interface BalanceData {
  userId: number;
  username: string;
  currentBalance: number;
  availableBalance: number;
  depositAmount: number;
  timeBalance: number;
  currency: string;
  lastUpdated: string;
  accountState: string;
  membershipType: string;
  fullName: string;
  email: string | null;
  phoneNumber: string | null;
  registrationDate: string;
  isActive: boolean;
  isEnabled: boolean;
}

interface RealTimeBalanceProps {
  username: string;
  initialBalance?: number;
  compact?: boolean;
}

export function RealTimeBalance({ username, initialBalance = 0, compact = false }: RealTimeBalanceProps) {
  const [balance, setBalance] = useState<BalanceData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  const fetchBalance = useCallback(async (showToast = false) => {
    console.log('🔄 fetchBalance called with showToast:', showToast, 'username:', username);
    
    if (!username) {
      console.log('❌ No username provided, returning early');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const apiUrl = `/api/gizmo/balance/${username}`;
      console.log('📡 Making API request to:', apiUrl);
      
      const response = await fetch(apiUrl);
      console.log('📡 API response status:', response.status);
      
      const data = await response.json();
      console.log('📡 API response data:', data);
      
      if (data.success) {
        setBalance(data.balance);
        setLastUpdate(new Date());
        console.log('✅ Balance updated successfully:', data.balance);
        
        if (showToast) {
          toast.success('Bakiye güncellendi!');
        }
      } else {
        setError(data.error || 'Bakiye bilgisi alınamadı');
        console.log('❌ API returned error:', data.error);
        
        if (showToast) {
          toast.error(data.error || 'Bakiye bilgisi alınamadı');
        }
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Bilinmeyen hata';
      setError(errorMessage);
      console.log('❌ Fetch error:', errorMessage);
      
      if (showToast) {
        toast.error('Bakiye bilgisi alınırken hata oluştu');
      }
    } finally {
      setLoading(false);
      console.log('🔄 fetchBalance completed');
    }
  }, [username]);

  // Initial fetch
  useEffect(() => {
    fetchBalance();
  }, [username, fetchBalance]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchBalance();
    }, 30000);

    return () => clearInterval(interval);
  }, [username, fetchBalance]);

  const handleRefresh = () => {
    console.log('🖱️ Refresh button clicked!');
    console.log('🔄 Calling fetchBalance with showToast=true');
    fetchBalance(true);
  };

  const getBalanceColor = (amount: number) => {
    if (amount > 50) return 'text-green-400';
    if (amount > 20) return 'text-yellow-400';
    if (amount > 0) return 'text-orange-400';
    return 'text-red-400';
  };

  const getBalanceIcon = (amount: number) => {
    if (amount > 0) return <TrendingUp className="h-4 w-4" />;
    return <Wallet className="h-4 w-4" />;
  };

  if (compact) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.2 }}
        className="flex items-center space-x-2"
      >
        <Badge variant="outline" className="flex items-center space-x-2">
          {getBalanceIcon(balance?.currentBalance || 0)}
          <span className={getBalanceColor(balance?.currentBalance || 0)}>
            {formatCurrency(balance?.currentBalance || 0)}
          </span>
          {loading && <RefreshCw className="h-3 w-3 animate-spin" />}
        </Badge>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={handleRefresh}
          disabled={loading}
          className="h-8 w-8 p-0"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
        </Button>
      </motion.div>
    );
  }

  return (
    <Card className="gaming-card">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Wallet className="h-5 w-5" />
            <span>Canlı Bakiye</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRefresh}
            disabled={loading}
            className="h-8 w-8 p-0"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </CardTitle>
        <CardDescription>
          Son güncelleme: {lastUpdate.toLocaleTimeString('tr-TR')}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error ? (
          <div className="flex items-center space-x-2 text-red-400">
            <AlertCircle className="h-4 w-4" />
            <span>{error}</span>
          </div>
        ) : balance ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-400">Mevcut Bakiye</p>
                <p className={`text-2xl font-bold ${getBalanceColor(balance.currentBalance)}`}>
                  {formatCurrency(balance.currentBalance)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Kullanılabilir Bakiye</p>
                <p className={`text-2xl font-bold ${getBalanceColor(balance.availableBalance)}`}>
                  {formatCurrency(balance.availableBalance)}
                </p>
              </div>
            </div>
            
            {balance.depositAmount > 0 && (
              <div className="p-3 rounded-lg bg-green-900/20 border border-green-700">
                <p className="text-sm text-green-400">Depozito</p>
                <p className="text-lg font-bold text-green-300">
                  {formatCurrency(balance.depositAmount)}
                </p>
              </div>
            )}
            
            {balance.timeBalance > 0 && (
              <div className="p-3 rounded-lg bg-blue-900/20 border border-blue-700">
                <p className="text-sm text-blue-400">Zaman Bakiyesi</p>
                <p className="text-lg font-bold text-blue-300">
                  {balance.timeBalance} dakika
                </p>
              </div>
            )}
            
            <div className="flex items-center justify-between text-sm text-gray-400">
              <span>Hesap Durumu</span>
              <Badge 
                variant={balance.accountState === 'ACTIVE' ? 'default' : 'secondary'}
                className={balance.accountState === 'ACTIVE' ? 'bg-green-900/50 text-green-200' : ''}
              >
                {balance.accountState}
              </Badge>
            </div>
            
            <div className="flex items-center justify-between text-sm text-gray-400">
              <span>Üyelik Türü</span>
              <Badge 
                variant="secondary"
                className={balance.membershipType === 'VIP' ? 'bg-yellow-900/50 text-yellow-200' : 'bg-blue-900/50 text-blue-200'}
              >
                {balance.membershipType}
              </Badge>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="h-6 w-6 animate-spin text-gray-400" />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
