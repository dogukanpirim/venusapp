
'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Download, 
  Play, 
  Pause, 
  Trash2, 
  Settings, 
  Monitor,
  TrendingUp,
  Search,
  Filter,
  Plus
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';

interface Application {
  id: number;
  name: string;
  category: string;
  version: string;
  status: 'running' | 'stopped' | 'installing' | 'updating';
  usage_count: number;
  last_used: string;
  size_gb: number;
  auto_update: boolean;
}

export default function ApplicationManagement() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    setLoading(true);
    try {
      // Mock applications data
      const mockApps: Application[] = [
        {
          id: 1,
          name: 'Counter-Strike 2',
          category: 'FPS Games',
          version: '1.39.8.5',
          status: 'running',
          usage_count: 1247,
          last_used: '2025-01-12 14:30',
          size_gb: 35.2,
          auto_update: true
        },
        {
          id: 2,
          name: 'Valorant',
          category: 'FPS Games',
          version: '8.11.0.1',
          status: 'running',
          usage_count: 892,
          last_used: '2025-01-12 14:25',
          size_gb: 28.4,
          auto_update: true
        },
        {
          id: 3,
          name: 'League of Legends',
          category: 'MOBA Games',
          version: '14.1.561.9279',
          status: 'running',
          usage_count: 654,
          last_used: '2025-01-12 13:45',
          size_gb: 22.8,
          auto_update: true
        },
        {
          id: 4,
          name: 'Adobe Photoshop',
          category: 'Design Tools',
          version: '2024.25.2.1',
          status: 'stopped',
          usage_count: 45,
          last_used: '2025-01-11 16:20',
          size_gb: 4.2,
          auto_update: false
        },
        {
          id: 5,
          name: 'Steam',
          category: 'Game Platforms',
          version: '1.0.0.76',
          status: 'running',
          usage_count: 2341,
          last_used: '2025-01-12 14:35',
          size_gb: 2.1,
          auto_update: true
        }
      ];
      
      setTimeout(() => {
        setApplications(mockApps);
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Error fetching applications:', error);
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running': return 'bg-green-900/20 text-green-400 border-green-400/30';
      case 'stopped': return 'bg-red-900/20 text-red-400 border-red-400/30';
      case 'installing': return 'bg-blue-900/20 text-blue-400 border-blue-400/30';
      case 'updating': return 'bg-yellow-900/20 text-yellow-400 border-yellow-400/30';
      default: return 'bg-gray-900/20 text-gray-400 border-gray-400/30';
    }
  };

  const filteredApplications = applications.filter(app => {
    const matchesSearch = app.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || app.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = ['all', ...Array.from(new Set(applications.map(app => app.category)))];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-400"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="flex flex-col lg:flex-row gap-4 justify-between items-start lg:items-center"
      >
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Application Management</h2>
          <p className="text-gray-400">Manage installed applications and games</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search applications..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
          
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white"
          >
            {categories.map(category => (
              <option key={category} value={category}>
                {category === 'all' ? 'All Categories' : category}
              </option>
            ))}
          </select>
          
          <Button className="bg-purple-600 hover:bg-purple-700 text-white">
            <Plus className="h-4 w-4 mr-2" />
            Install App
          </Button>
        </div>
      </motion.div>

      {/* Applications Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6"
      >
        {filteredApplications.map((app, index) => (
          <motion.div
            key={app.id}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: index * 0.1 }}
          >
            <Card className="gaming-card border-purple-400/20 hover:border-purple-400/40 transition-all duration-300">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-white text-lg mb-1">{app.name}</CardTitle>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="border-blue-400/50 text-blue-400 text-xs">
                        {app.category}
                      </Badge>
                      <Badge variant="outline" className={getStatusColor(app.status)}>
                        {app.status}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* App Info */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Version:</span>
                    <span className="text-white">{app.version}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Size:</span>
                    <span className="text-white">{app.size_gb} GB</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Usage Count:</span>
                    <span className="text-white">{app.usage_count.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Last Used:</span>
                    <span className="text-white">{app.last_used}</span>
                  </div>
                </div>

                {/* Usage Bar */}
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-400">Popularity</span>
                    <span className="text-gray-400">{Math.round((app.usage_count / 2500) * 100)}%</span>
                  </div>
                  <Progress value={(app.usage_count / 2500) * 100} className="h-2" />
                </div>

                {/* Auto Update Toggle */}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">Auto Update:</span>
                  <Badge 
                    variant="outline" 
                    className={app.auto_update ? 'border-green-400/50 text-green-400' : 'border-gray-400/50 text-gray-400'}
                  >
                    {app.auto_update ? 'Enabled' : 'Disabled'}
                  </Badge>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 pt-2">
                  {app.status === 'running' ? (
                    <Button size="sm" variant="outline" className="flex-1 border-red-400/50 text-red-400 hover:bg-red-400/10">
                      <Pause className="h-3 w-3 mr-1" />
                      Stop
                    </Button>
                  ) : (
                    <Button size="sm" variant="outline" className="flex-1 border-green-400/50 text-green-400 hover:bg-green-400/10">
                      <Play className="h-3 w-3 mr-1" />
                      Start
                    </Button>
                  )}
                  
                  <Button size="sm" variant="outline" className="border-blue-400/50 text-blue-400 hover:bg-blue-400/10">
                    <Settings className="h-3 w-3" />
                  </Button>
                  
                  <Button size="sm" variant="outline" className="border-yellow-400/50 text-yellow-400 hover:bg-yellow-400/10">
                    <Download className="h-3 w-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* Summary Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.4 }}
        className="grid grid-cols-1 md:grid-cols-4 gap-4"
      >
        <Card className="gaming-card border-green-400/20">
          <CardContent className="p-4 text-center">
            <TrendingUp className="h-6 w-6 text-green-400 mx-auto mb-2" />
            <div className="text-lg font-bold text-white">
              {applications.filter(app => app.status === 'running').length}
            </div>
            <div className="text-xs text-gray-400">Running Apps</div>
          </CardContent>
        </Card>

        <Card className="gaming-card border-blue-400/20">
          <CardContent className="p-4 text-center">
            <Monitor className="h-6 w-6 text-blue-400 mx-auto mb-2" />
            <div className="text-lg font-bold text-white">
              {applications.reduce((sum, app) => sum + app.size_gb, 0).toFixed(1)} GB
            </div>
            <div className="text-xs text-gray-400">Total Size</div>
          </CardContent>
        </Card>

        <Card className="gaming-card border-purple-400/20">
          <CardContent className="p-4 text-center">
            <Settings className="h-6 w-6 text-purple-400 mx-auto mb-2" />
            <div className="text-lg font-bold text-white">
              {applications.filter(app => app.auto_update).length}
            </div>
            <div className="text-xs text-gray-400">Auto-Update</div>
          </CardContent>
        </Card>

        <Card className="gaming-card border-yellow-400/20">
          <CardContent className="p-4 text-center">
            <Download className="h-6 w-6 text-yellow-400 mx-auto mb-2" />
            <div className="text-lg font-bold text-white">
              {applications.reduce((sum, app) => sum + app.usage_count, 0).toLocaleString()}
            </div>
            <div className="text-xs text-gray-400">Total Usage</div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
