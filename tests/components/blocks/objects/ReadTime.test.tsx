import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import ReadTime from '@/components/blocks/modules/frontpage/articles/ReadTime';

// Mock next-intl
vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => {
    const translations: Record<string, string> = {
      minute: 'minute',
      minutes: 'minutes',
    };
    return translations[key] || key;
  },
}));

describe('ReadTime', () => {
  it('renders with value', () => {
    render(<ReadTime value={5} />);
    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByText('minutes')).toBeInTheDocument();
  });

  it('renders singular minute for 1 minute', () => {
    render(<ReadTime value={1} />);
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('minute')).toBeInTheDocument();
  });

  it('rounds up fractional values', () => {
    render(<ReadTime value={2.3} />);
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('rounds up small fractional values', () => {
    render(<ReadTime value={0.5} />);
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('minute')).toBeInTheDocument();
  });

  it('renders clock icon', () => {
    const { container } = render(<ReadTime value={5} />);
    const icon = container.querySelector('svg.size-4');
    expect(icon).toBeInTheDocument();
  });

  it('applies flex layout', () => {
    const { container } = render(<ReadTime value={5} />);
    const wrapper = container.firstChild;
    expect(wrapper).toHaveClass('flex', 'items-center', 'gap-x-1');
  });

  it('applies font-numeric class to number', () => {
    render(<ReadTime value={5} />);
    const numberSpan = screen.getByText('5');
    expect(numberSpan).toHaveClass('font-numeric');
  });

  it('forwards additional props', () => {
    render(<ReadTime value={5} data-testid="read-time" />);
    expect(screen.getByTestId('read-time')).toBeInTheDocument();
  });

  it('handles large values', () => {
    render(<ReadTime value={120} />);
    expect(screen.getByText('120')).toBeInTheDocument();
    expect(screen.getByText('minutes')).toBeInTheDocument();
  });

  it('handles zero value', () => {
    render(<ReadTime value={0} />);
    expect(screen.getByText('0')).toBeInTheDocument();
    expect(screen.getByText('minutes')).toBeInTheDocument();
  });
});
