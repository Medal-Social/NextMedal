import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// Mock next-themes
const mockSetTheme = vi.fn();
vi.mock('next-themes', () => ({
  useTheme: () => ({
    resolvedTheme: 'light',
    setTheme: mockSetTheme,
  }),
}));

import { ThemeToggle } from '@/components/ThemeToggle';

describe('ThemeToggle', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders toggle button', () => {
    render(<ThemeToggle />);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('has accessible label', () => {
    render(<ThemeToggle />);
    expect(screen.getByLabelText('Toggle theme')).toBeInTheDocument();
  });

  it('has screen reader text', () => {
    render(<ThemeToggle />);
    expect(screen.getByText('Toggle theme')).toBeInTheDocument();
  });

  it('calls setTheme when clicked', async () => {
    const user = userEvent.setup();
    render(<ThemeToggle />);

    await user.click(screen.getByRole('button'));
    expect(mockSetTheme).toHaveBeenCalledWith('dark');
  });

  it('uses ghost variant styling', () => {
    render(<ThemeToggle />);
    const button = screen.getByRole('button');
    // Ghost variant has hover:bg-muted styling
    expect(button).toHaveClass('hover:bg-muted');
  });

  it('has icon size', () => {
    render(<ThemeToggle />);
    const button = screen.getByRole('button');
    // Icon size variant
    expect(button).toHaveClass('size-9');
  });
});
