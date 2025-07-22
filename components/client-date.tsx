
'use client';

import { useState, useEffect } from 'react';

interface ClientDateProps {
  date: string | Date;
  format?: 'date' | 'datetime' | 'time' | 'relative';
  locale?: string;
  options?: Intl.DateTimeFormatOptions;
  className?: string;
}

export function ClientDate({ 
  date, 
  format = 'date', 
  locale = 'tr-TR', 
  options,
  className = ''
}: ClientDateProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    // Return a placeholder during SSR to prevent hydration mismatch
    return <span className={className}>--</span>;
  }

  const dateObj = new Date(date);
  
  if (format === 'relative') {
    const now = new Date();
    const diffTime = now.getTime() - dateObj.getTime();
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffHours < 1) {
      return <span className={className}>Az önce</span>;
    } else if (diffHours < 24) {
      return <span className={className}>{diffHours} saat önce</span>;
    } else if (diffDays < 7) {
      return <span className={className}>{diffDays} gün önce</span>;
    } else {
      return <span className={className}>{dateObj.toLocaleDateString(locale)}</span>;
    }
  }

  let formatOptions: Intl.DateTimeFormatOptions;
  
  switch (format) {
    case 'datetime':
      formatOptions = {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        ...options
      };
      break;
    case 'time':
      formatOptions = {
        hour: '2-digit',
        minute: '2-digit',
        ...options
      };
      break;
    default:
      formatOptions = {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        ...options
      };
  }

  return (
    <span className={className}>
      {dateObj.toLocaleDateString(locale, formatOptions)}
    </span>
  );
}

interface ClientTimeRemainingProps {
  endDate: string | Date;
  className?: string;
}

export function ClientTimeRemaining({ endDate, className = '' }: ClientTimeRemainingProps) {
  const [mounted, setMounted] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);

  useEffect(() => {
    setMounted(true);
    
    const updateTime = () => {
      const now = new Date().getTime();
      const end = new Date(endDate).getTime();
      const remaining = Math.max(0, end - now);
      setTimeRemaining(remaining);
    };

    updateTime();
    const interval = setInterval(updateTime, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [endDate]);

  if (!mounted) {
    // Return a placeholder during SSR
    return <span className={className}>-- saat kaldı</span>;
  }

  const hoursRemaining = Math.floor(timeRemaining / (1000 * 60 * 60));
  
  if (hoursRemaining <= 0) {
    return <span className={className}>Süre doldu</span>;
  }

  if (hoursRemaining > 24) {
    const daysRemaining = Math.floor(hoursRemaining / 24);
    return <span className={className}>{daysRemaining} gün kaldı</span>;
  }

  return <span className={className}>{hoursRemaining} saat kaldı</span>;
}
