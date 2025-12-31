import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

// Mock next-themes
vi.mock('next-themes', () => ({
  useTheme: () => ({
    theme: 'light',
  }),
}));

// Mock sonner
vi.mock('sonner', () => ({
  Toaster: ({ theme, className, closeButton, icons, style, toastOptions, ...props }: any) => (
    <div
      data-testid="sonner-toaster"
      data-theme={theme}
      data-close-button={closeButton}
      className={className}
      style={style}
      {...props}
    >
      {icons?.success && <span data-testid="success-icon">{icons.success}</span>}
      {icons?.info && <span data-testid="info-icon">{icons.info}</span>}
      {icons?.warning && <span data-testid="warning-icon">{icons.warning}</span>}
      {icons?.error && <span data-testid="error-icon">{icons.error}</span>}
      {icons?.loading && <span data-testid="loading-icon">{icons.loading}</span>}
    </div>
  ),
}));

import { Toaster } from '@/components/ui/sonner';

describe('Toaster', () => {
  it('renders the toaster component', () => {
    render(<Toaster />);
    expect(screen.getByTestId('sonner-toaster')).toBeInTheDocument();
  });

  it('applies toaster class', () => {
    render(<Toaster />);
    expect(screen.getByTestId('sonner-toaster')).toHaveClass('toaster', 'group');
  });

  it('uses theme from next-themes', () => {
    render(<Toaster />);
    expect(screen.getByTestId('sonner-toaster')).toHaveAttribute('data-theme', 'light');
  });

  it('has close button enabled', () => {
    render(<Toaster />);
    expect(screen.getByTestId('sonner-toaster')).toHaveAttribute('data-close-button', 'true');
  });

  it('includes success icon', () => {
    render(<Toaster />);
    expect(screen.getByTestId('success-icon')).toBeInTheDocument();
  });

  it('includes info icon', () => {
    render(<Toaster />);
    expect(screen.getByTestId('info-icon')).toBeInTheDocument();
  });

  it('includes warning icon', () => {
    render(<Toaster />);
    expect(screen.getByTestId('warning-icon')).toBeInTheDocument();
  });

  it('includes error icon', () => {
    render(<Toaster />);
    expect(screen.getByTestId('error-icon')).toBeInTheDocument();
  });

  it('includes loading icon', () => {
    render(<Toaster />);
    expect(screen.getByTestId('loading-icon')).toBeInTheDocument();
  });

  it('applies custom CSS properties for styling', () => {
    render(<Toaster />);
    const toaster = screen.getByTestId('sonner-toaster');
    const style = toaster.getAttribute('style');
    expect(style).toContain('--normal-bg');
    expect(style).toContain('--normal-text');
    expect(style).toContain('--normal-border');
    expect(style).toContain('--border-radius');
  });

  it('forwards additional props', () => {
    render(<Toaster data-custom="value" />);
    expect(screen.getByTestId('sonner-toaster')).toHaveAttribute('data-custom', 'value');
  });
});
