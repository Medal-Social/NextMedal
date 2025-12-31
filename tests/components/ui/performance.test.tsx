/**
 * Performance Tests
 *
 * Tests for image optimization and animation performance
 * to ensure components follow best practices for PageSpeed Insights.
 */

import { render, screen } from '@testing-library/react';
import * as fc from 'fast-check';
import { describe, expect, it, vi } from 'vitest';

// Mock next/image to capture props - we need to use a native img element
// to test that next/image is being used correctly
vi.mock('next/image', () => ({
  default: vi.fn(({ src, width, height, loading, alt, ...props }) => {
    return (
      // biome-ignore lint/performance/noImgElement: Using img element intentionally for testing next/image mock
      <img
        data-testid="next-image"
        src={typeof src === 'string' ? src : src?.src || ''}
        width={width}
        height={height}
        loading={loading}
        alt={alt}
        data-next-image="true"
        {...props}
      />
    );
  }),
}));

// Mock Sanity image URL builder
vi.mock('@/sanity/lib/image', () => ({
  urlFor: vi.fn(() => ({
    withOptions: vi.fn(() => ({
      url: vi.fn(() => 'https://cdn.sanity.io/images/test/test/image.jpg'),
    })),
  })),
}));

// Mock @sanity/asset-utils
vi.mock('@sanity/asset-utils', () => ({
  getImageDimensions: vi.fn(() => ({ width: 800, height: 600 })),
}));

// Import components after mocks
import { Img, ResponsiveImg } from '@/components/blocks/objects/core';

// Helper to create mock Sanity image - using 'as unknown as' to bypass strict type checking
// since we're mocking the Sanity image structure for testing purposes
const createMockSanityImage = (overrides: Record<string, unknown> = {}) =>
  ({
    _type: 'image',
    asset: {
      _ref: 'image-abc123-800x600-jpg',
      _type: 'reference',
      altText: 'Test image alt text',
    },
    alt: 'Test image',
    loading: 'lazy',
    ...overrides,
  }) as unknown as Sanity.Image;

// Helper to create mock Sanity.Img (responsive image)
const createMockSanityImg = (overrides: Record<string, unknown> = {}) =>
  ({
    _type: 'img',
    image: createMockSanityImage(),
    ...overrides,
  }) as unknown as Sanity.Img;

describe('Performance Tests', () => {
  describe('12.1 Image Optimization Tests', () => {
    describe('Img.tsx Component', () => {
      it('renders using next/image component', () => {
        const mockImage = createMockSanityImage();
        render(<Img image={mockImage} />);

        const img = screen.getByTestId('next-image');
        expect(img).toBeInTheDocument();
        expect(img).toHaveAttribute('data-next-image', 'true');
      });

      it('includes width attribute', () => {
        const mockImage = createMockSanityImage();
        render(<Img image={mockImage} width={800} />);

        const img = screen.getByTestId('next-image');
        expect(img).toHaveAttribute('width', '800');
      });

      it('includes height attribute', () => {
        const mockImage = createMockSanityImage();
        render(<Img image={mockImage} height={600} />);

        const img = screen.getByTestId('next-image');
        expect(img).toHaveAttribute('height', '600');
      });

      it('includes loading attribute with lazy as default', () => {
        const mockImage = createMockSanityImage();
        render(<Img image={mockImage} />);

        const img = screen.getByTestId('next-image');
        expect(img).toHaveAttribute('loading', 'lazy');
      });

      it('supports eager loading when specified', () => {
        const mockImage = createMockSanityImage({ loading: 'eager' });
        render(<Img image={mockImage} />);

        const img = screen.getByTestId('next-image');
        expect(img).toHaveAttribute('loading', 'eager');
      });

      it('includes alt text from image', () => {
        const mockImage = createMockSanityImage({ alt: 'Custom alt text' });
        render(<Img image={mockImage} />);

        const img = screen.getByTestId('next-image');
        expect(img).toHaveAttribute('alt', 'Custom alt text');
      });

      it('returns null when no image is provided', () => {
        const { container } = render(<Img image={undefined} />);
        expect(container.firstChild).toBeNull();
      });
    });

    describe('ResponsiveImg Component', () => {
      it('renders using next/image for main image', () => {
        const mockImg = createMockSanityImg();
        render(<ResponsiveImg img={mockImg} />);

        const img = screen.getByTestId('next-image');
        expect(img).toBeInTheDocument();
        expect(img).toHaveAttribute('data-next-image', 'true');
      });

      it('returns null when no img is provided', () => {
        const { container } = render(<ResponsiveImg img={undefined} />);
        expect(container.firstChild).toBeNull();
      });
    });
  });

  /**
   * **Feature: component-accessibility-testing, Property 13: Image Optimization**
   * For any component rendering images, SHALL use next/image with proper attributes
   * **Validates: Requirements 5.1**
   */
  describe('Property 13: Image Optimization', () => {
    it('for any valid Sanity image, Img component SHALL use next/image with width, height, and loading attributes', () => {
      fc.assert(
        fc.property(
          // Generate valid image dimensions
          fc.record({
            width: fc.integer({ min: 100, max: 2000 }),
            height: fc.integer({ min: 100, max: 2000 }),
            loading: fc.constantFrom('lazy', 'eager'),
            alt: fc.string({ minLength: 1, maxLength: 100 }),
          }),
          ({ width, height, loading, alt }) => {
            const mockImage = createMockSanityImage({
              loading,
              alt,
            });

            const { container } = render(<Img image={mockImage} width={width} height={height} />);
            const img = container.querySelector('[data-next-image="true"]');

            // Property: Image MUST use next/image
            expect(img).not.toBeNull();

            // Property: Image MUST have width attribute
            expect(img).toHaveAttribute('width');

            // Property: Image MUST have height attribute
            expect(img).toHaveAttribute('height');

            // Property: Image MUST have loading attribute (lazy or eager)
            const loadingAttr = img?.getAttribute('loading');
            expect(loadingAttr === 'lazy' || loadingAttr === 'eager').toBe(true);

            // Cleanup
            container.remove();
          }
        ),
        { numRuns: process.env.CI ? 25 : 50 }
      );
    });
  });
});
