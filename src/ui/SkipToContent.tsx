'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { useState } from 'react';
import { cn } from '@/lib/utils';

// Spring animation config matching codebase conventions
const springConfig = {
  type: 'spring' as const,
  stiffness: 400,
  damping: 30,
  mass: 0.8,
};

/**
 * Modern skip-to-content link with slide-down animation.
 * Slides in from the top when focused for keyboard navigation.
 * Respects user's motion preferences for accessibility.
 */
export default function SkipToContent() {
  const [isFocused, setIsFocused] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.a
      href="#main-content"
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
      initial={false}
      animate={{
        y: isFocused ? 0 : -100,
        opacity: isFocused ? 1 : 0,
      }}
      transition={prefersReducedMotion ? { duration: 0 } : springConfig}
      className={cn(
        // Position centered at top of viewport
        'fixed top-4 left-1/2 -translate-x-1/2 z-[100]',
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
      Skip to content
    </motion.a>
  );
}
