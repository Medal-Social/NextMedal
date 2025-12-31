'use client';

import Script from 'next/script';
import { env } from '@/lib/core/env.client';

export function Analytics() {
  const isProduction = env.VERCEL_ENV === 'production' || env.NEXT_PUBLIC_APP_ENV === 'production';

  if (!isProduction || !env.NEXT_PUBLIC_UMAMI_SCRIPT_URL || !env.NEXT_PUBLIC_UMAMI_WEBSITE_ID) {
    return null;
  }

  return (
    <Script
      defer
      src={env.NEXT_PUBLIC_UMAMI_SCRIPT_URL}
      data-website-id={env.NEXT_PUBLIC_UMAMI_WEBSITE_ID}
      strategy="afterInteractive"
    />
  );
}
