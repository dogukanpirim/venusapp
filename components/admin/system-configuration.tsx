
'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Settings, Database, Network, Shield } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';

export default function SystemConfiguration() {
  const [config, setConfig] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock system configuration
    const mockConfig = {
      auto_updates: true,
      maintenance_mode: false,
      backup_enabled: true,
      security_monitoring: true,
      session_timeout: 30,
      max_concurrent_sessions: 35,
      default_session_duration: 60
    };
    
    setConfig(mockConfig);
    setLoading(false);
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
        <h2 className="text-2xl font-bold text-white mb-4">System Configuration</h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="gaming-card border-blue-400/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Settings className="h-5 w-5 mr-2" />
                General Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-white">Auto Updates</span>
                <Switch checked={config?.auto_updates} />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white">Maintenance Mode</span>
                <Switch checked={config?.maintenance_mode} />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white">Backup Enabled</span>
                <Switch checked={config?.backup_enabled} />
              </div>
            </CardContent>
          </Card>

          <Card className="gaming-card border-green-400/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Shield className="h-5 w-5 mr-2" />
                Security Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-white">Security Monitoring</span>
                <Switch checked={config?.security_monitoring} />
              </div>
              <div className="space-y-2">
                <label className="text-sm text-gray-400">Session Timeout (minutes)</label>
                <input 
                  type="number" 
                  value={config?.session_timeout} 
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-end">
          <Button className="bg-blue-600 hover:bg-blue-700 text-white">
            Save Configuration
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
