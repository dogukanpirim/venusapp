
'use client';

import { motion } from 'framer-motion';
import { Gamepad2, Users, Clock, MapPin } from 'lucide-react';
import { VenusesporLogo } from '@/components/venusespor-logo';
import RotatingText from '@/components/rotating-text';
import '@/components/rotating-text.css';

export function HeroSection() {
  return (
    <section className="relative min-h-[50vh] flex items-center justify-center px-4">
      {/* Content */}
      <div className="relative z-auto max-w-6xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-8"
        >
          <div className="mx-auto mb-6 flex justify-center">
            <VenusesporLogo
              src="/venusespor_logo_large.png"
              alt="Venusespor Esports Center"
              width={320}
              height={96}
              className="hover:scale-105 transition-transform duration-500"
            />
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
            <RotatingText
              texts={['HEADSHOT!', 'CLUTCH!', 'PENTA!', 'ACE!', 'GG EZ!', 'ZAFER!', 'LEVEL UP!']}
              mainClassName="text-purple-400 font-black"
              staggerFrom="last"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "-120%" }}
              staggerDuration={0.025}
              splitLevelClassName="overflow-hidden pb-0.5 sm:pb-1 md:pb-1"
              transition={{ type: "spring", damping: 30, stiffness: 400 }}
              rotationInterval={2000}
            />
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto">
            Premium oyun deneyimi için 35 PC, 2 PS5, 6 Racing Simulator ve lezzetli cafe menüsü
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto"
        >
          <div className="gaming-card p-4">
            <Gamepad2 className="h-8 w-8 text-purple-400 mx-auto mb-2" />
            <h3 className="font-semibold text-white">35 Gaming PC</h3>
            <p className="text-sm text-gray-400">High-end donanım</p>
          </div>
          
          <div className="gaming-card p-4">
            <Users className="h-8 w-8 text-green-400 mx-auto mb-2" />
            <h3 className="font-semibold text-white">2 PS5 Konsol</h3>
            <p className="text-sm text-gray-400">Premium oyunlar</p>
          </div>
          
          <div className="gaming-card p-4">
            <Clock className="h-8 w-8 text-yellow-400 mx-auto mb-2" />
            <h3 className="font-semibold text-white">7/24 Açık</h3>
            <p className="text-sm text-gray-400">10:00 - 04:00</p>
          </div>
          
          <div className="gaming-card p-4">
            <MapPin className="h-8 w-8 text-blue-400 mx-auto mb-2" />
            <h3 className="font-semibold text-white">Racing Zone</h3>
            <p className="text-sm text-gray-400">6 Simulator</p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
