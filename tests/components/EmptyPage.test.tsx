import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { EmptyPage } from '@/components/EmptyPage';

describe('EmptyPage', () => {
  it('renders empty page component', () => {
    render(<EmptyPage />);
    expect(screen.getByText('No Index Page Found')).toBeInTheDocument();
  });

  it('displays instructions for users', () => {
    render(<EmptyPage />);
    expect(screen.getByText(/Add a new Page document in your Sanity Studio/)).toBeInTheDocument();
  });

  it('has link to Medal Social', () => {
    render(<EmptyPage />);
    const link = screen.getByRole('link', { name: /Visit Medal Social/i });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', 'https://www.medalsocial.com');
  });

  it('link opens in new tab', () => {
    render(<EmptyPage />);
    const link = screen.getByRole('link', { name: /Visit Medal Social/i });
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
