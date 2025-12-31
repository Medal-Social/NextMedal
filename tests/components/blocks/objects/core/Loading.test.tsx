import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import Loading from '@/components/blocks/objects/core/Loading';

describe('Loading', () => {
  it('renders with default text', () => {
    render(<Loading />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('renders with custom children', () => {
    render(<Loading>Please wait...</Loading>);
    expect(screen.getByText('Please wait...')).toBeInTheDocument();
  });

  it('renders spinner icon', () => {
    const { container } = render(<Loading />);
    const spinner = container.querySelector('.animate-spin');
    expect(spinner).toBeInTheDocument();
  });

  it('applies default flex classes', () => {
    const { container } = render(<Loading />);
    const wrapper = container.firstChild;
    expect(wrapper).toHaveClass('flex', 'items-center', 'gap-2');
  });

  it('merges custom className', () => {
    const { container } = render(<Loading className="custom-loading" />);
    const wrapper = container.firstChild;
    expect(wrapper).toHaveClass('custom-loading');
  });

  it('renders children when provided as JSX', () => {
    render(
      <Loading>
        <span data-testid="custom">Custom content</span>
      </Loading>
    );
    expect(screen.getByTestId('custom')).toBeInTheDocument();
    expect(screen.getByText('Custom content')).toBeInTheDocument();
  });

  it('uses default text when children is empty string', () => {
    render(<Loading>{''}</Loading>);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('uses default text when children is null', () => {
    render(<Loading>{null}</Loading>);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('renders text when children is number', () => {
    render(<Loading>{50}</Loading>);
    expect(screen.getByText('50')).toBeInTheDocument();
  });
});
