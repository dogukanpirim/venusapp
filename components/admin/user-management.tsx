
'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Clock, DollarSign, Shield } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function UserManagement() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock users data
    const mockUsers = Array.from({ length: 8 }, (_, i) => ({
      id: i + 1,
      username: `player${i + 1}`,
      email: `player${i + 1}@example.com`,
      status: ['active', 'inactive', 'banned'][Math.floor(Math.random() * 3)],
      total_sessions: Math.floor(Math.random() * 100) + 10,
      total_time: `${Math.floor(Math.random() * 200) + 50}h`,
      balance: Math.floor(Math.random() * 100) + 10,
      last_login: '2025-01-12'
    }));
    
    setUsers(mockUsers);
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
        <h2 className="text-2xl font-bold text-white mb-4">User Management</h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {users.map((user, index) => (
            <motion.div
              key={user.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <Card className="gaming-card border-blue-400/20">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-white flex items-center">
                      <User className="h-4 w-4 mr-2" />
                      {user.username}
                    </CardTitle>
                    <Badge 
                      variant="outline" 
                      className={
                        user.status === 'active' ? 'border-green-400/50 text-green-400' :
                        user.status === 'inactive' ? 'border-yellow-400/50 text-yellow-400' :
                        'border-red-400/50 text-red-400'
                      }
                    >
                      {user.status}
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center text-sm">
                      <Mail className="h-3 w-3 text-gray-400 mr-2" />
                      <span className="text-gray-300">{user.email}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Sessions:</span>
                      <span className="text-white">{user.total_sessions}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Total Time:</span>
                      <span className="text-white">{user.total_time}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Balance:</span>
                      <span className="text-white">₺{user.balance}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Last Login:</span>
                      <span className="text-white">{user.last_login}</span>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="border-blue-400/50 text-blue-400">
                      <User className="h-3 w-3 mr-1" />
                      Edit
                    </Button>
                    <Button size="sm" variant="outline" className="border-green-400/50 text-green-400">
                      <DollarSign className="h-3 w-3 mr-1" />
                      Balance
                    </Button>
                    <Button size="sm" variant="outline" className="border-purple-400/50 text-purple-400">
                      <Shield className="h-3 w-3 mr-1" />
                      Permissions
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
