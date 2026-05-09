import '@testing-library/jest-dom/vitest';
import { expect, vi } from 'vitest';
import * as matchers from 'vitest-axe/matchers';

// Mock server-only package (throws error in client-side code)
vi.mock('server-only', () => ({}));

// Mock @/i18n/navigation so component tests don't need to wrap render() in
// <NextIntlClientProvider>. Without this, every Link/usePathname/useRouter
// call from `next-intl/navigation` throws "No intl context found" in jsdom.
// Tests that need locale-aware behavior can `vi.unmock('@/i18n/navigation')`.
vi.mock('@/i18n/navigation', async () => {
  const React = await import('react');
  return {
    Link: React.forwardRef<HTMLAnchorElement, React.ComponentProps<'a'> & { href: string }>(
      ({ href, children, ...props }, ref) =>
        React.createElement('a', { href, ref, ...props }, children)
    ),
    redirect: vi.fn(),
    usePathname: () => '/',
    useRouter: () => ({
      push: vi.fn(),
      replace: vi.fn(),
      back: vi.fn(),
      forward: vi.fn(),
      refresh: vi.fn(),
      prefetch: vi.fn(),
    }),
    getPathname: ({ href }: { href: string | { pathname: string } }) =>
      typeof href === 'string' ? href : href.pathname,
    buildLocaleHref: (path: string, _locale: string) => path,
  };
});

// Extend Vitest's expect with axe matchers for accessibility testing
expect.extend(matchers);

// Extend Vitest's expect types for TypeScript
declare module 'vitest' {
  // biome-ignore lint/suspicious/noExplicitAny: Required by vitest-axe matcher types
  interface Assertion<T = any> {
    toHaveNoViolations(): T;
  }
  interface AsymmetricMatchersContaining {
    toHaveNoViolations(): void;
  }
}

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  observe() {
    // noop - mock implementation
  }
  unobserve() {
    // noop - mock implementation
  }
  disconnect() {
    // noop - mock implementation
  }
};

// Mock PointerEvent
if (!global.PointerEvent) {
  class PointerEvent extends Event {
    button: number;
    ctrlKey: boolean;
    metaKey: boolean;
    shiftKey: boolean;
    view: Window;

    constructor(type: string, props: PointerEventInit = {}) {
      super(type, props);
      this.button = props.button || 0;
      this.ctrlKey = props.ctrlKey || false;
      this.metaKey = props.metaKey || false;
      this.shiftKey = props.shiftKey || false;
      this.view = window;
    }
  }
  // @ts-expect-error - PointerEvent is not defined in the global scope
  global.PointerEvent = PointerEvent;
}

// Mock scrollIntoView and pointer capture methods
window.HTMLElement.prototype.scrollIntoView = () => {
  // noop - mock implementation
};
window.HTMLElement.prototype.hasPointerCapture = () => false;
window.HTMLElement.prototype.setPointerCapture = () => {
  // noop - mock implementation
};
window.HTMLElement.prototype.releasePointerCapture = () => {
  // noop - mock implementation
};
