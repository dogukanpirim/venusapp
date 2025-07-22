
'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, StopCircle, Clock, User } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function SessionManagement() {
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock sessions data
    const mockSessions = Array.from({ length: 8 }, (_, i) => ({
      id: i + 1,
      user: `player${i + 1}`,
      host: `PC-${String(i + 1).padStart(2, '0')}`,
      status: ['active', 'paused', 'completed'][Math.floor(Math.random() * 3)],
      duration: `${Math.floor(Math.random() * 3)}h ${Math.floor(Math.random() * 60)}m`,
      remaining_time: `${Math.floor(Math.random() * 2)}h ${Math.floor(Math.random() * 60)}m`,
      cost: Math.floor(Math.random() * 50) + 20
    }));
    
    setSessions(mockSessions);
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
        <h2 className="text-2xl font-bold text-white mb-4">Session Management</h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {sessions.map((session, index) => (
            <motion.div
              key={session.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <Card className="gaming-card border-purple-400/20">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-white flex items-center">
                      <User className="h-4 w-4 mr-2" />
                      {session.user}
                    </CardTitle>
                    <Badge 
                      variant="outline" 
                      className={
                        session.status === 'active' ? 'border-green-400/50 text-green-400' :
                        session.status === 'paused' ? 'border-yellow-400/50 text-yellow-400' :
                        'border-gray-400/50 text-gray-400'
                      }
                    >
                      {session.status}
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Host:</span>
                      <span className="text-white">{session.host}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Duration:</span>
                      <span className="text-white">{session.duration}</span>
                    </div>
                    {session.status === 'active' && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Remaining:</span>
                        <span className="text-white">{session.remaining_time}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Cost:</span>
                      <span className="text-white">₺{session.cost}</span>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    {session.status === 'active' ? (
                      <>
                        <Button size="sm" variant="outline" className="border-yellow-400/50 text-yellow-400">
                          <Pause className="h-3 w-3 mr-1" />
                          Pause
                        </Button>
                        <Button size="sm" variant="outline" className="border-red-400/50 text-red-400">
                          <StopCircle className="h-3 w-3 mr-1" />
                          End
                        </Button>
                      </>
                    ) : session.status === 'paused' ? (
                      <>
                        <Button size="sm" variant="outline" className="border-green-400/50 text-green-400">
                          <Play className="h-3 w-3 mr-1" />
                          Resume
                        </Button>
                        <Button size="sm" variant="outline" className="border-red-400/50 text-red-400">
                          <StopCircle className="h-3 w-3 mr-1" />
                          End
                        </Button>
                      </>
                    ) : (
                      <Button size="sm" variant="outline" className="flex-1 border-blue-400/50 text-blue-400">
                        <Clock className="h-3 w-3 mr-1" />
                        View Details
                      </Button>
                    )}
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
