
'use client';

import { motion } from 'framer-motion';
import { TrendingUp, Crown, Star, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Link from 'next/link';

interface Player {
  id: string;
  gamertag: string;
  displayName: string;
  avatar?: string | null;
  currentRank: string;
  skillRating: number;
  totalPoints: number;
  winRate: number;
}

interface LeaderboardPreviewProps {
  players: Player[];
}

const rankColors = {
  'Bronze': 'text-orange-400',
  'Silver': 'text-gray-300',
  'Gold': 'text-yellow-400',
  'Platinum': 'text-cyan-400',
  'Diamond': 'text-blue-400',
  'Master': 'text-purple-400',
  'Grandmaster': 'text-red-400',
};

export default function LeaderboardPreview({ players }: LeaderboardPreviewProps) {
  const topPlayers = [...players]
    .sort((a, b) => b.totalPoints - a.totalPoints)
    .slice(0, 5);

  if (topPlayers.length === 0) {
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
            <Crown className="inline w-10 h-10 text-yellow-400 mb-2 mr-3" />
            Liderlik <span className="text-purple-400">Tablosu</span>
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            En başarılı oyuncularımızı keşfedin ve sıralamada yerinizi alın!
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto"
        >
          <Card className="gaming-card">
            <CardHeader className="text-center pb-6">
              <CardTitle className="text-2xl text-white flex items-center justify-center">
                <TrendingUp className="w-6 h-6 mr-2 text-purple-400" />
                Top 5 Oyuncular
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-1">
              {topPlayers.map((player, index) => {
                const position = index + 1;
                
                return (
                  <motion.div
                    key={player.id}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    viewport={{ once: true }}
                    className="flex items-center p-4 rounded-lg hover:bg-gray-800/30 transition-colors group"
                  >
                    {/* Position */}
                    <div className="flex items-center justify-center w-12 mr-4">
                      {position === 1 && (
                        <Crown className="w-8 h-8 text-yellow-400" />
                      )}
                      {position === 2 && (
                        <Star className="w-7 h-7 text-gray-400" />
                      )}
                      {position === 3 && (
                        <Star className="w-6 h-6 text-orange-400" />
                      )}
                      {position > 3 && (
                        <span className="text-xl font-bold text-gray-400">
                          #{position}
                        </span>
                      )}
                    </div>

                    {/* Player Info */}
                    <div className="flex items-center flex-1 min-w-0">
                      <Avatar className={`w-12 h-12 mr-4 border-2 ${
                        position === 1 ? 'border-yellow-400' :
                        position === 2 ? 'border-gray-400' :
                        position === 3 ? 'border-orange-400' :
                        'border-purple-500/30'
                      }`}>
                        <AvatarImage src={player.avatar || undefined} alt={player.displayName} />
                        <AvatarFallback className="bg-purple-600/20 text-purple-300 font-bold">
                          {player.displayName.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <h4 className="font-bold text-white truncate text-lg">
                            {player.displayName}
                          </h4>
                          <Badge 
                            variant="outline" 
                            className={`${rankColors[player.currentRank as keyof typeof rankColors]}`}
                          >
                            {player.currentRank}
                          </Badge>
                        </div>
                        <p className="text-gray-400 truncate">
                          @{player.gamertag}
                        </p>
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="flex items-center space-x-8 text-center">
                      <div>
                        <div className="text-2xl font-bold text-white">
                          {player.totalPoints.toLocaleString('tr-TR')}
                        </div>
                        <div className="text-sm text-gray-400">Puan</div>
                      </div>
                      
                      <div>
                        <div className="text-xl font-bold text-purple-400">
                          {Math.round(player.skillRating)}
                        </div>
                        <div className="text-sm text-gray-400">Rating</div>
                      </div>
                      
                      <div>
                        <div className="text-xl font-bold text-green-400">
                          %{player.winRate.toFixed(0)}
                        </div>
                        <div className="text-sm text-gray-400">Kazanma</div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </CardContent>
          </Card>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            viewport={{ once: true }}
            className="text-center mt-8"
          >
            <Button 
              size="lg" 
              variant="outline" 
              asChild
              className="border-purple-500/30 text-purple-400 hover:bg-purple-500/10"
            >
              <Link href="/leaderboard">
                <TrendingUp className="w-5 h-5 mr-2" />
                Tam Liderlik Tablosunu Gör
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
