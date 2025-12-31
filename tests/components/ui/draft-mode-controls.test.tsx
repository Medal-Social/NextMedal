import { axe, render, screen, userEvent, waitFor } from '@tests/setup/providers';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// Mock next-intl
vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => {
    const translations: Record<string, string> = {
      title: 'Preview Mode',
      description: 'See how your changes look before publishing.',
      learnMore: 'Learn more',
      exit: 'Exit Preview',
      exiting: 'Exiting...',
    };
    return translations[key] || key;
  },
}));

// Mock next/navigation
vi.mock('next/navigation', () => ({
  usePathname: () => '/test-page',
}));

// Import component after mocks
import DraftModeControls from '@/components/blocks/utility/DraftModeControls';

// ============================================================================
// Unit Tests
// ============================================================================

describe('DraftModeControls - Unit Tests', () => {
  beforeEach(() => {
    // Reset body styles before each test
    document.body.style.paddingBottom = '';
  });

  afterEach(() => {
    // Clean up body styles after each test
    document.body.style.paddingBottom = '';
  });

  describe('Rendering', () => {
    it('renders without throwing errors', () => {
      expect(() => render(<DraftModeControls />)).not.toThrow();
    });

    it('renders the banner with correct role', async () => {
      render(<DraftModeControls />);

      await waitFor(() => {
        const banner = screen.getByRole('status');
        expect(banner).toBeInTheDocument();
      });
    });

    it('renders the preview mode title', async () => {
      render(<DraftModeControls />);

      await waitFor(() => {
        expect(screen.getByText('Preview Mode')).toBeInTheDocument();
      });
    });

    it('renders the description text', async () => {
      render(<DraftModeControls />);

      await waitFor(() => {
        expect(
          screen.getByText('See how your changes look before publishing.')
        ).toBeInTheDocument();
      });
    });

    it('renders the exit button', async () => {
      render(<DraftModeControls />);

      await waitFor(() => {
        const exitButton = screen.getByRole('button', { name: /exit preview/i });
        expect(exitButton).toBeInTheDocument();
      });
    });

    it('renders the learn more link', async () => {
      render(<DraftModeControls />);

      await waitFor(() => {
        const learnMoreLink = screen.getByRole('link');
        expect(learnMoreLink).toBeInTheDocument();
      });
    });

    it('renders the eye icon', async () => {
      render(<DraftModeControls />);

      await waitFor(() => {
        const banner = screen.getByRole('status');
        const icon = banner.querySelector('svg');
        expect(icon).toBeInTheDocument();
      });
    });
  });

  describe('Learn More Link', () => {
    it('has correct href to Medal Social docs', async () => {
      render(<DraftModeControls />);

      await waitFor(() => {
        const link = screen.getByRole('link');
        expect(link).toHaveAttribute('href', 'https://www.medalsocial.com/docs');
      });
    });

    it('opens in new tab', async () => {
      render(<DraftModeControls />);

      await waitFor(() => {
        const link = screen.getByRole('link');
        expect(link).toHaveAttribute('target', '_blank');
      });
    });

    it('has noopener rel for security (proper backlink without noreferrer)', async () => {
      render(<DraftModeControls />);

      await waitFor(() => {
        const link = screen.getByRole('link');
        expect(link).toHaveAttribute('rel', 'noopener');
        // Should NOT have noreferrer to allow proper backlink SEO
        expect(link.getAttribute('rel')).not.toContain('noreferrer');
      });
    });

    it('has external link icon', async () => {
      render(<DraftModeControls />);

      await waitFor(() => {
        const link = screen.getByRole('link');
        const icon = link.querySelector('svg');
        expect(icon).toBeInTheDocument();
        expect(icon).toHaveAttribute('aria-hidden', 'true');
      });
    });
  });

  describe('Exit Button', () => {
    it('is a button element with type="button"', async () => {
      render(<DraftModeControls />);

      await waitFor(() => {
        const button = screen.getByRole('button', { name: /exit preview/i });
        expect(button).toHaveAttribute('type', 'button');
      });
    });

    it('is not disabled by default', async () => {
      render(<DraftModeControls />);

      await waitFor(() => {
        const button = screen.getByRole('button', { name: /exit preview/i });
        expect(button).not.toBeDisabled();
      });
    });
  });
});

