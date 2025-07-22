
'use client';

import { motion } from 'framer-motion';
import { Trophy, Medal, Award, TrendingUp, Users, Gamepad2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
  totalMatches: number;
  totalWins: number;
  winRate: number;
}

interface LeaderboardTableProps {
  players: Player[];
  title?: string;
  game?: {
    name: string;
    image?: string | null;
  };
  showGame?: boolean;
}

const rankIcons = {
  1: Trophy,
  2: Medal,
  3: Award,
};

const rankColors = {
  'Bronze': 'bg-orange-700/20 text-orange-400 border-orange-600/30',
  'Silver': 'bg-gray-400/20 text-gray-300 border-gray-400/30',
  'Gold': 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  'Platinum': 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
  'Diamond': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  'Master': 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  'Grandmaster': 'bg-red-500/20 text-red-400 border-red-500/30',
};

export default function LeaderboardTable({ 
  players, 
  title = "Genel Liderlik Tablosu",
  game,
  showGame = false 
}: LeaderboardTableProps) {
  const sortedPlayers = [...players].sort((a, b) => b.totalPoints - a.totalPoints);

  return (
    <Card className="gaming-card">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div className="flex items-center space-x-3">
          {showGame && game && (
            <div className="w-10 h-10 rounded-lg overflow-hidden">
              <img 
                src={game.image || '/placeholder-game.jpg'} 
                alt={game.name}
                className="w-full h-full object-cover"
              />
            </div>
          )}
          <div>
            <CardTitle className="text-xl text-white font-bold">
              {title}
            </CardTitle>
            {showGame && game && (
              <p className="text-sm text-gray-400">{game.name} Sıralaması</p>
            )}
          </div>
        </div>
        <Button variant="outline" size="sm" asChild>
          <Link href="/leaderboard">
            <TrendingUp className="w-4 h-4 mr-2" />
            Tümünü Gör
          </Link>
        </Button>
      </CardHeader>

      <CardContent className="p-0">
        <div className="overflow-hidden">
          {sortedPlayers.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>Henüz oyuncu bulunmuyor</p>
            </div>
          ) : (
            <div className="space-y-1">
              {sortedPlayers.slice(0, 10).map((player, index) => {
                const position = index + 1;
                const RankIcon = rankIcons[position as keyof typeof rankIcons];
                
                return (
                  <motion.div
                    key={player.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className="flex items-center p-4 hover:bg-gray-800/30 transition-colors border-b border-gray-800/50 last:border-b-0"
                  >
                    {/* Position */}
                    <div className="flex items-center justify-center w-12 mr-4">
                      {RankIcon ? (
                        <RankIcon 
                          className={`w-6 h-6 ${
                            position === 1 ? 'text-yellow-400' :
                            position === 2 ? 'text-gray-400' :
                            'text-orange-400'
                          }`}
                        />
                      ) : (
                        <span className="text-lg font-bold text-gray-400">
                          #{position}
                        </span>
                      )}
                    </div>

                    {/* Player Avatar & Info */}
                    <div className="flex items-center flex-1 min-w-0">
                      <Avatar className="w-10 h-10 mr-3 border-2 border-purple-500/30">
                        <AvatarImage src={player.avatar || undefined} alt={player.displayName} />
                        <AvatarFallback className="bg-purple-600/20 text-purple-300">
                          {player.displayName.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <h4 className="font-semibold text-white truncate">
                            {player.displayName}
                          </h4>
                          <Badge 
                            variant="outline" 
                            className={rankColors[player.currentRank as keyof typeof rankColors] || 'bg-gray-500/20 text-gray-400'}
                          >
                            {player.currentRank}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-400 truncate">
                          @{player.gamertag}
                        </p>
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="flex items-center space-x-6 text-sm">
                      <div className="text-center">
                        <div className="font-bold text-white">
                          {player.totalPoints.toLocaleString('tr-TR')}
                        </div>
                        <div className="text-gray-400">Puan</div>
                      </div>
                      
                      <div className="text-center">
                        <div className="font-bold text-purple-400">
                          {Math.round(player.skillRating)}
                        </div>
                        <div className="text-gray-400">Rating</div>
                      </div>
                      
                      <div className="text-center">
                        <div className="font-bold text-green-400">
                          %{player.winRate.toFixed(0)}
                        </div>
                        <div className="text-gray-400">WR</div>
                      </div>
                      
                      <div className="text-center">
                        <div className="font-bold text-blue-400">
                          {player.totalWins}/{player.totalMatches}
                        </div>
                        <div className="text-gray-400">W/L</div>
                      </div>
                    </div>

                    {/* Action Button */}
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="ml-4 text-purple-400 hover:text-purple-300"
                      asChild
                    >
                      <Link href={`/profile/${player.id}`}>
                        <Gamepad2 className="w-4 h-4" />
                      </Link>
                    </Button>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>

        {sortedPlayers.length > 10 && (
          <div className="p-4 text-center border-t border-gray-800/50">
            <Button variant="outline" asChild>
              <Link href="/leaderboard">
                +{sortedPlayers.length - 10} oyuncu daha
              </Link>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
