'use client';

import { type ComponentProps, useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import css from './InteractiveDetails.module.css';

const DESKTOP_BREAKPOINT = '(min-width: 1024px)'; // tailwind's lg breakpoint

function useMediaQuery(query: string, defaultValue = false) {
  const [matches, setMatches] = useState(defaultValue);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia(query);

    const handler = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };

    setMatches(mediaQuery.matches);
    mediaQuery.addEventListener('change', handler);

    return () => mediaQuery.removeEventListener('change', handler);
  }, [query]);

  return matches;
}

/**
 * @param safeAreaOnHover - Adds a safe area around the details element to prevent it from closing when the mouse leaves the element
 * @param closeAfterNavigate - Closes the details element after a navigation event
 * @param delay - Delay in ms before opening on hover
 */
export default function InteractiveDetails({
  safeAreaOnHover,
  closeAfterNavigate,
  delay,
  className,
  ...props
}: {
  safeAreaOnHover?: boolean;
  closeAfterNavigate?: boolean;
  delay?: number;
} & ComponentProps<'details'>) {
  const [open, setOpen] = useState(false);
  const timeout = useRef<NodeJS.Timeout | null>(null);
  const isDesktop = useMediaQuery(DESKTOP_BREAKPOINT);

  const events = isDesktop
    ? {
        onMouseEnter: () => {
          if (delay) {
            timeout.current = setTimeout(() => setOpen(true), delay);
          } else {
            setOpen(true);
          }
        },
        onMouseLeave: () => {
          if (delay && timeout.current) clearTimeout(timeout.current);
          setOpen(false);
        },
      }
    : {};

  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      if (timeout.current) clearTimeout(timeout.current);
    };
  }, []);

  // Close after navigation
  useEffect(() => {
    if (closeAfterNavigate) setOpen(false);
  }, [closeAfterNavigate]);

  return (
    <details
      className={cn(safeAreaOnHover && css.safearea, className)}
      open={open}
      key={String(open)}
      {...events}
      {...props}
    />
  );
}
