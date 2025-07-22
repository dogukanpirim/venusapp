
'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Users, 
  Wifi, 
  MapPin, 
  Trophy,
  AlertCircle
} from 'lucide-react';
import Image from 'next/image';

interface ServerCardProps {
  server: {
    id: string;
    name: string;
    category: string;
    status: 'online' | 'maintenance' | 'offline';
    currentPlayers: number;
    maxPlayers: number;
    ping: number;
    track: string;
    trackImage: string;
    gameMode: string;
  };
}

const categoryColors = {
  race: 'bg-red-500',
  drift: 'bg-purple-500',
  training: 'bg-blue-500',
  events: 'bg-green-500',
};

const categoryNames = {
  race: 'Yarış',
  drift: 'Drift', 
  training: 'Eğitim',
  events: 'Etkinlikler',
};

export function ServerCard({ server }: ServerCardProps) {
  const playerPercentage = (server.currentPlayers / server.maxPlayers) * 100;
  const isOnline = server.status === 'online';
  const isFull = server.currentPlayers >= server.maxPlayers;

  const statusConfig = {
    online: {
      color: 'text-green-400',
      bg: 'bg-green-400/20',
      text: 'Çevrimiçi'
    },
    maintenance: {
      color: 'text-yellow-400',
      bg: 'bg-yellow-400/20',
      text: 'Bakım'
    },
    offline: {
      color: 'text-red-400',
      bg: 'bg-red-400/20', 
      text: 'Çevrimdışı'
    }
  };

  return (
    <div className="bg-gray-900/40 backdrop-blur-xl border border-gray-700/50 rounded-xl overflow-hidden hover:border-gray-600/50 transition-all duration-200">
      {/* Track Image */}
      <div className="relative h-40 overflow-hidden">
        <Image
          src={server.trackImage}
          alt={server.track}
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 via-transparent to-transparent"></div>
        
        {/* Status Badge */}
        <div className="absolute top-3 left-3">
          <Badge className={`${statusConfig[server.status].bg} ${statusConfig[server.status].color} border-0 text-xs`}>
            {statusConfig[server.status].text}
          </Badge>
        </div>

        {/* Category Badge */}
        <div className="absolute top-3 right-3">
          <Badge className={`${categoryColors[server.category as keyof typeof categoryColors]} text-white border-0 text-xs`}>
            {categoryNames[server.category as keyof typeof categoryNames]}
          </Badge>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Server Name */}
        <h3 className="text-lg font-bold text-white mb-1">
          {server.name}
        </h3>
        
        {/* Game Mode & Track */}
        <div className="text-sm text-gray-400 mb-3">
          <div className="flex items-center mb-1">
            <Trophy className="h-3 w-3 mr-1" />
            {server.gameMode}
          </div>
          <div className="flex items-center">
            <MapPin className="h-3 w-3 mr-1" />
            {server.track}
          </div>
        </div>

        {/* Stats */}
        <div className="space-y-2 mb-4">
          {/* Players */}
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center text-gray-300">
              <Users className="h-3 w-3 mr-1" />
              Oyuncular
            </div>
            <span className={`font-medium ${isFull ? 'text-red-400' : 'text-white'}`}>
              {server.currentPlayers}/{server.maxPlayers}
            </span>
          </div>

          {/* Ping */}
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center text-gray-300">
              <Wifi className="h-3 w-3 mr-1" />
              Ping
            </div>
            <Badge className={`text-xs ${
              server.ping < 30 ? 'bg-green-500' : 
              server.ping < 60 ? 'bg-yellow-500' : 'bg-red-500'
            } text-white border-0`}>
              {server.ping}ms
            </Badge>
          </div>
        </div>

        {/* Join Button */}
        <Button 
          className={`w-full ${
            isOnline && !isFull
              ? 'bg-blue-600 hover:bg-blue-700 text-white'
              : 'bg-gray-700 text-gray-400 cursor-not-allowed'
          } transition-colors duration-200`}
          disabled={!isOnline || isFull}
        >
          {!isOnline ? (
            <>
              <AlertCircle className="h-4 w-4 mr-2" />
              Kullanılamaz
            </>
          ) : isFull ? (
            <>
              <Users className="h-4 w-4 mr-2" />
              Sunucu Dolu
            </>
          ) : (
            <>
              <Trophy className="h-4 w-4 mr-2" />
              Sunucuya Katıl
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
