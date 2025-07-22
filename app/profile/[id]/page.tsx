
import { notFound } from 'next/navigation';
import { PrismaClient } from '@prisma/client';
import { Trophy, TrendingUp, Target, Award, Calendar, Gamepad2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const prisma = new PrismaClient();

interface ProfilePageProps {
  params: {
    id: string;
  };
}

async function getPlayer(id: string) {
  try {
    const player = await prisma.player.findUnique({
      where: { id },
      include: {
        stats: {
          include: {
            game: true
          }
        },
        achievements: {
          include: {
            achievement: true
          }
        },
        results: {
          include: {
            tournament: {
              include: {
                game: true
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          },
          take: 10
        },
        registrations: {
          include: {
            tournament: {
              include: {
                game: true
              }
            },
            challenge: {
              include: {
                game: true
              }
            }
          }
        }
      }
    });
    return player;
  } catch (error) {
    console.error('Error fetching player:', error);
    return null;
  }
}

const rankColors = {
  'Bronze': 'bg-orange-700/20 text-orange-400 border-orange-600/30',
  'Silver': 'bg-gray-400/20 text-gray-300 border-gray-400/30',
  'Gold': 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  'Platinum': 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
  'Diamond': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  'Master': 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  'Grandmaster': 'bg-red-500/20 text-red-400 border-red-500/30',
};

export default async function ProfilePage({ params }: ProfilePageProps) {
  const player = await getPlayer(params.id);

  if (!player) {
    notFound();
  }

  const tournamentWins = player.results.filter(r => r.position === 1).length;
  const topThreeFinishes = player.results.filter(r => r.position <= 3).length;

  return (
    <div className="min-h-screen bg-gray-900 pt-20">
      <div className="container mx-auto px-4 py-12">
        {/* Player Header */}
        <div className="relative mb-12">
          <Card className="gaming-card bg-gradient-to-r from-purple-900/20 to-blue-900/20 border-purple-500/30">
            <CardContent className="p-8">
              <div className="flex flex-col md:flex-row items-center md:items-start space-y-6 md:space-y-0 md:space-x-8">
                <Avatar className="w-32 h-32 border-4 border-purple-500/50">
                  <AvatarImage src={player.avatar || undefined} alt={player.displayName} />
                  <AvatarFallback className="bg-purple-600/20 text-purple-300 text-4xl font-bold">
                    {player.displayName.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1 text-center md:text-left">
                  <h1 className="text-4xl font-bold text-white mb-2">
                    {player.displayName}
                  </h1>
                  <p className="text-xl text-gray-400 mb-4">@{player.gamertag}</p>
                  
                  <div className="flex flex-wrap justify-center md:justify-start gap-3 mb-6">
                    <Badge className={rankColors[player.currentRank as keyof typeof rankColors] || 'bg-gray-500/20 text-gray-400'}>
                      {player.currentRank}
                    </Badge>
                    <Badge variant="outline" className="text-purple-400 border-purple-500/30">
                      Skill Rating: {Math.round(player.skillRating)}
                    </Badge>
                  </div>
                  
                  {player.bio && (
                    <p className="text-gray-300 max-w-2xl">
                      {player.bio}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="gaming-card text-center">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-white mb-1">
                {player.totalPoints.toLocaleString('tr-TR')}
              </div>
              <div className="text-sm text-gray-400">Toplam Puan</div>
            </CardContent>
          </Card>
          
          <Card className="gaming-card text-center">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-green-400 mb-1">
                %{player.winRate.toFixed(0)}
              </div>
              <div className="text-sm text-gray-400">Kazanma Oranı</div>
            </CardContent>
          </Card>
          
          <Card className="gaming-card text-center">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-yellow-400 mb-1">
                {tournamentWins}
              </div>
              <div className="text-sm text-gray-400">Turnuva Zaferi</div>
            </CardContent>
          </Card>
          
          <Card className="gaming-card text-center">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-purple-400 mb-1">
                {player.totalMatches}
              </div>
              <div className="text-sm text-gray-400">Toplam Maç</div>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Stats Tabs */}
        <Tabs defaultValue="stats" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-8 bg-gray-800/50">
            <TabsTrigger value="stats" className="data-[state=active]:bg-purple-600">
              <TrendingUp className="w-4 h-4 mr-2" />
              İstatistikler
            </TabsTrigger>
            <TabsTrigger value="tournaments" className="data-[state=active]:bg-purple-600">
              <Trophy className="w-4 h-4 mr-2" />
              Turnuvalar
            </TabsTrigger>
            <TabsTrigger value="achievements" className="data-[state=active]:bg-purple-600">
              <Award className="w-4 h-4 mr-2" />
              Başarımlar
            </TabsTrigger>
            <TabsTrigger value="activity" className="data-[state=active]:bg-purple-600">
              <Calendar className="w-4 h-4 mr-2" />
              Aktivite
            </TabsTrigger>
          </TabsList>

          <TabsContent value="stats">
            <div className="grid md:grid-cols-2 gap-6">
              {player.stats.map((stat) => (
                <Card key={stat.id} className="gaming-card">
                  <CardHeader className="flex flex-row items-center space-y-0 pb-4">
                    <div className="w-10 h-10 rounded-lg overflow-hidden mr-3">
                      <img 
                        src={stat.game.image || '/placeholder-game.jpg'} 
                        alt={stat.game.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <CardTitle className="text-white">{stat.game.name}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <div className="text-lg font-bold text-white">{stat.gamesPlayed}</div>
                        <div className="text-xs text-gray-400">Oynanan</div>
                      </div>
                      <div>
                        <div className="text-lg font-bold text-green-400">{stat.wins}</div>
                        <div className="text-xs text-gray-400">Kazanılan</div>
                      </div>
                      <div>
                        <div className="text-lg font-bold text-red-400">{stat.losses}</div>
                        <div className="text-xs text-gray-400">Kaybedilen</div>
                      </div>
                    </div>
                    {stat.kills !== null && (
                      <div className="grid grid-cols-2 gap-4 text-center text-sm">
                        <div>
                          <div className="text-white font-semibold">{stat.kills}</div>
                          <div className="text-gray-400">Kills</div>
                        </div>
                        <div>
                          <div className="text-white font-semibold">{stat.deaths}</div>
                          <div className="text-gray-400">Deaths</div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="tournaments">
            <Card className="gaming-card">
              <CardHeader>
                <CardTitle className="text-white">Son Turnuva Sonuçları</CardTitle>
              </CardHeader>
              <CardContent>
                {player.results.length === 0 ? (
                  <div className="text-center py-8 text-gray-400">
                    <Trophy className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>Henüz turnuva sonucu bulunmuyor</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {player.results.map((result) => (
                      <div key={result.id} className="flex items-center p-3 bg-gray-800/50 rounded-lg">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold mr-4 ${
                          result.position === 1 ? 'bg-yellow-500' :
                          result.position === 2 ? 'bg-gray-400' :
                          result.position === 3 ? 'bg-orange-400' :
                          'bg-gray-600'
                        }`}>
                          {result.position}
                        </div>
                        
                        <div className="flex-1">
                          <div className="font-semibold text-white">
                            {result.tournament.title}
                          </div>
                          <div className="text-sm text-gray-400">
                            {result.tournament.game.name} • {new Date(result.createdAt).toLocaleDateString('tr-TR')}
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <div className="text-green-400 font-semibold">
                            ₺{result.cashEarned + result.creditsEarned}
                          </div>
                          <div className="text-sm text-gray-400">
                            +{result.pointsEarned} puan
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="achievements">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {player.achievements.length === 0 ? (
                <div className="col-span-full text-center py-8 text-gray-400">
                  <Award className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>Henüz başarım bulunmuyor</p>
                </div>
              ) : (
                player.achievements.map((playerAchievement) => (
                  <Card key={playerAchievement.id} className="gaming-card">
                    <CardContent className="p-4">
                      <div className="text-center">
                        <div className="text-2xl mb-2">
                          {playerAchievement.achievement.icon || '🏆'}
                        </div>
                        <h4 className="font-semibold text-white mb-1">
                          {playerAchievement.achievement.name}
                        </h4>
                        <p className="text-sm text-gray-400 mb-2">
                          {playerAchievement.achievement.description}
                        </p>
                        <Badge 
                          variant="outline" 
                          className="text-xs"
                        >
                          {playerAchievement.achievement.difficulty}
                        </Badge>
                        <div className="text-xs text-gray-500 mt-2">
                          {new Date(playerAchievement.unlockedAt).toLocaleDateString('tr-TR')}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="activity">
            <Card className="gaming-card">
              <CardHeader>
                <CardTitle className="text-white">Son Aktiviteler</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {player.registrations.slice(0, 10).map((registration) => (
                    <div key={registration.id} className="flex items-center p-3 bg-gray-800/50 rounded-lg">
                      <Gamepad2 className="w-5 h-5 text-purple-400 mr-3" />
                      <div className="flex-1">
                        <div className="text-white">
                          {registration.tournament ? 
                            `${registration.tournament.title} turnuvasına katıldı` :
                            `${registration.challenge?.title} challenge'ına katıldı`
                          }
                        </div>
                        <div className="text-sm text-gray-400">
                          {new Date(registration.createdAt).toLocaleDateString('tr-TR')}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
