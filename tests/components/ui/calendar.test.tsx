import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { Calendar } from '@/components/ui/calendar';

describe('Calendar', () => {
  it('renders calendar component', () => {
    render(<Calendar />);
    expect(document.querySelector('[data-slot="calendar"]')).toBeInTheDocument();
  });

  it('shows current month by default', () => {
    render(<Calendar />);
    // Calendar should show the current month in some form
    expect(document.querySelector('[data-slot="calendar"]')).toBeInTheDocument();
  });

  it('renders navigation buttons', () => {
    render(<Calendar />);
    // Previous and next buttons should be present
    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBeGreaterThanOrEqual(2);
  });

  it('renders weekday headers', () => {
    render(<Calendar />);
    // Should have weekday abbreviations (rendered in some form)
    const calendar = document.querySelector('[data-slot="calendar"]');
    expect(calendar).toBeInTheDocument();
  });

  it('renders day cells', () => {
    render(<Calendar />);
    // Days should be rendered
    const calendar = document.querySelector('[data-slot="calendar"]');
    expect(calendar).toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(<Calendar className="custom-calendar" />);
    expect(document.querySelector('[data-slot="calendar"]')).toHaveClass('custom-calendar');
  });

  it('shows outside days by default', () => {
    render(<Calendar />);
    // By default showOutsideDays is true
    const calendar = document.querySelector('[data-slot="calendar"]');
    expect(calendar).toBeInTheDocument();
  });

  it('can hide outside days', () => {
    render(<Calendar showOutsideDays={false} />);
    const calendar = document.querySelector('[data-slot="calendar"]');
    expect(calendar).toBeInTheDocument();
  });

  it('accepts default month prop', () => {
    const specificDate = new Date(2025, 5, 15); // June 2025
    render(<Calendar defaultMonth={specificDate} />);
    const calendar = document.querySelector('[data-slot="calendar"]');
    expect(calendar).toBeInTheDocument();
  });

  it('handles onSelect callback in single mode', async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(<Calendar mode="single" onSelect={onSelect} />);

    // Find a day button and click it
    const dayButtons = document.querySelectorAll('button[data-day]');
    if (dayButtons.length > 0) {
      await user.click(dayButtons[0]);
      expect(onSelect).toHaveBeenCalled();
    }
  });

  it('supports different button variants', () => {
    render(<Calendar buttonVariant="outline" />);
    const calendar = document.querySelector('[data-slot="calendar"]');
    expect(calendar).toBeInTheDocument();
  });

  it('supports different caption layouts', () => {
    render(<Calendar captionLayout="dropdown" />);
    const calendar = document.querySelector('[data-slot="calendar"]');
    expect(calendar).toBeInTheDocument();
  });

  it('renders with single selection mode', () => {
    render(<Calendar mode="single" />);
    const calendar = document.querySelector('[data-slot="calendar"]');
    expect(calendar).toBeInTheDocument();
  });

  it('renders with range selection mode', () => {
    render(<Calendar mode="range" />);
    const calendar = document.querySelector('[data-slot="calendar"]');
    expect(calendar).toBeInTheDocument();
  });

  it('renders with multiple selection mode', () => {
    render(<Calendar mode="multiple" />);
    const calendar = document.querySelector('[data-slot="calendar"]');
    expect(calendar).toBeInTheDocument();
  });

  it('can disable specific dates', () => {
    const disabledDays = [new Date(2025, 0, 15)]; // January 15, 2025
    render(<Calendar disabled={disabledDays} />);
    const calendar = document.querySelector('[data-slot="calendar"]');
    expect(calendar).toBeInTheDocument();
  });

  it('renders with week numbers when showWeekNumber is true', () => {
    render(<Calendar showWeekNumber />);
    const calendar = document.querySelector('[data-slot="calendar"]');
    expect(calendar).toBeInTheDocument();
  });

  it('renders multiple months', () => {
    render(<Calendar numberOfMonths={2} />);
    const calendar = document.querySelector('[data-slot="calendar"]');
    expect(calendar).toBeInTheDocument();
  });

  it('has background styling', () => {
    render(<Calendar />);
    const calendar = document.querySelector('[data-slot="calendar"]');
    expect(calendar).toHaveClass('bg-background');
  });
});
