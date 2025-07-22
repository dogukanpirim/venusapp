
'use client';

import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Activity, 
  LogIn, 
  LogOut, 
  Play, 
  Square,
  ShoppingCart,
  CreditCard,
  Clock,
  Pause,
  RotateCcw,
  Settings,
  Wallet
} from 'lucide-react';

interface GizmoActivityFeedProps {
  activities: any[];
  showTitle?: boolean;
}

export function GizmoActivityFeed({ activities, showTitle = true }: GizmoActivityFeedProps) {
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'LOGIN':
        return LogIn;
      case 'LOGOUT':
        return LogOut;
      case 'GAME_START':
        return Play;
      case 'GAME_END':
        return Square;
      case 'PURCHASE':
        return ShoppingCart;
      case 'PAYMENT':
        return CreditCard;
      case 'TIME_EXTEND':
        return Clock;
      case 'PAUSE':
        return Pause;
      case 'RESUME':
        return Play;
      case 'ADMIN_ACTION':
        return Settings;
      case 'BALANCE_UPDATE':
        return Wallet;
      default:
        return Activity;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'LOGIN':
      case 'GAME_START':
      case 'RESUME':
        return 'text-green-400';
      case 'LOGOUT':
      case 'GAME_END':
      case 'PAUSE':
        return 'text-red-400';
      case 'PURCHASE':
      case 'PAYMENT':
        return 'text-blue-400';
      case 'TIME_EXTEND':
      case 'BALANCE_UPDATE':
        return 'text-yellow-400';
      case 'ADMIN_ACTION':
        return 'text-purple-400';
      default:
        return 'text-gray-400';
    }
  };

  const getActivityBgColor = (type: string) => {
    switch (type) {
      case 'LOGIN':
      case 'GAME_START':
      case 'RESUME':
        return 'bg-green-900/50';
      case 'LOGOUT':
      case 'GAME_END':
      case 'PAUSE':
        return 'bg-red-900/50';
      case 'PURCHASE':
      case 'PAYMENT':
        return 'bg-blue-900/50';
      case 'TIME_EXTEND':
      case 'BALANCE_UPDATE':
        return 'bg-yellow-900/50';
      case 'ADMIN_ACTION':
        return 'bg-purple-900/50';
      default:
        return 'bg-gray-700/50';
    }
  };

  const formatRelativeTime = (date: string | Date) => {
    const now = new Date();
    const activityDate = new Date(date);
    const diffMs = now.getTime() - activityDate.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Az önce';
    if (diffMins < 60) return `${diffMins} dakika önce`;
    if (diffHours < 24) return `${diffHours} saat önce`;
    if (diffDays < 7) return `${diffDays} gün önce`;
    
    return activityDate.toLocaleDateString('tr-TR', {
      day: 'numeric',
      month: 'short'
    });
  };

  const content = (
    <div className="space-y-3">
      {activities?.length > 0 ? activities.map((activity, index) => {
        const Icon = getActivityIcon(activity.type);
        
        return (
          <motion.div
            key={activity.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            className="flex items-center space-x-3 p-3 rounded-lg bg-gray-800/30 border border-gray-700/50 hover:bg-gray-800/50 transition-colors"
          >
            <div className={`p-2 rounded-lg ${getActivityBgColor(activity.type)}`}>
              <Icon className={`h-4 w-4 ${getActivityColor(activity.type)}`} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">
                {activity.title}
              </p>
              <div className="flex items-center space-x-2 mt-1">
                {activity.computerName && (
                  <span className="text-xs text-gray-400">
                    {activity.computerName}
                  </span>
                )}
                {activity.applicationName && (
                  <Badge variant="outline" className="text-xs">
                    {activity.applicationName}
                  </Badge>
                )}
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-500">
                {formatRelativeTime(activity.timestamp)}
              </p>
              {activity.duration && (
                <p className="text-xs text-gray-400">
                  {Math.floor(activity.duration / 60)}:{(activity.duration % 60).toString().padStart(2, '0')}
                </p>
              )}
            </div>
          </motion.div>
        );
      }) : (
        <div className="text-center py-8 text-gray-400">
          <Activity className="h-12 w-12 mx-auto mb-3 opacity-50" />
          <p>Henüz aktivite bulunmuyor</p>
        </div>
      )}
    </div>
  );

  if (!showTitle) {
    return content;
  }

  return (
    <Card className="gaming-card">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Activity className="h-5 w-5" />
          <span>Son Aktiviteler</span>
        </CardTitle>
        <CardDescription>Güncel sistem aktiviteleriniz</CardDescription>
      </CardHeader>
      <CardContent>
        {content}
      </CardContent>
    </Card>
  );
}
