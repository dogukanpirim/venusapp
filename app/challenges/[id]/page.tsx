
import { notFound } from 'next/navigation';
import { PrismaClient } from '@prisma/client';
import { Calendar, Target, Gift, Clock, Gamepad2, Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import Image from 'next/image';

const prisma = new PrismaClient();

interface ChallengeDetailPageProps {
  params: {
    id: string;
  };
}

async function getChallenge(id: string) {
  try {
    const challenge = await prisma.challenge.findUnique({
      where: { id },
      include: {
        game: true,
        registrations: {
          include: {
            player: true
          }
        }
      }
    });
    return challenge;
  } catch (error) {
    console.error('Error fetching challenge:', error);
    return null;
  }
}

const typeColors = {
  DAILY: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  WEEKLY: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  MONTHLY: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  SPECIAL: 'bg-red-500/20 text-red-400 border-red-500/30',
};

const typeLabels = {
  DAILY: 'Günlük',
  WEEKLY: 'Haftalık',
  MONTHLY: 'Aylık',
  SPECIAL: 'Özel',
};

const difficultyColors = {
  Easy: 'bg-green-500/20 text-green-400 border-green-500/30',
  Medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  Hard: 'bg-red-500/20 text-red-400 border-red-500/30',
  Expert: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
};

const difficultyLabels = {
  Easy: 'Kolay',
  Medium: 'Orta',
  Hard: 'Zor',
  Expert: 'Uzman',
};

export default async function ChallengeDetailPage({ params }: ChallengeDetailPageProps) {
  const challenge = await getChallenge(params.id);

  if (!challenge) {
    notFound();
  }

  const progress = (challenge.currentProgress / challenge.targetValue) * 100;
  const isCompleted = challenge.status === 'COMPLETED' || progress >= 100;
  const isExpired = challenge.status === 'EXPIRED';
  const registrationCount = challenge.registrations.length;
  
  const timeRemaining = new Date(challenge.endDate).getTime() - new Date().getTime();
  const hoursRemaining = Math.max(0, Math.floor(timeRemaining / (1000 * 60 * 60)));

  return (
    <div className="min-h-screen bg-gray-900 pt-20">
      <div className="container mx-auto px-4 py-12">
        {/* Challenge Header */}
        <div className="relative mb-12">
          <div className="relative aspect-[16/6] overflow-hidden rounded-2xl">
            <Image
              src={challenge.game.image || '/placeholder-game.jpg'}
              alt={challenge.game.name}
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-black/80" />
            
            <div className="absolute inset-0 flex items-center">
              <div className="container mx-auto px-8">
                <div className="max-w-3xl">
                  <div className="flex items-center space-x-3 mb-4">
                    <Badge className={typeColors[challenge.type as keyof typeof typeColors]}>
                      {typeLabels[challenge.type as keyof typeof typeLabels]}
                    </Badge>
                    <Badge className={difficultyColors[challenge.difficulty as keyof typeof difficultyColors]}>
                      {difficultyLabels[challenge.difficulty as keyof typeof difficultyLabels]}
                    </Badge>
                    {isCompleted && (
                      <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                        ✅ Tamamlandı
                      </Badge>
                    )}
                    {isExpired && (
                      <Badge className="bg-gray-500/20 text-gray-400 border-gray-500/30">
                        ⏰ Süre Doldu
                      </Badge>
                    )}
                  </div>
                  
                  <h1 className="text-5xl font-bold text-white mb-4">
                    {challenge.title}
                  </h1>
                  
                  <p className="text-xl text-gray-300 mb-6">
                    {challenge.description}
                  </p>
                  
                  <div className="flex items-center space-x-6 text-gray-300">
                    <div className="flex items-center">
                      <Gamepad2 className="w-5 h-5 mr-2 text-purple-400" />
                      <span>{challenge.game.name}</span>
                    </div>
                    <div className="flex items-center">
                      <Calendar className="w-5 h-5 mr-2 text-purple-400" />
                      <span>
                        {new Date(challenge.endDate).toLocaleDateString('tr-TR', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric'
                        })}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <Users className="w-5 h-5 mr-2 text-purple-400" />
                      <span>{registrationCount} Katılımcı</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Challenge Details */}
            <Card className="gaming-card">
              <CardHeader>
                <CardTitle className="text-white">Challenge Detayları</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <div className="flex items-center text-gray-300">
                      <Target className="w-5 h-5 mr-3 text-purple-400" />
                      <span className="font-semibold">Hedef:</span>
                      <span className="ml-auto">{challenge.target}</span>
                    </div>
                    
                    <div className="flex items-center text-gray-300">
                      <Gift className="w-5 h-5 mr-3 text-yellow-400" />
                      <span className="font-semibold">Puan Ödülü:</span>
                      <span className="ml-auto text-yellow-400 font-bold">
                        +{challenge.pointsReward}
                      </span>
                    </div>
                    
                    <div className="flex items-center text-gray-300">
                      <Gift className="w-5 h-5 mr-3 text-green-400" />
                      <span className="font-semibold">Kredi Ödülü:</span>
                      <span className="ml-auto text-green-400 font-bold">
                        ₺{challenge.creditsReward}
                      </span>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center text-gray-300">
                      <Calendar className="w-5 h-5 mr-3 text-blue-400" />
                      <span className="font-semibold">Başlangıç:</span>
                      <span className="ml-auto">
                        {new Date(challenge.startDate).toLocaleDateString('tr-TR')}
                      </span>
                    </div>
                    
                    <div className="flex items-center text-gray-300">
                      <Calendar className="w-5 h-5 mr-3 text-red-400" />
                      <span className="font-semibold">Bitiş:</span>
                      <span className="ml-auto">
                        {new Date(challenge.endDate).toLocaleDateString('tr-TR')}
                      </span>
                    </div>
                    
                    {!isExpired && !isCompleted && (
                      <div className="flex items-center text-orange-400">
                        <Clock className="w-5 h-5 mr-3" />
                        <span className="font-semibold">Kalan Süre:</span>
                        <span className="ml-auto">
                          {hoursRemaining > 24 
                            ? `${Math.floor(hoursRemaining / 24)} gün`
                            : `${hoursRemaining} saat`
                          }
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <Separator className="bg-gray-700" />

                {/* Progress */}
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4">İlerleme</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Mevcut İlerleme</span>
                      <span className="text-white font-semibold">
                        {challenge.currentProgress}/{challenge.targetValue}
                      </span>
                    </div>
                    <Progress value={progress} className="h-3 bg-gray-800" />
                    <div className="text-sm text-gray-400">
                      {progress.toFixed(1)}% tamamlandı
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Game Info */}
            <Card className="gaming-card">
              <CardHeader>
                <CardTitle className="text-white">Oyun Bilgileri</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 rounded-lg overflow-hidden">
                    <img 
                      src={challenge.game.image || '/placeholder-game.jpg'} 
                      alt={challenge.game.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h4 className="text-xl font-semibold text-white mb-1">
                      {challenge.game.name}
                    </h4>
                    <p className="text-gray-400">{challenge.game.category}</p>
                    <div className="flex items-center mt-2">
                      <span className="text-sm text-gray-500">Platformlar:</span>
                      <div className="flex space-x-2 ml-2">
                        {challenge.game.platforms.map((platform) => (
                          <Badge key={platform} variant="outline" className="text-xs">
                            {platform}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Join Challenge */}
            <Card className="gaming-card">
              <CardHeader>
                <CardTitle className="text-white">Challenge'a Katıl</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {isCompleted ? (
                  <Button disabled className="w-full bg-green-600">
                    ✅ Tamamlandı
                  </Button>
                ) : isExpired ? (
                  <Button disabled className="w-full bg-gray-600">
                    ⏰ Süre Doldu
                  </Button>
                ) : (
                  <Button className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
                    Challenge'a Katıl
                  </Button>
                )}
                
                <div className="text-center text-sm text-gray-400">
                  {registrationCount} oyuncu katıldı
                </div>
              </CardContent>
            </Card>

            {/* Rewards */}
            <Card className="gaming-card">
              <CardHeader>
                <CardTitle className="text-white">Ödüller</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-3">
                  <div className="text-sm text-yellow-400 mb-1">Puan Ödülü</div>
                  <div className="text-xl font-bold text-white">
                    +{challenge.pointsReward} Puan
                  </div>
                </div>
                <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-3">
                  <div className="text-sm text-green-400 mb-1">Kredi Ödülü</div>
                  <div className="text-xl font-bold text-white">
                    ₺{challenge.creditsReward}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
