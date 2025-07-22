
'use client';

import { motion } from 'framer-motion';
import { Trophy, Calendar, Users, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { ClientDate } from './client-date';

interface Tournament {
  id: string;
  title: string;
  slug: string;
  game: {
    name: string;
    image?: string | null;
  };
  status: string;
  maxParticipants: number;
  registrations?: any[];
  totalPrizePool: number;
  startDate: string | Date;
}

interface ActiveTournamentsPreviewProps {
  tournaments: Tournament[];
}

const statusLabels = {
  UPCOMING: 'Yaklaşan',
  REGISTRATION_OPEN: 'Kayıt Açık',
  REGISTRATION_CLOSED: 'Kayıt Kapalı',
  LIVE: 'Canlı',
  COMPLETED: 'Tamamlandı',
  CANCELLED: 'İptal',
};

const statusColors = {
  UPCOMING: 'bg-blue-500/20 text-blue-400',
  REGISTRATION_OPEN: 'bg-green-500/20 text-green-400',
  REGISTRATION_CLOSED: 'bg-yellow-500/20 text-yellow-400',
  LIVE: 'bg-red-500/20 text-red-400',
  COMPLETED: 'bg-gray-500/20 text-gray-400',
  CANCELLED: 'bg-gray-600/20 text-gray-500',
};

export default function ActiveTournamentsPreview({ tournaments }: ActiveTournamentsPreviewProps) {
  const activeTournaments = tournaments.filter(t => 
    ['UPCOMING', 'REGISTRATION_OPEN', 'LIVE'].includes(t.status)
  ).slice(0, 3);

  if (activeTournaments.length === 0) {
    return null;
  }

  return (
    <section className="py-20 relative">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl font-bold text-white mb-4">
            Aktif <span className="text-purple-400">Turnuvalar</span>
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Heyecan verici turnuvalarda yeteneklerini sergileyip büyük ödüller kazan!
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {activeTournaments.map((tournament, index) => {
            const registrationCount = tournament.registrations?.length || 0;
            
            return (
              <motion.div
                key={tournament.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -5 }}
              >
                <Card className="gaming-card group h-full">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between mb-2">
                      <Badge className={statusColors[tournament.status as keyof typeof statusColors]}>
                        {statusLabels[tournament.status as keyof typeof statusLabels]}
                      </Badge>
                      <div className="text-right">
                        <div className="text-sm text-gray-400">Ödül Havuzu</div>
                        <div className="text-lg font-bold text-yellow-400">
                          ₺{tournament.totalPrizePool.toLocaleString('tr-TR')}
                        </div>
                      </div>
                    </div>
                    <CardTitle className="text-lg text-white line-clamp-2">
                      {tournament.title}
                    </CardTitle>
                    <p className="text-sm text-purple-400">{tournament.game.name}</p>
                  </CardHeader>

                  <CardContent className="space-y-3">
                    <div className="flex items-center text-sm text-gray-300">
                      <Calendar className="w-4 h-4 mr-2 text-purple-400" />
                      <span>
                        <ClientDate 
                          date={tournament.startDate} 
                          format="datetime"
                          options={{
                            day: 'numeric',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit'
                          }}
                        />
                      </span>
                    </div>

                    <div className="flex items-center text-sm text-gray-300">
                      <Users className="w-4 h-4 mr-2 text-purple-400" />
                      <span>{registrationCount}/{tournament.maxParticipants} Katılımcı</span>
                    </div>

                    <Button 
                      asChild 
                      className="w-full mt-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                    >
                      <Link href={`/tournaments/${tournament.slug}`}>
                        Detayları Gör
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <Button 
            size="lg" 
            variant="outline" 
            asChild
            className="border-purple-500/30 text-purple-400 hover:bg-purple-500/10"
          >
            <Link href="/tournaments">
              <Trophy className="w-5 h-5 mr-2" />
              Tüm Turnuvaları Gör
            </Link>
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
