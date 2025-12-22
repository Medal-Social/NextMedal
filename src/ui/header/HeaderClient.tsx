'use client';

import { usePathname } from 'next/navigation';
import { type ReactNode, useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import MobileNavigation from './mobile-navigation';
import Toggle from './Toggle';

interface HeaderClientProps extends React.ComponentProps<'header'> {
  logo: ReactNode;
  ctas: any;
  menu: any;
  children: ReactNode;
}

export default function HeaderClient({
  className,
  logo,
  ctas,
  menu,
  children,
}: HeaderClientProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isDarkHero, setIsDarkHero] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
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
        `${ref.current.offsetHeight ?? 0}px`,
      );
    }
    setHeight();
    window.addEventListener('resize', setHeight);

    return () => window.removeEventListener('resize', setHeight);
  }, []);

  // close mobile menu after navigation or on desktop resize
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <>
      <header
        ref={ref}
        className={cn(
          className,
          'transition-colors duration-150',
          isScrolled
            ? 'bg-background border-b border-border/40 shadow-sm'
            : 'bg-transparent border-transparent',
          !isScrolled && isDarkHero && 'dark text-white',
        )}
      >
        <div className="header-grid mx-auto grid max-w-7xl items-center gap-x-6 p-4 px-4 sm:px-6 lg:px-8">
          {children}

          <div className="flex items-center gap-2 ml-auto [grid-area:toggle-area] lg:hidden">
            <Toggle isOpen={isOpen} setIsOpen={setIsOpen} />
          </div>
        </div>
      </header>

      {isOpen && (
        <div className="lg:hidden">
          <MobileNavigation
            menu={menu}
            ctas={ctas}
            headerLogo={logo}
            isOpen={isOpen}
            setIsOpen={setIsOpen}
          />
        </div>
      )}
    </>
  );
}

