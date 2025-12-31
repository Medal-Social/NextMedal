import { Suspense } from 'react';
import Header from '@/components/blocks/layout/header';
import Banner from './banner/Banner';

/**
 * Combined site header that includes both Banner and Header.
 * They are wrapped in a fixed container so they stack naturally
 * without needing to coordinate CSS variables for positioning.
 *
 * z-index hierarchy:
 * - SiteHeader container: z-50
 * - Mobile navigation (inside Header): z-40 (appears below header)
 * - Toggle button: z-[101] (always clickable)
 */
export default function SiteHeader() {
  return (
    <div className="fixed top-0 left-0 right-0 z-50 flex flex-col">
      <Suspense fallback={null}>
        <Banner />
      </Suspense>
      <Suspense fallback={null}>
        <Header />
      </Suspense>
    </div>
  );
}
