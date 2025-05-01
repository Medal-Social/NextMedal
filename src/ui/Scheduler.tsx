'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

export default function Scheduler({
  start,
  end,
  children,
}: Partial<{
  start: string;
  end: string;
  children: React.ReactNode;
}>) {
  if (!start && !end) return children;

  const checkActive = useCallback(() => {
    const now = new Date();
    return (!start || new Date(start) < now) && (!end || new Date(end) > now);
  }, [start, end]);

  const [isActive, setIsActive] = useState(checkActive());
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    // Initialize AbortController to handle cleanup
    abortControllerRef.current = new AbortController();
    const { signal } = abortControllerRef.current;

    // Create a polling loop using promises instead of setInterval
    const pollSchedule = async () => {
      // Set initial state
      setIsActive(checkActive());

      try {
        // Continue polling until signal is aborted
        while (!signal.aborted) {
          // Wait one second using a promise
          await new Promise<void>((resolve) => {
            const timeoutId = setTimeout(() => resolve(), 1000);

            // Add event listener to abort the timeout if needed
            signal.addEventListener(
              'abort',
              () => {
                clearTimeout(timeoutId);
                // Reject is not needed as we check signal.aborted
              },
              { once: true }
            );
          });

          // Check schedule if not aborted
          if (!signal.aborted) {
            setIsActive(checkActive());
          }
        }
      } catch (error) {
        // Handle any errors (usually just aborted signal)
        console.error('Scheduler error:', error);
      }
    };

    // Start polling
    pollSchedule();

    // Clean up on unmount
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [checkActive]);

  if (!isActive) return null;

  return children;
}