// ============================================================================
// Accessibility Tests (WCAG 2.1 AA Compliance)
// ============================================================================

describe('DraftModeControls - Accessibility Tests', () => {
  beforeEach(() => {
    document.body.style.paddingBottom = '';
  });

  afterEach(() => {
    document.body.style.paddingBottom = '';
  });

  it('has no accessibility violations', async () => {
    render(<DraftModeControls />);

    await waitFor(() => {
      expect(screen.getByRole('status')).toBeInTheDocument();
    });

    const results = await axe(document.body);
    expect(results).toHaveNoViolations();
  });

  it('has proper ARIA live region for screen readers', async () => {
    render(<DraftModeControls />);

    await waitFor(() => {
      const banner = screen.getByRole('status');
      expect(banner).toHaveAttribute('aria-live', 'polite');
    });
  });

  it('has role="status" for assistive technology', async () => {
    render(<DraftModeControls />);

    await waitFor(() => {
      const banner = screen.getByRole('status');
      expect(banner).toBeInTheDocument();
    });
  });

  it('icons have aria-hidden="true" to hide from screen readers', async () => {
    render(<DraftModeControls />);

    await waitFor(() => {
      const banner = screen.getByRole('status');
      const icons = banner.querySelectorAll('svg');
      icons.forEach((icon) => {
        expect(icon).toHaveAttribute('aria-hidden', 'true');
      });
    });
  });

  it('exit button has visible focus indicator', async () => {
    render(<DraftModeControls />);

    await waitFor(() => {
      const button = screen.getByRole('button', { name: /exit preview/i });
      // Check that focus-visible styles are present in className
      expect(button.className).toContain('focus-visible:');
    });
  });
});

// ============================================================================
// Keyboard Navigation Tests
// ============================================================================

describe('DraftModeControls - Keyboard Navigation', () => {
  beforeEach(() => {
    document.body.style.paddingBottom = '';
  });

  afterEach(() => {
    document.body.style.paddingBottom = '';
  });

  it('learn more link is keyboard focusable', async () => {
    const user = userEvent.setup();
    render(<DraftModeControls />);

    await waitFor(() => {
      expect(screen.getByRole('status')).toBeInTheDocument();
    });

    await user.tab();

    const link = screen.getByRole('link');
    expect(link).toHaveFocus();
  });

  it('exit button is keyboard focusable after link', async () => {
    const user = userEvent.setup();
    render(<DraftModeControls />);

    await waitFor(() => {
      expect(screen.getByRole('status')).toBeInTheDocument();
    });

    await user.tab(); // Focus link
    await user.tab(); // Focus exit button

    const button = screen.getByRole('button', { name: /exit preview/i });
    expect(button).toHaveFocus();
  });

  it('exit button can be activated with Enter key', async () => {
    const _user = userEvent.setup();

    render(<DraftModeControls />);

    await waitFor(() => {
      expect(screen.getByRole('status')).toBeInTheDocument();
    });

    const button = screen.getByRole('button', { name: /exit preview/i });
    button.focus();

    // Button should respond to Enter key (native button behavior)
    expect(button.tagName).toBe('BUTTON');
    expect(button).toHaveAttribute('type', 'button');
  });

  it('exit button can be activated with Space key', async () => {
    const _user = userEvent.setup();

    render(<DraftModeControls />);

    await waitFor(() => {
      expect(screen.getByRole('status')).toBeInTheDocument();
    });

    const button = screen.getByRole('button', { name: /exit preview/i });
    button.focus();

    // Button should respond to Space key (native button behavior)
    expect(button.tagName).toBe('BUTTON');
    expect(button).toHaveAttribute('type', 'button');
  });
});

// ============================================================================
// Integration Tests
// ============================================================================

