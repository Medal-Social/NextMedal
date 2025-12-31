'use client';

import { useTranslations } from 'next-intl';
import { useCallback } from 'react';
import { cn } from '@/lib/utils/index';

/**
 * Modern skip-to-content link with slide-down animation.
 * Slides in from the top when focused for keyboard navigation.
 * Uses CSS transitions for better performance.
 */
export default function SkipToContent() {
  const t = useTranslations('Accessibility');

  const handleClick = useCallback(() => {
    // After native anchor navigation, ensure main content receives focus
    // Use setTimeout to run after the browser's native scroll
    setTimeout(() => {
      const mainContent = document.getElementById('main-content');
      if (mainContent) {
        mainContent.focus();
      }
    }, 0);
  }, []);

  return (
    // biome-ignore lint/a11y/useValidAnchor: Skip links with href="#id" are valid page navigation
    <a
      href="#main-content"
      onClick={handleClick}
      className={cn(
        // Position centered at top of viewport - hidden by default
        'fixed top-4 left-1/2 -translate-x-1/2 z-[100]',
        // Start off-screen
        '-translate-y-24 opacity-0',
        // CSS transition with spring-like easing
        'transition-all duration-300 ease-out',
        'motion-reduce:transition-none',
        // Show on focus
        'focus:translate-y-0 focus:opacity-100',
        // Sizing and padding
        'px-6 py-3',
        // Pill shape
        'rounded-full',
        // Glassmorphism with brand color
        'bg-brand-600/95 backdrop-blur-sm',
        // Typography
        'text-white font-semibold text-sm',
        // Subtle border for depth
        'ring-1 ring-white/20',
        // Shadow with brand color tint
        'shadow-lg shadow-brand-600/30',
        // Focus states
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-brand-600'
      )}
    >
      {t('skipToContent')}
    </a>
  );
}
