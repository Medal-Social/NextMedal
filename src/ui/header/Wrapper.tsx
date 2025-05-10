'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useRef } from 'react';

export default function Wrapper({ className, children }: React.ComponentProps<'header'>) {
  const ref = useRef<HTMLDivElement>(null);
  const _pathname = usePathname();

  // set --header-height
  useEffect(() => {
    if (typeof window === 'undefined') return;

    function setHeight() {
      if (!ref.current) return;
      document.documentElement.style.setProperty(
        '--header-height',
        `${ref.current.offsetHeight ?? 0}px`
      );
    }
    setHeight();
    window.addEventListener('resize', setHeight);

    return () => window.removeEventListener('resize', setHeight);
  }, []);

  // close mobile menu after navigation
  useEffect(() => {
    if (typeof document === 'undefined') return;
    const toggle = document.querySelector('#header-toggle') as HTMLInputElement;
    if (toggle) toggle.checked = false;
  }, []);

  return (
    <header ref={ref} className={className}>
      {children}
    </header>
  );
}