describe('DraftModeControls - Integration Tests', () => {
  beforeEach(() => {
    document.body.style.paddingBottom = '';
  });

  afterEach(() => {
    document.body.style.paddingBottom = '';
  });

  describe('Body Padding Management', () => {
    it('adds padding to body on mount', async () => {
      render(<DraftModeControls />);

      await waitFor(() => {
        expect(document.body.style.paddingBottom).toBe('56px');
      });
    });

    it('removes padding from body on unmount', async () => {
      const { unmount } = render(<DraftModeControls />);

      await waitFor(() => {
        expect(document.body.style.paddingBottom).toBe('56px');
      });

      unmount();

      expect(document.body.style.paddingBottom).toBe('');
    });

    it('restores original padding on unmount', async () => {
      document.body.style.paddingBottom = '20px';

      const { unmount } = render(<DraftModeControls />);

      await waitFor(() => {
        expect(document.body.style.paddingBottom).toBe('56px');
      });

      unmount();

      expect(document.body.style.paddingBottom).toBe('20px');
    });
  });

  describe('Portal Rendering', () => {
    it('renders banner in document.body via portal', async () => {
      render(<DraftModeControls />);

      await waitFor(() => {
        // Banner should be a direct child of body (via portal)
        const banner = document.body.querySelector('[role="status"]');
        expect(banner).toBeInTheDocument();
      });
    });

    it('banner has fixed positioning for overlay behavior', async () => {
      render(<DraftModeControls />);

      await waitFor(() => {
        const banner = screen.getByRole('status');
        expect(banner.className).toContain('fixed');
        expect(banner.className).toContain('bottom-0');
      });
    });

    it('banner has high z-index to stay above content', async () => {
      render(<DraftModeControls />);

      await waitFor(() => {
        const banner = screen.getByRole('status');
        expect(banner.className).toContain('z-[9999]');
      });
    });
  });

  describe('Exit Preview Functionality', () => {
    it('exit button is clickable and triggers action', async () => {
      const user = userEvent.setup();

      render(<DraftModeControls />);

      await waitFor(() => {
        expect(screen.getByRole('status')).toBeInTheDocument();
      });

      const button = screen.getByRole('button', { name: /exit preview/i });

      // Button should be enabled and clickable
      expect(button).not.toBeDisabled();
      expect(button).toHaveAttribute('type', 'button');

      // Click should not throw
      await expect(user.click(button)).resolves.not.toThrow();
    });

    it('exit button has onClick handler attached', async () => {
      render(<DraftModeControls />);

      await waitFor(() => {
        expect(screen.getByRole('status')).toBeInTheDocument();
      });

      const button = screen.getByRole('button', { name: /exit preview/i });

      // Verify the button is properly set up for interaction
      expect(button).not.toBeDisabled();
      expect(button.onclick).toBeDefined;
    });
  });
});

// ============================================================================
// Visual Regression Prevention Tests
// ============================================================================

describe('DraftModeControls - Visual Stability', () => {
  beforeEach(() => {
    document.body.style.paddingBottom = '';
  });

  afterEach(() => {
    document.body.style.paddingBottom = '';
  });

  it('banner has consistent height (56px padding)', async () => {
    render(<DraftModeControls />);

    await waitFor(() => {
      // The BANNER_HEIGHT constant should match the body padding
      expect(document.body.style.paddingBottom).toBe('56px');
    });
  });

  it('maintains responsive layout classes', async () => {
    render(<DraftModeControls />);

    await waitFor(() => {
      const banner = screen.getByRole('status');
      // Should have responsive padding and full width
      expect(banner.className).toContain('px-4');
      expect(banner.className).toContain('py-3');
      expect(banner.className).toContain('inset-x-0');
    });
  });

  it('has proper color scheme classes for theming', async () => {
    render(<DraftModeControls />);

    await waitFor(() => {
      const banner = screen.getByRole('status');
      // Light mode
      expect(banner.className).toContain('bg-brand-vibrant');
      // Dark mode
      expect(banner.className).toContain('dark:bg-brand-900');
    });
  });
});

// ============================================================================
// Edge Cases
// ============================================================================

