import { renderWithProviders as render, screen } from '@tests/setup/providers';
import { describe, expect, it, vi } from 'vitest';

// Mock the date utility functions
vi.mock('@/lib/utils/index', async () => {
  const actual = await vi.importActual('@/lib/utils/index');
  return {
    ...actual,
    formatFullDate: vi.fn((date: string) => `Full: ${date}`),
    formatRelativeDate: vi.fn((date: string) => `Relative: ${date}`),
  };
});

import DateDisplay from '@/components/blocks/objects/core/Date';

describe('DateDisplay', () => {
  it('renders null when value is undefined', () => {
    const { container } = render(<DateDisplay />);
    expect(container.firstChild).toBeNull();
  });

  it('renders null when value is empty string', () => {
    const { container } = render(<DateDisplay value="" />);
    expect(container.firstChild).toBeNull();
  });

  it('renders time element with relative date by default', () => {
    render(<DateDisplay value="2025-12-31" />);
    expect(screen.getByText(/Relative: 2025-12-31/)).toBeInTheDocument();
  });

  it('renders full date when relative is false', () => {
    render(<DateDisplay value="2025-12-31" relative={false} />);
    expect(screen.getByText(/Full: 2025-12-31/)).toBeInTheDocument();
  });

  it('extracts date from ISO datetime string', () => {
    render(<DateDisplay value="2025-12-31T14:30:00" relative={false} />);
    const timeEl = screen.getByRole('time');
    expect(timeEl).toHaveAttribute('dateTime', '2025-12-31');
  });

  it('uses full date string when no T delimiter', () => {
    render(<DateDisplay value="2025-12-31" relative={false} />);
    const timeEl = screen.getByRole('time');
    expect(timeEl).toHaveAttribute('dateTime', '2025-12-31');
  });

  it('applies custom className', () => {
    render(<DateDisplay value="2025-12-31" relative={false} className="custom-date" />);
    const timeEl = screen.getByRole('time');
    expect(timeEl).toHaveClass('custom-date');
  });

  it('forwards additional props when not relative', () => {
    render(<DateDisplay value="2025-12-31" relative={false} data-testid="date-element" />);
    expect(screen.getByTestId('date-element')).toBeInTheDocument();
  });

  it('wraps relative date in tooltip', () => {
    const { container } = render(<DateDisplay value="2025-12-31" />);
    // Tooltip trigger should be present
    const trigger = container.querySelector('[data-slot="tooltip-trigger"]');
    expect(trigger).toBeInTheDocument();
  });

  it('renders as time element for relative display', () => {
    render(<DateDisplay value="2025-12-31" />);
    const timeEl = screen.getByRole('time');
    expect(timeEl).toBeInTheDocument();
  });
});

describe('DateDisplay edge cases', () => {
  it('handles date with time zone', () => {
    render(<DateDisplay value="2025-12-31T14:30:00Z" relative={false} />);
    const timeEl = screen.getByRole('time');
    expect(timeEl).toHaveAttribute('dateTime', '2025-12-31');
  });

  it('handles date with offset', () => {
    render(<DateDisplay value="2025-12-31T14:30:00+01:00" relative={false} />);
    const timeEl = screen.getByRole('time');
    expect(timeEl).toHaveAttribute('dateTime', '2025-12-31');
  });
});
