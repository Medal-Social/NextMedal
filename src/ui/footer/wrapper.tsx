'use client';

import { useEffect, useRef } from 'react';

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
          document.documentElement.style.setProperty(
            '--footer-height',
            `${height}px`
          );
        }
      } catch (error) {
        console.error('Error setting footer height:', error);
      }
    }

    setHeight();
    window.addEventListener('resize', setHeight);

    return () => {
      try {
        window.removeEventListener('resize', setHeight);
      } catch (error) {
        console.error('Error removing resize listener:', error);
      }
    };
  }, []);

  return (
    <footer ref={ref} className={className}>
      {children}
    </footer>
  );
}
