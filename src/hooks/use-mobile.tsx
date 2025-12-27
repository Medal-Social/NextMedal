import * as React from 'react';

const MOBILE_BREAKPOINT = 768; // Matches Tailwind v4 default `md` breakpoint

/**
 * Hook to detect if the viewport is mobile-sized.
 * Returns false during SSR (assumes desktop), then syncs with actual viewport.
 */
export function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
    setIsMobile(mql.matches);

    const onChange = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mql.addEventListener('change', onChange);
    return () => mql.removeEventListener('change', onChange);
  }, []);

  return isMobile;
}
