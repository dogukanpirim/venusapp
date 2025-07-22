
'use client';

import { useState } from 'react';
import { ServerCard } from './server-card';
import { Button } from '@/components/ui/button';
import { Car, Zap, GraduationCap, Calendar, Filter } from 'lucide-react';

const categories = [
  { id: 'all', name: 'Tümü', icon: Filter },
  { id: 'race', name: 'Yarış', icon: Car },
  { id: 'drift', name: 'Drift', icon: Zap },
  { id: 'training', name: 'Eğitim', icon: GraduationCap },
  { id: 'events', name: 'Etkinlik', icon: Calendar },
];

const mockServers = [
  {
    id: '1',
    name: 'Venüs Racing Server',
    category: 'race',
    status: 'online' as const,
    currentPlayers: 18,
    maxPlayers: 24,
    ping: 12,
    track: 'Spa-Francorchamps',
    trackImage: 'https://i.ytimg.com/vi/B-vpvlFRS2o/maxresdefault.jpg',
    gameMode: 'GT3 Championship',
  },
  {
    id: '2',
    name: 'Drift Paradise',
    category: 'drift',
    status: 'online' as const,
    currentPlayers: 12,
    maxPlayers: 16,
    ping: 8,
    track: 'Ebisu Circuit',
    trackImage: 'https://i.ytimg.com/vi/22TZnS7n544/maxresdefault.jpg',
    gameMode: 'Drift Battle',
  },
  {
    id: '3',
    name: 'Training Ground',
    category: 'training',
    status: 'online' as const,
    currentPlayers: 8,
    maxPlayers: 20,
    ping: 15,
    track: 'Brands Hatch',
    trackImage: 'https://msvstatic.blob.core.windows.net/high-res/f3e62ba1-4419-4e1c-9ea1-c1a0c993c65d.jpg',
    gameMode: 'Practice Session',
  },
  {
    id: '4',
    name: 'Weekly Event',
    category: 'events',
    status: 'online' as const,
    currentPlayers: 22,
    maxPlayers: 24,
    ping: 5,
    track: 'Monza',
    trackImage: 'https://i.ytimg.com/vi/qlqm61tSGUo/maxresdefault.jpg',
    gameMode: 'Special Event',
  },
  {
    id: '5',
    name: 'Endurance Racing',
    category: 'race',
    status: 'online' as const,
    currentPlayers: 20,
    maxPlayers: 32,
    ping: 18,
    track: 'Nürburgring',
    trackImage: 'https://i.ytimg.com/vi/Ccd5ZuhJVxI/maxresdefault.jpg',
    gameMode: 'Endurance Race',
  },
  {
    id: '6',
    name: 'Drift Kings',
    category: 'drift',
    status: 'maintenance' as const,
    currentPlayers: 0,
    maxPlayers: 12,
    ping: 0,
    track: 'Mountain Pass',
    trackImage: 'https://i.ytimg.com/vi/wN_00uq4gFw/maxresdefault.jpg',
    gameMode: 'Touge Battle',
  },
  {
    id: '7',
    name: 'Formula Academy',
    category: 'training',
    status: 'online' as const,
    currentPlayers: 15,
    maxPlayers: 20,
    ping: 22,
    track: 'Silverstone',
    trackImage: 'https://media.formula1.com/image/upload/f_auto,c_limit,w_1440,q_auto/f_auto/q_auto/content/dam/fom-website/2018-redesign-assets/Circuit%20maps%2016x9/Great_Britain_Circuit',
    gameMode: 'Formula Training',
  },
  {
    id: '8',
    name: 'Championship Series',
    category: 'events',
    status: 'online' as const,
    currentPlayers: 16,
    maxPlayers: 24,
    ping: 14,
    track: 'Suzuka',
    trackImage: 'http://i.ytimg.com/vi/EhuePVaDwWE/maxresdefault.jpg',
    gameMode: 'Championship',
  },
];

export function ServerCategories() {
  const [selectedCategory, setSelectedCategory] = useState('all');

  const filteredServers = selectedCategory === 'all' 
    ? mockServers 
    : mockServers.filter(server => server.category === selectedCategory);

  return (
    <section className="py-16">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-white mb-4">
            Assetto Corsa Serverları
          </h2>
          <p className="text-gray-400">
            Yarış deneyiminizi yaşayın, serverları keşfedin
          </p>
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {categories.map((category) => {
            const Icon = category.icon;
            const isActive = selectedCategory === category.id;
            return (
              <Button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                variant={isActive ? "default" : "outline"}
                size="sm"
                className={
                  isActive 
                    ? "bg-blue-600 text-white" 
                    : "bg-gray-800/50 border-gray-700 hover:bg-gray-700/50"
                }
              >
                <Icon className="h-4 w-4 mr-1" />
                {category.name}
                <span className="ml-1 text-xs bg-gray-600 px-1 rounded">
                  {category.id === 'all' 
                    ? mockServers.length 
                    : mockServers.filter(s => s.category === category.id).length
                  }
                </span>
              </Button>
            );
          })}
        </div>

        {/* Server Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredServers.map((server) => (
            <ServerCard key={server.id} server={server} />
          ))}
        </div>

        {filteredServers.length === 0 && (
          <div className="text-center py-12">
            <div className="text-4xl mb-4">🏁</div>
            <h3 className="text-xl font-bold text-gray-300 mb-2">Server bulunamadı</h3>
            <p className="text-gray-500">Diğer kategorileri kontrol edin.</p>
          </div>
        )}
      </div>
    </section>
  );
}
