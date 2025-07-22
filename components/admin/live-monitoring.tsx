
'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Activity, Users, Monitor, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

export default function LiveMonitoring() {
  const [liveData, setLiveData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLiveData = () => {
      // Mock live monitoring data
      const mockData = {
        active_sessions: Math.floor(Math.random() * 10) + 15,
        total_hosts: 35,
        cpu_usage: Math.floor(Math.random() * 30) + 45,
        memory_usage: Math.floor(Math.random() * 25) + 60,
        network_usage: Math.floor(Math.random() * 40) + 30,
        alerts: Math.floor(Math.random() * 3),
        uptime: '99.8%'
      };
      setLiveData(mockData);
      setLoading(false);
    };

    fetchLiveData();
    const interval = setInterval(fetchLiveData, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-400"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <h2 className="text-2xl font-bold text-white mb-4">Live System Monitoring</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="gaming-card border-blue-400/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-400">Active Sessions</p>
                  <p className="text-2xl font-bold text-white">{liveData?.active_sessions}</p>
                </div>
                <Activity className="h-8 w-8 text-blue-400" />
              </div>
              <Progress value={(liveData?.active_sessions / liveData?.total_hosts) * 100} className="mt-3 h-2" />
            </CardContent>
          </Card>

          <Card className="gaming-card border-green-400/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-400">CPU Usage</p>
                  <p className="text-2xl font-bold text-white">{liveData?.cpu_usage}%</p>
                </div>
                <Monitor className="h-8 w-8 text-green-400" />
              </div>
              <Progress value={liveData?.cpu_usage} className="mt-3 h-2" />
            </CardContent>
          </Card>

          <Card className="gaming-card border-purple-400/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-400">Memory Usage</p>
                  <p className="text-2xl font-bold text-white">{liveData?.memory_usage}%</p>
                </div>
                <Users className="h-8 w-8 text-purple-400" />
              </div>
              <Progress value={liveData?.memory_usage} className="mt-3 h-2" />
            </CardContent>
          </Card>

          <Card className="gaming-card border-yellow-400/20">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-400">System Health</p>
                  <p className="text-2xl font-bold text-white">{liveData?.uptime}</p>
                </div>
                {liveData?.alerts === 0 ? (
                  <CheckCircle className="h-8 w-8 text-green-400" />
                ) : (
                  <AlertTriangle className="h-8 w-8 text-yellow-400" />
                )}
              </div>
              {liveData?.alerts > 0 && (
                <Badge variant="outline" className="mt-3 border-yellow-400/50 text-yellow-400">
                  {liveData.alerts} alerts
                </Badge>
              )}
            </CardContent>
          </Card>
        </div>
      </motion.div>
    </div>
  );
}
