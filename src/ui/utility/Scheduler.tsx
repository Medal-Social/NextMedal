'use client';

import { useCallback, useEffect, useState } from 'react';

export default function Scheduler({
  start,
  end,
  children,
}: Partial<{
  start: string;
  end: string;
  children: React.ReactNode;
}>) {
  const checkActive = useCallback(() => {
    const now = new Date();
    return (!start || new Date(start) < now) && (!end || new Date(end) > now);
  }, [start, end]);

  // Initialize to null to defer time check to client side (avoids SSR/hydration mismatch)
  const [isActive, setIsActive] = useState<boolean | null>(null);

  useEffect(() => {
    // Set initial state on client
    setIsActive(checkActive());

    // Poll every second using setInterval - no event listener accumulation
    const intervalId = setInterval(() => {
      setIsActive(checkActive());
    }, 1000);

    // Clean up on unmount
    return () => {
      clearInterval(intervalId);
    };
  }, [checkActive]);

  // No scheduling constraints - always show
  if (!start && !end) return children;

  // Still hydrating or inactive - don't render
  if (isActive !== true) return null;

  return children;
}
