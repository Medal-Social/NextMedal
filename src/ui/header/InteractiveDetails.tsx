'use client';

import { cn } from '@/lib/utils';
import { usePathname } from 'next/navigation';
import { type ComponentProps, useEffect, useRef, useState } from 'react';
import { isMobile } from 'react-device-detect';
import css from './InteractiveDetails.module.css';

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

  const events = !isMobile
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
  const pathname = usePathname();
  useEffect(() => {
    if (closeAfterNavigate) setOpen(false);
  }, [pathname, closeAfterNavigate]);

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
