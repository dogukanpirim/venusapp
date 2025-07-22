
import Image from 'next/image';
import Link from 'next/link';
import { Clock, MapPin, Phone } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-gray-900 border-t border-purple-500/20 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="grid md:grid-cols-3 gap-8">
          {/* Logo and Info */}
          <div>
            <div className="relative h-12 w-40 mb-4">
              <Image
                src="/venusespor_logo.png"
                alt="Venusespor Esports Center"
                fill
                className="object-contain"
              />
            </div>
            <p className="text-gray-400 text-sm mb-4">
              Premium esports deneyimi ve lezzetli cafe menüsü ile İstanbul'un en iyi oyuncu merkezi.
            </p>
            <div className="flex items-center space-x-2 text-sm text-gray-400">
              <Clock className="h-4 w-4" />
              <span>7/24 Açık: 10:00 - 04:00</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Hızlı Linkler</h3>
            <div className="space-y-2">
              <Link href="/zones/pc-zone" className="block text-gray-400 hover:text-purple-400 transition-colors text-sm">
                PC Zone
              </Link>
              <Link href="/zones/ps5-zone" className="block text-gray-400 hover:text-purple-400 transition-colors text-sm">
                PS5 Zone
              </Link>
              <Link href="/zones/racing-zone" className="block text-gray-400 hover:text-purple-400 transition-colors text-sm">
                Racing Zone
              </Link>
              <Link href="/zones/cafe" className="block text-gray-400 hover:text-purple-400 transition-colors text-sm">
                Cafe Menu
              </Link>
            </div>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-semibold mb-4">İletişim</h3>
            <div className="space-y-2 text-sm text-gray-400">
              <div className="flex items-center space-x-2">
                <MapPin className="h-4 w-4" />
                <span>Merkez Mahallesi, Gaming Sokağı No:1</span>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="h-4 w-4" />
                <span>+90 555 123 4567</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-500">
          <p>&copy; 2024 Venusespor Esports Center. Tüm hakları saklıdır.</p>
        </div>
      </div>
    </footer>
  );
}
