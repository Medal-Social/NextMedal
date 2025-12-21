'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

export default function Wrapper({ className, children }: React.ComponentProps<'header'>) {
  const ref = useRef<HTMLDivElement>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isDarkHero, setIsDarkHero] = useState(false);
  const pathname = usePathname();

  // check for dark theme on first content element
  // biome-ignore lint/correctness/useExhaustiveDependencies: re-run check when route changes
  useEffect(() => {
    const checkDarkTheme = () => {
      // Find the main content area
      const main = document.querySelector('main');
      if (!main) return;

      // Check the first child of main, or specific known containers
      const firstChild = main.firstElementChild;

      if (firstChild && firstChild.getAttribute('data-theme') === 'dark') {
        setIsDarkHero(true);
      } else {
        setIsDarkHero(false);
      }
    };

    // Run initially
    checkDarkTheme();

    // Setup observer for dynamic content changes (optional but good for hydration)
    const observer = new MutationObserver(checkDarkTheme);
    const main = document.querySelector('main');
    if (main) {
      observer.observe(main, {
        childList: true,
        attributes: true,
        attributeFilter: ['data-theme'],
      });
    }

    return () => observer.disconnect();
  }, [pathname]);

  // handle scroll state
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
    <header
      ref={ref}
      className={cn(
        className,
        'transition-colors duration-150',
        isScrolled
          ? 'bg-background border-b border-border/40 shadow-sm'
          : 'bg-transparent border-transparent',
        !isScrolled && isDarkHero && 'dark text-white'
      )}
    >
      {children}
    </header>
  );
}
