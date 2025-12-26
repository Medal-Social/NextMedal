import * as React from 'react';

const MOBILE_BREAKPOINT = 768;

/**
 * Hook to detect if the viewport is mobile-sized.
 *
 * Returns `undefined` during SSR and initial hydration to prevent hydration
 * mismatch, then returns the actual boolean value after the effect runs.
 *
 * Components using this hook should handle the `undefined` state to avoid
 * flash of incorrect content.
 */
export function useIsMobile(): boolean | undefined {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined);

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    };
    mql.addEventListener('change', onChange);
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    return () => mql.removeEventListener('change', onChange);
  }, []);

  return isMobile;
}
