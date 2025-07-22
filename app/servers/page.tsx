
import { Suspense } from 'react';
import { ServerCategories } from '@/components/servers/server-categories';
import { FeaturedServers } from '@/components/servers/featured-servers';
import { ServerStats } from '@/components/servers/server-stats';
import { Footer } from '@/components/footer';

function ServersSkeleton() {
  return (
    <div className="py-20">
      <div className="max-w-6xl mx-auto px-4">
        <div className="grid md:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-64 bg-gray-800/50 rounded-xl animate-pulse"></div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function ServersPage() {
  return (
    <div className="min-h-screen bg-background">
      <main>
        {/* Hero Section */}
        <section className="relative py-16 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-gray-900/50 via-blue-900/20 to-gray-900/50"></div>
          
          <div className="relative max-w-6xl mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
              🏁 Assetto Corsa Serverları
            </h1>
            <p className="text-lg text-gray-300 mb-8 max-w-2xl mx-auto">
              En iyi yarış deneyimi için serverlarımıza katılın
            </p>
          </div>
        </section>

        {/* Server Stats */}
        <Suspense fallback={<div className="h-32 bg-gray-800/20 rounded-xl animate-pulse mx-4"></div>}>
          <ServerStats />
        </Suspense>

        {/* Featured Servers */}
        <Suspense fallback={<ServersSkeleton />}>
          <FeaturedServers />
        </Suspense>

        {/* All Servers */}
        <Suspense fallback={<ServersSkeleton />}>
          <ServerCategories />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
