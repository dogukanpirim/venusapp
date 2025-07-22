
'use client';

import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { useToast } from '../hooks/use-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { LootBox3D } from './loot-box-3d';
import { LootBoxAnimation } from './loot-box-animation';
import { LootBoxResult } from './loot-box-result';

interface LootBoxContainerProps {
  initialBalance: number;
  userId: string;
}

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

export function LootBoxContainer({ initialBalance, userId }: LootBoxContainerProps) {
  const [balance, setBalance] = useState(initialBalance);
  const [isOpening, setIsOpening] = useState(false);
  const [currentOpening, setCurrentOpening] = useState<LootBoxOpening | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [availableRewards, setAvailableRewards] = useState<Reward[]>([]);
  const { toast } = useToast();

  // Fetch available rewards for animation
  useEffect(() => {
    fetchAvailableRewards();
  }, []);

  const fetchAvailableRewards = async () => {
    try {
      const response = await fetch('/api/lootbox/rewards');
      if (response.ok) {
        const data = await response.json();
        setAvailableRewards(data.rewards);
      }
    } catch (error) {
      console.error('Failed to fetch rewards:', error);
    }
  };

  const openLootBox = async () => {
    if (balance < 1) {
      toast({
        title: "Yetersiz Kasa",
        description: "Açılacak kasa bulunamadı. Bakiye yükleyerek kasa kazanabilirsin!",
        variant: "destructive",
      });
      return;
    }

    setIsOpening(true);

    try {
      const response = await fetch('/api/lootbox/open', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to open loot box');
      }

      const data = await response.json();
      
      if (data.success) {
        setCurrentOpening(data.opening);
        setBalance(data.user.remainingBalance);
        
        // Show animation for a few seconds, then show result
        setTimeout(() => {
          setIsOpening(false);
          setShowResult(true);
        }, 5000); // 5 second animation
      }
    } catch (error) {
      console.error('Loot box opening error:', error);
      toast({
        title: "Hata",
        description: "Kasa açılırken bir hata oluştu. Lütfen tekrar deneyin.",
        variant: "destructive",
      });
      setIsOpening(false);
    }
  };

  const closeResult = () => {
    setShowResult(false);
    setCurrentOpening(null);
  };

  return (
    <div className="relative">
      {/* Main Loot Box Area */}
      <div className="bg-black/40 backdrop-blur-sm rounded-2xl border border-white/20 p-8 min-h-[600px]">
        
        {/* Loot Box Balance Display */}
        <div className="text-center mb-8">
          <motion.div 
            className="text-2xl font-bold text-white mb-2"
            animate={{ scale: balance === 0 ? [1, 1.1, 1] : 1 }}
            transition={{ duration: 0.5, repeat: balance === 0 ? Infinity : 0, repeatDelay: 2 }}
          >
            📦 Açılabilir Kasa: <span className="text-yellow-400">{balance}</span>
          </motion.div>
          
          {balance === 0 && (
            <motion.p 
              className="text-red-400 text-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              Daha fazla kasa kazanmak için bakiye yükleyin!
            </motion.p>
          )}
        </div>

        {/* 3D Loot Box */}
        <div className="relative flex justify-center items-center h-80 mb-8">
          <LootBox3D 
            isOpening={isOpening}
            rarity={currentOpening?.rarity || 'COMMON'}
          />
        </div>

        {/* Open Button */}
        <div className="text-center">
          <Button
            onClick={openLootBox}
            disabled={isOpening || balance < 1}
            size="lg"
            className={`
              px-8 py-4 text-xl font-bold rounded-xl transition-all duration-300
              ${balance < 1 
                ? 'bg-gray-600 text-gray-300 cursor-not-allowed' 
                : 'bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 text-white shadow-lg hover:shadow-xl hover:scale-105'
              }
            `}
          >
            {isOpening ? (
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>Açılıyor...</span>
              </div>
            ) : balance < 1 ? (
              'Kasa Yok'
            ) : (
              `🎁 Kasayı Aç (1 Kasa Kullan)`
            )}
          </Button>
          
          {balance > 0 && !isOpening && (
            <p className="text-white/60 text-sm mt-3">
              Kasayı açmak için butona tıklayın
            </p>
          )}
        </div>
      </div>

      {/* Animated Overlays */}
      <AnimatePresence>
        {isOpening && currentOpening && (
          <LootBoxAnimation
            opening={currentOpening}
            availableRewards={availableRewards}
            onComplete={() => {
              setIsOpening(false);
              setShowResult(true);
            }}
          />
        )}

        {showResult && currentOpening && (
          <LootBoxResult
            opening={currentOpening}
            onClose={closeResult}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
