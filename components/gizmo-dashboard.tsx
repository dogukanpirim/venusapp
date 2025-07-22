
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Monitor, 
  Users, 
  Activity, 
  AlertTriangle, 
  CheckCircle,
  Clock,
  DollarSign,
  RefreshCw,
  Wifi,
  WifiOff
} from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useToast } from '@/components/ui/use-toast';
import { ClientDate } from './client-date';

interface GizmoUser {
  id: string;
  username: string;
  email?: string;
  balance: number;
  isOnline: boolean;
  currentHostId?: string;
  sessionStart?: string;
}

interface GizmoHost {
  id: string;
  name: string;
  isOnline: boolean;
  status: 'available' | 'occupied' | 'maintenance' | 'offline';
  currentUserId?: string;
  sessionStart?: string;
}

interface TestResult {
  endpoint: string;
  status: number | string;
  statusText: string;
  success: boolean;
}

interface GizmoDashboardProps {
  className?: string;
}

export function GizmoDashboard({ className }: GizmoDashboardProps) {
  const [users, setUsers] = useState<GizmoUser[]>([]);
  const [hosts, setHosts] = useState<GizmoHost[]>([]);
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const { data: session } = useSession();
  const { toast } = useToast();

  const fetchData = async (showToast = false) => {
    if (!session?.user) return;

    try {
      setIsLoading(true);

      // Fetch users
      const usersResponse = await fetch('/api/gizmo/users');
      const usersData = usersResponse.ok ? await usersResponse.json() : { error: 'Failed to fetch users' };

      // Fetch hosts
      const hostsResponse = await fetch('/api/gizmo/hosts');
      const hostsData = hostsResponse.ok ? await hostsResponse.json() : { error: 'Failed to fetch hosts' };

      // Fetch test results
      const testResponse = await fetch('/api/gizmo/test');
      const testData = testResponse.ok ? await testResponse.json() : { tests: [] };

      if (usersData.error || hostsData.error) {
        // Handle API errors gracefully
        if (usersData.error) {
          console.error('Users API Error:', usersData.error);
        }
        if (hostsData.error) {
          console.error('Hosts API Error:', hostsData.error);
        }
        
        if (showToast) {
          toast({
            title: "API Bağlantı Hatası",
            description: "Gizmo API'sine bağlanırken bir hata oluştu. Lütfen bağlantı ayarlarını kontrol edin.",
            variant: "destructive",
          });
        }
      } else {
        // Use real API data only
        setUsers(usersData.users || []);
        setHosts(hostsData.hosts || []);
      }

      setTestResults(testData.tests || []);
      setLastUpdated(new Date());

      if (showToast) {
        toast({
          title: "Veriler Güncellendi",
          description: "Gizmo verileri başarıyla güncellendi.",
        });
      }
    } catch (error) {
      console.error('Dashboard fetch error:', error);
      if (showToast) {
        toast({
          title: "Hata",
          description: "Veriler güncellenirken bir hata oluştu.",
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [session]);

  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      fetchData();
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, [autoRefresh, session]);

  const handleRefresh = () => {
    fetchData(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-green-500';
      case 'occupied': return 'bg-blue-500';
      case 'maintenance': return 'bg-yellow-500';
      case 'offline': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'available': return 'Müsait';
      case 'occupied': return 'Kullanımda';
      case 'maintenance': return 'Bakım';
      case 'offline': return 'Çevrimdışı';
      default: return 'Bilinmiyor';
    }
  };

  const formatSessionTime = (sessionStart: string) => {
    const start = new Date(sessionStart);
    const now = new Date();
    const diffMs = now.getTime() - start.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const hours = Math.floor(diffMins / 60);
    const minutes = diffMins % 60;
    
    if (hours > 0) {
      return `${hours}s ${minutes}d`;
    }
    return `${minutes}d`;
  };

  const onlineUsers = users.filter(user => user.isOnline).length;
  const availableHosts = hosts.filter(host => host.status === 'available').length;
  const occupiedHosts = hosts.filter(host => host.status === 'occupied').length;
  const totalBalance = users.reduce((sum, user) => sum + user.balance, 0);

  if (!session?.user) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground">Gizmo Dashboard'a erişmek için giriş yapmalısınız.</p>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Gizmo Dashboard</h2>
          <p className="text-muted-foreground">
            Real-time sistem durumu ve kullanıcı bilgileri
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={autoRefresh ? 'bg-green-500/10 text-green-500' : ''}
          >
            <Activity className="h-4 w-4 mr-2" />
            {autoRefresh ? 'Otomatik Güncelleme' : 'Manuel Güncelleme'}
          </Button>
          <Button onClick={handleRefresh} disabled={isLoading} size="sm">
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Yenile
          </Button>
        </div>
      </div>

      {/* Connection Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Wifi className="h-5 w-5" />
            <span>API Bağlantı Durumu</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {testResults.map((test) => (
              <div key={test.endpoint} className="flex items-center space-x-2">
                {test.success ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <AlertTriangle className="h-4 w-4 text-red-500" />
                )}
                <span className="text-sm">
                  {test.endpoint}: {test.status}
                </span>
              </div>
            ))}
          </div>
          {lastUpdated && (
            <p className="text-xs text-muted-foreground mt-2">
              Son güncelleme: <ClientDate date={lastUpdated} format="time" />
            </p>
          )}
        </CardContent>
      </Card>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Çevrimiçi Kullanıcılar</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{onlineUsers}</div>
            <p className="text-xs text-muted-foreground">
              {users.length} toplam kullanıcı
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Müsait PC'ler</CardTitle>
            <Monitor className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{availableHosts}</div>
            <p className="text-xs text-muted-foreground">
              {hosts.length} toplam PC
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Kullanımda</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{occupiedHosts}</div>
            <p className="text-xs text-muted-foreground">
              aktif oturum
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Toplam Bakiye</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₺{totalBalance.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              kullanıcı bakiyeleri
            </p>
          </CardContent>
        </Card>
      </div>

      {/* PC Status Grid */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Monitor className="h-5 w-5" />
            <span>PC Durumu</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {hosts.map((host) => (
              <div key={host.id} className="border rounded-lg p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">{host.name}</h4>
                  <Badge className={getStatusColor(host.status)}>
                    {getStatusText(host.status)}
                  </Badge>
                </div>
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  {host.isOnline ? (
                    <Wifi className="h-4 w-4 text-green-500" />
                  ) : (
                    <WifiOff className="h-4 w-4 text-red-500" />
                  )}
                  <span>{host.isOnline ? 'Çevrimiçi' : 'Çevrimdışı'}</span>
                </div>
                {host.currentUserId && host.sessionStart && (
                  <div className="text-sm space-y-1">
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4" />
                      <span>Süre: {formatSessionTime(host.sessionStart)}</span>
                    </div>
                    <div className="text-muted-foreground">
                      Kullanıcı ID: {host.currentUserId}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Users List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="h-5 w-5" />
            <span>Kullanıcılar</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {users.map((user) => (
              <div key={user.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${user.isOnline ? 'bg-green-500' : 'bg-gray-500'}`} />
                  <div>
                    <p className="font-medium">{user.username}</p>
                    {user.email && (
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium">₺{user.balance.toFixed(2)}</p>
                  {user.isOnline && user.currentHostId && (
                    <p className="text-sm text-muted-foreground">
                      {user.currentHostId}
                    </p>
                  )}
                  {user.sessionStart && (
                    <p className="text-xs text-muted-foreground">
                      {formatSessionTime(user.sessionStart)}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
