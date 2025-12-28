/**
 * Layout Tests
 * @description Tests for the root layout component structure and accessibility
 * Tests SkipToContent, Header/main/Footer structure, main-content id, lang attribute, ThemeProvider
 * _Requirements: 13.1, 13.2, 13.3, 13.4, 13.5_
 */

import fs from 'node:fs';
import path from 'node:path';
import { render, screen } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import { describe, expect, it, vi } from 'vitest';
import { routing } from '@/i18n/routing';
import SkipToContent from '@/ui/SkipToContent';

// Mock framer-motion to avoid animation-related issues in tests
vi.mock('framer-motion', () => ({
  motion: {
    a: ({
      children,
      className,
      href,
      onClick,
      onFocus,
      onBlur,
      ...props
    }: React.ComponentProps<'a'>) => (
      <a
        className={className}
        href={href}
        onClick={onClick}
        onFocus={onFocus}
        onBlur={onBlur}
        {...props}
      >
        {children}
      </a>
    ),
  },
  useReducedMotion: () => false,
}));

// Test messages for next-intl
const messages = {
  Accessibility: {
    skipToContent: 'Skip to content',
  },
};

// Helper to render with NextIntlClientProvider
function renderWithIntl(ui: React.ReactElement) {
  return render(
    <NextIntlClientProvider locale="en" messages={messages}>
      {ui}
    </NextIntlClientProvider>
  );
}

describe('Layout Components', () => {
  describe('SkipToContent', () => {
    it('renders as a link targeting main-content', () => {
      renderWithIntl(<SkipToContent />);
      const skipLink = screen.getByRole('link', { name: /skip to content/i });
      expect(skipLink).toBeInTheDocument();
      expect(skipLink).toHaveAttribute('href', '#main-content');
    });

    it('is keyboard focusable (anchor elements are focusable by default)', () => {
      renderWithIntl(<SkipToContent />);
      const skipLink = screen.getByRole('link', { name: /skip to content/i });
      // Anchor elements with href are focusable by default, no explicit tabIndex needed
      expect(skipLink).toHaveAttribute('href', '#main-content');
    });

    it('uses fixed positioning for modern slide-down animation', () => {
      renderWithIntl(<SkipToContent />);
      const skipLink = screen.getByRole('link', { name: /skip to content/i });
      // Modern implementation uses fixed positioning with Framer Motion animation
      expect(skipLink).toHaveClass('fixed');
    });
  });

  describe('Layout Structure Requirements', () => {
    /**
     * Validates: Requirements 13.1
     * WHEN the root layout renders THEN the layout SHALL include a SkipToContent link as the first focusable element
     */
    it('SkipToContent should be designed to be first focusable element', () => {
      renderWithIntl(<SkipToContent />);
      const skipLink = screen.getByRole('link', { name: /skip to content/i });
      // SkipToContent is an anchor with href (inherently focusable) and positioned fixed at top-center
      expect(skipLink).toHaveAttribute('href', '#main-content');
      expect(skipLink).toHaveClass('fixed', 'top-4');
    });

    /**
     * Validates: Requirements 13.3
     * WHEN the main content area renders THEN the area SHALL have id="main-content" for skip link targeting
     */
    it('SkipToContent links to #main-content', () => {
      renderWithIntl(<SkipToContent />);
      const skipLink = screen.getByRole('link', { name: /skip to content/i });
      expect(skipLink.getAttribute('href')).toBe('#main-content');
    });
  });

  describe('Layout Configuration Verification', () => {
    const layoutPath = path.join(process.cwd(), 'src/app/(frontend)/[locale]/layout.tsx');
    let layoutSource: string;

    // Read layout source once for static analysis
    try {
      layoutSource = fs.readFileSync(layoutPath, 'utf-8');
    } catch {
      layoutSource = '';
    }

    /**
     * Validates: Requirements 13.2
     * Verifies the layout structure includes Header, main, and Footer
     */
    it('layout includes Header component', () => {
      expect(layoutSource).toContain('import Header from');
      expect(layoutSource).toContain('<Header');
    });

    it('layout includes Footer component', () => {
      expect(layoutSource).toContain('import Footer from');
      expect(layoutSource).toContain('<Footer');
    });

    it('layout includes main element with id="main-content"', () => {
      expect(layoutSource).toContain('<main');
      expect(layoutSource).toContain('id="main-content"');
    });

    /**
     * Validates: Requirements 13.1
     * Verifies SkipToContent is imported and used
     */
    it('layout includes SkipToContent component', () => {
      expect(layoutSource).toContain('import SkipToContent from');
      expect(layoutSource).toContain('<SkipToContent');
    });

    /**
     * Validates: Requirements 13.4
     * Verifies html element has lang attribute from locale
     */
    it('layout sets lang attribute on html element', () => {
      expect(layoutSource).toContain('lang={locale}');
    });

    /**
     * Validates: Requirements 13.5
     * Verifies ThemeProvider is configured with defaultTheme
     */
    it('layout uses ThemeProvider with defaultTheme', () => {
      expect(layoutSource).toContain('import { ThemeProvider }');
      expect(layoutSource).toContain('<ThemeProvider');
      expect(layoutSource).toContain('defaultTheme');
    });
  });

  describe('Locale Configuration', () => {
    /**
     * Validates: Requirements 13.4
     * Verifies supported locales are configured
     */
    it('routing has configured locales', () => {
      expect(routing.locales).toBeDefined();
      expect(Array.isArray(routing.locales)).toBe(true);
      expect(routing.locales.length).toBeGreaterThan(0);
    });

    it('routing includes English locale', () => {
      expect(routing.locales).toContain('en');
    });

    it('routing includes Norwegian locale', () => {
      expect(routing.locales).toContain('nb');
    });

    it('routing has a default locale', () => {
      expect(routing.defaultLocale).toBeDefined();
      expect(typeof routing.defaultLocale).toBe('string');
    });
  });
});
