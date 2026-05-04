'use client';

import { AnimatePresence } from 'motion/react';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { CommandMenu } from '@/components/blocks/utility/CommandMenu';
import { Link } from '@/i18n/navigation';
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
  }, []);

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
  }, []);

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
            ? 'border-border/40 border-b bg-background shadow-sm'
            : 'border-transparent bg-transparent',
          !isScrolled && isDarkHero && !isOpen && !isDocs && 'dark text-white'
        )}
      >
        <div
          className={cn(
            'mx-auto flex min-h-16 w-full items-center p-4 px-4 sm:px-6 lg:px-8',
            isDocs ? 'max-w-none' : 'max-w-7xl'
          )}
        >
          {isDocs ? (
            <div className="flex w-full flex-1 items-center justify-between">
              <div className="flex min-w-0 items-center gap-2 sm:gap-4">
                {/* Identity: Logo | Docs */}
                <div className="flex shrink-0 items-center">{logoNode}</div>
                <div className="hidden h-6 w-px shrink-0 rotate-12 bg-border/60 sm:block" />
                <Link
                  href="/docs"
                  className="hidden truncate font-semibold text-lg tracking-tight transition-opacity hover:opacity-80 sm:block"
                >
                  Docs
                </Link>
              </div>

              <div className="relative z-[101] flex shrink-0 items-center gap-1 sm:gap-2 md:gap-4">
                {enableSearch && (
                  <>
                    <div className="hidden md:block">
                      <CommandMenu
                        variant="default"
                        className="w-[180px] border-transparent bg-muted/40 hover:bg-muted/60 lg:w-[240px]"
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
                <Toggle isOpen={isOpen} setIsOpen={setIsOpen} className="ml-1 md:hidden" />
              </div>
            </div>
          ) : (
            <div className="flex w-full flex-1 items-center justify-between">
              {/* Left: Logo + Navigation */}
              <div className="flex min-w-0 items-center gap-4 lg:gap-10">
                <div className="shrink-0">{logoNode}</div>
                <div className="hidden lg:block">{navNode}</div>
              </div>

              {/* Right: Search + Controls + CTA */}
              <div className="relative z-[101] flex shrink-0 items-center gap-2 md:gap-4">
                {/* Search */}
                {enableSearch && (
                  <>
                    <div className="hidden md:block">
                      <CommandMenu
                        variant="default"
                        className="w-[150px] border-transparent bg-muted/40 hover:bg-muted/60 lg:w-[200px]"
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
                  <div className="hidden h-6 items-center border-border/40 border-l pl-4 md:flex lg:pl-6">
                    {ctaNode}
                  </div>
                )}

                {/* Mobile Toggle */}
                <div className="ml-1 flex items-center lg:hidden">
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
