import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { Checkbox } from '@/components/ui/checkbox';

describe('Checkbox', () => {
  it('renders with data-slot attribute', () => {
    render(<Checkbox data-testid="checkbox" />);
    expect(screen.getByTestId('checkbox')).toHaveAttribute('data-slot', 'checkbox');
  });

  it('renders as a button role by default', () => {
    render(<Checkbox />);
    expect(screen.getByRole('checkbox')).toBeInTheDocument();
  });

  it('has correct size classes', () => {
    render(<Checkbox data-testid="checkbox" />);
    expect(screen.getByTestId('checkbox')).toHaveClass('size-4');
  });

  it('applies border and background classes', () => {
    render(<Checkbox data-testid="checkbox" />);
    const checkbox = screen.getByTestId('checkbox');
    expect(checkbox).toHaveClass('border', 'border-input', 'rounded-[4px]');
  });

  it('applies focus-visible classes', () => {
    render(<Checkbox data-testid="checkbox" />);
    const checkbox = screen.getByTestId('checkbox');
    expect(checkbox).toHaveClass('focus-visible:border-ring', 'focus-visible:ring-[3px]');
  });

  it('supports disabled state', () => {
    render(<Checkbox disabled data-testid="checkbox" />);
    expect(screen.getByTestId('checkbox')).toHaveAttribute('aria-disabled', 'true');
    expect(screen.getByTestId('checkbox')).toHaveAttribute('data-disabled');
  });

  it('has disabled styling classes', () => {
    render(<Checkbox data-testid="checkbox" />);
    const checkbox = screen.getByTestId('checkbox');
    expect(checkbox).toHaveClass('disabled:cursor-not-allowed', 'disabled:opacity-50');
  });

  it('merges custom className', () => {
    render(<Checkbox className="custom-checkbox" data-testid="checkbox" />);
    expect(screen.getByTestId('checkbox')).toHaveClass('custom-checkbox');
  });

  it('forwards additional props', () => {
    render(<Checkbox data-testid="checkbox" aria-label="Accept terms" />);
    expect(screen.getByTestId('checkbox')).toHaveAttribute('aria-label', 'Accept terms');
  });

  it('supports defaultChecked', () => {
    render(<Checkbox defaultChecked data-testid="checkbox" />);
    expect(screen.getByTestId('checkbox')).toHaveAttribute('data-checked');
  });

  it('renders indicator when checked', () => {
    const { container } = render(<Checkbox defaultChecked />);
    expect(container.querySelector('[data-slot="checkbox-indicator"]')).toBeInTheDocument();
  });

  it('has shadow styling', () => {
    render(<Checkbox data-testid="checkbox" />);
    expect(screen.getByTestId('checkbox')).toHaveClass('shadow-xs');
  });

  it('has aria-invalid styling', () => {
    render(<Checkbox data-testid="checkbox" />);
    const checkbox = screen.getByTestId('checkbox');
    expect(checkbox).toHaveClass('aria-invalid:border-destructive', 'aria-invalid:ring-[3px]');
  });
});

describe('Checkbox accessibility', () => {
  it('can be labelled with aria-label', () => {
    render(<Checkbox aria-label="Remember me" />);
    expect(screen.getByRole('checkbox', { name: 'Remember me' })).toBeInTheDocument();
  });

  it('has proper touch target area', () => {
    render(<Checkbox data-testid="checkbox" />);
    expect(screen.getByTestId('checkbox')).toHaveClass(
      'after:absolute',
      'after:-inset-x-3',
      'after:-inset-y-2'
    );
  });
});
