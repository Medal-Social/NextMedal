import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import Time from '@/components/blocks/objects/core/Time';

describe('Time', () => {
  it('renders null when value is undefined', () => {
    const { container } = render(<Time />);
    expect(container.firstChild).toBeNull();
  });

  it('renders null when value is empty string', () => {
    const { container } = render(<Time value="" />);
    expect(container.firstChild).toBeNull();
  });

  it('renders time element with datetime attribute', () => {
    const value = '2025-12-31T14:30:00';
    render(<Time value={value} />);
    const timeEl = screen.getByText(/2:30/);
    expect(timeEl.tagName).toBe('TIME');
    expect(timeEl).toHaveAttribute('dateTime', value);
  });

  it('formats time in 12-hour format by default', () => {
    render(<Time value="2025-12-31T14:30:00" />);
    expect(screen.getByText(/2:30\s*PM/i)).toBeInTheDocument();
  });

  it('formats morning time correctly', () => {
    render(<Time value="2025-12-31T09:15:00" />);
    expect(screen.getByText(/9:15\s*AM/i)).toBeInTheDocument();
  });

  it('formats noon correctly', () => {
    render(<Time value="2025-12-31T12:00:00" />);
    expect(screen.getByText(/12:00\s*PM/i)).toBeInTheDocument();
  });

  it('formats midnight correctly', () => {
    render(<Time value="2025-12-31T00:00:00" />);
    expect(screen.getByText(/12:00\s*AM/i)).toBeInTheDocument();
  });

  it('accepts custom format options', () => {
    render(
      <Time
        value="2025-12-31T14:30:00"
        options={{
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
        }}
      />
    );
    expect(screen.getByText('14:30')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(<Time value="2025-12-31T14:30:00" className="custom-time" />);
    const timeEl = screen.getByText(/2:30/);
    expect(timeEl).toHaveClass('custom-time');
  });

  it('forwards additional props', () => {
    render(<Time value="2025-12-31T14:30:00" data-testid="time-element" />);
    expect(screen.getByTestId('time-element')).toBeInTheDocument();
  });

  it('handles ISO date with timezone', () => {
    render(<Time value="2025-12-31T14:30:00Z" />);
    // Time will be displayed in local timezone
    expect(screen.getByRole('time')).toBeInTheDocument();
  });
});
