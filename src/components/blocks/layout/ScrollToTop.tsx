'use client';

import { ArrowUp } from 'lucide-react';
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useReducedMotion,
  useTransform,
} from 'motion/react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { cn } from '@/lib/utils/index';

// Constants
const SCROLL_THRESHOLD = 400;
const RING_RADIUS = 23;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;
const BASE_BOTTOM_OFFSET = 32; // 8 * 4 = 32px (bottom-8)

// Collision detection selectors for common overlapping elements
const COLLISION_SELECTORS = [
  '[data-footer-status]', // Footer system status
  '#cc-main .cm', // Cookie consent (vanilla-cookieconsent)
  '[data-chat-widget]', // Generic chat widget
  '.intercom-lightweight-app-launcher', // Intercom
  '#crisp-chatbox', // Crisp
  '#hubspot-messages-iframe-container', // HubSpot
  '.drift-widget-container', // Drift
];

// Spring animation configurations
const springConfig = {
  type: 'spring' as const,
  stiffness: 400,
  damping: 25,
  mass: 0.8,
};

const positionSpring = {
  type: 'spring' as const,
  stiffness: 300,
  damping: 30,
};

/**
 * Custom hook for detecting collisions with other fixed elements
 * and calculating the appropriate bottom offset
 */
function useCollisionDetection() {
  const [bottomOffset, setBottomOffset] = useState(BASE_BOTTOM_OFFSET);

  useEffect(() => {
    const checkCollisions = () => {
      let maxOffset = BASE_BOTTOM_OFFSET;

      for (const selector of COLLISION_SELECTORS) {
        const element = document.querySelector(selector);
        if (element) {
          const rect = element.getBoundingClientRect();
          const viewportHeight = window.innerHeight;
          const elementBottomFromViewport = viewportHeight - rect.top;

          // Add padding (16px) to avoid touching
          const neededOffset = Math.max(0, elementBottomFromViewport + 16);
          maxOffset = Math.max(maxOffset, neededOffset);
        }
      }

      setBottomOffset(maxOffset);
    };

    // Initial check
    checkCollisions();

    // Use MutationObserver for dynamic elements
    const observer = new MutationObserver(checkCollisions);
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['class', 'style'],
    });

    // Also check on resize
    window.addEventListener('resize', checkCollisions);

    return () => {
      observer.disconnect();
      window.removeEventListener('resize', checkCollisions);
    };
  }, []);

  return bottomOffset;
}

/**
 * Progress ring component that displays scroll progress
 */
function ProgressRing({
  progress,
  prefersReducedMotion,
}: {
  progress: ReturnType<typeof useMotionValue<number>>;
  prefersReducedMotion: boolean | null;
}) {
  const strokeDashoffset = useTransform(progress, [0, 1], [RING_CIRCUMFERENCE, 0]);

  return (
    <svg
      className="absolute inset-0 -rotate-90"
      width="52"
      height="52"
      viewBox="0 0 52 52"
      aria-hidden="true"
    >
      {/* Background track */}
      <circle
        cx="26"
        cy="26"
        r={RING_RADIUS}
        fill="none"
        strokeWidth="2.5"
        className="stroke-brand-vibrant/15 dark:stroke-white/10"
      />
      {/* Progress ring */}
      <motion.circle
        cx="26"
        cy="26"
        r={RING_RADIUS}
        fill="none"
        strokeWidth="2.5"
        strokeLinecap="round"
        className="stroke-brand-vibrant dark:stroke-white"
        style={{
          strokeDasharray: RING_CIRCUMFERENCE,
          strokeDashoffset: prefersReducedMotion ? 0 : strokeDashoffset,
        }}
      />
    </svg>
  );
}

/**
 * A modern "Back to Top" button with scroll progress indicator.
 * Features glassmorphism styling, spring animations, and collision avoidance.
 */
export default function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false);
  const scrollProgress = useMotionValue(0);
  const bottomOffset = useCollisionDetection();
  const prefersReducedMotion = useReducedMotion();

  // Scroll handler with requestAnimationFrame for performance
  useEffect(() => {
    let rafId: number;
    let ticking = false;

    const updateScrollProgress = () => {
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = scrollHeight > 0 ? Math.min(window.scrollY / scrollHeight, 1) : 0;

      scrollProgress.set(progress);
      setIsVisible(window.scrollY > SCROLL_THRESHOLD);

      ticking = false;
    };

    const onScroll = () => {
      if (!ticking) {
        rafId = requestAnimationFrame(updateScrollProgress);
        ticking = true;
      }
    };

    // Initial check
    updateScrollProgress();

    window.addEventListener('scroll', onScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', onScroll);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [scrollProgress]);

  const scrollToTop = useCallback(() => {
    window.scrollTo({
      top: 0,
      behavior: prefersReducedMotion ? 'auto' : 'smooth',
    });
  }, [prefersReducedMotion]);

  // Animation variants
  const variants = useMemo(
    () => ({
      hidden: {
        opacity: 0,
        scale: 0.6,
        y: 20,
      },
      visible: {
        opacity: 1,
        scale: 1,
        y: 0,
        transition: prefersReducedMotion ? { duration: 0 } : springConfig,
      },
      exit: {
        opacity: 0,
        scale: 0.8,
        y: 10,
        transition: { duration: prefersReducedMotion ? 0 : 0.2, ease: 'easeOut' as const },
      },
    }),
    [prefersReducedMotion]
  );

  return (
    <AnimatePresence mode="wait">
      {isVisible && (
        <motion.div
          className="fixed right-4 md:right-8 z-[60]"
          animate={{ bottom: bottomOffset }}
          transition={prefersReducedMotion ? { duration: 0 } : positionSpring}
        >
          <motion.button
            variants={variants}
            initial="hidden"
            animate="visible"
            exit="exit"
            whileHover={
              prefersReducedMotion
                ? undefined
                : { scale: 1.08, transition: { type: 'spring', stiffness: 500, damping: 30 } }
            }
            whileTap={
              prefersReducedMotion
                ? undefined
                : { scale: 0.92, transition: { type: 'spring', stiffness: 600, damping: 25 } }
            }
            onClick={scrollToTop}
            className={cn(
              // Size and layout
              'relative flex h-[52px] w-[52px] items-center justify-center rounded-full',
              // Glassmorphism
              'bg-white/70 backdrop-blur-md border border-white/30',
              'dark:bg-brand-900/60 dark:border-white/10',
              // Shadow
              'shadow-lg shadow-brand-vibrant/15 dark:shadow-brand-vibrant/25',
              // Icon color
              'text-brand-vibrant dark:text-white',
              // Hover state
              'hover:bg-white/85 dark:hover:bg-brand-800/70',
              'transition-colors duration-200',
              // Focus states
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-vibrant focus-visible:ring-offset-2'
            )}
            aria-label="Scroll to top of page"
          >
            <ProgressRing progress={scrollProgress} prefersReducedMotion={prefersReducedMotion} />
            <ArrowUp className="relative z-10 size-5" />
          </motion.button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
