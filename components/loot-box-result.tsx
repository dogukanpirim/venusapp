
'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from './ui/button';
import { Dialog, DialogContent } from './ui/dialog';
import { Badge } from './ui/badge';
import Image from 'next/image';
import confetti from 'canvas-confetti';

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

interface LootBoxResultProps {
  opening: LootBoxOpening;
  onClose: () => void;
}

export function LootBoxResult({ opening, onClose }: LootBoxResultProps) {
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    // Trigger confetti based on rarity
    setTimeout(() => {
      setShowConfetti(true);
      triggerConfetti(opening.rarity);
    }, 300);
  }, [opening.rarity]);

  const triggerConfetti = (rarity: string) => {
    const colors = getConfettiColors(rarity);
    const particleCount = getParticleCount(rarity);
    const spread = getConfettiSpread(rarity);

    // Multiple confetti bursts for rare items
    const burstCount = rarity === 'LEGENDARY' ? 5 : rarity === 'EPIC' ? 3 : rarity === 'RARE' ? 2 : 1;

    for (let i = 0; i < burstCount; i++) {
      setTimeout(() => {
        confetti({
          particleCount,
          spread,
          origin: { y: 0.6 },
          colors,
          gravity: 0.8,
          drift: 0,
          startVelocity: 45,
          shapes: ['square', 'circle'],
          scalar: 1.2,
        });

        // Side bursts for legendary
        if (rarity === 'LEGENDARY') {
          confetti({
            particleCount: particleCount / 2,
            spread: 60,
            origin: { x: 0.2, y: 0.7 },
            colors,
          });
          confetti({
            particleCount: particleCount / 2,
            spread: 60,
            origin: { x: 0.8, y: 0.7 },
            colors,
          });
        }
      }, i * 200);
    }
  };

  const getConfettiColors = (rarity: string) => {
    switch (rarity) {
      case 'COMMON':
        return ['#9CA3AF', '#6B7280', '#D1D5DB'];
      case 'RARE':
        return ['#3B82F6', '#1D4ED8', '#60A5FA'];
      case 'EPIC':
        return ['#8B5CF6', '#7C3AED', '#A78BFA'];
      case 'LEGENDARY':
        return ['#F59E0B', '#D97706', '#FBD147', '#FBBF24'];
      default:
        return ['#9CA3AF', '#6B7280'];
    }
  };

  const getParticleCount = (rarity: string) => {
    switch (rarity) {
      case 'LEGENDARY': return 150;
      case 'EPIC': return 100;
      case 'RARE': return 70;
      default: return 50;
    }
  };

  const getConfettiSpread = (rarity: string) => {
    switch (rarity) {
      case 'LEGENDARY': return 100;
      case 'EPIC': return 80;
      case 'RARE': return 60;
      default: return 45;
    }
  };

  const getRarityColors = (rarity: string) => {
    switch (rarity) {
      case 'COMMON':
        return {
          bg: 'from-gray-400 to-gray-600',
          border: 'border-gray-400',
          text: 'text-gray-300',
          title: 'text-gray-200'
        };
      case 'RARE':
        return {
          bg: 'from-blue-400 to-blue-600',
          border: 'border-blue-400',
          text: 'text-blue-300',
          title: 'text-blue-200'
        };
      case 'EPIC':
        return {
          bg: 'from-purple-400 to-purple-600',
          border: 'border-purple-400',
          text: 'text-purple-300',
          title: 'text-purple-200'
        };
      case 'LEGENDARY':
        return {
          bg: 'from-yellow-400 to-yellow-600',
          border: 'border-yellow-400',
          text: 'text-yellow-300',
          title: 'text-yellow-200'
        };
      default:
        return {
          bg: 'from-gray-400 to-gray-600',
          border: 'border-gray-400',
          text: 'text-gray-300',
          title: 'text-gray-200'
        };
    }
  };

  const getRarityTitle = (rarity: string) => {
    switch (rarity) {
      case 'COMMON': return 'Sıradan Ödül!';
      case 'RARE': return 'Nadir Ödül!';
      case 'EPIC': return 'Destansı Ödül!';
      case 'LEGENDARY': return 'EFSANEVİ ÖDÜL!';
      default: return 'Ödül Kazandın!';
    }
  };

  const getRewardValueText = (reward: Reward) => {
    switch (reward.type) {
      case 'FREE_HOURS':
        return `${reward.value} Saat Ücretsiz Kullanım`;
      case 'DRINK_COUPON':
        return `${reward.value} TL Değerinde Kupon`;
      case 'BATTLEPASS_XP':
        return `${reward.value} XP`;
      case 'TOURNAMENT_ENTRY':
        return `${reward.value} TL Değerinde Katılım Hakkı`;
      case 'CREDITS':
        return `${reward.value} TL Kredi`;
      case 'SPECIAL_ITEM':
        return reward.value > 0 ? `${reward.value} TL Değerinde` : 'Özel Eşya';
      default:
        return '';
    }
  };

  const colors = getRarityColors(opening.rarity);

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-md mx-auto bg-black/90 backdrop-blur-md border-white/20">
        <motion.div
          className="text-center p-6"
          initial={{ opacity: 0, scale: 0.8, y: 50 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          {/* Rarity Title */}
          <motion.div
            className={`text-2xl font-bold mb-4 ${colors.title}`}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            ✨ {getRarityTitle(opening.rarity)} ✨
          </motion.div>

          {/* Reward Image */}
          <motion.div
            className={`relative w-32 h-32 mx-auto mb-4 rounded-xl border-4 ${colors.border} overflow-hidden bg-gradient-to-br ${colors.bg} shadow-xl`}
            initial={{ opacity: 0, scale: 0.5, rotateY: 180 }}
            animate={{ opacity: 1, scale: 1, rotateY: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            {opening?.reward?.image ? (
              <Image
                src={opening.reward.image}
                alt={opening?.reward?.name || 'Reward'}
                fill
                className="object-cover"
                onError={() => {
                  // Handle image load error silently
                }}
              />
            ) : (
              <div className={`w-full h-full bg-gradient-to-br ${colors.bg} flex items-center justify-center`}>
                <div className="text-6xl opacity-50">{opening?.reward?.icon || '🎁'}</div>
              </div>
            )}
            
            {/* Icon Overlay */}
            <div className="absolute inset-0 flex items-center justify-center bg-black/30">
              <motion.div
                className="text-4xl"
                initial={{ scale: 0 }}
                animate={{ scale: [0, 1.2, 1] }}
                transition={{ delay: 0.6, duration: 0.4 }}
              >
                {opening?.reward?.icon || '🎁'}
              </motion.div>
            </div>

            {/* Glow Effect */}
            <div className={`absolute inset-0 bg-gradient-to-br ${colors.bg} opacity-20 animate-pulse`}></div>
          </motion.div>

          {/* Rarity Badge */}
          <motion.div
            className="mb-4"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Badge className={`bg-gradient-to-r ${colors.bg} text-white border-0 px-3 py-1`}>
              {opening.rarity}
            </Badge>
          </motion.div>

          {/* Reward Name */}
          <motion.h3
            className={`text-xl font-bold mb-2 ${colors.text}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            {opening?.reward?.name || 'Ödül'}
          </motion.h3>

          {/* Reward Description */}
          <motion.p
            className="text-white/80 mb-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            {opening?.reward?.description || 'Ödül açıklaması yok'}
          </motion.p>

          {/* Reward Value */}
          <motion.div
            className={`text-lg font-semibold mb-6 ${colors.text}`}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.8 }}
          >
            💎 {opening?.reward ? getRewardValueText(opening.reward) : 'Değer belirtilmemiş'}
          </motion.div>

          {/* Success Message */}
          <motion.div
            className="bg-green-500/20 border border-green-500/40 rounded-lg p-3 mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
          >
            <div className="text-green-400 font-semibold text-sm">
              ✅ Ödülün hesabına eklendi!
            </div>
            <div className="text-green-300/80 text-xs mt-1">
              Hemen kullanmaya başlayabilirsin
            </div>
          </motion.div>

          {/* Close Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
          >
            <Button
              onClick={onClose}
              className={`bg-gradient-to-r ${colors.bg} hover:opacity-90 text-white border-0 px-8 py-2 rounded-xl font-semibold transition-all duration-300 hover:scale-105`}
            >
              Harika! 🎉
            </Button>
          </motion.div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}
