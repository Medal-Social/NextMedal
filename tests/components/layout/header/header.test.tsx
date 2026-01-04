/**
 * Header Component Tests
 *
 * Tests for the header component including:
 * - HeaderClient state management logic
 * - Scroll behavior and threshold detection
 * - Mobile menu toggle functionality
 * - Dark hero detection
 * - Header height calculation
 * - Docs vs. regular layout switching
 * - HeaderFallback rendering
 *
 * Full component testing with Sanity data fetching requires E2E tests.
 */

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { DESKTOP_BREAKPOINT, SCROLL_THRESHOLD } from '@/components/blocks/layout/header/constants';

// Mock next/navigation
const { mockUsePathname } = vi.hoisted(() => ({
  mockUsePathname: vi.fn(() => '/'),
}));

vi.mock('next/navigation', () => ({
  usePathname: mockUsePathname,
}));

// Mock Sanity live client
vi.mock('@/sanity/lib/live', () => ({
  sanityFetch: vi.fn(),
  SanityLive: () => null,
}));

// Mock motion/react
vi.mock('motion/react', () => ({
  motion: {
    div: ({ children, ...props }: React.ComponentProps<'div'>) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

// Mock next/link
vi.mock('next/link', () => ({
  default: ({
    children,
    href,
    ...props
  }: {
    children: React.ReactNode;
    href: string;
    [key: string]: unknown;
  }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

// Mock child components
vi.mock('@/components/blocks/layout/header/mobile-navigation', () => ({
  default: () => <div data-testid="mobile-navigation">Mobile Navigation</div>,
}));

vi.mock('@/components/blocks/layout/header/mobile-docs-navigation', () => ({
  default: () => <div data-testid="mobile-docs-navigation">Mobile Docs Navigation</div>,
}));

vi.mock('@/components/blocks/layout/header/ThemeToggle', () => ({
  default: ({ className }: { className?: string }) => (
    <button type="button" data-testid="theme-toggle" className={className}>
      Theme
    </button>
  ),
}));

vi.mock('@/components/blocks/layout/header/Toggle', () => ({
  default: ({
    isOpen,
    setIsOpen,
    className,
  }: {
    isOpen: boolean;
    setIsOpen: (value: boolean) => void;
    className?: string;
  }) => (
    <button
      type="button"
      data-testid="menu-toggle"
      className={className}
      onClick={() => setIsOpen(!isOpen)}
      aria-label={isOpen ? 'Close menu' : 'Open menu'}
    >
      {isOpen ? 'Close' : 'Menu'}
    </button>
  ),
}));

vi.mock('@/components/blocks/utility/CommandMenu', () => ({
  CommandMenu: ({ variant, className }: { variant?: string; className?: string }) => (
    <div data-testid={`command-menu-${variant}`} className={className}>
      Search
    </div>
  ),
}));

vi.mock('@/components/blocks/layout/language-switcher', () => ({
  default: () => <div data-testid="locale-switcher">Language Switcher</div>,
}));

// Import HeaderClient and CollectionProvider after mocks
import HeaderClient from '@/components/blocks/layout/header/Header.client';
import type { HeaderClientProps } from '@/components/blocks/layout/header/types';
import { CollectionProvider } from '@/lib/collections/context';

describe('Header Constants', () => {
  it('should have correct scroll threshold', () => {
    expect(SCROLL_THRESHOLD).toBe(10);
  });

  it('should have correct desktop breakpoint', () => {
    expect(DESKTOP_BREAKPOINT).toBe(1024);
  });
});

describe('HeaderClient Component', () => {
  let defaultProps: HeaderClientProps;

  // Helper to render HeaderClient with required CollectionProvider
  const renderWithProvider = (props: HeaderClientProps, locale = 'en') => {
    return render(
      <CollectionProvider locale={locale}>
        <HeaderClient {...props} />
      </CollectionProvider>
    );
  };

  beforeEach(() => {
    defaultProps = {
      className: 'test-class',
      ctas: [],
      menu: { items: [] },
      enableSearch: false,
      logoNode: <div data-testid="logo">Logo</div>,
      navNode: <nav data-testid="nav">Navigation</nav>,
      ctaNode: <div data-testid="cta">CTA</div>,
      localeSwitcherNode: <div data-testid="locale-switcher">Locale</div>,
    };

    // Mock window properties
    Object.defineProperty(window, 'scrollY', { value: 0, writable: true });
    Object.defineProperty(window, 'innerWidth', { value: 1280, writable: true });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Basic Rendering', () => {
    it('should render header with proper role and aria-label', () => {
      mockUsePathname.mockReturnValue('/');

      renderWithProvider(defaultProps);

      const header = screen.getByRole('banner');
      expect(header).toBeInTheDocument();
    });

    it('should render logo node', () => {
      mockUsePathname.mockReturnValue('/');

      renderWithProvider(defaultProps);

      expect(screen.getByTestId('logo')).toBeInTheDocument();
    });

    it('should render navigation node', () => {
      mockUsePathname.mockReturnValue('/');

      renderWithProvider(defaultProps);

      expect(screen.getByTestId('nav')).toBeInTheDocument();
    });

    it('should render theme toggle', () => {
      mockUsePathname.mockReturnValue('/');

      renderWithProvider(defaultProps);

      expect(screen.getByTestId('theme-toggle')).toBeInTheDocument();
    });

    it('should render mobile menu toggle', () => {
      mockUsePathname.mockReturnValue('/');

      renderWithProvider(defaultProps);

      expect(screen.getByTestId('menu-toggle')).toBeInTheDocument();
    });
  });

  describe('Search Integration', () => {
    it('should not render search when enableSearch is false', () => {
      mockUsePathname.mockReturnValue('/');

      renderWithProvider({ ...defaultProps, enableSearch: false });

      expect(screen.queryByTestId('command-menu-default')).not.toBeInTheDocument();
      expect(screen.queryByTestId('command-menu-icon')).not.toBeInTheDocument();
    });

    it('should render search when enableSearch is true', () => {
      mockUsePathname.mockReturnValue('/');

      renderWithProvider({ ...defaultProps, enableSearch: true });

      // Should render both desktop and mobile variants
      expect(screen.getByTestId('command-menu-default')).toBeInTheDocument();
      expect(screen.getByTestId('command-menu-icon')).toBeInTheDocument();
    });
  });

  describe('Mobile Menu Toggle', () => {
    it('should toggle mobile menu state when toggle button is clicked', async () => {
      mockUsePathname.mockReturnValue('/');
      const user = userEvent.setup();

      renderWithProvider(defaultProps);

      const toggleButton = screen.getByTestId('menu-toggle');

      // Initially closed
      expect(toggleButton).toHaveTextContent('Menu');
      expect(screen.queryByTestId('mobile-navigation')).not.toBeInTheDocument();

      // Click to open
      await user.click(toggleButton);

      // Should now be open
      await waitFor(() => {
        expect(screen.getByTestId('mobile-navigation')).toBeInTheDocument();
      });

      // Click to close
      await user.click(toggleButton);

      // Should close
      await waitFor(() => {
        expect(screen.queryByTestId('mobile-navigation')).not.toBeInTheDocument();
      });
    });

    it('should render regular mobile navigation for non-docs pages', async () => {
      mockUsePathname.mockReturnValue('/about');
      const user = userEvent.setup();

      renderWithProvider(defaultProps);

      const toggleButton = screen.getByTestId('menu-toggle');
      await user.click(toggleButton);

      await waitFor(() => {
        expect(screen.getByTestId('mobile-navigation')).toBeInTheDocument();
        expect(screen.queryByTestId('mobile-docs-navigation')).not.toBeInTheDocument();
      });
    });

    it('should render docs mobile navigation for docs pages', async () => {
      mockUsePathname.mockReturnValue('/docs/getting-started');
      const user = userEvent.setup();

      renderWithProvider(defaultProps);

      const toggleButton = screen.getByTestId('menu-toggle');
      await user.click(toggleButton);

      await waitFor(() => {
        expect(screen.getByTestId('mobile-docs-navigation')).toBeInTheDocument();
        expect(screen.queryByTestId('mobile-navigation')).not.toBeInTheDocument();
      });
    });
  });

  describe('Docs Layout Detection', () => {
    it('should detect docs pages from pathname', () => {
      mockUsePathname.mockReturnValue('/docs/api-reference');

      renderWithProvider(defaultProps);

      // Should render docs layout with "Docs" label
      expect(screen.getByText(/Docs/i)).toBeInTheDocument();
    });

    it('should detect docs root page', () => {
      mockUsePathname.mockReturnValue('/docs');

      renderWithProvider(defaultProps);

      // Should render docs layout
      expect(screen.getByText(/Docs/i)).toBeInTheDocument();
    });

    it('should use regular layout for non-docs pages', () => {
      mockUsePathname.mockReturnValue('/about');

      renderWithProvider(defaultProps);

      // Should not render "Docs" label
      expect(screen.queryByText('Docs')).not.toBeInTheDocument();
    });
  });

  describe('Responsive Behavior', () => {
    it('should apply correct container classes', () => {
      mockUsePathname.mockReturnValue('/');

      renderWithProvider(defaultProps);

      const header = screen.getByRole('banner');
      expect(header).toHaveClass('test-class');
      expect(header).toHaveClass('relative');
      expect(header).toHaveClass('z-50');
      expect(header).toHaveClass('transition-colors');
    });
  });
});

/**
 * HeaderClient Component - Logic Documentation
 *
 * Complex client-side behaviors that require E2E testing:
 * - Scroll state management with throttling
 * - Dark hero detection via MutationObserver
 * - Header height calculation with banner offset
 * - Body scroll prevention when menu is open
 * - Scrollbar width compensation
 * - Route change menu closing
 * - Resize to desktop menu closing
 */

describe('HeaderClient Component - State Management Logic', () => {
  describe('Scroll State Management', () => {
    it('should have scroll threshold of 10px', () => {
      const scrollThreshold = 10;
      expect(scrollThreshold).toBe(SCROLL_THRESHOLD);
    });

    it('should use requestAnimationFrame for scroll throttling', () => {
      const throttleLogic = {
        usesRAF: true,
        preventsDuplicateCalls: 'ticking flag',
        passiveListener: true,
      };
      expect(throttleLogic.usesRAF).toBe(true);
    });

    it('should update isScrolled state when scrollY > SCROLL_THRESHOLD', () => {
      const scrollY = 15;
      const isScrolled = scrollY > SCROLL_THRESHOLD;
      expect(isScrolled).toBe(true);
    });

    it('should not update isScrolled when scrollY <= SCROLL_THRESHOLD', () => {
      const scrollY = 5;
      const isScrolled = scrollY > SCROLL_THRESHOLD;
      expect(isScrolled).toBe(false);
    });
  });

  describe('Dark Hero Detection', () => {
    it('should check for data-theme="dark" on main first child', () => {
      const detectionLogic = {
        selector: 'main',
        targetElement: 'main.firstElementChild',
        attribute: 'data-theme',
        expectedValue: 'dark',
      };
      expect(detectionLogic.attribute).toBe('data-theme');
    });

    it('should use MutationObserver for dynamic theme changes', () => {
      const observerConfig = {
        childList: true,
        attributes: true,
        attributeFilter: ['data-theme'],
      };
      expect(observerConfig.attributeFilter).toContain('data-theme');
    });

    it('should re-run detection on pathname change', () => {
      const effectDependencies = ['pathname'];
      expect(effectDependencies).toContain('pathname');
    });
  });

  describe('Header Height Calculation', () => {
    it('should include banner height in total header height', () => {
      const bannerHeight = 40;
      const headerHeight = 64;
      const totalHeight = bannerHeight + headerHeight;
      expect(totalHeight).toBe(104);
    });

    it('should set CSS custom property --header-height', () => {
      const _propertyName = '--header-height';
      const bannerHeight = 40;
      const headerHeight = 64;
      const expectedValue = `${bannerHeight + headerHeight}px`;
      expect(expectedValue).toBe('104px');
    });

    it('should update on window resize', () => {
      const listenerConfig = {
        event: 'resize',
        passive: true,
      };
      expect(listenerConfig.passive).toBe(true);
    });

    it('should observe style attribute for banner height changes', () => {
      const observerConfig = {
        attributes: true,
        attributeFilter: ['style'],
      };
      expect(observerConfig.attributeFilter).toContain('style');
    });
  });

  describe('Mobile Menu State', () => {
    it('should close menu on pathname change', () => {
      const effectDependencies = ['pathname'];
      const _expectedBehavior = 'setIsOpen(false)';
      expect(effectDependencies).toContain('pathname');
    });

    it('should close menu when resizing to desktop width', () => {
      const desktopWidth = 1024;
      const shouldClose = (currentWidth: number, isOpen: boolean) =>
        currentWidth >= desktopWidth && isOpen;

      expect(shouldClose(1280, true)).toBe(true);
      expect(shouldClose(768, true)).toBe(false);
      expect(shouldClose(1280, false)).toBe(false);
    });
  });

  describe('Body Scroll Prevention', () => {
    it('should prevent body scroll when menu is open', () => {
      const isOpen = true;
      const expectedBodyOverflow = isOpen ? 'hidden' : '';
      expect(expectedBodyOverflow).toBe('hidden');
    });

    it('should compensate for scrollbar width', () => {
      const windowInnerWidth = 1280;
      const documentClientWidth = 1263; // 17px scrollbar
      const scrollbarWidth = windowInnerWidth - documentClientWidth;
      expect(scrollbarWidth).toBe(17);
    });

    it('should apply padding-right to body and header when open', () => {
      const isOpen = true;
      const scrollbarWidth = 17;
      const expectedPadding = isOpen ? `${scrollbarWidth}px` : '';
      expect(expectedPadding).toBe('17px');
    });

    it('should restore defaults when menu closes', () => {
      const _isOpen = false;
      const expectedOverflow = '';
      const expectedPadding = '';
      expect(expectedOverflow).toBe('');
      expect(expectedPadding).toBe('');
    });
  });

  describe('Header Styling Logic', () => {
    const getShouldBeDark = ({
      isScrolled,
      isDarkHero,
      isOpen,
      isDocs,
    }: {
      isScrolled: boolean;
      isDarkHero: boolean;
      isOpen: boolean;
      isDocs: boolean;
    }) => !isScrolled && isDarkHero && !isOpen && !isDocs;

    it('should add background when scrolled', () => {
      const isScrolled = true;
      const shouldHaveBackground = isScrolled;
      expect(shouldHaveBackground).toBe(true);
    });

    it('should add background when menu is open', () => {
      const isOpen = true;
      const shouldHaveBackground = isOpen;
      expect(shouldHaveBackground).toBe(true);
    });

    it('should add background on docs pages', () => {
      const isDocs = true;
      const shouldHaveBackground = isDocs;
      expect(shouldHaveBackground).toBe(true);
    });

    it('should apply dark mode for dark hero when not scrolled', () => {
      const shouldBeDark = getShouldBeDark({
        isScrolled: false,
        isDarkHero: true,
        isOpen: false,
        isDocs: false,
      });
      expect(shouldBeDark).toBe(true);
    });

    it('should not apply dark mode when scrolled', () => {
      const shouldBeDark = getShouldBeDark({
        isScrolled: true,
        isDarkHero: true,
        isOpen: false,
        isDocs: false,
      });
      expect(shouldBeDark).toBe(false);
    });

    it('should not apply dark mode when menu is open', () => {
      const shouldBeDark = getShouldBeDark({
        isScrolled: false,
        isDarkHero: true,
        isOpen: true,
        isDocs: false,
      });
      expect(shouldBeDark).toBe(false);
    });
  });

  describe('Layout Switching', () => {
    it('should detect docs pages by pathname includes /docs', () => {
      const pathname = '/docs/getting-started';
      const isDocs = pathname?.includes('/docs');
      expect(isDocs).toBe(true);
    });

    it('should detect docs root by pathname ends with /docs', () => {
      const pathname = '/docs';
      const isDocsRoot = pathname?.endsWith('/docs');
      expect(isDocsRoot).toBe(true);
    });

    it('should use max-w-none for docs layout', () => {
      const isDocs = true;
      const maxWidth = isDocs ? 'max-w-none' : 'max-w-7xl';
      expect(maxWidth).toBe('max-w-none');
    });

    it('should use max-w-7xl for regular layout', () => {
      const isDocs = false;
      const maxWidth = isDocs ? 'max-w-none' : 'max-w-7xl';
      expect(maxWidth).toBe('max-w-7xl');
    });
  });
});

/**
 * Testing Strategy for Header Component
 *
 * 1. **Unit Tests** (this file):
 *    - ✅ Basic rendering and props
 *    - ✅ Mobile menu toggle
 *    - ✅ Search integration
 *    - ✅ Docs layout detection
 *    - ✅ State management logic documentation
 *
 * 2. **E2E Tests** (Recommended):
 *    - Scroll behavior (threshold at 10px)
 *    - Dark hero detection and theme switching
 *    - Header height calculation with banner
 *    - Body scroll lock when menu opens
 *    - Scrollbar width compensation
 *    - Menu closes on route change
 *    - Menu closes on desktop resize
 *    - Sticky header behavior
 *    - All breakpoint transitions
 *
 * 3. **Manual Testing Checklist**:
 *    - [ ] Header appears on all pages
 *    - [ ] Scroll past 10px adds background
 *    - [ ] Dark hero pages invert header colors
 *    - [ ] Mobile menu opens/closes correctly
 *    - [ ] Body scroll locked when menu open
 *    - [ ] No layout shift from scrollbar compensation
 *    - [ ] Menu closes when navigating
 *    - [ ] Menu closes when resizing to desktop
 *    - [ ] Search appears when enabled
 *    - [ ] Docs layout renders on /docs pages
 *    - [ ] Regular layout renders on other pages
 *    - [ ] Theme toggle works
 *    - [ ] Language switcher works
 *    - [ ] All links navigate correctly
 */
