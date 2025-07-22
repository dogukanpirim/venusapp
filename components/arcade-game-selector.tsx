
'use client';

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { GameTitle } from '@prisma/client';

interface GameConfig {
  gameTitle: GameTitle;
  displayName: string;
  shortName: string;
  slug: string;
  logo: string | null;
  banner: string | null;
  icon: string | null;
  primaryColor: string;
  hasRanks: boolean;
}

interface GameSelectorProps {
  games: GameConfig[];
  selectedGame: GameTitle | null;
  onGameSelect: (game: GameTitle | null) => void;
}

export function ArcadeGameSelector({ games, selectedGame, onGameSelect }: GameSelectorProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">Select Game</h3>
        <Button
          variant={selectedGame === null ? "default" : "outline"}
          size="sm"
          onClick={() => onGameSelect(null)}
          className={selectedGame === null ? "bg-purple-600 hover:bg-purple-700" : ""}
        >
          All Games
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {games.map((game) => (
          <motion.div
            key={game.gameTitle}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Card
              className={`cursor-pointer transition-all duration-300 hover:shadow-lg ${
                selectedGame === game.gameTitle
                  ? 'border-2 shadow-lg'
                  : 'border border-slate-700 hover:border-slate-600'
              }`}
              style={{
                borderColor: selectedGame === game.gameTitle ? game.primaryColor : undefined,
                boxShadow: selectedGame === game.gameTitle ? `0 0 20px ${game.primaryColor}40` : undefined,
              }}
              onClick={() => onGameSelect(game.gameTitle)}
            >
              <div className="p-4">
                <div className="flex items-center space-x-3">
                  {/* Game Icon/Logo */}
                  <div
                    className="w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold text-lg"
                    style={{
                      backgroundColor: `${game.primaryColor}20`,
                      border: `1px solid ${game.primaryColor}40`,
                    }}
                  >
                    {game.icon ? (
                      <img 
                        src={game.icon} 
                        alt={game.displayName}
                        className="w-8 h-8 object-contain"
                      />
                    ) : (
                      game.shortName
                    )}
                  </div>

                  {/* Game Info */}
                  <div className="flex-1">
                    <h4 className="font-semibold text-white text-sm">
                      {game.displayName}
                    </h4>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge
                        variant="secondary"
                        className="text-xs"
                        style={{
                          backgroundColor: `${game.primaryColor}20`,
                          color: game.primaryColor,
                          borderColor: `${game.primaryColor}40`,
                        }}
                      >
                        {game.shortName}
                      </Badge>
                      {game.hasRanks && (
                        <Badge variant="outline" className="text-xs text-slate-400 border-slate-600">
                          Ranked
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Selection Indicator */}
                  {selectedGame === game.gameTitle && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="w-6 h-6 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: game.primaryColor }}
                    >
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </motion.div>
                  )}
                </div>

                {/* Game Banner (if available) */}
                {game.banner && selectedGame === game.gameTitle && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    className="mt-3 rounded-lg overflow-hidden"
                  >
                    <img 
                      src={game.banner} 
                      alt={`${game.displayName} banner`}
                      className="w-full h-20 object-cover"
                    />
                  </motion.div>
                )}
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
