/**
 * Property Test: Sanity Component Rendering
 * @description Property 37 - For any component receiving valid mock Sanity data,
 * rendering SHALL not throw errors.
 *
 * This test uses fast-check to generate various combinations of mock data
 * and verifies that components render without throwing.
 */

import * as fc from 'fast-check';
import { describe, expect, it, vi } from 'vitest';

// Mock the Sanity fetch module to avoid server-only errors
vi.mock('@/sanity/lib/fetch', () => ({
  fetchSanity: vi.fn().mockResolvedValue(null),
  fetchSanityLive: vi.fn().mockResolvedValue(null),
  sanityFetch: vi.fn().mockResolvedValue({ data: null }),
  SanityLive: () => null,
  getSite: vi.fn().mockResolvedValue({}),
}));

// Mock next/headers for server components
vi.mock('next/headers', () => ({
  draftMode: vi.fn().mockResolvedValue({ isEnabled: false }),
  cookies: vi.fn().mockReturnValue({ get: vi.fn() }),
  headers: vi.fn().mockReturnValue(new Map()),
}));

// Mock next-sanity/live
vi.mock('next-sanity/live', () => ({
  defineLive: vi.fn().mockReturnValue({
    sanityFetch: vi.fn().mockResolvedValue({ data: null }),
    SanityLive: () => null,
  }),
}));

import Modules from '@/ui/modules';
import {
  createMockAccordionListModule,
  createMockBlogFrontpageModule,
  createMockBlogListModule,
  createMockBreadcrumbsModule,
  createMockCalloutModule,
  createMockComponentGalleryModule,
  createMockFeaturesModule,
  createMockHeroModule,
  createMockLatestArticlesModule,
  createMockLogoCloudModule,
  createMockLogoListModule,
  createMockPage,
  createMockPricingComparisonModule,
  createMockPricingListModule,
  createMockProductComparisonModule,
  createMockRichtextModule,
  createMockTeamListModule,
  createMockTeamModule,
  createMockVideoHeroModule,
  MODULE_TYPES,
} from './mocks/sanity';
import { renderWithProviders } from './setup';

// Module factory map for property-based testing
const moduleFactories = {
  hero: createMockHeroModule,
  callout: createMockCalloutModule,
  'accordion-list': createMockAccordionListModule,
  'blog-frontpage': createMockBlogFrontpageModule,
  'blog-list': createMockBlogListModule,
  'latest-articles': createMockLatestArticlesModule,
  breadcrumbs: createMockBreadcrumbsModule,
  'component-gallery': createMockComponentGalleryModule,
  features: createMockFeaturesModule,
  'logo-cloud': createMockLogoCloudModule,
  'logo-list': createMockLogoListModule,
  team: createMockTeamModule,
  'team-list': createMockTeamListModule,
  'pricing-comparison': createMockPricingComparisonModule,
  'pricing-list': createMockPricingListModule,
  'product-comparison': createMockProductComparisonModule,
  richtext: createMockRichtextModule,
  videoHero: createMockVideoHeroModule,
} as const;

// Synchronous module types (excludes async components)
const SYNC_MODULE_TYPES = [
  'hero',
  'callout',
  'accordion-list',
  'blog-list',
  'latest-articles',
  'component-gallery',
  'features',
  'logo-cloud',
  'logo-list',
  'team',
  'team-list',
  'pricing-list',
  'product-comparison',
  'richtext',
  'videoHero',
] as const;

describe('Property 37: Sanity Component Rendering', () => {
  describe('Individual module rendering', () => {
    it.each(SYNC_MODULE_TYPES)('renders %s module without throwing', (moduleType) => {
      const factory = moduleFactories[moduleType];
      const module = factory();

      expect(() => {
        renderWithProviders(<Modules modules={[module as Sanity.Module]} />);
      }).not.toThrow();
    });
  });

  describe('Property-based tests', () => {
    it('renders any single synchronous module without throwing', () => {
      const moduleTypeArb = fc.constantFrom(...SYNC_MODULE_TYPES);

      fc.assert(
        fc.property(moduleTypeArb, (moduleType) => {
          const factory = moduleFactories[moduleType];
          const module = factory();

          expect(() => {
            renderWithProviders(<Modules modules={[module as Sanity.Module]} />);
          }).not.toThrow();
        }),
        { numRuns: 50 }
      );
    });

    it('renders multiple modules together without throwing', () => {
      const modulesArb = fc.array(fc.constantFrom(...SYNC_MODULE_TYPES), {
        minLength: 1,
        maxLength: 5,
      });

      fc.assert(
        fc.property(modulesArb, (moduleTypes) => {
          const modules = moduleTypes.map((type) => {
            const factory = moduleFactories[type];
            return factory() as Sanity.Module;
          });

          expect(() => {
            renderWithProviders(<Modules modules={modules} />);
          }).not.toThrow();
        }),
        { numRuns: 30 }
      );
    });

    it('renders modules with page context without throwing', () => {
      const moduleTypeArb = fc.constantFrom(...SYNC_MODULE_TYPES);

      fc.assert(
        fc.property(moduleTypeArb, (moduleType) => {
          const factory = moduleFactories[moduleType];
          const module = factory();
          const page = createMockPage();

          expect(() => {
            renderWithProviders(
              <Modules modules={[module as Sanity.Module]} page={page as unknown as Sanity.Page} />
            );
          }).not.toThrow();
        }),
        { numRuns: 30 }
      );
    });
  });

  describe('Edge cases', () => {
    it('renders with empty modules array', () => {
      expect(() => {
        renderWithProviders(<Modules modules={[]} />);
      }).not.toThrow();
    });

    it('renders with undefined modules', () => {
      expect(() => {
        renderWithProviders(<Modules modules={undefined} />);
      }).not.toThrow();
    });

    it('renders with null module in array', () => {
      const module = createMockCalloutModule();
      expect(() => {
        renderWithProviders(
          <Modules modules={[null as unknown as Sanity.Module, module as Sanity.Module]} />
        );
      }).not.toThrow();
    });
  });

  describe('Module type coverage', () => {
    it('has factories for all registered module types', () => {
      for (const moduleType of MODULE_TYPES) {
        expect(moduleFactories[moduleType]).toBeDefined();
        expect(typeof moduleFactories[moduleType]).toBe('function');
      }
    });

    it('all factories produce valid module objects', () => {
      for (const moduleType of MODULE_TYPES) {
        const factory = moduleFactories[moduleType];
        const module = factory();

        expect(module._type).toBe(moduleType);
        expect(module._key).toBeDefined();
        expect(typeof module._key).toBe('string');
      }
    });
  });
});
