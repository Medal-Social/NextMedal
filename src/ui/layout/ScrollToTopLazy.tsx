'use client';

import dynamic from 'next/dynamic';

/**
 * Lazy-loaded ScrollToTop component.
 * Loads only after the page is interactive, reducing initial bundle size.
 * The heavy framer-motion dependencies are deferred until needed.
 */
const ScrollToTop = dynamic(() => import('./ScrollToTop'), {
  ssr: false,
  loading: () => null,
});

export default ScrollToTop;
