
'use client';

import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from './ui/card';
import Image from 'next/image';

interface Reward {
  id: string;
  name: string;
  description: string;
  icon: string;
  image: string;
  type: string;
  rarity: string;
  value: number;
  quantity: number;
}

interface LootBoxOpening {
  id: string;
  animationSeed: string;
  reward: Reward;
  rarity: string;
  openedAt: string;
}

interface LootBoxAnimationProps {
  opening: LootBoxOpening;
  availableRewards: Reward[];
  onComplete: () => void;
}

export function LootBoxAnimation({ opening, availableRewards, onComplete }: LootBoxAnimationProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isSlowing, setIsSlowing] = useState(false);
  const [finalReward, setFinalReward] = useState<Reward | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const animationRef = useRef<number | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);
  const lastFrameTimeRef = useRef<number>(0);

  // Memoize reward reel to prevent unnecessary recalculations
  const rewardReel = useMemo(() => 
    [...availableRewards, ...availableRewards, ...availableRewards],
    [availableRewards]
  );
  
  const finalIndex = useMemo(() => 
    rewardReel.findIndex(r => r.id === opening.reward.id) + availableRewards.length,
    [rewardReel, opening.reward.id, availableRewards.length]
  );

  // Initialize audio context once
  const initAudioContext = useCallback(() => {
    if (typeof window !== 'undefined' && !audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
  }, []);

  // Optimized sound playing functions
  const playOpeningSound = useCallback(() => {
    if (!audioContextRef.current) return;
    
    try {
      const oscillator = audioContextRef.current.createOscillator();
      const gainNode = audioContextRef.current.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContextRef.current.destination);
      
      oscillator.frequency.setValueAtTime(800, audioContextRef.current.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(400, audioContextRef.current.currentTime + 0.1);
      
      gainNode.gain.setValueAtTime(0.1, audioContextRef.current.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContextRef.current.currentTime + 0.1);
      
      oscillator.start(audioContextRef.current.currentTime);
      oscillator.stop(audioContextRef.current.currentTime + 0.1);
    } catch (error) {
      console.warn('Audio playback failed:', error);
    }
  }, []);

  const playWinSound = useCallback((rarity: string) => {
    if (!audioContextRef.current) return;
    
    try {
      const oscillator = audioContextRef.current.createOscillator();
      const gainNode = audioContextRef.current.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContextRef.current.destination);
      
      // Different sounds for different rarities
      switch (rarity) {
        case 'LEGENDARY':
          oscillator.type = 'sawtooth';
          oscillator.frequency.setValueAtTime(523, audioContextRef.current.currentTime);
          oscillator.frequency.setValueAtTime(659, audioContextRef.current.currentTime + 0.2);
          oscillator.frequency.setValueAtTime(784, audioContextRef.current.currentTime + 0.4);
          break;
        case 'EPIC':
          oscillator.type = 'square';
          oscillator.frequency.setValueAtTime(440, audioContextRef.current.currentTime);
          oscillator.frequency.setValueAtTime(554, audioContextRef.current.currentTime + 0.15);
          break;
        case 'RARE':
          oscillator.type = 'triangle';
          oscillator.frequency.setValueAtTime(349, audioContextRef.current.currentTime);
          oscillator.frequency.setValueAtTime(440, audioContextRef.current.currentTime + 0.1);
          break;
        default: // COMMON
          oscillator.type = 'sine';
          oscillator.frequency.setValueAtTime(262, audioContextRef.current.currentTime);
          break;
      }
      
      gainNode.gain.setValueAtTime(0.1, audioContextRef.current.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContextRef.current.currentTime + 0.5);
      
      oscillator.start(audioContextRef.current.currentTime);
      oscillator.stop(audioContextRef.current.currentTime + 0.5);
    } catch (error) {
      console.warn('Audio playback failed:', error);
    }
  }, []);

  // Optimized animation function using requestAnimationFrame
  const runAnimation = useCallback(() => {
    const animate = (timestamp: number) => {
      if (!startTimeRef.current) {
        startTimeRef.current = timestamp;
        lastFrameTimeRef.current = timestamp;
      }

      const elapsed = timestamp - startTimeRef.current;
      const deltaTime = timestamp - lastFrameTimeRef.current;

      // Fast spinning phase (first 3 seconds)
      if (elapsed < 3000) {
        if (deltaTime >= 100) { // 100ms intervals for fast phase
          setCurrentIndex(prev => prev + 1);
          lastFrameTimeRef.current = timestamp;
        }
        animationRef.current = requestAnimationFrame(animate);
      } 
      // Slowing down phase
      else if (elapsed < 5000) {
        if (!isSlowing) {
          setIsSlowing(true);
        }
        
        // Progressive slowing: start at 100ms, end at 300ms
        const slowPhaseProgress = (elapsed - 3000) / 2000;
        const interval = 100 + (slowPhaseProgress * 200);
        
        if (deltaTime >= interval) {
          setCurrentIndex(prev => {
            const newIndex = prev + 1;
            if (newIndex >= finalIndex) {
              // Animation complete
              setFinalReward(opening.reward);
              playWinSound(opening.rarity);
              
              timeoutRef.current = setTimeout(() => {
                onComplete();
              }, 1000);
              
              return newIndex;
            }
            return newIndex;
          });
          lastFrameTimeRef.current = timestamp;
        }
        
        animationRef.current = requestAnimationFrame(animate);
      }
    };

    animationRef.current = requestAnimationFrame(animate);
  }, [finalIndex, isSlowing, onComplete, opening.reward, opening.rarity, playWinSound]);

  useEffect(() => {
    initAudioContext();
    playOpeningSound();
    runAnimation();

    return () => {
      // Cleanup all timers and animations
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close();
      }
    };
  }, [initAudioContext, playOpeningSound, runAnimation]);

  const getRarityColors = (rarity: string) => {
    switch (rarity) {
      case 'COMMON':
        return {
          bg: 'from-gray-400 to-gray-600',
          border: 'border-gray-400',
          glow: 'shadow-gray-400/50'
        };
      case 'RARE':
        return {
          bg: 'from-blue-400 to-blue-600',
          border: 'border-blue-400',
          glow: 'shadow-blue-400/50'
        };
      case 'EPIC':
        return {
          bg: 'from-purple-400 to-purple-600',
          border: 'border-purple-400',
          glow: 'shadow-purple-400/50'
        };
      case 'LEGENDARY':
        return {
          bg: 'from-yellow-400 to-yellow-600',
          border: 'border-yellow-400',
          glow: 'shadow-yellow-400/50'
        };
      default:
        return {
          bg: 'from-gray-400 to-gray-600',
          border: 'border-gray-400',
          glow: 'shadow-gray-400/50'
        };
    }
  };

  // Memoize visible rewards calculation
  const visibleRewards = useMemo(() => 
    rewardReel.slice(currentIndex, currentIndex + 5),
    [rewardReel, currentIndex]
  );

  return (
    <motion.div
      className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="relative w-full max-w-4xl mx-auto px-4">
        
        {/* Title */}
        <motion.div
          className="text-center mb-8"
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="text-4xl font-bold text-white mb-2">
            🎁 Kasa Açılıyor...
          </h2>
          <p className="text-white/80">
            Ödülün belirleniyor, bekle!
          </p>
        </motion.div>

        {/* Reward Reel Container */}
        <div className="relative bg-black/50 backdrop-blur-sm rounded-2xl border border-white/20 p-8">
          
          {/* Center Selection Indicator */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
            <div className="w-32 h-32 border-4 border-yellow-400 rounded-xl bg-yellow-400/10 backdrop-blur-sm shadow-lg"></div>
          </div>

          {/* Reward Reel */}
          <div className="flex items-center justify-center space-x-4 overflow-hidden" style={{ willChange: 'transform' }}>
            <AnimatePresence mode="popLayout">
              {visibleRewards.map((reward, index) => {
                const isCenter = index === 2;
                const colors = getRarityColors(reward.rarity);
                
                return (
                  <motion.div
                    key={`${reward.id}-${currentIndex + index}`}
                    className={`
                      relative flex-shrink-0 w-28 h-28 rounded-xl border-2 overflow-hidden
                      ${colors.border} ${isCenter ? `bg-gradient-to-br ${colors.bg} ${colors.glow} shadow-xl` : 'bg-black/40 opacity-60'}
                    `}
                    style={{ 
                      willChange: 'transform, opacity',
                      transform: isCenter ? 'scale(1.1) translateZ(0)' : 'scale(0.9) translateZ(0)'
                    }}
                    initial={{ x: 300, opacity: 0, scale: 0.8 }}
                    animate={{ 
                      x: 0, 
                      opacity: 1,
                      scale: isCenter ? 1.1 : 0.9,
                      rotateY: isCenter ? 0 : 5
                    }}
                    exit={{ x: -300, opacity: 0, scale: 0.8 }}
                    transition={{ 
                      type: "tween",
                      duration: 0.1,
                      ease: "easeOut"
                    }}
                  >
                    {/* Reward Image */}
                    <div className="relative w-full h-full">
                      {reward?.image ? (
                        <Image
                          src={reward.image}
                          alt={reward?.name || 'Reward'}
                          fill
                          className="object-cover"
                          onError={() => {
                            // Handle image load error silently
                          }}
                        />
                      ) : (
                        <div className={`w-full h-full bg-gradient-to-br ${colors.bg} flex items-center justify-center`}>
                          <div className="text-4xl opacity-50">{reward?.icon || '🎁'}</div>
                        </div>
                      )}
                      
                      {/* Icon Overlay */}
                      <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                        <div className="text-3xl">{reward?.icon || '🎁'}</div>
                      </div>
                      
                      {/* Rarity Indicator */}
                      <div className={`absolute top-1 right-1 w-3 h-3 rounded-full bg-gradient-to-br ${colors.bg}`}></div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>

          {/* Slowing Down Indicator */}
          {isSlowing && (
            <motion.div
              className="text-center mt-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="text-yellow-400 font-semibold">
                ⏳ Ödül belirleniyor...
              </div>
            </motion.div>
          )}

          {/* Final Reward Preview */}
          {finalReward && (
            <motion.div
              className="absolute inset-0 flex items-center justify-center bg-black/80 backdrop-blur-md rounded-2xl"
              style={{ willChange: 'transform, opacity' }}
              initial={{ opacity: 0, scale: 0.5, rotateY: 180 }}
              animate={{ opacity: 1, scale: 1, rotateY: 0 }}
              transition={{ 
                duration: 0.5,
                type: "spring",
                stiffness: 300,
                damping: 30
              }}
            >
              <motion.div 
                className="text-center"
                style={{ willChange: 'transform' }}
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.3 }}
              >
                <motion.div 
                  className="text-6xl mb-4"
                  animate={{ 
                    scale: [1, 1.2, 1],
                    rotate: [0, 10, -10, 0]
                  }}
                  transition={{ 
                    duration: 1,
                    repeat: Infinity,
                    repeatType: "reverse"
                  }}
                >
                  {finalReward?.icon || '🎁'}
                </motion.div>
                <div className={`text-2xl font-bold mb-2 ${getRarityColors(finalReward.rarity).border.replace('border-', 'text-')}`}>
                  {finalReward?.name || 'Ödül'}
                </div>
                <div className="text-white/80 mb-4">
                  {finalReward?.description || 'Ödül açıklaması yok'}
                </div>
                <motion.div 
                  className="text-green-400 font-bold"
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ 
                    duration: 0.8,
                    repeat: Infinity,
                    repeatType: "reverse"
                  }}
                >
                  ✨ Tebrikler! ✨
                </motion.div>
              </motion.div>
            </motion.div>
          )}
        </div>

        {/* Loading Bar */}
        <motion.div
          className="mt-8 bg-black/40 rounded-full h-2 overflow-hidden"
          style={{ willChange: 'opacity' }}
          initial={{ opacity: 0, scaleX: 0 }}
          animate={{ opacity: 1, scaleX: 1 }}
          transition={{ delay: 0.5, duration: 0.3 }}
        >
          <motion.div
            className="h-full bg-gradient-to-r from-yellow-400 to-orange-500 relative"
            style={{ 
              willChange: 'transform',
              transformOrigin: 'left center'
            }}
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 5, ease: 'easeOut' }}
          >
            {/* Animated shimmer effect */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
              style={{ willChange: 'transform' }}
              animate={{ x: ['-100%', '100%'] }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "linear"
              }}
            />
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  );
}
