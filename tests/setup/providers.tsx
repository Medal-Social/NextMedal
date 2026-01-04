import type { RenderOptions, RenderResult } from '@testing-library/react';
import { render } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import type { ReactElement, ReactNode } from 'react';

// Mock messages for testing
const messages = {
  common: {
    readMore: 'Read more',
    loading: 'Loading...',
  },
};

/**
 * Custom render function that wraps components with necessary providers.
 * Use this instead of the default render from @testing-library/react
 * when testing components that require context providers.
 */
export function renderWithProviders(
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'> & { locale?: string }
): RenderResult {
  const { locale = 'en', ...renderOptions } = options || {};

  function Wrapper({ children }: { children: ReactNode }) {
    return (
      <NextIntlClientProvider locale={locale} messages={messages}>
        {children}
      </NextIntlClientProvider>
    );
  }

  return render(ui, { wrapper: Wrapper, ...renderOptions });
}

// Re-export everything from @testing-library/react for convenience
export * from '@testing-library/react';
export { default as userEvent } from '@testing-library/user-event';
export { axe } from 'vitest-axe';
