
'use client';

import { motion } from 'framer-motion';
import { Calendar, Users, Trophy, Gamepad2, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { ClientDate } from '@/components/client-date';
import Link from 'next/link';
import Image from 'next/image';

interface TournamentCardProps {
  tournament: {
    id: string;
    title: string;
    slug: string;
    description?: string | null;
    image?: string | null;
    game: {
      name: string;
      image?: string | null;
      category: string;
    };
    status: string;
    maxParticipants: number;
    registrations: any[];
    totalPrizePool: number;
    cashPrize: number;
    bonusCredits: number;
    entryFee: number;
    startDate: string;
    registrationEnd: string;
    venue?: string | null;
  };
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

export default function TournamentCard({ tournament }: TournamentCardProps) {
  const registrationCount = tournament.registrations?.length || 0;
  const spotsRemaining = tournament.maxParticipants - registrationCount;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
      className="h-full"
    >
      <Card className="gaming-card group h-full flex flex-col overflow-hidden">
        <CardHeader className="p-0 relative">
          {/* Game Image */}
          <div className="relative aspect-video overflow-hidden">
            <Image
              src={tournament.game.image || '/placeholder-game.jpg'}
              alt={tournament.game.name}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            
            {/* Status Badge */}
            <Badge 
              className={`absolute top-3 right-3 ${statusColors[tournament.status as keyof typeof statusColors]}`}
            >
              {statusLabels[tournament.status as keyof typeof statusLabels]}
            </Badge>
            
            {/* Game Category */}
            <Badge 
              variant="secondary" 
              className="absolute top-3 left-3 bg-purple-500/20 text-purple-300 border-purple-500/30"
            >
              <Gamepad2 className="w-3 h-3 mr-1" />
              {tournament.game.category}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="flex-1 p-4 space-y-3">
          {/* Tournament Title */}
          <div>
            <h3 className="font-bold text-lg text-white mb-1 line-clamp-2">
              {tournament.title}
            </h3>
            <p className="text-sm text-gray-400 line-clamp-2">
              {tournament.description}
            </p>
          </div>

          {/* Tournament Info */}
          <div className="space-y-2">
            <div className="flex items-center text-sm text-gray-300">
              <Calendar className="w-4 h-4 mr-2 text-purple-400" />
              <ClientDate 
                date={tournament.startDate}
                format="datetime"
                options={{
                  day: 'numeric',
                  month: 'long',
                  hour: '2-digit',
                  minute: '2-digit'
                }}
              />
            </div>

            <div className="flex items-center text-sm text-gray-300">
              <Users className="w-4 h-4 mr-2 text-purple-400" />
              <span>{registrationCount}/{tournament.maxParticipants} Katılımcı</span>
              {spotsRemaining > 0 && (
                <span className="ml-2 text-green-400">
                  ({spotsRemaining} slot kaldı)
                </span>
              )}
            </div>

            <div className="flex items-center text-sm text-gray-300">
              <Trophy className="w-4 h-4 mr-2 text-yellow-400" />
              <span className="font-semibold">
                {tournament.totalPrizePool.toLocaleString('tr-TR')} TL Ödül
              </span>
            </div>

            {tournament.venue && (
              <div className="flex items-center text-sm text-gray-300">
                <Clock className="w-4 h-4 mr-2 text-purple-400" />
                <span>{tournament.venue}</span>
              </div>
            )}
          </div>

          {/* Prize Breakdown */}
          <div className="bg-gray-800/50 rounded-lg p-3 space-y-1">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Nakit Ödül:</span>
              <span className="text-green-400 font-semibold">
                ₺{tournament.cashPrize.toLocaleString('tr-TR')}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Bonus Kredi:</span>
              <span className="text-purple-400 font-semibold">
                ₺{tournament.bonusCredits.toLocaleString('tr-TR')}
              </span>
            </div>
            <div className="flex justify-between text-sm border-t border-gray-700 pt-1">
              <span className="text-gray-400">Katılım Ücreti:</span>
              <span className="text-white font-semibold">
                ₺{tournament.entryFee}
              </span>
            </div>
          </div>
        </CardContent>

        <CardFooter className="p-4 pt-0">
          <Button 
            asChild 
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
          >
            <Link href={`/tournaments/${tournament.slug}`}>
              {tournament.status === 'REGISTRATION_OPEN' ? 'Kayıt Ol' : 'Detayları Gör'}
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
}
