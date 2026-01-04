'use client';

import { AnimatePresence } from 'motion/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { CommandMenu } from '@/components/blocks/utility/CommandMenu';
import { useCollections } from '@/lib/collections/context';
import { cn } from '@/lib/utils/index';
import { DESKTOP_BREAKPOINT, SCROLL_THRESHOLD } from './constants';
import MobileDocsNavigation from './mobile-docs-navigation';
import MobileNavigation from './mobile-navigation';
import ThemeToggle from './ThemeToggle';
import Toggle from './Toggle';
import type { HeaderClientProps } from './types';

export default function HeaderClient({
  className,
  ctas,
  menu,
  enableSearch,
  logoNode,
  navNode,
  ctaNode,
  localeSwitcherNode,
}: HeaderClientProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isOpenRef = useRef(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isDarkHero, setIsDarkHero] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const { getSlug } = useCollections();

  const docsSlug = getSlug('collection.documentation');
  const isDocs = docsSlug && pathname?.includes(`/${docsSlug}`);
  const isDocsRoot = docsSlug && pathname?.endsWith(`/${docsSlug}`);

  const _backHref = isDocsRoot ? '/' : `/${docsSlug || 'docs'}`;

  isOpenRef.current = isOpen;

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
          'relative z-50 transition-colors duration-200 ease-in-out',
          isScrolled || isOpen || isDocs
            ? 'bg-background border-b border-border/40 shadow-sm'
            : 'bg-transparent border-transparent',
          !isScrolled && isDarkHero && !isOpen && !isDocs && 'dark text-white'
        )}
      >
        <div
          className={cn(
            'mx-auto flex min-h-16 items-center w-full p-4 px-4 sm:px-6 lg:px-8',
            isDocs ? 'max-w-none' : 'max-w-7xl'
          )}
        >
          {isDocs ? (
            <div className="flex flex-1 items-center justify-between w-full">
              <div className="flex items-center gap-2 sm:gap-4 min-w-0">
                {/* Identity: Logo | Docs */}
                <div className="flex items-center shrink-0">{logoNode}</div>
                <div className="hidden sm:block h-6 w-px bg-border/60 rotate-12 shrink-0" />
                <Link
                  href="/docs"
                  className="hidden sm:block font-semibold text-lg tracking-tight truncate hover:opacity-80 transition-opacity"
                >
                  Docs
                </Link>
              </div>

              <div className="flex items-center gap-1 sm:gap-2 md:gap-4 relative z-[101] shrink-0">
                {enableSearch && (
                  <>
                    <div className="hidden md:block">
                      <CommandMenu
                        variant="default"
                        className="w-[180px] lg:w-[240px] bg-muted/40 border-transparent hover:bg-muted/60"
                      />
                    </div>
                    <div className="md:hidden">
                      <CommandMenu variant="icon" />
                    </div>
                  </>
                )}

                <div className="flex items-center gap-1">
                  <ThemeToggle className="hover:bg-accent/50" />
                  {localeSwitcherNode}
                </div>

                {/* Mobile Toggle Trigger */}
                <Toggle isOpen={isOpen} setIsOpen={setIsOpen} className="md:hidden ml-1" />
              </div>
            </div>
          ) : (
            <div className="flex flex-1 items-center justify-between w-full">
              {/* Left: Logo + Navigation */}
              <div className="flex items-center gap-4 lg:gap-10 min-w-0">
                <div className="shrink-0">{logoNode}</div>
                <div className="hidden lg:block">{navNode}</div>
              </div>

              {/* Right: Search + Controls + CTA */}
              <div className="flex items-center gap-2 md:gap-4 relative z-[101] shrink-0">
                {/* Search */}
                {enableSearch && (
                  <>
                    <div className="hidden md:block">
                      <CommandMenu
                        variant="default"
                        className="w-[150px] lg:w-[200px] bg-muted/40 border-transparent hover:bg-muted/60"
                      />
                    </div>
                    <div className="md:hidden">
                      <CommandMenu variant="icon" />
                    </div>
                  </>
                )}

                {/* Theme + Language Controls */}
                <div className="flex items-center gap-1">
                  <ThemeToggle className="hover:bg-accent/50" />
                  {localeSwitcherNode}
                </div>

                {/* Marketing CTAs */}
                {ctaNode && (
                  <div className="hidden md:flex items-center border-l border-border/40 pl-4 lg:pl-6 h-6">
                    {ctaNode}
                  </div>
                )}

                {/* Mobile Toggle */}
                <div className="flex items-center lg:hidden ml-1">
                  <Toggle isOpen={isOpen} setIsOpen={setIsOpen} />
                </div>
              </div>
            </div>
          )}
        </div>
      </header>

      <AnimatePresence>
        {isOpen &&
          (isDocs ? (
            <MobileDocsNavigation closeMenu={() => setIsOpen(false)} />
          ) : (
            <MobileNavigation menu={menu} ctas={ctas} enableSearch={enableSearch} />
          ))}
      </AnimatePresence>
    </>
  );
}
