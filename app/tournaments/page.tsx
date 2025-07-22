
import { Suspense } from 'react';
import { PrismaClient } from '@prisma/client';
import { motion } from 'framer-motion';
import { Trophy, Calendar, Filter, Search } from 'lucide-react';
import TournamentCard from '@/components/tournament-card';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

const prisma = new PrismaClient();

async function getTournaments() {
  try {
    const tournaments = await prisma.tournament.findMany({
      include: {
        game: true,
        registrations: true,
        season: true,
      },
      orderBy: [
        { status: 'asc' },
        { startDate: 'asc' }
      ]
    });
    return tournaments;
  } catch (error) {
    console.error('Error fetching tournaments:', error);
    return [];
  }
}

async function getStats() {
  try {
    const totalTournaments = await prisma.tournament.count();
    const activeTournaments = await prisma.tournament.count({
      where: {
        status: {
          in: ['REGISTRATION_OPEN', 'LIVE']
        }
      }
    });
    const totalPrizePool = await prisma.tournament.aggregate({
      _sum: {
        totalPrizePool: true
      },
      where: {
        status: {
          not: 'CANCELLED'
        }
      }
    });
    const totalPlayers = await prisma.player.count();

    return {
      totalTournaments,
      activeTournaments,
      totalPrizePool: totalPrizePool._sum.totalPrizePool || 0,
      totalPlayers
    };
  } catch (error) {
    console.error('Error fetching stats:', error);
    return {
      totalTournaments: 0,
      activeTournaments: 0,
      totalPrizePool: 0,
      totalPlayers: 0
    };
  }
}

function TournamentsSkeleton() {
  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="animate-pulse">
          <div className="gaming-card h-[400px] bg-gray-800/50"></div>
        </div>
      ))}
    </div>
  );
}

export default async function TournamentsPage() {
  const [tournaments, stats] = await Promise.all([
    getTournaments(),
    getStats()
  ]);

  const activeTournaments = tournaments.filter(t => 
    ['REGISTRATION_OPEN', 'LIVE'].includes(t.status)
  );
  const upcomingTournaments = tournaments.filter(t => t.status === 'UPCOMING');
  const completedTournaments = tournaments.filter(t => t.status === 'COMPLETED');

  return (
    <div className="min-h-screen bg-gray-900 pt-20">
      {/* Header */}
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-white mb-4">
            <Trophy className="inline w-12 h-12 text-yellow-400 mb-2 mr-4" />
            Turnuvalar
          </h1>
          <p className="text-gray-400 text-xl max-w-3xl mx-auto">
            En heyecan verici esports turnuvalarında yeteneklerini sergileyip büyük ödüller kazan!
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          <Card className="gaming-card text-center">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-white mb-1">
                {stats.totalTournaments}
              </div>
              <div className="text-sm text-gray-400">Toplam Turnuva</div>
            </CardContent>
          </Card>
          
          <Card className="gaming-card text-center">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-green-400 mb-1">
                {stats.activeTournaments}
              </div>
              <div className="text-sm text-gray-400">Aktif Turnuva</div>
            </CardContent>
          </Card>
          
          <Card className="gaming-card text-center">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-yellow-400 mb-1">
                ₺{stats.totalPrizePool.toLocaleString('tr-TR')}
              </div>
              <div className="text-sm text-gray-400">Toplam Ödül</div>
            </CardContent>
          </Card>
          
          <Card className="gaming-card text-center">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-purple-400 mb-1">
                {stats.totalPlayers}
              </div>
              <div className="text-sm text-gray-400">Kayıtlı Oyuncu</div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <Card className="gaming-card mb-8">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input 
                    placeholder="Turnuva ara..." 
                    className="pl-10 bg-gray-800 border-gray-700 text-white"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Filter className="w-4 h-4 mr-2" />
                  Filtrele
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Active Tournaments */}
        {activeTournaments.length > 0 && (
          <section className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-3xl font-bold text-white">
                Aktif Turnuvalar
                <Badge className="ml-3 bg-green-500/20 text-green-400 border-green-500/30">
                  {activeTournaments.length}
                </Badge>
              </h2>
            </div>
            <Suspense fallback={<TournamentsSkeleton />}>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {activeTournaments.map((tournament) => (
                  <TournamentCard 
                    key={tournament.id} 
                    tournament={{
                      ...tournament,
                      startDate: tournament.startDate.toISOString(),
                      registrationEnd: tournament.registrationEnd.toISOString(),
                    }} 
                  />
                ))}
              </div>
            </Suspense>
          </section>
        )}

        {/* Upcoming Tournaments */}
        {upcomingTournaments.length > 0 && (
          <section className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-3xl font-bold text-white">
                Yaklaşan Turnuvalar
                <Badge className="ml-3 bg-blue-500/20 text-blue-400 border-blue-500/30">
                  {upcomingTournaments.length}
                </Badge>
              </h2>
            </div>
            <Suspense fallback={<TournamentsSkeleton />}>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {upcomingTournaments.map((tournament) => (
                  <TournamentCard 
                    key={tournament.id} 
                    tournament={{
                      ...tournament,
                      startDate: tournament.startDate.toISOString(),
                      registrationEnd: tournament.registrationEnd.toISOString(),
                    }} 
                  />
                ))}
              </div>
            </Suspense>
          </section>
        )}

        {/* Completed Tournaments */}
        {completedTournaments.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-3xl font-bold text-white">
                Tamamlanan Turnuvalar
                <Badge className="ml-3 bg-gray-500/20 text-gray-400 border-gray-500/30">
                  {completedTournaments.length}
                </Badge>
              </h2>
            </div>
            <Suspense fallback={<TournamentsSkeleton />}>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {completedTournaments.slice(0, 6).map((tournament) => (
                  <TournamentCard 
                    key={tournament.id} 
                    tournament={{
                      ...tournament,
                      startDate: tournament.startDate.toISOString(),
                      registrationEnd: tournament.registrationEnd.toISOString(),
                    }} 
                  />
                ))}
              </div>
            </Suspense>
          </section>
        )}

        {/* No Tournaments */}
        {tournaments.length === 0 && (
          <div className="text-center py-16">
            <Trophy className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-400 mb-2">
              Henüz turnuva bulunmuyor
            </h3>
            <p className="text-gray-500">
              Yakında heyecan verici turnuvalar düzenleyeceğiz!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
