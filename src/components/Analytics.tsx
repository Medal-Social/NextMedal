'use client';

import { getWebInstrumentations, initializeFaro } from '@grafana/faro-web-sdk';
import { TracingInstrumentation } from '@grafana/faro-web-tracing';
import { useEffect, useRef } from 'react';
import { env } from '@/lib/core/env.client';

export function Analytics() {
  const initializedRef = useRef(false);
  const isProduction = env.VERCEL_ENV === 'production' || env.NEXT_PUBLIC_APP_ENV === 'production';

  useEffect(() => {
    if (!isProduction || initializedRef.current || !env.NEXT_PUBLIC_FARO_URL) return;

    initializedRef.current = true;
    initializeFaro({
      app: {
        environment:
          env.NEXT_PUBLIC_FARO_APP_ENVIRONMENT ||
          env.NEXT_PUBLIC_APP_ENV ||
          env.VERCEL_ENV ||
          env.NODE_ENV,
        name: env.NEXT_PUBLIC_FARO_APP_NAME || 'Medal Social Site',
        version: env.NEXT_PUBLIC_FARO_APP_VERSION,
      },
      instrumentations: [...getWebInstrumentations(), new TracingInstrumentation()],
      url: env.NEXT_PUBLIC_FARO_URL,
    });
  }, [isProduction]);

  return null;
}
