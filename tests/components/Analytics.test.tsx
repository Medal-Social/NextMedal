import { render } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// Use vi.hoisted to define mock values before hoisting
const mockEnv = vi.hoisted(() => ({
  VERCEL_ENV: 'development',
  NEXT_PUBLIC_APP_ENV: 'development',
  NEXT_PUBLIC_UMAMI_SCRIPT_URL: undefined as string | undefined,
  NEXT_PUBLIC_UMAMI_WEBSITE_ID: undefined as string | undefined,
}));

// Mock next/script
vi.mock('next/script', () => ({
  default: ({ src, ...props }: { src: string }) => (
    <script data-testid="analytics-script" src={src} {...props} />
  ),
}));

// Mock env module
vi.mock('@/lib/core/env.client', () => ({
  env: mockEnv,
}));

import { Analytics } from '@/components/Analytics';

describe('Analytics', () => {
  beforeEach(() => {
    // Reset mock env values
    mockEnv.VERCEL_ENV = 'development';
    mockEnv.NEXT_PUBLIC_APP_ENV = 'development';
    mockEnv.NEXT_PUBLIC_UMAMI_SCRIPT_URL = undefined;
    mockEnv.NEXT_PUBLIC_UMAMI_WEBSITE_ID = undefined;
  });

  it('returns null in development environment', () => {
    mockEnv.VERCEL_ENV = 'development';

    const { container } = render(<Analytics />);
    expect(container.firstChild).toBeNull();
  });

  it('returns null when UMAMI_SCRIPT_URL is not set', () => {
    mockEnv.VERCEL_ENV = 'production';
    mockEnv.NEXT_PUBLIC_UMAMI_SCRIPT_URL = undefined;

    const { container } = render(<Analytics />);
    expect(container.firstChild).toBeNull();
  });

  it('returns null when UMAMI_WEBSITE_ID is not set', () => {
    mockEnv.VERCEL_ENV = 'production';
    mockEnv.NEXT_PUBLIC_UMAMI_SCRIPT_URL = 'https://analytics.example.com/script.js';
    mockEnv.NEXT_PUBLIC_UMAMI_WEBSITE_ID = undefined;

    const { container } = render(<Analytics />);
    expect(container.firstChild).toBeNull();
  });

  it('renders script in production with all env vars set', () => {
    mockEnv.VERCEL_ENV = 'production';
    mockEnv.NEXT_PUBLIC_UMAMI_SCRIPT_URL = 'https://analytics.example.com/script.js';
    mockEnv.NEXT_PUBLIC_UMAMI_WEBSITE_ID = 'website-123';

    const { getByTestId } = render(<Analytics />);
    const script = getByTestId('analytics-script');

    expect(script).toBeInTheDocument();
    expect(script).toHaveAttribute('src', 'https://analytics.example.com/script.js');
    expect(script).toHaveAttribute('data-website-id', 'website-123');
  });

  it('renders script when NEXT_PUBLIC_APP_ENV is production', () => {
    mockEnv.VERCEL_ENV = 'development';
    mockEnv.NEXT_PUBLIC_APP_ENV = 'production';
    mockEnv.NEXT_PUBLIC_UMAMI_SCRIPT_URL = 'https://analytics.example.com/script.js';
    mockEnv.NEXT_PUBLIC_UMAMI_WEBSITE_ID = 'website-123';

    const { getByTestId } = render(<Analytics />);
    const script = getByTestId('analytics-script');

    expect(script).toBeInTheDocument();
  });

  it('has defer attribute', () => {
    mockEnv.VERCEL_ENV = 'production';
    mockEnv.NEXT_PUBLIC_UMAMI_SCRIPT_URL = 'https://analytics.example.com/script.js';
    mockEnv.NEXT_PUBLIC_UMAMI_WEBSITE_ID = 'website-123';

    const { getByTestId } = render(<Analytics />);
    const script = getByTestId('analytics-script');

    expect(script).toHaveAttribute('defer');
  });

  it('uses afterInteractive strategy', () => {
    mockEnv.VERCEL_ENV = 'production';
    mockEnv.NEXT_PUBLIC_UMAMI_SCRIPT_URL = 'https://analytics.example.com/script.js';
    mockEnv.NEXT_PUBLIC_UMAMI_WEBSITE_ID = 'website-123';

    const { getByTestId } = render(<Analytics />);
    const script = getByTestId('analytics-script');

    expect(script).toHaveAttribute('strategy', 'afterInteractive');
  });
});
