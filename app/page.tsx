
import { Suspense } from 'react';
import { HeroSection } from '@/components/hero-section';
import { ZoneCards } from '@/components/zone-cards';
import ActiveTournamentsPreview from '@/components/active-tournaments-preview';
import LeaderboardPreview from '@/components/leaderboard-preview';
import { OperatingHours } from '@/components/operating-hours';
import { ContactSection } from '@/components/contact-section';
import { Footer } from '@/components/footer';

async function getActiveTournaments() {
  // Mock data for tournaments
  return [];
}

async function getTopPlayers() {
  // Mock data for players
  return [];
}

function TournamentSkeleton() {
  return (
    <div className="py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <div className="h-12 bg-gray-700 rounded w-1/3 mx-auto mb-4"></div>
          <div className="h-6 bg-gray-700 rounded w-2/3 mx-auto"></div>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-64 bg-gray-800/50 rounded-lg animate-pulse"></div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default async function HomePage() {
  const [tournaments, players] = await Promise.all([
    getActiveTournaments(),
    getTopPlayers()
  ]);

  return (
    <div className="min-h-screen bg-background">
      <main>
        <HeroSection />
        <ZoneCards />
        
        {/* Tournament System Previews */}
        <Suspense fallback={<TournamentSkeleton />}>
          <ActiveTournamentsPreview tournaments={tournaments} />
        </Suspense>
        
        <Suspense fallback={<TournamentSkeleton />}>
          <LeaderboardPreview players={players} />
        </Suspense>
        
        <OperatingHours />
        <ContactSection />
      </main>
      <Footer />
    </div>
  );
}
