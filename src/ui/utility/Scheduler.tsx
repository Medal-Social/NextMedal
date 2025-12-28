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

  const [isActive, setIsActive] = useState(checkActive());

  useEffect(() => {
    // Set initial state
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

  if (!start && !end) return children;

  if (!isActive) return null;

  return children;
}
