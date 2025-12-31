import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { Slider } from '@/components/ui/slider';

/**
 * Slider component tests
 *
 * Focus on BEHAVIOR, not CSS implementation:
 * - Rendering required elements (track, range, thumb)
 * - Data-slot attributes (stable API contract)
 * - Multi-thumb range behavior
 * - Accessibility (role, orientation)
 */

describe('Slider', () => {
  describe('Rendering', () => {
    it('renders with data-slot attribute', () => {
      render(<Slider data-testid="slider" />);
      expect(screen.getByTestId('slider')).toHaveAttribute('data-slot', 'slider');
    });

    it('renders as a group role for accessibility', () => {
      render(<Slider />);
      expect(screen.getByRole('group')).toBeInTheDocument();
    });

    it('renders track element', () => {
      const { container } = render(<Slider />);
      expect(container.querySelector('[data-slot="slider-track"]')).toBeInTheDocument();
    });

    it('renders range element', () => {
      const { container } = render(<Slider />);
      expect(container.querySelector('[data-slot="slider-range"]')).toBeInTheDocument();
    });

    it('renders thumb element', () => {
      const { container } = render(<Slider />);
      expect(container.querySelector('[data-slot="slider-thumb"]')).toBeInTheDocument();
    });
  });

  describe('Props', () => {
    it('accepts min/max props', () => {
      const { container } = render(<Slider min={10} max={50} />);
      const slider = container.querySelector('[data-slot="slider"]');
      expect(slider).toBeInTheDocument();
    });

    it('applies custom className to control element', () => {
      const { container } = render(<Slider className="custom-slider" />);
      // className is applied to the SliderPrimitive.Control, not the root
      const control = container.querySelector('.custom-slider');
      expect(control).toBeInTheDocument();
    });
  });

  describe('Multi-thumb Range', () => {
    it('renders multiple thumbs for range slider', () => {
      const { container } = render(<Slider defaultValue={[25, 75]} />);
      const thumbs = container.querySelectorAll('[data-slot="slider-thumb"]');
      expect(thumbs).toHaveLength(2);
    });

    it('renders default thumbs when no value provided', () => {
      const { container } = render(<Slider />);
      const thumbs = container.querySelectorAll('[data-slot="slider-thumb"]');
      expect(thumbs.length).toBeGreaterThanOrEqual(1);
    });

    it('renders single thumb with single value', () => {
      const { container } = render(<Slider defaultValue={[50]} />);
      const thumbs = container.querySelectorAll('[data-slot="slider-thumb"]');
      expect(thumbs).toHaveLength(1);
    });
  });
});
