'use client';

import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useMemo, useTransition } from 'react';
import { VscBeakerStop } from 'react-icons/vsc';
import { cn } from '@/lib/utils';

// Spring animation configuration (matching ScrollToTop)
const springConfig = {
  type: 'spring' as const,
  stiffness: 400,
  damping: 25,
  mass: 0.8,
};

export default function DraftModeControls() {
  const pathname = usePathname();
  const [pending, startTransition] = useTransition();
  const prefersReducedMotion = useReducedMotion();

  const disable = () =>
    startTransition(() => {
      window.location.href = `/api/draft-mode/disable?slug=${pathname}`;
    });

  // Animation variants
  const variants = useMemo(
    () => ({
      hidden: {
        opacity: 0,
        scale: 0.6,
        x: -20,
      },
      visible: {
        opacity: 1,
        scale: 1,
        x: 0,
        transition: prefersReducedMotion ? { duration: 0 } : springConfig,
      },
      exit: {
        opacity: 0,
        scale: 0.8,
        x: -10,
        transition: { duration: prefersReducedMotion ? 0 : 0.2, ease: 'easeOut' as const },
      },
    }),
    [prefersReducedMotion]
  );

  return (
    <AnimatePresence mode="wait">
      <motion.div className="fixed left-4 bottom-4 z-[60]">
        <motion.button
          type="button"
          variants={variants}
          initial="hidden"
          animate="visible"
          exit="exit"
          whileHover={
            prefersReducedMotion
              ? undefined
              : { scale: 1.03, transition: { type: 'spring', stiffness: 500, damping: 30 } }
          }
          whileTap={
            prefersReducedMotion
              ? undefined
              : { scale: 0.97, transition: { type: 'spring', stiffness: 600, damping: 25 } }
          }
          onClick={disable}
          disabled={pending}
          className={cn(
            // Layout
            'flex items-center gap-2.5 px-4 py-2.5 rounded-full',
            // Glassmorphism
            'bg-white/70 backdrop-blur-md border border-white/30',
            'dark:bg-brand-900/60 dark:border-white/10',
            // Shadow
            'shadow-lg shadow-brand-vibrant/15 dark:shadow-brand-vibrant/25',
            // Typography
            'text-sm font-medium',
            'text-brand-vibrant dark:text-white',
            // Hover state
            'hover:bg-white/85 dark:hover:bg-brand-800/70',
            'transition-colors duration-200',
            // Focus states
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-vibrant focus-visible:ring-offset-2',
            // Disabled state
            'disabled:opacity-70 disabled:cursor-not-allowed'
          )}
          aria-label={pending ? 'Disabling draft mode...' : 'Exit draft mode'}
        >
          {pending ? (
            <Loader2 className="size-4 shrink-0 animate-spin" />
          ) : (
            <VscBeakerStop className="size-4 shrink-0" />
          )}
          <span>Draft Mode</span>
          <span
            className={cn(
              'text-xs px-2 py-0.5 rounded-full',
              'bg-brand-vibrant/10 dark:bg-white/10',
              'text-brand-vibrant dark:text-white/90'
            )}
          >
            {pending ? 'Exiting...' : 'Exit'}
          </span>
        </motion.button>
      </motion.div>
    </AnimatePresence>
  );
}
