import { axe, render, screen, userEvent } from '@tests/setup/providers';
import { describe, expect, it, vi } from 'vitest';
import FooterWrapper from '@/components/blocks/layout/footer/wrapper';
import Toggle from '@/components/blocks/layout/header/Toggle';

// Mock next-themes for ThemeToggle tests
vi.mock('next-themes', () => ({
  useTheme: () => ({
    theme: 'light',
    setTheme: vi.fn(),
  }),
}));

// Mock next-intl for ThemeToggle tests
vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}));

// Mock next/navigation for Wrapper component
vi.mock('next/navigation', () => ({
  usePathname: () => '/',
}));

// ============================================================================
// Header Component Tests (Task 8.1)
// ============================================================================

describe('Header Components - Unit Tests', () => {
  describe('Toggle Component', () => {
    it('renders without throwing errors', () => {
      expect(() => render(<Toggle isOpen={false} setIsOpen={vi.fn()} />)).not.toThrow();
    });

    it('renders a button element', () => {
      const { container } = render(<Toggle isOpen={false} setIsOpen={vi.fn()} />);
      const button = container.querySelector('button');
      expect(button).toBeInTheDocument();
    });

    it('has correct aria attributes', () => {
      const { container } = render(<Toggle isOpen={false} setIsOpen={vi.fn()} />);
      const button = container.querySelector('button');
      expect(button).toHaveAttribute('aria-expanded', 'false');
      expect(button).toHaveAttribute('aria-controls', 'mobile-menu');
      expect(button).toHaveAttribute('aria-label', 'Open menu');
    });

    it('renders SVG icon', () => {
      const { container } = render(<Toggle isOpen={false} setIsOpen={vi.fn()} />);
      const svg = container.querySelector('svg');
      expect(svg).toBeInTheDocument();
    });

    it('has lg:hidden class for responsive behavior', () => {
      const { container } = render(<Toggle isOpen={false} setIsOpen={vi.fn()} />);
      const button = container.querySelector('button');
      expect(button).toHaveClass('lg:hidden');
    });
  });
});

// ============================================================================
// Footer Component Tests (Task 8.2)
// ============================================================================

describe('Footer Components - Unit Tests', () => {
  describe('Footer Wrapper Component', () => {
    it('renders without throwing errors', () => {
      expect(() =>
        render(
          <FooterWrapper>
            <div>Footer Content</div>
          </FooterWrapper>
        )
      ).not.toThrow();
    });

    it('renders children correctly', () => {
      render(
        <FooterWrapper>
          <div data-testid="footer-child">Footer Child</div>
        </FooterWrapper>
      );
      expect(screen.getByTestId('footer-child')).toBeInTheDocument();
    });

    it('renders as a footer element', () => {
      const { container } = render(
        <FooterWrapper>
          <div>Content</div>
        </FooterWrapper>
      );
      const footer = container.querySelector('footer');
      expect(footer).toBeInTheDocument();
    });

    it('applies custom className', () => {
      const { container } = render(
        <FooterWrapper className="custom-footer-class">
          <div>Content</div>
        </FooterWrapper>
      );
      const footer = container.querySelector('footer');
      expect(footer).toHaveClass('custom-footer-class');
    });

    it('renders multiple children', () => {
      render(
        <FooterWrapper>
          <nav data-testid="footer-nav">Footer Navigation</nav>
          <p data-testid="copyright">© 2024</p>
        </FooterWrapper>
      );
      expect(screen.getByTestId('footer-nav')).toBeInTheDocument();
      expect(screen.getByTestId('copyright')).toBeInTheDocument();
    });
  });
});

// ============================================================================
// Accessibility Tests (Task 8.3)
// ============================================================================

describe('Header Components - Accessibility Tests', () => {
  describe('Toggle Component Accessibility', () => {
    it('has no accessibility violations', async () => {
      const { container } = render(<Toggle isOpen={false} setIsOpen={vi.fn()} />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });
});

describe('Footer Components - Accessibility Tests', () => {
  describe('Footer Wrapper Component Accessibility', () => {
    it('has no accessibility violations', async () => {
      const { container } = render(
        <FooterWrapper>
          <nav aria-label="Footer navigation">
            <a href="/privacy">Privacy Policy</a>
            <a href="/terms">Terms of Service</a>
          </nav>
          <p>© 2024 Company Name</p>
        </FooterWrapper>
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('renders with proper contentinfo landmark role', () => {
      const { container } = render(
        <FooterWrapper>
          <div>Footer content</div>
        </FooterWrapper>
      );
      // Footer element has implicit contentinfo role
      const footer = container.querySelector('footer');
      expect(footer).toBeInTheDocument();
    });

    it('has no violations with complex footer structure', async () => {
      const { container } = render(
        <FooterWrapper>
          <div>
            <nav aria-label="Footer links">
              <h2>Quick Links</h2>
              <ul>
                <li>
                  <a href="/about">About Us</a>
                </li>
                <li>
                  <a href="/contact">Contact</a>
                </li>
              </ul>
            </nav>
            <nav aria-label="Social media">
              <h2>Follow Us</h2>
              <ul>
                <li>
                  <a href="https://twitter.com" target="_blank" rel="noopener noreferrer">
                    Twitter
                  </a>
                </li>
              </ul>
            </nav>
          </div>
          <p>© 2024 Company Name. All rights reserved.</p>
        </FooterWrapper>
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });
});

// ============================================================================
// Keyboard Navigation Tests
// ============================================================================

describe('Header/Footer Keyboard Navigation', () => {
  describe('Toggle Component Keyboard Interaction', () => {
    it('button click calls setIsOpen', async () => {
      const user = userEvent.setup();
      const setIsOpen = vi.fn();
      const { container } = render(<Toggle isOpen={false} setIsOpen={setIsOpen} />);

      const button = container.querySelector('button');
      await user.click(button!);

      expect(setIsOpen).toHaveBeenCalledWith(true);
    });
  });

  describe('Footer Navigation Keyboard Accessibility', () => {
    it('footer links are keyboard navigable', async () => {
      const user = userEvent.setup();
      render(
        <FooterWrapper>
          <nav aria-label="Footer navigation">
            <a href="/privacy">Privacy Policy</a>
            <a href="/terms">Terms of Service</a>
          </nav>
        </FooterWrapper>
      );

      await user.tab();
      expect(screen.getByText('Privacy Policy')).toHaveFocus();

      await user.tab();
      expect(screen.getByText('Terms of Service')).toHaveFocus();
    });
  });
});
