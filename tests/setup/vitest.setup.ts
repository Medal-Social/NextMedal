import '@testing-library/jest-dom/vitest';
import { expect, vi } from 'vitest';
import * as matchers from 'vitest-axe/matchers';

// Mock server-only package (throws error in client-side code)
vi.mock('server-only', () => ({}));

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
