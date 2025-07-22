
'use client';

import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { Clock, Calendar, Zap } from 'lucide-react';

export function OperatingHours() {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const hours = [
    { day: 'Pazartesi', time: '10:00 - 04:00', isToday: false },
    { day: 'Salı', time: '10:00 - 04:00', isToday: false },
    { day: 'Çarşamba', time: '10:00 - 04:00', isToday: false },
    { day: 'Perşembe', time: '10:00 - 04:00', isToday: false },
    { day: 'Cuma', time: '10:00 - 04:00', isToday: false },
    { day: 'Cumartesi', time: '10:00 - 04:00', isToday: true },
    { day: 'Pazar', time: '10:00 - 04:00', isToday: false },
  ];

  return (
    <section className="py-20 px-4 bg-gradient-to-br from-gray-900/50 to-purple-900/20" ref={ref}>
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Çalışma <span className="text-green-400">Saatleri</span>
          </h2>
          <p className="text-gray-400 text-lg">
            Haftanın 7 günü kesintisiz hizmet
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Hours Table */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="md:col-span-2"
          >
            <div className="gaming-card p-6">
              <div className="flex items-center mb-6">
                <Calendar className="h-6 w-6 text-purple-400 mr-3" />
                <h3 className="text-xl font-bold text-white">Haftalık Program</h3>
              </div>
              
              <div className="space-y-3">
                {hours.map((item, index) => (
                  <div
                    key={item.day}
                    className={`flex justify-between items-center p-3 rounded-lg transition-colors ${
                      item.isToday
                        ? 'bg-purple-500/20 border border-purple-500/30'
                        : 'bg-gray-800/30'
                    }`}
                  >
                    <span className={`font-medium ${item.isToday ? 'text-purple-400' : 'text-gray-300'}`}>
                      {item.day}
                    </span>
                    <span className={`font-bold ${item.isToday ? 'text-green-400' : 'text-white'}`}>
                      {item.time}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Quick Info */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="space-y-6"
          >
            <div className="gaming-card p-6">
              <div className="flex items-center mb-4">
                <Clock className="h-6 w-6 text-green-400 mr-3" />
                <h3 className="text-lg font-bold text-white">Şu An</h3>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400 mb-2">AÇIK</div>
                <p className="text-gray-400 text-sm">Kapanış: 04:00</p>
              </div>
            </div>

            <div className="gaming-card p-6">
              <div className="flex items-center mb-4">
                <Zap className="h-6 w-6 text-yellow-400 mr-3" />
                <h3 className="text-lg font-bold text-white">Özel Saatler</h3>
              </div>
              <div className="space-y-2 text-sm text-gray-300">
                <p>• Gece 02:00-04:00 arası %20 indirim</p>
                <p>• Hafta içi 10:00-14:00 öğrenci indirimi</p>
                <p>• Cumartesi gece özel turnuvalar</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
