
'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Cpu, TrendingUp, Zap, Monitor } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function UpgradeCenterHero() {
  const [windowSize, setWindowSize] = useState({ width: 800, height: 600 });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const updateSize = () => {
        setWindowSize({ width: window.innerWidth, height: window.innerHeight });
      };
      
      updateSize();
      window.addEventListener('resize', updateSize);
      return () => window.removeEventListener('resize', updateSize);
    }
  }, []);

  return (
    <section className="relative min-h-[60vh] flex items-center justify-center px-4 overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/30 via-background to-cyan-900/20"></div>
      
      {/* Floating Elements */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-20 h-20 rounded-full bg-purple-500/10 backdrop-blur-sm"
            initial={{ 
              x: Math.random() * windowSize.width,
              y: Math.random() * windowSize.height,
              scale: 0 
            }}
            animate={{ 
              x: Math.random() * windowSize.width,
              y: Math.random() * windowSize.height,
              scale: [0, 1, 0.8, 1]
            }}
            transition={{ 
              duration: 10 + i * 2,
              repeat: Infinity,
              repeatType: "reverse",
              delay: i * 0.5
            }}
          />
        ))}
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-6xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-8"
        >
          <h1 className="text-5xl md:text-7xl font-black text-white mb-6">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-cyan-400 to-purple-400">
              UPGRADE
            </span>
            <br />
            <span className="text-gray-200">MERKEZİ</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto">
            PC'nizi bir sonraki seviyeye taşıyın! Sistem analizi, donanım önerileri ve 
            professional kurulum hizmetleriyle gaming performansınızı maximum'a çıkarın.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto mb-12"
        >
          <div className="gaming-card p-4 group hover:scale-105 transition-all duration-300">
            <Cpu className="h-8 w-8 text-purple-400 mx-auto mb-2 group-hover:text-purple-300" />
            <h3 className="font-semibold text-white">Sistem Analizi</h3>
            <p className="text-sm text-gray-400">Real-time performans</p>
          </div>
          
          <div className="gaming-card p-4 group hover:scale-105 transition-all duration-300">
            <Monitor className="h-8 w-8 text-cyan-400 mx-auto mb-2 group-hover:text-cyan-300" />
            <h3 className="font-semibold text-white">Upgrade Simülatörü</h3>
            <p className="text-sm text-gray-400">Before/After karşılaştırma</p>
          </div>
          
          <div className="gaming-card p-4 group hover:scale-105 transition-all duration-300">
            <TrendingUp className="h-8 w-8 text-green-400 mx-auto mb-2 group-hover:text-green-300" />
            <h3 className="font-semibold text-white">Fiyat Hesaplayıcı</h3>
            <p className="text-sm text-gray-400">Anında teklif</p>
          </div>
          
          <div className="gaming-card p-4 group hover:scale-105 transition-all duration-300">
            <Zap className="h-8 w-8 text-yellow-400 mx-auto mb-2 group-hover:text-yellow-300" />
            <h3 className="font-semibold text-white">Professional Kurulum</h3>
            <p className="text-sm text-gray-400">Garanti dahil</p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center"
        >
          <Link href="/upgrade-center/analysis">
            <Button className="neon-border bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 text-lg font-semibold">
              SİSTEMİNİ ANALİZ ET
            </Button>
          </Link>
          
          <Link href="/upgrade-center/simulator">
            <Button variant="outline" className="px-8 py-3 text-lg font-semibold border-cyan-400 text-cyan-400 hover:bg-cyan-400 hover:text-black">
              UPGRADE SİMÜLATÖRÜ
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
