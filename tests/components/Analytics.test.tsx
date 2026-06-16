import { render, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockEnv = vi.hoisted(() => ({
  NEXT_PUBLIC_APP_ENV: 'development',
  NEXT_PUBLIC_FARO_APP_ENVIRONMENT: undefined as string | undefined,
  NEXT_PUBLIC_FARO_APP_NAME: undefined as string | undefined,
  NEXT_PUBLIC_FARO_APP_VERSION: undefined as string | undefined,
  NEXT_PUBLIC_FARO_URL: undefined as string | undefined,
  VERCEL_ENV: 'development',
}));

const faroSdk = vi.hoisted(() => ({
  getWebInstrumentations: vi.fn(() => ['web-instrumentation']),
  initializeFaro: vi.fn(),
}));

const tracing = vi.hoisted(() => {
  const instrumentation = { name: 'tracing-instrumentation' };
  return {
    instrumentation,
    TracingInstrumentation: vi.fn(function TracingInstrumentation() {
      return instrumentation;
    }),
  };
});

vi.mock('@/lib/core/env.client', () => ({
  env: mockEnv,
}));

vi.mock('@grafana/faro-web-sdk', () => faroSdk);
vi.mock('@grafana/faro-web-tracing', () => tracing);

import { Analytics } from '@/components/Analytics';

describe('Analytics', () => {
  beforeEach(() => {
    mockEnv.NEXT_PUBLIC_APP_ENV = 'development';
    mockEnv.NEXT_PUBLIC_FARO_APP_ENVIRONMENT = undefined;
    mockEnv.NEXT_PUBLIC_FARO_APP_NAME = undefined;
    mockEnv.NEXT_PUBLIC_FARO_APP_VERSION = undefined;
    mockEnv.NEXT_PUBLIC_FARO_URL = undefined;
    mockEnv.VERCEL_ENV = 'development';
    vi.clearAllMocks();
  });

  it('returns null and does not initialize Faro in development', () => {
    const { container } = render(<Analytics />);

    expect(container.firstChild).toBeNull();
    expect(faroSdk.initializeFaro).not.toHaveBeenCalled();
  });

  it('initializes Faro in production when the collector URL is configured', async () => {
    mockEnv.VERCEL_ENV = 'production';
    mockEnv.NEXT_PUBLIC_FARO_APP_ENVIRONMENT = 'production';
    mockEnv.NEXT_PUBLIC_FARO_APP_NAME = 'Medal Social Site';
    mockEnv.NEXT_PUBLIC_FARO_APP_VERSION = '2026.06.16';
    mockEnv.NEXT_PUBLIC_FARO_URL = 'https://collector.example.com/collect/site-token';

    const { container } = render(<Analytics />);

    expect(container.firstChild).toBeNull();
    await waitFor(() => {
      expect(faroSdk.initializeFaro).toHaveBeenCalledWith({
        app: {
          environment: 'production',
          name: 'Medal Social Site',
          version: '2026.06.16',
        },
        instrumentations: ['web-instrumentation', tracing.instrumentation],
        url: 'https://collector.example.com/collect/site-token',
      });
    });
  });

  it('also initializes when NEXT_PUBLIC_APP_ENV is production', async () => {
    mockEnv.NEXT_PUBLIC_APP_ENV = 'production';
    mockEnv.NEXT_PUBLIC_FARO_URL = 'https://collector.example.com/collect/site-token';

    render(<Analytics />);

    await waitFor(() => {
      expect(faroSdk.initializeFaro).toHaveBeenCalled();
    });
  });

  it('does not initialize Faro in production without a collector URL', () => {
    mockEnv.VERCEL_ENV = 'production';

    render(<Analytics />);

    expect(faroSdk.initializeFaro).not.toHaveBeenCalled();
  });
});
