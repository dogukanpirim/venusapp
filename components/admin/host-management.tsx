
'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Monitor, Power, PowerOff, Settings, Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function HostManagement() {
  const [hosts, setHosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock hosts data
    const mockHosts = Array.from({ length: 10 }, (_, i) => ({
      id: i + 1,
      name: `PC-${String(i + 1).padStart(2, '0')}`,
      status: Math.random() > 0.3 ? 'online' : 'offline',
      current_user: Math.random() > 0.5 ? `user${i + 1}` : null,
      cpu_usage: Math.floor(Math.random() * 80) + 10,
      memory_usage: Math.floor(Math.random() * 70) + 20,
      uptime: `${Math.floor(Math.random() * 24)}h ${Math.floor(Math.random() * 60)}m`
    }));
    
    setHosts(mockHosts);
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
        <h2 className="text-2xl font-bold text-white mb-4">Host Management</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {hosts.map((host, index) => (
            <motion.div
              key={host.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <Card className="gaming-card border-blue-400/20">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-white">{host.name}</CardTitle>
                    <Badge 
                      variant="outline" 
                      className={host.status === 'online' ? 'border-green-400/50 text-green-400' : 'border-red-400/50 text-red-400'}
                    >
                      {host.status}
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  {host.current_user && (
                    <div className="flex items-center">
                      <Users className="h-4 w-4 text-blue-400 mr-2" />
                      <span className="text-white text-sm">{host.current_user}</span>
                    </div>
                  )}
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">CPU:</span>
                      <span className="text-white">{host.cpu_usage}%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Memory:</span>
                      <span className="text-white">{host.memory_usage}%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Uptime:</span>
                      <span className="text-white">{host.uptime}</span>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    {host.status === 'online' ? (
                      <Button size="sm" variant="outline" className="flex-1 border-red-400/50 text-red-400">
                        <PowerOff className="h-3 w-3 mr-1" />
                        Shutdown
                      </Button>
                    ) : (
                      <Button size="sm" variant="outline" className="flex-1 border-green-400/50 text-green-400">
                        <Power className="h-3 w-3 mr-1" />
                        Start
                      </Button>
                    )}
                    <Button size="sm" variant="outline" className="border-blue-400/50 text-blue-400">
                      <Settings className="h-3 w-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
