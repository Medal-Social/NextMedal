'use client';

import dynamic from 'next/dynamic';

/**
 * Lazy-loaded DraftModeControls component.
 * Loads only after the page is interactive to avoid hydration issues with portal.
 */
const DraftModeControls = dynamic(() => import('./DraftModeControls'), {
  ssr: false,
  loading: () => null,
});

export default DraftModeControls;
