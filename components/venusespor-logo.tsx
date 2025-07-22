
import Image from 'next/image';

interface VenusesporLogoProps {
  src: string;
  alt: string;
  width: number;
  height: number;
  className?: string;
}

export function VenusesporLogo({ src, alt, width, height, className = '' }: VenusesporLogoProps) {
  return (
    <div className={`relative ${className}`} style={{ width, height }}>
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        className="w-full h-full object-contain"
        priority
      />
    </div>
  );
}
