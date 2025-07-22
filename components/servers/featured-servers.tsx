
'use client';

import { ServerCard } from './server-card';
import { Star } from 'lucide-react';

const featuredServers = [
  {
    id: 'featured-1',
    name: 'Premium Racing Hub',
    category: 'race',
    status: 'online' as const,
    currentPlayers: 28,
    maxPlayers: 32,
    ping: 8,
    track: 'Spa-Francorchamps',
    trackImage: 'https://driver61.com/wp-content/uploads/2019/08/Spa-Francorchamps-Circuit-Guide.jpg',
    gameMode: 'GT3 Elite Series',
  },
  {
    id: 'featured-2',
    name: 'Elite Drift Arena',
    category: 'drift',
    status: 'online' as const,
    currentPlayers: 14,
    maxPlayers: 16,
    ping: 5,
    track: 'Tokyo Bay',
    trackImage: 'https://i.ytimg.com/vi/jXPgcWZ5iP4/maxresdefault.jpg',
    gameMode: 'Pro Drift Battle',
  },
  {
    id: 'featured-3',
    name: 'Championship Central',
    category: 'events',
    status: 'online' as const,
    currentPlayers: 30,
    maxPlayers: 32,
    ping: 12,
    track: 'Silverstone GP',
    trackImage: 'https://i.ytimg.com/vi/A0xooD6CKIA/maxresdefault.jpg',
    gameMode: 'World Championship',
  },
];

export function FeaturedServers() {
  return (
    <section className="py-16">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-center mb-8">
          <Star className="h-6 w-6 text-yellow-400 mr-2" />
          <h2 className="text-2xl font-bold text-white">Öne Çıkan Serverlar</h2>
        </div>

        {/* Featured Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {featuredServers.map((server) => (
            <ServerCard key={server.id} server={server} />
          ))}
        </div>
      </div>
    </section>
  );
}
