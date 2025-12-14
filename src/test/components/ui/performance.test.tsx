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
import { Img, ResponsiveImg } from '@/ui/Img';
import Asset from '@/ui/modules/Asset';

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

    describe('Asset.tsx Component', () => {
      it('renders images using ResponsiveImg with next/image', () => {
        const mockAsset = createMockSanityImg();
        render(<Asset asset={mockAsset} />);

        const img = screen.getByTestId('next-image');
        expect(img).toBeInTheDocument();
        expect(img).toHaveAttribute('data-next-image', 'true');
      });

      it('includes width attribute for Asset images', () => {
        const mockAsset = createMockSanityImg();
        render(<Asset asset={mockAsset} />);

        const img = screen.getByTestId('next-image');
        // Asset component passes width={1200}
        expect(img).toHaveAttribute('width');
      });

      it('returns null when no asset is provided', () => {
        const { container } = render(<Asset asset={undefined} />);
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
        { numRuns: 100 }
      );
    });
  });

  describe('12.3 Animation Performance Tests', () => {
    // Layout-triggering properties that should NOT be in animations
    const layoutTriggeringProps = [
      'left',
      'top',
      'right',
      'bottom',
      'margin',
      'padding',
      'width',
      'height',
    ];

    // Performance-friendly properties that SHOULD be used
    const performanceFriendlyProps = ['transform', 'translate', 'scale', 'rotate', 'opacity'];

    describe('LogoList.module.css Animation', () => {
      // Read the actual CSS file
      const fs = require('node:fs');
      const path = require('node:path');
      const cssPath = path.join(process.cwd(), 'src/ui/modules/LogoList.module.css');
      const cssContent = fs.readFileSync(cssPath, 'utf-8');

      it('uses translate (transform) instead of layout-triggering properties', () => {
        // Verify translate is used (transform property)
        expect(cssContent).toContain('translate:');
      });

      it('keyframe animation uses performance-friendly properties only', () => {
        // Extract keyframe content
        const keyframeMatch = cssContent.match(/@keyframes[\s\S]*?\{[\s\S]*?\}/);
        expect(keyframeMatch).not.toBeNull();

        if (keyframeMatch) {
          const keyframeContent = keyframeMatch[0];

          // Verify no layout-triggering properties in animation
          for (const prop of layoutTriggeringProps) {
            const propRegex = new RegExp(`\\b${prop}\\s*:`, 'i');
            expect(propRegex.test(keyframeContent)).toBe(false);
          }

          // Verify performance-friendly properties are used
          const usesPerformanceFriendly = performanceFriendlyProps.some((prop) => {
            const propRegex = new RegExp(`\\b${prop}\\s*:`, 'i');
            return propRegex.test(keyframeContent);
          });
          expect(usesPerformanceFriendly).toBe(true);
        }
      });
    });

    describe('InteractiveDetails.module.css', () => {
      // Read the actual CSS file
      const fs = require('node:fs');
      const path = require('node:path');
      const cssPath = path.join(process.cwd(), 'src/ui/header/InteractiveDetails.module.css');
      const cssContent = fs.readFileSync(cssPath, 'utf-8');

      it('uses translate (transform) for positioning instead of layout-triggering properties', () => {
        // Verify translate is used (transform property)
        expect(cssContent).toContain('translate:');
      });

      it('does not use layout-triggering properties for dynamic positioning', () => {
        // The file uses position: absolute and inset which are acceptable for layout
        // but should not use margin/padding for dynamic positioning
        // Check that translate is used instead of margin-left or left for the offset
        expect(cssContent).not.toMatch(/margin-left\s*:/);
        expect(cssContent).not.toMatch(/margin-right\s*:/);

        // Verify the translate property is used for the offset positioning
        expect(cssContent).toMatch(/translate:\s*-?\d/);
      });
    });
  });

  /**
   * **Feature: component-accessibility-testing, Property 14: Animation Performance**
   * For any CSS animation, SHALL use transform or opacity properties
   * **Validates: Requirements 5.3**
   */
  describe('Property 14: Animation Performance', () => {
    // Read actual CSS files from the project
    const fs = require('node:fs');
    const path = require('node:path');

    // Get all CSS module files that may contain animations
    const cssFiles = [
      { name: 'LogoList.module.css', path: 'src/ui/modules/LogoList.module.css' },
      {
        name: 'InteractiveDetails.module.css',
        path: 'src/ui/header/InteractiveDetails.module.css',
      },
    ];

    // Read CSS content from actual files
    const projectAnimations = cssFiles
      .map((file) => {
        const fullPath = path.join(process.cwd(), file.path);
        try {
          const css = fs.readFileSync(fullPath, 'utf-8');
          return { name: file.name, css };
        } catch {
          return null;
        }
      })
      .filter((item): item is { name: string; css: string } => item !== null);

    // Layout-triggering properties that should NOT be in animations
    const layoutTriggeringProps = [
      'width',
      'height',
      'top',
      'left',
      'right',
      'bottom',
      'margin',
      'padding',
      'border-width',
      'font-size',
    ];

    // Performance-friendly properties that SHOULD be used
    const performanceFriendlyProps = ['transform', 'translate', 'scale', 'rotate', 'opacity'];

    it('for any animation in the codebase, SHALL use transform/translate/opacity instead of layout-triggering properties', () => {
      fc.assert(
        fc.property(fc.constantFrom(...projectAnimations), (animation) => {
          const keyframeMatch = animation.css.match(/@keyframes[\s\S]*?\{[\s\S]*?\}/);

          if (keyframeMatch) {
            const keyframeContent = keyframeMatch[0];

            // Property: Animation MUST NOT use layout-triggering properties
            for (const prop of layoutTriggeringProps) {
              const propRegex = new RegExp(`\\b${prop}\\s*:`, 'i');
              expect(propRegex.test(keyframeContent)).toBe(false);
            }

            // Property: Animation SHOULD use performance-friendly properties
            const usesPerformanceFriendly = performanceFriendlyProps.some((prop) => {
              const propRegex = new RegExp(`\\b${prop}\\s*:`, 'i');
              return propRegex.test(keyframeContent);
            });
            expect(usesPerformanceFriendly).toBe(true);
          }

          return true;
        }),
        { numRuns: 100 }
      );
    });
  });
});
