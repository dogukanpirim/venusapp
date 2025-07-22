
import { notFound } from 'next/navigation';
import { PrismaClient } from '@prisma/client';
import { Calendar, Users, Trophy, MapPin, Clock, Target, Gamepad2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import Image from 'next/image';

const prisma = new PrismaClient();

interface TournamentDetailPageProps {
  params: {
    slug: string;
  };
}

async function getTournament(slug: string) {
  try {
    const tournament = await prisma.tournament.findUnique({
      where: { slug },
      include: {
        game: true,
        season: true,
        registrations: {
          include: {
            player: true
          }
        },
        results: {
          include: {
            player: true
          },
          orderBy: {
            position: 'asc'
          }
        },
        rewards: true
      }
    });
    return tournament;
  } catch (error) {
    console.error('Error fetching tournament:', error);
    return null;
  }
}

const statusColors = {
  UPCOMING: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  REGISTRATION_OPEN: 'bg-green-500/20 text-green-400 border-green-500/30',
  REGISTRATION_CLOSED: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  LIVE: 'bg-red-500/20 text-red-400 border-red-500/30',
  COMPLETED: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
  CANCELLED: 'bg-gray-600/20 text-gray-500 border-gray-600/30',
};

const statusLabels = {
  UPCOMING: 'Yaklaşan',
  REGISTRATION_OPEN: 'Kayıt Açık',
  REGISTRATION_CLOSED: 'Kayıt Kapalı',
  LIVE: 'Canlı',
  COMPLETED: 'Tamamlandı',
  CANCELLED: 'İptal',
};

export default async function TournamentDetailPage({ params }: TournamentDetailPageProps) {
  const tournament = await getTournament(params.slug);

  if (!tournament) {
    notFound();
  }

  const registrationCount = tournament.registrations.length;
  const spotsRemaining = tournament.maxParticipants - registrationCount;
  const isRegistrationOpen = tournament.status === 'REGISTRATION_OPEN';
  const hasResults = tournament.results.length > 0;

  return (
    <div className="min-h-screen bg-gray-900 pt-20">
      <div className="container mx-auto px-4 py-12">
        {/* Tournament Header */}
        <div className="relative mb-12">
          <div className="relative aspect-[16/6] overflow-hidden rounded-2xl">
            <Image
              src={tournament.game.image || '/placeholder-game.jpg'}
              alt={tournament.game.name}
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-black/80" />
            
            <div className="absolute inset-0 flex items-center">
              <div className="container mx-auto px-8">
                <div className="max-w-3xl">
                  <Badge className={`mb-4 ${statusColors[tournament.status as keyof typeof statusColors]}`}>
                    {statusLabels[tournament.status as keyof typeof statusLabels]}
                  </Badge>
                  
                  <h1 className="text-5xl font-bold text-white mb-4">
                    {tournament.title}
                  </h1>
                  
                  <p className="text-xl text-gray-300 mb-6">
                    {tournament.description}
                  </p>
                  
                  <div className="flex items-center space-x-6 text-gray-300">
                    <div className="flex items-center">
                      <Gamepad2 className="w-5 h-5 mr-2 text-purple-400" />
                      <span>{tournament.game.name}</span>
                    </div>
                    <div className="flex items-center">
                      <Calendar className="w-5 h-5 mr-2 text-purple-400" />
                      <span>
                        {new Date(tournament.startDate).toLocaleDateString('tr-TR', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                    {tournament.venue && (
                      <div className="flex items-center">
                        <MapPin className="w-5 h-5 mr-2 text-purple-400" />
                        <span>{tournament.venue}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Tournament Info */}
            <Card className="gaming-card">
              <CardHeader>
                <CardTitle className="text-white">Turnuva Bilgileri</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <div className="flex items-center text-gray-300">
                      <Users className="w-5 h-5 mr-3 text-purple-400" />
                      <span className="font-semibold">Katılımcılar:</span>
                      <span className="ml-auto">{registrationCount}/{tournament.maxParticipants}</span>
                    </div>
                    
                    <div className="flex items-center text-gray-300">
                      <Trophy className="w-5 h-5 mr-3 text-yellow-400" />
                      <span className="font-semibold">Toplam Ödül:</span>
                      <span className="ml-auto text-yellow-400 font-bold">
                        ₺{tournament.totalPrizePool.toLocaleString('tr-TR')}
                      </span>
                    </div>
                    
                    <div className="flex items-center text-gray-300">
                      <Target className="w-5 h-5 mr-3 text-green-400" />
                      <span className="font-semibold">Katılım Ücreti:</span>
                      <span className="ml-auto">₺{tournament.entryFee}</span>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center text-gray-300">
                      <Clock className="w-5 h-5 mr-3 text-blue-400" />
                      <span className="font-semibold">Format:</span>
                      <span className="ml-auto">{tournament.format.replace('_', ' ')}</span>
                    </div>
                    
                    <div className="flex items-center text-gray-300">
                      <Calendar className="w-5 h-5 mr-3 text-purple-400" />
                      <span className="font-semibold">Kayıt Bitiş:</span>
                      <span className="ml-auto">
                        {new Date(tournament.registrationEnd).toLocaleDateString('tr-TR')}
                      </span>
                    </div>
                    
                    {tournament.minRating && (
                      <div className="flex items-center text-gray-300">
                        <span className="font-semibold">Min. Rating:</span>
                        <span className="ml-auto">{tournament.minRating}</span>
                      </div>
                    )}
                  </div>
                </div>

                <Separator className="bg-gray-700" />

                {/* Prize Breakdown */}
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4">Ödül Dağılımı</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-4">
                      <div className="text-sm text-green-400 mb-1">Nakit Ödül</div>
                      <div className="text-2xl font-bold text-white">
                        ₺{tournament.cashPrize.toLocaleString('tr-TR')}
                      </div>
                    </div>
                    <div className="bg-purple-900/20 border border-purple-500/30 rounded-lg p-4">
                      <div className="text-sm text-purple-400 mb-1">Bonus Kredi</div>
                      <div className="text-2xl font-bold text-white">
                        ₺{tournament.bonusCredits.toLocaleString('tr-TR')}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Results */}
            {hasResults && (
              <Card className="gaming-card">
                <CardHeader>
                  <CardTitle className="text-white">Turnuva Sonuçları</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {tournament.results.slice(0, 10).map((result, index) => (
                      <div key={result.id} className="flex items-center p-3 bg-gray-800/50 rounded-lg">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 flex items-center justify-center text-white font-bold mr-4">
                          {result.position}
                        </div>
                        
                        <Avatar className="w-10 h-10 mr-3">
                          <AvatarImage src={result.player.avatar || undefined} />
                          <AvatarFallback>
                            {result.player.displayName.slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        
                        <div className="flex-1">
                          <div className="font-semibold text-white">
                            {result.player.displayName}
                          </div>
                          <div className="text-sm text-gray-400">
                            @{result.player.gamertag}
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
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Registration */}
            <Card className="gaming-card">
              <CardHeader>
                <CardTitle className="text-white">Kayıt</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {isRegistrationOpen && spotsRemaining > 0 ? (
                  <Button className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700">
                    Turnuvaya Kayıt Ol
                  </Button>
                ) : (
                  <Button disabled className="w-full">
                    {spotsRemaining === 0 ? 'Dolu' : 'Kayıt Kapalı'}
                  </Button>
                )}
                
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">
                    {spotsRemaining}
                  </div>
                  <div className="text-sm text-gray-400">Kalan Slot</div>
                </div>
              </CardContent>
            </Card>

            {/* Participants */}
            <Card className="gaming-card">
              <CardHeader>
                <CardTitle className="text-white">
                  Katılımcılar ({registrationCount})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-60 overflow-y-auto">
                  {tournament.registrations.map((registration) => (
                    <div key={registration.id} className="flex items-center">
                      <Avatar className="w-8 h-8 mr-3">
                        <AvatarImage src={registration.player.avatar || undefined} />
                        <AvatarFallback className="text-xs">
                          {registration.player.displayName.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-white truncate">
                          {registration.player.displayName}
                        </div>
                        <div className="text-xs text-gray-400 truncate">
                          @{registration.player.gamertag}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
