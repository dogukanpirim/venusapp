
import { Suspense } from 'react';
import { PrismaClient } from '@prisma/client';
import { Crown, TrendingUp, GamepadIcon, Users } from 'lucide-react';
import LeaderboardTable from '@/components/leaderboard-table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';

const prisma = new PrismaClient();

async function getPlayers() {
  try {
    const players = await prisma.player.findMany({
      orderBy: {
        totalPoints: 'desc'
      }
    });
    return players;
  } catch (error) {
    console.error('Error fetching players:', error);
    return [];
  }
}

async function getGames() {
  try {
    const games = await prisma.game.findMany({
      where: {
        isActive: true
      },
      include: {
        stats: {
          include: {
            player: true
          }
        }
      }
    });
    return games;
  } catch (error) {
    console.error('Error fetching games:', error);
    return [];
  }
}

async function getLeaderboardStats() {
  try {
    const totalPlayers = await prisma.player.count();
    const activePlayers = await prisma.player.count({
      where: {
        totalMatches: {
          gt: 0
        }
      }
    });
    
    const topPlayer = await prisma.player.findFirst({
      orderBy: {
        totalPoints: 'desc'
      }
    });

    const avgRating = await prisma.player.aggregate({
      _avg: {
        skillRating: true
      }
    });

    return {
      totalPlayers,
      activePlayers,
      topPlayer,
      avgRating: Math.round(avgRating._avg.skillRating || 1000)
    };
  } catch (error) {
    console.error('Error fetching leaderboard stats:', error);
    return {
      totalPlayers: 0,
      activePlayers: 0,
      topPlayer: null,
      avgRating: 1000
    };
  }
}

function LeaderboardSkeleton() {
  return (
    <div className="space-y-4">
      {[...Array(10)].map((_, i) => (
        <div key={i} className="animate-pulse flex items-center p-4 bg-gray-800/30 rounded-lg">
          <div className="w-12 h-12 bg-gray-700 rounded-full mr-4"></div>
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-700 rounded w-1/4"></div>
            <div className="h-3 bg-gray-700 rounded w-1/6"></div>
          </div>
          <div className="space-y-2">
            <div className="h-4 bg-gray-700 rounded w-16"></div>
            <div className="h-3 bg-gray-700 rounded w-12"></div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default async function LeaderboardPage() {
  const [players, games, stats] = await Promise.all([
    getPlayers(),
    getGames(),
    getLeaderboardStats()
  ]);

  return (
    <div className="min-h-screen bg-gray-900 pt-20">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-white mb-4">
            <Crown className="inline w-12 h-12 text-yellow-400 mb-2 mr-4" />
            Liderlik Tablosu
          </h1>
          <p className="text-gray-400 text-xl max-w-3xl mx-auto">
            En başarılı oyuncularımızı keşfedin ve sıralamada yerinizi alın!
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          <Card className="gaming-card text-center">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-white mb-1">
                {stats.totalPlayers}
              </div>
              <div className="text-sm text-gray-400">Toplam Oyuncu</div>
            </CardContent>
          </Card>
          
          <Card className="gaming-card text-center">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-green-400 mb-1">
                {stats.activePlayers}
              </div>
              <div className="text-sm text-gray-400">Aktif Oyuncu</div>
            </CardContent>
          </Card>
          
          <Card className="gaming-card text-center">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-purple-400 mb-1">
                {stats.avgRating}
              </div>
              <div className="text-sm text-gray-400">Ortalama Rating</div>
            </CardContent>
          </Card>
          
          <Card className="gaming-card text-center">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-yellow-400 mb-1">
                {stats.topPlayer?.currentRank || 'N/A'}
              </div>
              <div className="text-sm text-gray-400">En Yüksek Rank</div>
            </CardContent>
          </Card>
        </div>

        {/* Champion Spotlight */}
        {stats.topPlayer && (
          <Card className="gaming-card mb-8 bg-gradient-to-r from-yellow-900/20 to-purple-900/20 border-yellow-500/30">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl text-white flex items-center justify-center">
                <Crown className="w-8 h-8 text-yellow-400 mr-3" />
                Şu Anki Şampiyon
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <div className="flex flex-col items-center space-y-4">
                <div className="w-24 h-24 rounded-full bg-gradient-to-r from-yellow-400 to-yellow-600 flex items-center justify-center text-4xl font-bold text-black">
                  {stats.topPlayer.displayName.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-3xl font-bold text-white mb-1">
                    {stats.topPlayer.displayName}
                  </h3>
                  <p className="text-lg text-gray-400">@{stats.topPlayer.gamertag}</p>
                  <Badge className="mt-2 bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
                    {stats.topPlayer.currentRank}
                  </Badge>
                </div>
                <div className="grid grid-cols-3 gap-6 text-center">
                  <div>
                    <div className="text-2xl font-bold text-yellow-400">
                      {stats.topPlayer.totalPoints.toLocaleString('tr-TR')}
                    </div>
                    <div className="text-sm text-gray-400">Toplam Puan</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-purple-400">
                      {Math.round(stats.topPlayer.skillRating)}
                    </div>
                    <div className="text-sm text-gray-400">Skill Rating</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-green-400">
                      %{stats.topPlayer.winRate.toFixed(0)}
                    </div>
                    <div className="text-sm text-gray-400">Kazanma Oranı</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Leaderboard Tabs */}
        <Tabs defaultValue="overall" className="w-full">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 lg:grid-cols-6 mb-8 bg-gray-800/50">
            <TabsTrigger 
              value="overall" 
              className="data-[state=active]:bg-purple-600 data-[state=active]:text-white"
            >
              <TrendingUp className="w-4 h-4 mr-2" />
              Genel
            </TabsTrigger>
            {games.slice(0, 5).map((game) => (
              <TabsTrigger 
                key={game.id} 
                value={game.slug}
                className="data-[state=active]:bg-purple-600 data-[state=active]:text-white"
              >
                <GamepadIcon className="w-4 h-4 mr-2" />
                {game.name}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="overall">
            <Suspense fallback={<LeaderboardSkeleton />}>
              <LeaderboardTable 
                players={players} 
                title="Genel Liderlik Tablosu"
              />
            </Suspense>
          </TabsContent>

          {games.map((game) => {
            const gamePlayers = game.stats.map(stat => stat.player);
            return (
              <TabsContent key={game.id} value={game.slug}>
                <Suspense fallback={<LeaderboardSkeleton />}>
                  <LeaderboardTable 
                    players={gamePlayers} 
                    title={`${game.name} Liderlik Tablosu`}
                    game={game}
                    showGame={true}
                  />
                </Suspense>
              </TabsContent>
            );
          })}
        </Tabs>

        {/* No Players */}
        {players.length === 0 && (
          <div className="text-center py-16">
            <Users className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-400 mb-2">
              Henüz oyuncu bulunmuyor
            </h3>
            <p className="text-gray-500">
              İlk oyuncular arasında yer alın!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
