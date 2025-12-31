'use client';

import { motion, type Variants } from 'motion/react';
import { useCallback, useEffect, useRef } from 'react';
import { DocsSidebarContent } from '@/components/blocks/docs/DocsSidebar';
import { ANIMATION_DURATION, ANIMATION_EASING } from './constants';

export default function MobileDocsNavigation({ closeMenu }: { closeMenu: () => void }) {
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
      },
    },
  };

  return (
    <motion.div
      id="mobile-docs-menu"
      ref={containerRef}
      initial="closed"
      animate="open"
      exit="closed"
      variants={containerVariants}
      className="absolute top-full left-0 z-40 flex h-[calc(100dvh-var(--header-height))] w-full flex-col overflow-hidden bg-background text-foreground lg:hidden"
      role="dialog"
      aria-modal="true"
      aria-label="Mobile documentation navigation menu"
    >
      <nav
        className="flex-1 overflow-y-auto pb-safe px-4 py-6"
        aria-label="Mobile documentation navigation"
      >
        <div className="mx-auto max-w-screen-xl">
          <DocsSidebarContent mobile onClick={closeMenu} />
        </div>
      </nav>
    </motion.div>
  );
}
