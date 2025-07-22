
"use client";

import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  AnimatePresence,
} from "framer-motion";
import {
  Children,
  cloneElement,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useRouter, usePathname } from "next/navigation";
import { 
  Home, 
  Monitor, 
  Gamepad2, 
  Trophy, 
  TrendingUp,
  Target,
  Coffee, 
  MessageCircle,
  Zap,
  Gift
} from "lucide-react";

interface DockItemProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  mouseX: any;
  spring: any;
  distance: number;
  magnification: number;
  baseItemSize: number;
  isActive?: boolean;
}

function DockItem({
  children,
  className = "",
  onClick,
  mouseX,
  spring,
  distance,
  magnification,
  baseItemSize,
  isActive = false,
}: DockItemProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isHovered = useMotionValue(0);

  const mouseDistance = useTransform(mouseX, (val: number) => {
    const rect = ref.current?.getBoundingClientRect() ?? {
      x: 0,
      width: baseItemSize,
    };
    return val - rect.x - baseItemSize / 2;
  });

  const targetSize = useTransform(
    mouseDistance,
    [-distance, 0, distance],
    [baseItemSize, magnification, baseItemSize]
  );
  const size = useSpring(targetSize, spring);

  return (
    <motion.div
      ref={ref}
      style={{
        width: size,
        height: size,
      }}
      onHoverStart={() => isHovered.set(1)}
      onHoverEnd={() => isHovered.set(0)}
      onFocus={() => isHovered.set(1)}
      onBlur={() => isHovered.set(0)}
      onClick={onClick}
      className={`relative inline-flex items-center justify-center rounded-xl cursor-pointer outline-none transition-all duration-200 ${
        isActive 
          ? 'bg-purple-600/90 border-2 border-purple-400' 
          : 'bg-gray-900/90 border border-gray-700 hover:bg-gray-800/90 hover:border-purple-500/50'
      } backdrop-blur-md shadow-lg ${className}`}
      tabIndex={0}
      role="button"
      whileTap={{ scale: 0.95 }}
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 0.1 }}
    >
      {Children.map(children, (child) =>
        cloneElement(child as React.ReactElement, { isHovered, isActive })
      )}
    </motion.div>
  );
}

function DockLabel({ children, className = "", ...rest }: any) {
  const { isHovered } = rest;
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!isHovered) return;
    const unsubscribe = isHovered.on?.("change", (latest: number) => {
      setIsVisible(latest === 1);
    });
    return () => unsubscribe?.();
  }, [isHovered]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 10, scale: 0.8 }}
          animate={{ opacity: 1, y: -8, scale: 1 }}
          exit={{ opacity: 0, y: 10, scale: 0.8 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className={`absolute top-0 left-1/2 transform -translate-x-1/2 w-fit whitespace-nowrap rounded-lg border border-gray-700 bg-gray-900/95 backdrop-blur-md px-2 py-1 text-xs font-medium text-white shadow-lg pointer-events-none ${className}`}
          style={{ zIndex: 1000 }}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function DockIcon({ children, className = "", isActive = false }: any) {
  return (
    <div className={`flex items-center justify-center ${isActive ? 'text-white' : 'text-gray-300'} ${className}`}>
      {children}
    </div>
  );
}

interface DockItem {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  path?: string;
}

interface MobileDockProps {
  className?: string;
  spring?: any;
  magnification?: number;
  distance?: number;
  panelHeight?: number;
  baseItemSize?: number;
}

export default function MobileDock({
  className = "",
  spring = { mass: 0.1, stiffness: 150, damping: 12 },
  magnification = 60,
  distance = 120,
  panelHeight = 68,
  baseItemSize = 48,
}: MobileDockProps) {
  const router = useRouter();
  const pathname = usePathname();
  const mouseX = useMotionValue(Infinity);
  const isHovered = useMotionValue(0);

  const scrollToContact = () => {
    if (pathname === '/') {
      const contactSection = document.getElementById('contact-section') || 
                           document.querySelector('[data-contact]') ||
                           document.querySelector('.contact-section');
      if (contactSection) {
        contactSection.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      router.push('/#contact');
    }
  };

  const items: DockItem[] = [
    { 
      icon: <Home size={20} />, 
      label: 'Ana Sayfa', 
      onClick: () => router.push('/'),
      path: '/'
    },
    { 
      icon: <Trophy size={20} />, 
      label: 'Turnuvalar', 
      onClick: () => router.push('/tournaments'),
      path: '/tournaments'
    },
    { 
      icon: <TrendingUp size={20} />, 
      label: 'Liderlik', 
      onClick: () => router.push('/leaderboard'),
      path: '/leaderboard'
    },
    { 
      icon: <Target size={20} />, 
      label: 'Challenge\'lar', 
      onClick: () => router.push('/challenges'),
      path: '/challenges'
    },
    { 
      icon: <Gift size={20} />, 
      label: 'Kasa Aç', 
      onClick: () => router.push('/lootbox'),
      path: '/lootbox'
    },
    { 
      icon: <Monitor size={20} />, 
      label: 'PC Zone', 
      onClick: () => router.push('/zones/pc-zone'),
      path: '/zones/pc-zone'
    },
    { 
      icon: <Coffee size={20} />, 
      label: 'Cafe', 
      onClick: () => router.push('/zones/cafe'),
      path: '/zones/cafe'
    },
    { 
      icon: <MessageCircle size={20} />, 
      label: 'İletişim', 
      onClick: scrollToContact
    },
  ];

  const maxHeight = useMemo(
    () => Math.max(panelHeight * 1.5, magnification + magnification / 2 + 4),
    [magnification, panelHeight]
  );
  
  const heightRow = useTransform(isHovered, [0, 1], [panelHeight, maxHeight]);
  const height = useSpring(heightRow, spring);

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 pointer-events-none">
      <motion.div
        style={{ height }}
        className="flex items-end justify-center pb-4 pointer-events-none"
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.6, ease: "easeOut" }}
      >
        <motion.div
          onMouseMove={({ pageX }) => {
            isHovered.set(1);
            mouseX.set(pageX);
          }}
          onMouseLeave={() => {
            isHovered.set(0);
            mouseX.set(Infinity);
          }}
          onTouchStart={() => isHovered.set(1)}
          onTouchEnd={() => {
            setTimeout(() => isHovered.set(0), 1000);
          }}
          className={`flex items-end gap-3 rounded-2xl border border-gray-800/50 bg-black/80 backdrop-blur-xl px-4 py-3 shadow-2xl pointer-events-auto ${className}`}
          style={{ 
            height: panelHeight,
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8), 0 0 0 1px rgba(139, 69, 197, 0.3)'
          }}
          role="toolbar"
          aria-label="Navigation dock"
        >
          {items.map((item, index) => {
            const isActive = item.path ? pathname === item.path : false;
            return (
              <DockItem
                key={index}
                onClick={item.onClick}
                mouseX={mouseX}
                spring={spring}
                distance={distance}
                magnification={magnification}
                baseItemSize={baseItemSize}
                isActive={isActive}
              >
                <DockIcon isActive={isActive}>{item.icon}</DockIcon>
                <DockLabel>{item.label}</DockLabel>
              </DockItem>
            );
          })}
        </motion.div>
      </motion.div>
    </div>
  );
}
