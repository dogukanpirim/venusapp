
import { Suspense } from 'react';
import { PrismaClient } from '@prisma/client';
import { Target, Calendar, Gift, Gamepad2 } from 'lucide-react';
import ChallengeCard from '@/components/challenge-card';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const prisma = new PrismaClient();

async function getChallenges() {
  try {
    const challenges = await prisma.challenge.findMany({
      include: {
        game: true,
      },
      orderBy: [
        { type: 'asc' },
        { endDate: 'asc' }
      ]
    });
    return challenges;
  } catch (error) {
    console.error('Error fetching challenges:', error);
    return [];
  }
}

async function getChallengeStats() {
  try {
    const totalChallenges = await prisma.challenge.count();
    const activeChallenges = await prisma.challenge.count({
      where: {
        status: 'ACTIVE'
      }
    });
    const totalRewards = await prisma.challenge.aggregate({
      _sum: {
        creditsReward: true,
        pointsReward: true
      }
    });

    return {
      totalChallenges,
      activeChallenges,
      totalCredits: totalRewards._sum.creditsReward || 0,
      totalPoints: totalRewards._sum.pointsReward || 0
    };
  } catch (error) {
    console.error('Error fetching challenge stats:', error);
    return {
      totalChallenges: 0,
      activeChallenges: 0,
      totalCredits: 0,
      totalPoints: 0
    };
  }
}

function ChallengesSkeleton() {
  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="animate-pulse">
          <div className="gaming-card h-[500px] bg-gray-800/50"></div>
        </div>
      ))}
    </div>
  );
}

export default async function ChallengesPage() {
  const [challenges, stats] = await Promise.all([
    getChallenges(),
    getChallengeStats()
  ]);

  const dailyChallenges = challenges.filter(c => c.type === 'DAILY' && c.status === 'ACTIVE');
  const weeklyChallenges = challenges.filter(c => c.type === 'WEEKLY' && c.status === 'ACTIVE');
  const monthlyChallenges = challenges.filter(c => c.type === 'MONTHLY' && c.status === 'ACTIVE');
  const specialChallenges = challenges.filter(c => c.type === 'SPECIAL' && c.status === 'ACTIVE');
  const expiredChallenges = challenges.filter(c => c.status === 'EXPIRED');

  return (
    <div className="min-h-screen bg-gray-900 pt-20">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-white mb-4">
            <Target className="inline w-12 h-12 text-purple-400 mb-2 mr-4" />
            Challenge'lar
          </h1>
          <p className="text-gray-400 text-xl max-w-3xl mx-auto">
            Günlük, haftalık ve özel challenge'ları tamamlayarak puan ve ödül kazan!
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          <Card className="gaming-card text-center">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-white mb-1">
                {stats.totalChallenges}
              </div>
              <div className="text-sm text-gray-400">Toplam Challenge</div>
            </CardContent>
          </Card>
          
          <Card className="gaming-card text-center">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-green-400 mb-1">
                {stats.activeChallenges}
              </div>
              <div className="text-sm text-gray-400">Aktif Challenge</div>
            </CardContent>
          </Card>
          
          <Card className="gaming-card text-center">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-yellow-400 mb-1">
                {stats.totalPoints.toLocaleString('tr-TR')}
              </div>
              <div className="text-sm text-gray-400">Toplam Puan</div>
            </CardContent>
          </Card>
          
          <Card className="gaming-card text-center">
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-purple-400 mb-1">
                ₺{stats.totalCredits.toLocaleString('tr-TR')}
              </div>
              <div className="text-sm text-gray-400">Toplam Kredi</div>
            </CardContent>
          </Card>
        </div>

        {/* Daily Challenges */}
        {dailyChallenges.length > 0 && (
          <section className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-3xl font-bold text-white">
                Günlük Challenge'lar
                <Badge className="ml-3 bg-blue-500/20 text-blue-400 border-blue-500/30">
                  {dailyChallenges.length}
                </Badge>
              </h2>
              <div className="flex items-center text-sm text-gray-400">
                <Calendar className="w-4 h-4 mr-2" />
                Her gün yenilenir
              </div>
            </div>
            <Suspense fallback={<ChallengesSkeleton />}>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {dailyChallenges.map((challenge) => (
                  <ChallengeCard 
                    key={challenge.id} 
                    challenge={{
                      ...challenge,
                      startDate: challenge.startDate.toISOString(),
                      endDate: challenge.endDate.toISOString(),
                    }} 
                  />
                ))}
              </div>
            </Suspense>
          </section>
        )}

        {/* Weekly Challenges */}
        {weeklyChallenges.length > 0 && (
          <section className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-3xl font-bold text-white">
                Haftalık Challenge'lar
                <Badge className="ml-3 bg-purple-500/20 text-purple-400 border-purple-500/30">
                  {weeklyChallenges.length}
                </Badge>
              </h2>
              <div className="flex items-center text-sm text-gray-400">
                <Calendar className="w-4 h-4 mr-2" />
                Haftalık
              </div>
            </div>
            <Suspense fallback={<ChallengesSkeleton />}>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {weeklyChallenges.map((challenge) => (
                  <ChallengeCard 
                    key={challenge.id} 
                    challenge={{
                      ...challenge,
                      startDate: challenge.startDate.toISOString(),
                      endDate: challenge.endDate.toISOString(),
                    }} 
                  />
                ))}
              </div>
            </Suspense>
          </section>
        )}

        {/* Monthly Challenges */}
        {monthlyChallenges.length > 0 && (
          <section className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-3xl font-bold text-white">
                Aylık Challenge'lar
                <Badge className="ml-3 bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
                  {monthlyChallenges.length}
                </Badge>
              </h2>
              <div className="flex items-center text-sm text-gray-400">
                <Calendar className="w-4 h-4 mr-2" />
                Aylık
              </div>
            </div>
            <Suspense fallback={<ChallengesSkeleton />}>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {monthlyChallenges.map((challenge) => (
                  <ChallengeCard 
                    key={challenge.id} 
                    challenge={{
                      ...challenge,
                      startDate: challenge.startDate.toISOString(),
                      endDate: challenge.endDate.toISOString(),
                    }} 
                  />
                ))}
              </div>
            </Suspense>
          </section>
        )}

        {/* Special Challenges */}
        {specialChallenges.length > 0 && (
          <section className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-3xl font-bold text-white">
                Özel Challenge'lar
                <Badge className="ml-3 bg-red-500/20 text-red-400 border-red-500/30">
                  {specialChallenges.length}
                </Badge>
              </h2>
              <div className="flex items-center text-sm text-gray-400">
                <Gift className="w-4 h-4 mr-2" />
                Sınırlı süre
              </div>
            </div>
            <Suspense fallback={<ChallengesSkeleton />}>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {specialChallenges.map((challenge) => (
                  <ChallengeCard 
                    key={challenge.id} 
                    challenge={{
                      ...challenge,
                      startDate: challenge.startDate.toISOString(),
                      endDate: challenge.endDate.toISOString(),
                    }} 
                  />
                ))}
              </div>
            </Suspense>
          </section>
        )}

        {/* No Active Challenges */}
        {stats.activeChallenges === 0 && (
          <div className="text-center py-16">
            <Target className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-400 mb-2">
              Şu anda aktif challenge bulunmuyor
            </h3>
            <p className="text-gray-500">
              Yakında yeni challenge'lar ekleyeceğiz!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
