

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { Menu, X, User, LogOut, Settings, Monitor, TrendingUp, ChevronDown, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { VenusesporLogo } from '@/components/venusespor-logo';
import ShoppingCart from '@/components/ecommerce/shopping-cart';

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { data: session, status } = useSession();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-purple-500/20 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="max-w-6xl mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-2">
          <VenusesporLogo
            src="/venusespor_logo.png"
            alt="Venusespor Esports Center"
            width={128}
            height={40}
            className="hover:scale-105 transition-transform duration-300"
          />
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6">
          <Link
            href="/tournaments"
            className="text-sm font-medium hover:text-purple-400 transition-colors"
          >
            Turnuvalar
          </Link>
          <Link
            href="/leaderboard"
            className="text-sm font-medium hover:text-purple-400 transition-colors"
          >
            Liderlik
          </Link>
          <Link
            href="/arcade"
            className="text-sm font-medium hover:text-cyan-400 transition-colors relative"
          >
            <span className="flex items-center space-x-1">
              <span>🎮</span>
              <span>Arcade</span>
            </span>
          </Link>
          <Link
            href="/gamification"
            className="text-sm font-medium hover:text-pink-400 transition-colors relative"
          >
            <span className="flex items-center space-x-1">
              <span>✨</span>
              <span>Gamification</span>
            </span>
          </Link>
          <Link
            href="/servers"
            className="text-sm font-medium hover:text-cyan-400 transition-colors relative"
          >
            <span className="flex items-center space-x-1">
              <span>🏁</span>
              <span>AC Servers</span>
            </span>
          </Link>
          
          {/* Upgrade Center Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                className="text-sm font-medium hover:text-orange-400 transition-colors relative p-0 h-auto font-normal"
              >
                <span className="flex items-center space-x-1">
                  <TrendingUp className="h-4 w-4" />
                  <span>Upgrade Merkezi</span>
                  <ChevronDown className="h-3 w-3" />
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="center">
              <DropdownMenuItem asChild>
                <Link href="/upgrade-center" className="flex items-center">
                  <TrendingUp className="mr-2 h-4 w-4" />
                  <span>Ana Sayfa</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/upgrade-center/analysis" className="flex items-center">
                  <Monitor className="mr-2 h-4 w-4" />
                  <span>Sistem Analizi</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/upgrade-center/inventory" className="flex items-center">
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Hardware Envanteri</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/upgrade-center/simulator" className="flex items-center">
                  <TrendingUp className="mr-2 h-4 w-4" />
                  <span>Upgrade Simülatörü</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/upgrade-center/services" className="flex items-center">
                  <User className="mr-2 h-4 w-4" />
                  <span>Servis Paketleri</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/upgrade-center/recommendations" className="flex items-center">
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Gaming Önerileri</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/upgrade-center/calculator" className="flex items-center">
                  <Monitor className="mr-2 h-4 w-4" />
                  <span>Fiyat Hesaplayıcı</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/ecommerce" className="flex items-center">
                  <ShoppingBag className="mr-2 h-4 w-4" />
                  <span>Hardware Mağaza</span>
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <Link
            href="/gizmo-dashboard"
            className="text-sm font-medium hover:text-green-400 transition-colors relative"
          >
            <span className="flex items-center space-x-1">
              <Monitor className="h-4 w-4" />
              <span>Gizmo Dashboard</span>
            </span>
          </Link>
          <Link
            href="/pc-durumu"
            className="text-sm font-medium hover:text-blue-400 transition-colors relative"
          >
            <span className="flex items-center space-x-1">
              <Monitor className="h-4 w-4" />
              <span>PC Durumu</span>
            </span>
          </Link>
          <Link
            href="/challenges"
            className="text-sm font-medium hover:text-purple-400 transition-colors"
          >
            Challenge'lar
          </Link>
          <Link
            href="/lootbox"
            className="text-sm font-medium hover:text-yellow-400 transition-colors relative"
          >
            <span className="flex items-center space-x-1">
              <span>🎁</span>
              <span>Kasa Aç</span>
            </span>
          </Link>
          <Link
            href="/zones/pc-zone"
            className="text-sm font-medium hover:text-purple-400 transition-colors"
          >
            PC Zone
          </Link>
          <Link
            href="/zones/ps5-zone"
            className="text-sm font-medium hover:text-purple-400 transition-colors"
          >
            PS5 Zone
          </Link>
          <Link
            href="/zones/cafe"
            className="text-sm font-medium hover:text-purple-400 transition-colors"
          >
            Cafe
          </Link>
        </nav>

        {/* Admin Menu */}
        <div className="flex items-center space-x-4">
          {/* Shopping Cart - visible when logged in */}
          {session?.user && <ShoppingCart />}
          
          {status === 'loading' ? (
            <div className="w-8 h-8 rounded-full bg-gray-700 animate-pulse"></div>
          ) : session?.user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="relative h-8 w-8 rounded-full">
                  <User className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuItem asChild>
                  <Link href="/profile" className="flex items-center">
                    <User className="mr-2 h-4 w-4" />
                    <span>Profilim</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => signOut()}
                  className="flex items-center"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Çıkış Yap</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center space-x-2">
              <Link href="/auth/register">
                <Button variant="ghost" size="sm" className="text-purple-400 hover:text-purple-300">
                  Üye Ol
                </Button>
              </Link>
              <Link href="/auth/signin">
                <Button variant="outline" size="sm" className="neon-border">
                  Üye Girişi
                </Button>
              </Link>
            </div>
          )}

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="sm"
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 border-t border-purple-500/20">
            <Link
              href="/tournaments"
              className="block px-3 py-2 text-sm font-medium hover:text-purple-400 transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Turnuvalar
            </Link>
            <Link
              href="/leaderboard"
              className="block px-3 py-2 text-sm font-medium hover:text-purple-400 transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Liderlik Tablosu
            </Link>
            <Link
              href="/arcade"
              className="block px-3 py-2 text-sm font-medium hover:text-cyan-400 transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              <span className="flex items-center space-x-2">
                <span>🎮</span>
                <span>Arcade</span>
              </span>
            </Link>
            <Link
              href="/gamification"
              className="block px-3 py-2 text-sm font-medium hover:text-pink-400 transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              <span className="flex items-center space-x-2">
                <span>✨</span>
                <span>Gamification</span>
              </span>
            </Link>
            <Link
              href="/servers"
              className="block px-3 py-2 text-sm font-medium hover:text-cyan-400 transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              <span className="flex items-center space-x-2">
                <span>🏁</span>
                <span>AC Servers</span>
              </span>
            </Link>
            
            {/* Upgrade Center Mobile Menu */}
            <div className="border-t border-gray-700/50 pt-2 mt-2">
              <div className="px-3 py-2 text-sm font-medium text-orange-400 flex items-center">
                <TrendingUp className="h-4 w-4 mr-2" />
                Upgrade Merkezi
              </div>
              <Link
                href="/upgrade-center"
                className="block px-6 py-2 text-sm font-medium hover:text-orange-400 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Ana Sayfa
              </Link>
              <Link
                href="/upgrade-center/analysis"
                className="block px-6 py-2 text-sm font-medium hover:text-orange-400 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Sistem Analizi
              </Link>
              <Link
                href="/upgrade-center/inventory"
                className="block px-6 py-2 text-sm font-medium hover:text-orange-400 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Hardware Envanteri
              </Link>
              <Link
                href="/upgrade-center/simulator"
                className="block px-6 py-2 text-sm font-medium hover:text-orange-400 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Upgrade Simülatörü
              </Link>
              <Link
                href="/upgrade-center/services"
                className="block px-6 py-2 text-sm font-medium hover:text-orange-400 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Servis Paketleri
              </Link>
              <Link
                href="/upgrade-center/recommendations"
                className="block px-6 py-2 text-sm font-medium hover:text-orange-400 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Gaming Önerileri
              </Link>
              <Link
                href="/upgrade-center/calculator"
                className="block px-6 py-2 text-sm font-medium hover:text-orange-400 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Fiyat Hesaplayıcı
              </Link>
              <Link
                href="/ecommerce"
                className="block px-6 py-2 text-sm font-medium hover:text-orange-400 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Hardware Mağaza
              </Link>
            </div>
            
            <Link
              href="/gizmo-dashboard"
              className="block px-3 py-2 text-sm font-medium hover:text-green-400 transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              <span className="flex items-center space-x-2">
                <Monitor className="h-4 w-4" />
                <span>Gizmo Dashboard</span>
              </span>
            </Link>
            <Link
              href="/pc-durumu"
              className="block px-3 py-2 text-sm font-medium hover:text-blue-400 transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              <span className="flex items-center space-x-2">
                <Monitor className="h-4 w-4" />
                <span>PC Durumu</span>
              </span>
            </Link>
            <Link
              href="/challenges"
              className="block px-3 py-2 text-sm font-medium hover:text-purple-400 transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Challenge'lar
            </Link>
            <Link
              href="/lootbox"
              className="block px-3 py-2 text-sm font-medium hover:text-yellow-400 transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              <span className="flex items-center space-x-2">
                <span>🎁</span>
                <span>Kasa Aç</span>
              </span>
            </Link>
            <Link
              href="/zones/pc-zone"
              className="block px-3 py-2 text-sm font-medium hover:text-purple-400 transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              PC Zone
            </Link>
            <Link
              href="/zones/ps5-zone"
              className="block px-3 py-2 text-sm font-medium hover:text-purple-400 transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              PS5 Zone
            </Link>
            <Link
              href="/zones/cafe"
              className="block px-3 py-2 text-sm font-medium hover:text-purple-400 transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Cafe
            </Link>
            
            {/* Mobile Authentication Links */}
            {!session?.user && (
              <div className="border-t border-purple-500/20 pt-2 mt-2">
                <Link
                  href="/auth/register"
                  className="block px-3 py-2 text-sm font-medium text-purple-400 hover:text-purple-300 transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Üye Ol
                </Link>
                <Link
                  href="/auth/signin"
                  className="block px-3 py-2 text-sm font-medium text-purple-400 hover:text-purple-300 transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Üye Girişi
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