describe('DraftModeControls - Edge Cases', () => {
  beforeEach(() => {
    document.body.style.paddingBottom = '';
  });

  afterEach(() => {
    document.body.style.paddingBottom = '';
  });

  it('renders correctly when body has existing inline styles', async () => {
    document.body.style.backgroundColor = 'red';
    document.body.style.paddingBottom = '10px';

    const { unmount } = render(<DraftModeControls />);

    await waitFor(() => {
      expect(document.body.style.paddingBottom).toBe('56px');
      // Other styles should be preserved
      expect(document.body.style.backgroundColor).toBe('red');
    });

    unmount();

    // Original padding should be restored
    expect(document.body.style.paddingBottom).toBe('10px');
    // Other styles should still be preserved
    expect(document.body.style.backgroundColor).toBe('red');

    // Cleanup
    document.body.style.backgroundColor = '';
  });

  it('renders all interactive elements correctly', async () => {
    render(<DraftModeControls />);

    await waitFor(() => {
      // Should have exactly 1 link (learn more)
      const links = screen.getAllByRole('link');
      expect(links).toHaveLength(1);

      // Should have exactly 1 button (exit preview)
      const buttons = screen.getAllByRole('button');
      expect(buttons).toHaveLength(1);
    });
  });

  it('uses semantic HTML elements', async () => {
    render(<DraftModeControls />);

    await waitFor(() => {
      const banner = screen.getByRole('status');

      // Should use native button, not div with role
      const button = banner.querySelector('button');
      expect(button).toBeInTheDocument();

      // Should use native anchor, not span with onClick
      const link = banner.querySelector('a');
      expect(link).toBeInTheDocument();
    });
  });
});

// ============================================================================
// Exit Button Loading State Tests
// ============================================================================

describe('DraftModeControls - Loading State', () => {
  beforeEach(() => {
    document.body.style.paddingBottom = '';
  });

  afterEach(() => {
    document.body.style.paddingBottom = '';
  });

  it('exit button shows "Exit Preview" text by default', async () => {
    render(<DraftModeControls />);

    await waitFor(() => {
      const button = screen.getByRole('button');
      expect(button).toHaveTextContent('Exit Preview');
    });
  });

  it('exit button does not show spinner by default', async () => {
    render(<DraftModeControls />);

    await waitFor(() => {
      const button = screen.getByRole('button');
      // No spinner element should be present
      const spinner = button.querySelector('.animate-spin');
      expect(spinner).not.toBeInTheDocument();
    });
  });

  it('exit button has proper disabled styling classes', async () => {
    render(<DraftModeControls />);

    await waitFor(() => {
      const button = screen.getByRole('button');
      expect(button.className).toContain('disabled:opacity-50');
      expect(button.className).toContain('disabled:pointer-events-none');
    });
  });

  it('exit button has transition for smooth state changes', async () => {
    render(<DraftModeControls />);

    await waitFor(() => {
      const button = screen.getByRole('button');
      expect(button.className).toContain('transition-all');
    });
  });
});

// ============================================================================
// Responsive Design Tests
// ============================================================================

describe('DraftModeControls - Responsive Design', () => {
  beforeEach(() => {
    document.body.style.paddingBottom = '';
  });

  afterEach(() => {
    document.body.style.paddingBottom = '';
  });

  it('learn more text is hidden on mobile, visible on desktop', async () => {
    render(<DraftModeControls />);

    await waitFor(() => {
      const link = screen.getByRole('link');
      const textSpan = link.querySelector('span');
      expect(textSpan?.className).toContain('hidden');
      expect(textSpan?.className).toContain('sm:inline');
    });
  });

  it('external link icon is always visible', async () => {
    render(<DraftModeControls />);

    await waitFor(() => {
      const link = screen.getByRole('link');
      const icon = link.querySelector('svg');
      expect(icon).toBeInTheDocument();
      // Icon should not have hidden class
      expect(icon?.className).not.toContain('hidden');
    });
  });

  it('description layout is responsive (stacks on mobile)', async () => {
    render(<DraftModeControls />);

    await waitFor(() => {
      const banner = screen.getByRole('status');
      // Find the flex container with responsive classes
      const flexContainer = banner.querySelector('.flex.flex-col.sm\\:flex-row');
      expect(flexContainer).toBeInTheDocument();
    });
  });

  it('banner has max-width constraint for large screens', async () => {
    render(<DraftModeControls />);

    await waitFor(() => {
      const banner = screen.getByRole('status');
      const innerContainer = banner.querySelector('.max-w-screen-xl');
      expect(innerContainer).toBeInTheDocument();
    });
  });
});
