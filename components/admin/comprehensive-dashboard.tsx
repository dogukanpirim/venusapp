
'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  Monitor, 
  HardDrive, 
  Activity, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle,
  Gamepad,
  DollarSign,
  Clock,
  Settings
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Import other admin components
import LiveMonitoring from './live-monitoring';
import HostManagement from './host-management';
import SessionManagement from './session-management';
import UserManagement from './user-management';
import ApplicationManagement from './application-management';
import BillingManagement from './billing-management';
import SystemConfiguration from './system-configuration';

interface DashboardStats {
  total_users: number;
  active_sessions: number;
  total_hosts: number;
  available_hosts: number;
  total_revenue: number;
  pending_payments: number;
  system_alerts: number;
  applications_installed: number;
}

export default function ComprehensiveDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    setLoading(true);
    try {
      // Mock comprehensive stats - in real app, this would fetch from multiple Gizmo API endpoints
      const mockStats: DashboardStats = {
        total_users: 1247,
        active_sessions: 23,
        total_hosts: 35,
        available_hosts: 12,
        total_revenue: 45780,
        pending_payments: 3420,
        system_alerts: 2,
        applications_installed: 156
      };
      
      setTimeout(() => {
        setStats(mockStats);
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400 mx-auto mb-4"></div>
          <p className="text-gray-300">Dashboard yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-white mb-2">
            <span className="text-purple-400">COMPREHENSIVE</span> ADMIN DASHBOARD
          </h1>
          <p className="text-gray-400">
            Complete Gizmo system management and monitoring
          </p>
        </motion.div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-4 lg:grid-cols-8 w-full mb-8">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="monitoring">Live Monitor</TabsTrigger>
            <TabsTrigger value="hosts">Hosts</TabsTrigger>
            <TabsTrigger value="sessions">Sessions</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="apps">Applications</TabsTrigger>
            <TabsTrigger value="billing">Billing</TabsTrigger>
            <TabsTrigger value="system">System</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview">
            {stats && (
              <div className="space-y-6">
                {/* Key Metrics */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
                >
                  <Card className="gaming-card border-blue-400/20">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-400">Total Users</p>
                          <p className="text-2xl font-bold text-white">{stats.total_users}</p>
                        </div>
                        <Users className="h-8 w-8 text-blue-400" />
                      </div>
                      <div className="mt-4">
                        <Progress value={75} className="h-2" />
                        <p className="text-xs text-gray-500 mt-1">75% capacity</p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="gaming-card border-green-400/20">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-400">Active Sessions</p>
                          <p className="text-2xl font-bold text-white">{stats.active_sessions}</p>
                        </div>
                        <Activity className="h-8 w-8 text-green-400" />
                      </div>
                      <div className="mt-4">
                        <Progress value={(stats.active_sessions / stats.total_hosts) * 100} className="h-2" />
                        <p className="text-xs text-gray-500 mt-1">
                          {stats.available_hosts} hosts available
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="gaming-card border-purple-400/20">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-400">Revenue Today</p>
                          <p className="text-2xl font-bold text-white">₺{stats.total_revenue.toLocaleString('tr-TR')}</p>
                        </div>
                        <DollarSign className="h-8 w-8 text-purple-400" />
                      </div>
                      <div className="mt-4">
                        <Progress value={85} className="h-2" />
                        <p className="text-xs text-gray-500 mt-1">₺{stats.pending_payments.toLocaleString('tr-TR')} pending</p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="gaming-card border-yellow-400/20">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-400">System Health</p>
                          <p className="text-2xl font-bold text-white">
                            {stats.system_alerts === 0 ? 'Good' : 'Alerts'}
                          </p>
                        </div>
                        {stats.system_alerts === 0 ? (
                          <CheckCircle className="h-8 w-8 text-green-400" />
                        ) : (
                          <AlertTriangle className="h-8 w-8 text-yellow-400" />
                        )}
                      </div>
                      <div className="mt-4">
                        {stats.system_alerts > 0 && (
                          <Badge variant="outline" className="border-yellow-400/50 text-yellow-400">
                            {stats.system_alerts} alerts
                          </Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                {/* Quick Actions */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.4 }}
                >
                  <Card className="gaming-card border-gray-400/20">
                    <CardHeader>
                      <CardTitle className="text-white">Quick Actions</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <Button 
                          onClick={() => setActiveTab('monitoring')}
                          className="bg-blue-600 hover:bg-blue-700 text-white"
                        >
                          <Monitor className="h-4 w-4 mr-2" />
                          Live Monitor
                        </Button>
                        <Button 
                          onClick={() => setActiveTab('hosts')}
                          className="bg-green-600 hover:bg-green-700 text-white"
                        >
                          <HardDrive className="h-4 w-4 mr-2" />
                          Host Control
                        </Button>
                        <Button 
                          onClick={() => setActiveTab('billing')}
                          className="bg-purple-600 hover:bg-purple-700 text-white"
                        >
                          <DollarSign className="h-4 w-4 mr-2" />
                          Billing
                        </Button>
                        <Button 
                          onClick={() => setActiveTab('system')}
                          className="bg-yellow-600 hover:bg-yellow-700 text-white"
                        >
                          <Settings className="h-4 w-4 mr-2" />
                          System Config
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                {/* Recent Activity */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.6 }}
                  className="grid grid-cols-1 lg:grid-cols-2 gap-6"
                >
                  <Card className="gaming-card border-green-400/20">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center">
                        <TrendingUp className="h-5 w-5 mr-2 text-green-400" />
                        Recent Sessions
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {[
                          { user: 'player001', host: 'PC-15', duration: '45 min', status: 'active' },
                          { user: 'gamer_pro', host: 'PC-23', duration: '2h 15min', status: 'completed' },
                          { user: 'newuser', host: 'PC-07', duration: '1h 30min', status: 'active' }
                        ].map((session, index) => (
                          <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-gray-800/50">
                            <div>
                              <div className="font-medium text-white">{session.user}</div>
                              <div className="text-sm text-gray-400">{session.host} • {session.duration}</div>
                            </div>
                            <Badge 
                              variant="outline" 
                              className={session.status === 'active' ? 'border-green-400/50 text-green-400' : 'border-gray-400/50 text-gray-400'}
                            >
                              {session.status}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="gaming-card border-blue-400/20">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center">
                        <Gamepad className="h-5 w-5 mr-2 text-blue-400" />
                        Popular Applications
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {[
                          { name: 'Counter-Strike 2', sessions: 12, usage: 85 },
                          { name: 'Valorant', sessions: 8, usage: 65 },
                          { name: 'League of Legends', sessions: 6, usage: 45 }
                        ].map((app, index) => (
                          <div key={index} className="p-3 rounded-lg bg-gray-800/50">
                            <div className="flex items-center justify-between mb-2">
                              <div className="font-medium text-white">{app.name}</div>
                              <div className="text-sm text-blue-400">{app.sessions} sessions</div>
                            </div>
                            <Progress value={app.usage} className="h-2" />
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </div>
            )}
          </TabsContent>

          {/* Other Tabs */}
          <TabsContent value="monitoring">
            <LiveMonitoring />
          </TabsContent>

          <TabsContent value="hosts">
            <HostManagement />
          </TabsContent>

          <TabsContent value="sessions">
            <SessionManagement />
          </TabsContent>

          <TabsContent value="users">
            <UserManagement />
          </TabsContent>

          <TabsContent value="apps">
            <ApplicationManagement />
          </TabsContent>

          <TabsContent value="billing">
            <BillingManagement />
          </TabsContent>

          <TabsContent value="system">
            <SystemConfiguration />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
