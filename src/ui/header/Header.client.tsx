'use client';

import { AnimatePresence } from 'motion/react';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils/index';
import { DESKTOP_BREAKPOINT, SCROLL_THRESHOLD } from './constants';
import MobileNavigation from './mobile-navigation';
import Toggle from './Toggle';
import type { HeaderClientProps } from './types';

export default function HeaderClient({
  className,
  ctas,
  menu,
  enableSearch,
  children,
}: HeaderClientProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isOpenRef = useRef(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isDarkHero, setIsDarkHero] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  // Keep ref in sync with state for resize handler
  isOpenRef.current = isOpen;

  // Check for dark theme on first content element
  useEffect(() => {
    const checkDarkTheme = () => {
      const main = document.querySelector('main');
      if (!main) return;

      const firstChild = main.firstElementChild;
      setIsDarkHero(firstChild?.getAttribute('data-theme') === 'dark');
    };

    checkDarkTheme();

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

  // Handle scroll state with throttling
  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setIsScrolled(window.scrollY > SCROLL_THRESHOLD);
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Set --header-height (includes banner height for proper content offset)
  useEffect(() => {
    if (typeof window === 'undefined') return;

    function setHeight() {
      if (!ref.current) return;
      const bannerHeight =
        Number.parseInt(
          getComputedStyle(document.documentElement).getPropertyValue('--banner-height') || '0',
          10
        ) || 0;
      const headerHeight = ref.current.offsetHeight ?? 0;
      document.documentElement.style.setProperty(
        '--header-height',
        `${bannerHeight + headerHeight}px`
      );
    }
    setHeight();
    window.addEventListener('resize', setHeight, { passive: true });

    // Listen for banner height changes via MutationObserver on style attribute
    const observer = new MutationObserver(setHeight);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['style'],
    });

    return () => {
      window.removeEventListener('resize', setHeight);
      observer.disconnect();
    };
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  // Close mobile menu on resize to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= DESKTOP_BREAKPOINT && isOpenRef.current) {
        setIsOpen(false);
      }
    };
    window.addEventListener('resize', handleResize, { passive: true });
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Prevent body scroll when menu is open and compensate for scrollbar width
  useEffect(() => {
    if (isOpen) {
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
      document.body.style.paddingRight = `${scrollbarWidth}px`;
      document.body.style.overflow = 'hidden';

      // Compensate fixed header as well
      if (ref.current) {
        ref.current.style.paddingRight = `${scrollbarWidth}px`;
      }
    } else {
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';

      if (ref.current) {
        ref.current.style.paddingRight = '';
      }
    }
    return () => {
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
      if (ref.current) {
        ref.current.style.paddingRight = '';
      }
    };
  }, [isOpen]);

  return (
    <>
      <header
        ref={ref}
        className={cn(
          className,
          'relative z-10 transition-colors duration-200 ease-in-out',
          isScrolled || isOpen
            ? 'bg-background border-b border-border/40 shadow-sm'
            : 'bg-transparent border-transparent',
          !isScrolled && isDarkHero && !isOpen && 'dark text-white'
        )}
      >
        <div className="mx-auto flex min-h-16 max-w-7xl items-center gap-x-6 p-4 px-4 sm:px-6 lg:px-8">
          {children}

          <div className="flex items-center gap-2 lg:hidden relative z-[101]">
            <Toggle isOpen={isOpen} setIsOpen={setIsOpen} />
          </div>
        </div>
      </header>

      <AnimatePresence>
        {isOpen && <MobileNavigation menu={menu} ctas={ctas} enableSearch={enableSearch} />}
      </AnimatePresence>
    </>
  );
}
