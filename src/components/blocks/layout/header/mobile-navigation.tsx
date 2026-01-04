'use client';

import { ChevronDown, ExternalLink } from 'lucide-react';
import { motion, type Variants } from 'motion/react';
import Link from 'next/link';
import { stegaClean } from 'next-sanity';
import { useCallback, useEffect, useRef } from 'react';
import { CTAList } from '@/components/blocks/objects/cta';
import { CommandMenu } from '@/components/blocks/utility';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { resolveUrlSync } from '@/lib/sanity/resolve-url';
import { ANIMATION_DURATION, ANIMATION_EASING } from './constants';
import type { MobileNavigationProps } from './types';

function getNavLinkHref(link: Sanity.MenuItem | Sanity.Link): string {
  if (link.internal && '_type' in link.internal) {
    return resolveUrlSync(link.internal as Sanity.PageBase, {
      base: false,
      params: link.params,
    });
  }
  if (link.external) {
    return stegaClean(link.external);
  }
  return '/';
}

export const NavLink = ({
  link,
  onClick,
}: {
  link: Sanity.MenuItem | Sanity.Link;
  onClick?: () => void;
}) => (
  <Link
    href={getNavLinkHref(link)}
    className="flex items-center gap-4 rounded-lg p-4 min-h-11 text-lg font-medium hover:bg-accent hover:text-primary text-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-colors"
    target={link.external ? '_blank' : undefined}
    aria-label={link.external ? `${link.label} (opens in new tab)` : undefined}
    onClick={onClick}
  >
    <div className="flex-1">
      <div className="flex items-center gap-2">
        {link.label}
        {link.external && <ExternalLink className="h-4 w-4" aria-hidden="true" />}
      </div>
    </div>
  </Link>
);

export default function MobileNavigation({ menu, ctas, enableSearch }: MobileNavigationProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Focus trap implementation
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key !== 'Tab') return;

    const focusableElements = containerRef.current?.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
    );

    if (!focusableElements || focusableElements.length === 0) return;

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    if (e.shiftKey && document.activeElement === firstElement) {
      e.preventDefault();
      lastElement.focus();
    } else if (!e.shiftKey && document.activeElement === lastElement) {
      e.preventDefault();
      firstElement.focus();
    }
  }, []);

  // Set up focus trap on mount
  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);

    // Focus first focusable element on mount
    const timer = setTimeout(() => {
      const focusableElements = containerRef.current?.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled])'
      );
      if (focusableElements && focusableElements.length > 0) {
        focusableElements[0].focus();
      }
    }, ANIMATION_DURATION.menuItemsDelay);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      clearTimeout(timer);
    };
  }, [handleKeyDown]);

  const containerVariants: Variants = {
    closed: {
      opacity: 0,
      y: '-100%',
      transition: {
        type: 'tween',
        ease: ANIMATION_EASING.mobileMenu,
        duration: ANIMATION_DURATION.mobileMenuSlide / 1000,
      },
    },
    open: {
      opacity: 1,
      y: 0,
      transition: {
        type: 'tween',
        ease: ANIMATION_EASING.mobileMenu,
        duration: ANIMATION_DURATION.mobileMenuSlide / 1000,
        delay: 0.1,
        staggerChildren: ANIMATION_DURATION.menuItemStagger / 1000,
        delayChildren: ANIMATION_DURATION.menuItemsDelay / 1000,
      },
    },
  };

  const itemVariants = {
    closed: { opacity: 0, y: -10 },
    open: {
      opacity: 1,
      y: 0,
      transition: { duration: ANIMATION_DURATION.menuItemAnimation / 1000 },
    },
  };

  return (
    <motion.div
      id="mobile-menu"
      ref={containerRef}
      initial="closed"
      animate="open"
      exit="closed"
      variants={containerVariants}
      className="absolute top-full left-0 z-40 flex h-[calc(100dvh-var(--header-height))] w-full flex-col overflow-hidden bg-background text-foreground lg:hidden"
      role="dialog"
      aria-modal="true"
      aria-label="Mobile navigation menu"
    >
      <nav className="flex-1 overflow-y-auto pb-safe" aria-label="Mobile navigation">
        <div className="mx-auto max-w-screen-xl px-4 py-6 space-y-8">
          <ul className="space-y-2">
            {menu?.items?.map((item, index: number) => {
              if (item._type === 'menuItem') {
                return (
                  <motion.li key={`mobile-${item.label}-${index}`} variants={itemVariants}>
                    <NavLink link={item} />
                  </motion.li>
                );
              }

              if (item._type === 'dropdownMenu') {
                return (
                  <motion.li key={`mobile-${item.title}-${index}`} variants={itemVariants}>
                    <Collapsible>
                      <CollapsibleTrigger
                        className="flex w-full items-center justify-between rounded-lg p-4 min-h-11 text-lg font-medium hover:bg-accent focus:outline-none focus:ring-2 focus:ring-primary transition-colors"
                        aria-label={`${item.title} submenu`}
                      >
                        <span className="font-medium">{item.title}</span>
                        <ChevronDown
                          className="h-5 w-5 transition-transform duration-200 [[data-state=open]>&]:rotate-180"
                          aria-hidden="true"
                        />
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <ul className="ml-4 mt-2 space-y-2 border-l-2 border-border pl-4">
                          {item.links?.map((link, linkIndex: number) => (
                            <li key={`mobile-${link.label}-${index}-${linkIndex}`}>
                              <NavLink link={link} />
                            </li>
                          ))}
                        </ul>
                      </CollapsibleContent>
                    </Collapsible>
                  </motion.li>
                );
              }
              return null;
            })}
          </ul>

          <motion.div variants={itemVariants} className="space-y-6 pt-6 border-t border-border">
            {enableSearch && (
              <div className="px-4">
                <CommandMenu variant="mobile" className="w-full justify-start" />
              </div>
            )}
            <CTAList ctas={ctas} className="grid gap-4 px-4 *:w-full *:text-lg *:py-6" />
          </motion.div>
        </div>
      </nav>
    </motion.div>
  );
}
