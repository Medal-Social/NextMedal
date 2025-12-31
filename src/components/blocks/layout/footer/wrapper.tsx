'use client';

import { useEffect, useRef } from 'react';
import { logger } from '@/lib/core/logger';

interface WrapperProps extends React.ComponentProps<'footer'> {
  className?: string;
  children: React.ReactNode;
}

export default function Wrapper({ className, children }: WrapperProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    function setHeight() {
      try {
        if (!ref.current) return;
        const height = ref.current.offsetHeight;
        if (typeof height === 'number') {
          document.documentElement.style.setProperty('--footer-height', `${height}px`);
        }
      } catch (error) {
        logger.error({ err: error }, 'Error setting footer height:');
      }
    }

    setHeight();
    window.addEventListener('resize', setHeight);

    return () => {
      try {
        window.removeEventListener('resize', setHeight);
      } catch (error) {
        logger.error({ err: error }, 'Error removing resize listener:');
      }
    };
  }, []);

  return (
    <footer ref={ref} className={className}>
      {children}
    </footer>
  );
}
