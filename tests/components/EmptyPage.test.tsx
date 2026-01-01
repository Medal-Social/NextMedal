import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { EmptyPage } from '@/components/EmptyPage';

// Mock next-intl
vi.mock('next-intl', () => ({
  useTranslations: () => {
    const translations: Record<string, string> = {
      title: 'Welcome to NextMedal!',
      description: 'Your site is running, but no index page exists yet.',
      quickSetup: 'Quick setup:',
      'step1.title': 'Create a page',
      'step1.description': 'Open Sanity Studio',
      'step2.title': 'Set slug to "index"',
      'step2.description': 'In the metadata section',
      'step3.title': 'Publish',
      'step3.description': 'Save and publish the page',
      needHelp: 'Need help? Check the README or contact Medal Social.',
      openStudio: 'Open Sanity Studio',
    };

    const t = (key: string) => translations[key] || key;
    t.rich = (key: string) => translations[key] || key;
    return t;
  },
}));

describe('EmptyPage', () => {
  it('renders empty page component', () => {
    render(<EmptyPage />);
    expect(screen.getByText('Welcome to NextMedal!')).toBeInTheDocument();
  });

  it('displays instructions for users', () => {
    render(<EmptyPage />);
    expect(
      screen.getByText(/Your site is running, but no index page exists yet/)
    ).toBeInTheDocument();
  });

  it('has link to Sanity Studio', () => {
    render(<EmptyPage />);
    const link = screen.getByRole('link', { name: /Open Sanity Studio/i });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', '/studio/structure/page');
  });

  it('studio link opens in new tab', () => {
    render(<EmptyPage />);
    const link = screen.getByRole('link', { name: /Open Sanity Studio/i });
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('has icon media element', () => {
    render(<EmptyPage />);
    // EmptyMedia with icon variant should be present
    expect(document.querySelector('[data-slot="empty-icon"]')).toBeInTheDocument();
  });

  it('renders within a section', () => {
    render(<EmptyPage />);
    const section = document.querySelector('section');
    expect(section).toBeInTheDocument();
  });

  it('has centered layout', () => {
    render(<EmptyPage />);
    const section = document.querySelector('section');
    expect(section).toHaveClass('items-center');
    expect(section).toHaveClass('justify-center');
  });
});
