'use client';

import { cn } from '@/lib/utils';
import { usePathname } from 'next/navigation';
import { type ComponentProps, useEffect, useState } from 'react';
import { isMobile } from 'react-device-detect';
import css from './InteractiveDetails.module.css';

/**
 * @param safeAreaOnHover - Adds a safe area around the details element to prevent it from closing when the mouse leaves the element
 * @param closeAfterNavigate - Closes the details element after a navigation event
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
  let timeout: NodeJS.Timeout;

  const events = !isMobile
    ? {
        onMouseEnter: () => {
          if (delay) {
            timeout = setTimeout(() => setOpen(true), delay);
          } else {
            setOpen(true);
          }
        },
        onMouseLeave: () => {
          if (delay) clearTimeout(timeout);
          setOpen(false);
        },
      }
    : {};

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
