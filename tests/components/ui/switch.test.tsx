import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { Switch } from '@/components/ui/switch';

/**
 * Switch component tests
 *
 * Focus on BEHAVIOR, not CSS implementation:
 * - Accessibility (ARIA roles, labels, keyboard)
 * - State management (checked, disabled)
 * - User interactions (click, keyboard toggle)
 * - Prop forwarding
 */

describe('Switch', () => {
  describe('Rendering', () => {
    it('renders as a switch role', () => {
      render(<Switch />);
      expect(screen.getByRole('switch')).toBeInTheDocument();
    });

    it('renders thumb element', () => {
      const { container } = render(<Switch />);
      expect(container.querySelector('[data-slot="switch-thumb"]')).toBeInTheDocument();
    });

    it('has data-slot attribute for styling hooks', () => {
      render(<Switch data-testid="switch" />);
      expect(screen.getByTestId('switch')).toHaveAttribute('data-slot', 'switch');
    });
  });

  describe('Props', () => {
    it('applies default size', () => {
      render(<Switch data-testid="switch" />);
      expect(screen.getByTestId('switch')).toHaveAttribute('data-size', 'default');
    });

    it('supports sm size variant', () => {
      render(<Switch size="sm" data-testid="switch" />);
      expect(screen.getByTestId('switch')).toHaveAttribute('data-size', 'sm');
    });

    it('merges custom className with defaults', () => {
      render(<Switch className="my-custom-class" data-testid="switch" />);
      expect(screen.getByTestId('switch')).toHaveClass('my-custom-class');
    });

    it('forwards additional props', () => {
      render(<Switch aria-describedby="description" data-testid="switch" />);
      expect(screen.getByTestId('switch')).toHaveAttribute('aria-describedby', 'description');
    });
  });

  describe('State', () => {
    it('supports defaultChecked initial state', () => {
      render(<Switch defaultChecked data-testid="switch" />);
      expect(screen.getByTestId('switch')).toHaveAttribute('data-checked');
    });

    it('supports disabled state', () => {
      render(<Switch disabled data-testid="switch" />);
      expect(screen.getByTestId('switch')).toHaveAttribute('aria-disabled', 'true');
      expect(screen.getByTestId('switch')).toHaveAttribute('data-disabled');
    });

    it('does not toggle when disabled', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();

      render(<Switch disabled onCheckedChange={onChange} data-testid="switch" />);
      await user.click(screen.getByTestId('switch'));

      expect(onChange).not.toHaveBeenCalled();
    });
  });

  describe('User Interaction', () => {
    it('toggles on click', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();

      render(<Switch onCheckedChange={onChange} />);
      await user.click(screen.getByRole('switch'));

      // base-ui passes (checked, event) to onCheckedChange
      expect(onChange).toHaveBeenCalledWith(true, expect.anything());
    });

    it('toggles on Space key', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();

      render(<Switch onCheckedChange={onChange} />);
      screen.getByRole('switch').focus();
      await user.keyboard(' ');

      expect(onChange).toHaveBeenCalledWith(true, expect.anything());
    });

    it('toggles on Enter key', async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();

      render(<Switch onCheckedChange={onChange} />);
      screen.getByRole('switch').focus();
      await user.keyboard('{Enter}');

      expect(onChange).toHaveBeenCalledWith(true, expect.anything());
    });
  });

  describe('Accessibility', () => {
    it('can be labelled with aria-label', () => {
      render(<Switch aria-label="Enable dark mode" />);
      expect(screen.getByRole('switch', { name: 'Enable dark mode' })).toBeInTheDocument();
    });

    it('is focusable', () => {
      render(<Switch data-testid="switch" />);
      screen.getByTestId('switch').focus();
      expect(screen.getByTestId('switch')).toHaveFocus();
    });

    it('announces checked state to screen readers', () => {
      render(<Switch defaultChecked data-testid="switch" />);
      expect(screen.getByRole('switch')).toHaveAttribute('aria-checked', 'true');
    });

    it('announces unchecked state to screen readers', () => {
      render(<Switch data-testid="switch" />);
      expect(screen.getByRole('switch')).toHaveAttribute('aria-checked', 'false');
    });
  });
});
