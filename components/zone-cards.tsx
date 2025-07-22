
'use client';

import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import Link from 'next/link';
import { Monitor, Gamepad, Car, Coffee } from 'lucide-react';

const zones = [
  {
    id: 'pc-zone',
    title: 'PC Zone',
    description: '35 adet high-end gaming bilgisayar ile en son oyunları oynayın',
    icon: Monitor,
    color: 'purple',
    features: ['RTX 4070+ GPU', 'i7+ İşlemci', 'Mechanical Klavye', 'Gaming Mouse'],
    price: '25₺/saat',
    link: '/zones/pc-zone'
  },
  {
    id: 'ps5-zone',
    title: 'PS5 Zone',
    description: '2 adet PlayStation 5 konsolu ile premium oyun deneyimi',
    icon: Gamepad,
    color: 'blue',
    features: ['FC25', 'NBA2025', 'Spiderman', 'UFC5'],
    price: '30₺/saat',
    link: '/zones/ps5-zone'
  },
  {
    id: 'racing-zone',
    title: 'Racing Zone',
    description: '6 adet racing simulator ile gerçekçi yarış deneyimi',
    icon: Car,
    color: 'green',
    features: ['F1 24', 'Assetto Corsa', 'Euro Truck', 'GTA 5 (Yakında)'],
    price: '35₺/saat',
    link: '/zones/racing-zone'
  },
  {
    id: 'cafe',
    title: 'Cafe Menu',
    description: 'Lezzetli yiyecek ve içecekler ile enerjinizi yenileyin',
    icon: Coffee,
    color: 'yellow',
    features: ['Çıtır Tavuk Wrap', 'Tost', 'Patates', 'İçecekler'],
    price: '5₺-45₺',
    link: '/zones/cafe'
  }
];

const colorClasses = {
  purple: 'border-purple-500/30 hover:border-purple-500/60 hover:shadow-purple-500/20',
  blue: 'border-blue-500/30 hover:border-blue-500/60 hover:shadow-blue-500/20',
  green: 'border-green-500/30 hover:border-green-500/60 hover:shadow-green-500/20',
  yellow: 'border-yellow-500/30 hover:border-yellow-500/60 hover:shadow-yellow-500/20'
};

const iconColorClasses = {
  purple: 'text-purple-400',
  blue: 'text-blue-400',
  green: 'text-green-400',
  yellow: 'text-yellow-400'
};

export function ZoneCards() {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  return (
    <section className="py-20 px-4" ref={ref}>
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Gaming <span className="text-purple-400">Alanlarımız</span>
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Her tür oyuncuya uygun özel alanlar ve premium deneyim
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {zones.map((zone, index) => {
            const Icon = zone.icon;
            return (
              <motion.div
                key={zone.id}
                initial={{ opacity: 0, y: 30 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.8, delay: index * 0.1 }}
              >
                <Link href={zone.link}>
                  <div className={`gaming-card p-6 h-full hover:transform hover:scale-105 transition-all duration-300 ${colorClasses[zone.color as keyof typeof colorClasses]}`}>
                    <div className="text-center mb-4">
                      <Icon className={`h-12 w-12 mx-auto mb-3 ${iconColorClasses[zone.color as keyof typeof iconColorClasses]}`} />
                      <h3 className="text-xl font-bold text-white mb-2">{zone.title}</h3>
                      <p className="text-gray-400 text-sm mb-4">{zone.description}</p>
                    </div>

                    <div className="space-y-2 mb-4">
                      {zone.features.map((feature, idx) => (
                        <div key={idx} className="flex items-center text-sm">
                          <div className={`w-2 h-2 rounded-full mr-2 ${iconColorClasses[zone.color as keyof typeof iconColorClasses]?.replace('text-', 'bg-')}`}></div>
                          <span className="text-gray-300">{feature}</span>
                        </div>
                      ))}
                    </div>

                    <div className="text-center">
                      <div className={`text-lg font-bold ${iconColorClasses[zone.color as keyof typeof iconColorClasses]}`}>
                        {zone.price}
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
