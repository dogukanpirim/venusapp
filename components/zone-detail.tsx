
'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Clock, Users, Star, ArrowLeft, Gamepad2, Coffee, Car, Monitor } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  duration: number | null;
}

interface Zone {
  id: string;
  name: string;
  slug: string;
  description: string;
  image: string | null;
  products: Product[];
}

interface ZoneDetailProps {
  zone: Zone;
}

const zoneInfo = {
  'pc-zone': {
    icon: Monitor,
    color: 'purple',
    features: [
      'RTX 4070+ Graphics Cards',
      'Intel i7+ Processors',
      'Mechanical Gaming Keyboards',
      'High-DPI Gaming Mice',
      'Gaming Headsets',
      '144Hz Gaming Monitors'
    ],
    games: [
      'Valorant', 'CS2', 'League of Legends', 'Fortnite', 
      'PUBG', 'Apex Legends', 'Call of Duty', 'FIFA 24'
    ],
    specs: '35 High-End Gaming PC',
    background: 'https://i.pinimg.com/originals/b0/54/35/b054350c870051285335e0bf88418f86.jpg'
  },
  'ps5-zone': {
    icon: Gamepad2,
    color: 'blue',
    features: [
      '2 PlayStation 5 Consoles',
      '4K HDR Gaming',
      'DualSense Controllers',
      '55" OLED Gaming Monitors',
      'Premium Sound System',
      'Comfortable Gaming Chairs'
    ],
    games: [
      'FC25', 'PES2021', 'NBA2025', 'Spiderman', 
      'UFC5', 'God of War', 'The Last of Us', 'Ghost of Tsushima'
    ],
    specs: '2 PlayStation 5 Konsolu',
    background: 'https://i.pinimg.com/originals/f9/d2/41/f9d2417dff278760a3d7502cfa7b4b6a.jpg'
  },
  'racing-zone': {
    icon: Car,
    color: 'green',
    features: [
      '6 Racing Simulators',
      'Force Feedback Steering Wheels',
      'Professional Pedal Sets',
      'Triple Monitor Setup',
      'Racing Seats',
      'Immersive Sound System'
    ],
    games: [
      'Assetto Corsa', 'F1 24', 'Euro Truck Simulator 2', 
      'Dirt Rally', 'Gran Turismo', 'GTA 5 (Yakında)'
    ],
    specs: '6 Professional Racing Simulator',
    background: 'https://i.ytimg.com/vi/5PodBRzLoO8/maxresdefault.jpg'
  },
  'cafe': {
    icon: Coffee,
    color: 'yellow',
    features: [
      'Fresh Coffee & Tea',
      'Healthy Snacks',
      'Quick Meals',
      'Cold Beverages',
      'Energy Drinks',
      'Comfortable Seating Area'
    ],
    games: [],
    specs: 'Lezzetli Cafe Menüsü',
    background: 'https://i.pinimg.com/736x/1c/69/6c/1c696c411d03f641222e8c3a91f05ebd.jpg'
  }
};

const colorClasses = {
  purple: 'border-purple-500/30 text-purple-400',
  blue: 'border-blue-500/30 text-blue-400',
  green: 'border-green-500/30 text-green-400',
  yellow: 'border-yellow-500/30 text-yellow-400'
};

export function ZoneDetail({ zone }: ZoneDetailProps) {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const info = zoneInfo[zone.slug as keyof typeof zoneInfo];
  const Icon = info?.icon || Monitor;

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[60vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/40 via-background/60 to-green-900/40"></div>
        
        <div className="relative z-10 max-w-4xl mx-auto text-center px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <Link href="/" className="inline-flex items-center text-gray-400 hover:text-white mb-6 transition-colors">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Ana Sayfaya Dön
            </Link>
            
            <div className="flex items-center justify-center mb-6">
              <Icon className={`h-16 w-16 mr-4 ${info ? colorClasses[info.color as keyof typeof colorClasses].split(' ')[1] : 'text-purple-400'}`} />
              <h1 className="text-4xl md:text-6xl font-bold text-white">
                {zone.name}
              </h1>
            </div>
            
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              {zone.description}
            </p>
            
            {info && (
              <div className="inline-flex items-center bg-gray-800/50 rounded-lg px-6 py-3 border border-purple-500/20">
                <Star className="h-5 w-5 text-yellow-400 mr-2" />
                <span className="text-white font-medium">{info.specs}</span>
              </div>
            )}
          </motion.div>
        </div>
      </section>

      {/* Features & Pricing */}
      <section className="py-20 px-4" ref={ref}>
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Features */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={inView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.8 }}
              className="lg:col-span-2"
            >
              <div className="gaming-card p-8">
                <h2 className="text-2xl font-bold text-white mb-6">Özellikler</h2>
                
                {info && (
                  <div className="grid md:grid-cols-2 gap-4 mb-8">
                    {info.features.map((feature, index) => (
                      <div key={index} className="flex items-center space-x-3">
                        <div className={`w-2 h-2 rounded-full ${info ? colorClasses[info.color as keyof typeof colorClasses].split(' ')[1].replace('text-', 'bg-') : 'bg-purple-400'}`}></div>
                        <span className="text-gray-300">{feature}</span>
                      </div>
                    ))}
                  </div>
                )}

                {info && info.games.length > 0 && (
                  <div>
                    <h3 className="text-xl font-bold text-white mb-4">Mevcut Oyunlar</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {info.games.map((game, index) => (
                        <div key={index} className="bg-gray-800/50 rounded-lg p-3 text-center">
                          <span className="text-sm text-gray-300">{game}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Pricing */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={inView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <div className="gaming-card p-8">
                <h2 className="text-2xl font-bold text-white mb-6">Fiyatlandırma</h2>
                
                <div className="space-y-4">
                  {zone.products.map((product) => (
                    <div key={product.id} className="border border-gray-700 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-medium text-white">{product.name}</h3>
                        <span className="text-lg font-bold text-green-400">
                          {product.price}₺
                        </span>
                      </div>
                      
                      {product.description && (
                        <p className="text-sm text-gray-400 mb-2">{product.description}</p>
                      )}
                      
                      {product.duration && (
                        <div className="flex items-center text-sm text-gray-500">
                          <Clock className="h-4 w-4 mr-1" />
                          <span>{product.duration} dakika</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <div className="mt-8 p-4 bg-purple-500/10 rounded-lg border border-purple-500/20">
                  <h3 className="font-bold text-white mb-2">Rezervasyon</h3>
                  <p className="text-sm text-gray-400 mb-4">
                    Rezervasyon için bizi arayın veya direkt gelebilirsiniz.
                  </p>
                  <Button className="w-full bg-purple-600 hover:bg-purple-700">
                    <Users className="h-4 w-4 mr-2" />
                    Rezervasyon Yap
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}
