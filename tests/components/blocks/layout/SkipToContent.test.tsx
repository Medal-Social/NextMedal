import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

// Mock next-intl
vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => {
    const translations: Record<string, string> = {
      skipToContent: 'Skip to content',
    };
    return translations[key] || key;
  },
}));

import SkipToContent from '@/components/blocks/layout/SkipToContent';

describe('SkipToContent', () => {
  it('renders skip link', () => {
    render(<SkipToContent />);
    expect(screen.getByText('Skip to content')).toBeInTheDocument();
  });

  it('links to main content', () => {
    render(<SkipToContent />);
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '#main-content');
  });

  it('is hidden by default (off-screen)', () => {
    render(<SkipToContent />);
    const link = screen.getByRole('link');
    expect(link).toHaveClass('opacity-0');
    expect(link).toHaveClass('-translate-y-24');
  });

  it('has focus styles', () => {
    render(<SkipToContent />);
    const link = screen.getByRole('link');
    expect(link).toHaveClass('focus:translate-y-0');
    expect(link).toHaveClass('focus:opacity-100');
  });

  it('has fixed positioning', () => {
    render(<SkipToContent />);
    const link = screen.getByRole('link');
    expect(link).toHaveClass('fixed');
    expect(link).toHaveClass('z-[100]');
  });

  it('has pill shape styling', () => {
    render(<SkipToContent />);
    const link = screen.getByRole('link');
    expect(link).toHaveClass('rounded-full');
  });

  it('has brand color background', () => {
    render(<SkipToContent />);
    const link = screen.getByRole('link');
    expect(link).toHaveClass('bg-brand-600/95');
  });

  it('respects reduced motion preference', () => {
    render(<SkipToContent />);
    const link = screen.getByRole('link');
    expect(link).toHaveClass('motion-reduce:transition-none');
  });

  it('focuses main content on click', async () => {
    const user = userEvent.setup();

    // Create a mock main-content element
    const mainContent = document.createElement('div');
    mainContent.id = 'main-content';
    mainContent.tabIndex = -1;
    document.body.appendChild(mainContent);

    render(<SkipToContent />);

    const link = screen.getByRole('link');
    await user.click(link);

    // Wait for setTimeout to complete
    await new Promise((resolve) => setTimeout(resolve, 10));

    expect(document.activeElement).toBe(mainContent);

    // Cleanup
    document.body.removeChild(mainContent);
  });
});
