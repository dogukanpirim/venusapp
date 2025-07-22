
'use client';

import { motion } from 'framer-motion';

interface LootBox3DProps {
  isOpening: boolean;
  rarity: string;
}

export function LootBox3D({ isOpening, rarity }: LootBox3DProps) {
  // Rarity-based colors and effects
  const getRarityStyles = (rarity: string) => {
    switch (rarity) {
      case 'COMMON':
        return {
          boxColor: 'from-gray-400 to-gray-600',
          borderColor: 'border-gray-400',
          glowColor: 'shadow-gray-400/50',
          sparkleColor: 'text-gray-300'
        };
      case 'RARE':
        return {
          boxColor: 'from-blue-400 to-blue-600',
          borderColor: 'border-blue-400',
          glowColor: 'shadow-blue-400/50',
          sparkleColor: 'text-blue-300'
        };
      case 'EPIC':
        return {
          boxColor: 'from-purple-400 to-purple-600',
          borderColor: 'border-purple-400',
          glowColor: 'shadow-purple-400/50',
          sparkleColor: 'text-purple-300'
        };
      case 'LEGENDARY':
        return {
          boxColor: 'from-yellow-400 to-yellow-600',
          borderColor: 'border-yellow-400',
          glowColor: 'shadow-yellow-400/50',
          sparkleColor: 'text-yellow-300'
        };
      default:
        return {
          boxColor: 'from-gray-400 to-gray-600',
          borderColor: 'border-gray-400',
          glowColor: 'shadow-gray-400/50',
          sparkleColor: 'text-gray-300'
        };
    }
  };

  const styles = getRarityStyles(rarity);

  return (
    <div className="relative w-48 h-48 mx-auto">
      {/* Floating Animation Container */}
      <motion.div
        className="relative w-full h-full"
        animate={{
          y: isOpening ? [0, -20, 0] : [0, -10, 0],
          rotateY: isOpening ? [0, 360] : [0, 5, -5, 0],
        }}
        transition={{
          y: {
            duration: isOpening ? 0.8 : 3,
            repeat: Infinity,
            ease: "easeInOut"
          },
          rotateY: {
            duration: isOpening ? 1 : 8,
            repeat: Infinity,
            ease: "linear"
          }
        }}
        style={{ perspective: '1000px' }}
      >
        {/* Main Loot Box */}
        <motion.div
          className={`
            relative w-full h-full rounded-2xl border-4 ${styles.borderColor}
            bg-gradient-to-br ${styles.boxColor}
            shadow-2xl ${isOpening ? styles.glowColor : ''}
            transform-gpu preserve-3d
          `}
          animate={{
            scale: isOpening ? [1, 1.1, 1] : 1,
            rotateX: isOpening ? [0, 10, -10, 0] : 0,
            rotateZ: isOpening ? [0, 2, -2, 0] : 0,
          }}
          transition={{
            duration: isOpening ? 0.3 : 1,
            repeat: isOpening ? Infinity : 0,
            ease: isOpening ? "easeInOut" : "linear"
          }}
        >
          {/* Box Lid */}
          <div className={`
            absolute -top-2 left-1/2 transform -translate-x-1/2 
            w-[calc(100%+8px)] h-6 rounded-t-2xl border-4 ${styles.borderColor}
            bg-gradient-to-br ${styles.boxColor}
            shadow-lg z-10
          `} />

          {/* Venusespor Logo */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
            <div className="text-6xl mb-2">🎮</div>
            <div className="text-lg font-bold tracking-wider">VENUS</div>
            <div className="text-xs opacity-80">ESPOR</div>
          </div>

          {/* Corner Decorations */}
          <div className="absolute top-2 left-2 w-3 h-3 bg-white/30 rounded-full"></div>
          <div className="absolute top-2 right-2 w-3 h-3 bg-white/30 rounded-full"></div>
          <div className="absolute bottom-2 left-2 w-3 h-3 bg-white/30 rounded-full"></div>
          <div className="absolute bottom-2 right-2 w-3 h-3 bg-white/30 rounded-full"></div>

          {/* Opening Effects */}
          {isOpening && (
            <>
              {/* Glow Effect */}
              <div className={`
                absolute inset-0 rounded-2xl bg-gradient-to-br ${styles.boxColor} 
                opacity-40 animate-pulse
              `} />

              {/* Sparkles */}
              <div className="absolute inset-0 overflow-hidden rounded-2xl">
                {[...Array(12)].map((_, i) => (
                  <motion.div
                    key={i}
                    className={`absolute text-xl ${styles.sparkleColor}`}
                    style={{
                      left: `${Math.random() * 100}%`,
                      top: `${Math.random() * 100}%`,
                    }}
                    animate={{
                      opacity: [0, 1, 0],
                      scale: [0, 1.5, 0],
                      rotate: [0, 360],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      delay: Math.random() * 2,
                    }}
                  >
                    ✨
                  </motion.div>
                ))}
              </div>

              {/* Energy Rings */}
              <div className="absolute inset-0 flex items-center justify-center">
                {[...Array(3)].map((_, i) => (
                  <motion.div
                    key={i}
                    className={`absolute w-32 h-32 rounded-full border-2 ${styles.borderColor} opacity-60`}
                    animate={{
                      scale: [0.5, 2],
                      opacity: [0.6, 0],
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      delay: i * 0.5,
                    }}
                  />
                ))}
              </div>
            </>
          )}
        </motion.div>
      </motion.div>

      {/* Base Shadow */}
      <motion.div
        className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-8
                   w-40 h-6 bg-black/20 rounded-full blur-sm"
        animate={{
          scale: isOpening ? [1, 1.2, 1] : [1, 1.1, 1],
        }}
        transition={{
          duration: isOpening ? 0.8 : 3,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
    </div>
  );
}
