import '@testing-library/jest-dom/vitest';
import type { RenderOptions, RenderResult } from '@testing-library/react';
import { render } from '@testing-library/react';
import type { ReactElement, ReactNode } from 'react';
import { expect } from 'vitest';
import * as matchers from 'vitest-axe/matchers';

// Extend Vitest's expect with axe matchers for accessibility testing
expect.extend(matchers);

// Extend Vitest's expect types for TypeScript
declare module 'vitest' {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  interface Assertion<T = any> {
    toHaveNoViolations(): T;
  }
  interface AsymmetricMatchersContaining {
    toHaveNoViolations(): void;
  }
}

/**
 * Custom render function that wraps components with necessary providers.
 * Use this instead of the default render from @testing-library/react
 * when testing components that require context providers.
 */
export function renderWithProviders(
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
): RenderResult {
  function Wrapper({ children }: { children: ReactNode }) {
    // Add providers here as needed (e.g., ThemeProvider, IntlProvider)
    return <>{children}</>;
  }

  return render(ui, { wrapper: Wrapper, ...options });
}

// Re-export everything from @testing-library/react for convenience
export * from '@testing-library/react';
export { default as userEvent } from '@testing-library/user-event';
export { axe } from 'vitest-axe';
