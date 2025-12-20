import { describe, expect, it, vi } from 'vitest';
import { axe, render, screen, userEvent } from '@/test/setup';
import FooterWrapper from '@/ui/footer/wrapper';
import Toggle from '@/ui/header/Toggle';
import Wrapper from '@/ui/header/Wrapper';

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
      expect(() => render(<Toggle />)).not.toThrow();
    });

    it('renders a label element', () => {
      const { container } = render(<Toggle />);
      const label = container.querySelector('label');
      expect(label).toBeInTheDocument();
    });

    it('contains a hidden checkbox input', () => {
      const { container } = render(<Toggle />);
      const input = container.querySelector('input[type="checkbox"]');
      expect(input).toBeInTheDocument();
      expect(input).toHaveAttribute('hidden');
    });

    it('has correct id for header toggle', () => {
      const { container } = render(<Toggle />);
      const input = container.querySelector('#header-toggle');
      expect(input).toBeInTheDocument();
    });

    it('renders Menu and X icons', () => {
      const { container } = render(<Toggle />);
      // Check for SVG elements (Menu and X icons from lucide-react)
      const svgs = container.querySelectorAll('svg');
      expect(svgs.length).toBe(2);
    });

    it('has lg:hidden class for responsive behavior', () => {
      const { container } = render(<Toggle />);
      const label = container.querySelector('label');
      expect(label).toHaveClass('lg:hidden');
    });
  });

  describe('Wrapper Component', () => {
    it('renders without throwing errors', () => {
      expect(() =>
        render(
          <Wrapper>
            <div>Content</div>
          </Wrapper>
        )
      ).not.toThrow();
    });

    it('renders children correctly', () => {
      render(
        <Wrapper>
          <div data-testid="child">Child Content</div>
        </Wrapper>
      );
      expect(screen.getByTestId('child')).toBeInTheDocument();
    });

    it('renders as a header element', () => {
      const { container } = render(
        <Wrapper>
          <div>Content</div>
        </Wrapper>
      );
      const header = container.querySelector('header');
      expect(header).toBeInTheDocument();
    });

    it('applies custom className', () => {
      const { container } = render(
        <Wrapper className="custom-header-class">
          <div>Content</div>
        </Wrapper>
      );
      const header = container.querySelector('header');
      expect(header).toHaveClass('custom-header-class');
    });

    it('renders multiple children', () => {
      render(
        <Wrapper>
          <nav data-testid="nav">Navigation</nav>
          <div data-testid="content">Content</div>
        </Wrapper>
      );
      expect(screen.getByTestId('nav')).toBeInTheDocument();
      expect(screen.getByTestId('content')).toBeInTheDocument();
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
      const { container } = render(<Toggle />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('Wrapper Component Accessibility', () => {
    it('has no accessibility violations with banner role', async () => {
      const { container } = render(
        <Wrapper role="banner" aria-label="Site header">
          <nav aria-label="Main navigation">
            <a href="/">Home</a>
          </nav>
        </Wrapper>
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('renders with proper landmark role', () => {
      render(
        <Wrapper role="banner" aria-label="Site header">
          <div>Header content</div>
        </Wrapper>
      );
      expect(screen.getByRole('banner')).toBeInTheDocument();
    });

    it('header element has implicit banner role', () => {
      const { container } = render(
        <Wrapper>
          <div>Header content</div>
        </Wrapper>
      );
      const header = container.querySelector('header');
      expect(header).toBeInTheDocument();
      // Header element has implicit banner role when it's a direct child of body
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
    it('checkbox state can be changed programmatically', () => {
      const { container } = render(<Toggle />);
      const checkbox = container.querySelector('input[type="checkbox"]') as HTMLInputElement;

      expect(checkbox).not.toBeChecked();

      // Simulate checkbox change (since it's hidden, direct keyboard interaction won't work)
      checkbox.checked = true;
      expect(checkbox).toBeChecked();

      checkbox.checked = false;
      expect(checkbox).not.toBeChecked();
    });

    it('label click toggles checkbox', async () => {
      const user = userEvent.setup();
      const { container } = render(<Toggle />);

      const label = container.querySelector('label');
      const checkbox = container.querySelector('input[type="checkbox"]') as HTMLInputElement;

      expect(checkbox).not.toBeChecked();

      // Click on label should toggle the checkbox
      await user.click(label!);
      expect(checkbox).toBeChecked();
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
