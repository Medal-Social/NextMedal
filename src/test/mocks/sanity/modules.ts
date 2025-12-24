/**
 * Sanity Module Mock Factories
 * @description Factories for creating mock Sanity module types
 */

import {
  createMockCta,
  createMockIcon,
  createMockImage,
  createMockImg,
  createMockMenuItem,
  createMockPortableText,
  generateKey,
} from './helpers';
import type {
  MockAccordionListModule,
  MockBlogFrontpageModule,
  MockBreadcrumbsModule,
  MockCalloutModule,
  MockComponentGalleryModule,
  MockFeaturesModule,
  MockHeroModule,
  MockLatestArticlesModule,
  MockLogoCloudModule,
  MockModule,
  MockPricingComparisonModule,
  MockPricingListModule,
  MockProductComparisonModule,
  MockRichtextModule,
  MockTeamModule,
  MockVideoHeroModule,
} from './types';

// ============================================================================
// Module Factories
// ============================================================================

export function createMockHeroModule(overrides?: Partial<MockHeroModule>): MockHeroModule {
  return {
    _type: 'hero',
    _key: generateKey(),
    options: { uid: 'hero-section' },
    content: createMockPortableText([
      'Welcome to Our Platform',
      'Build amazing products with our cutting-edge tools.',
    ]),
    ctas: [
      createMockCta({
        link: createMockMenuItem({
          label: 'Get Started',
          type: 'external',
          externalLink: 'https://example.com/signup',
        }),
        style: 'primary',
      }),
      createMockCta({
        link: createMockMenuItem({
          label: 'Learn More',
          type: 'external',
          externalLink: 'https://example.com/about',
        }),
        style: 'ghost',
      }),
    ],
    videoType: 'image',
    image: createMockImg(),
    ...overrides,
  };
}

export function createMockCalloutModule(overrides?: Partial<MockCalloutModule>): MockCalloutModule {
  return {
    _type: 'callout',
    _key: generateKey(),
    uid: 'callout-section',
    content: createMockPortableText([
      'Ready to get started?',
      'Join thousands of satisfied customers today.',
    ]),
    ctas: [
      createMockCta({
        link: createMockMenuItem({ label: 'Sign Up Now' }),
      }),
    ],
    ...overrides,
  };
}

export function createMockAccordionListModule(
  overrides?: Partial<MockAccordionListModule>
): MockAccordionListModule {
  return {
    _type: 'accordion-list',
    _key: generateKey(),
    options: { uid: 'faq-section' },
    content: createMockPortableText(['Frequently Asked Questions']),
    items: [
      {
        _key: generateKey(),
        summary: 'What is this product?',
        content: createMockPortableText([
          'This is a comprehensive solution for modern web development.',
        ]),
        open: false,
      },
      {
        _key: generateKey(),
        summary: 'How do I get started?',
        content: createMockPortableText([
          'Simply sign up for an account and follow our quick start guide.',
        ]),
        open: false,
      },
    ],
    generateSchema: true,
    ...overrides,
  };
}

export function createMockBlogFrontpageModule(
  overrides?: Partial<MockBlogFrontpageModule>
): MockBlogFrontpageModule {
  return {
    _type: 'blog-frontpage',
    _key: generateKey(),
    mainPost: 'recent',
    showFeaturedPostsFirst: true,
    itemsPerPage: 6,
    ...overrides,
  };
}

export function createMockLatestArticlesModule(
  overrides?: Partial<MockLatestArticlesModule>
): MockLatestArticlesModule {
  return {
    _type: 'latest-articles',
    _key: generateKey(),
    pretitle: 'Blog',
    intro: createMockPortableText(['Latest Articles']),
    layout: 'carousel',
    showFeaturedPostsFirst: true,
    displayFilters: false,
    limit: 6,
    ...overrides,
  };
}

export function createMockBreadcrumbsModule(
  overrides?: Partial<MockBreadcrumbsModule>
): MockBreadcrumbsModule {
  return {
    _type: 'breadcrumbs',
    _key: generateKey(),
    crumbs: [
      createMockMenuItem({ label: 'Home', type: 'internal' }),
      createMockMenuItem({ label: 'Products', type: 'internal' }),
    ],
    hideCurrent: false,
    ...overrides,
  };
}

export function createMockFeaturesModule(
  overrides?: Partial<MockFeaturesModule>
): MockFeaturesModule {
  return {
    _type: 'features',
    _key: generateKey(),
    options: { uid: 'features-section' },
    pretitle: 'Features',
    intro: createMockPortableText(['Everything you need to succeed']),
    items: [
      {
        _key: generateKey(),
        icon: createMockIcon('zap'),
        summary: 'Lightning Speed',
        content: createMockPortableText(['Experience blazing fast performance.']),
      },
      {
        _key: generateKey(),
        icon: createMockIcon('shield'),
        summary: 'Enterprise Security',
        content: createMockPortableText(['Bank-level security for your data.']),
      },
    ],
    ...overrides,
  };
}

export function createMockLogoCloudModule(
  overrides?: Partial<MockLogoCloudModule>
): MockLogoCloudModule {
  return {
    _type: 'logo-cloud',
    _key: generateKey(),
    options: { uid: 'logo-cloud' },
    content: createMockPortableText(['Trusted by Industry Leaders']),
    logos: [],
    ...overrides,
  };
}

export function createMockTeamModule(overrides?: Partial<MockTeamModule>): MockTeamModule {
  return {
    _type: 'team',
    _key: generateKey(),
    options: { uid: 'team-section' },
    pretitle: 'Our Team',
    intro: createMockPortableText(['Meet the people behind our success']),
    people: [],
    layout: 'carousel',
    ...overrides,
  };
}

export function createMockPricingComparisonModule(
  overrides?: Partial<MockPricingComparisonModule>
): MockPricingComparisonModule {
  return {
    _type: 'pricing-comparison',
    _key: generateKey(),
    options: { uid: 'pricing-comparison' },
    title: 'Compare Plans',
    description: 'Choose the plan that fits your needs',
    tiers: [
      {
        _key: generateKey(),
        name: 'Starter',
        price: '$9/mo',
        description: 'Perfect for individuals',
        cta: createMockCta({
          link: createMockMenuItem({ label: 'Start Free' }),
        }),
        popular: false,
      },
      {
        _key: generateKey(),
        name: 'Pro',
        price: '$29/mo',
        description: 'Best for growing teams',
        cta: createMockCta({
          link: createMockMenuItem({ label: 'Get Pro' }),
        }),
        popular: true,
      },
    ],
    featureCategories: [
      {
        _key: generateKey(),
        category: 'Core Features',
        items: [
          {
            _key: generateKey(),
            name: 'Users',
            tooltip: 'Number of team members',
            tiers: ['1', '10'],
          },
        ],
      },
    ],
    ...overrides,
  };
}

export function createMockPricingListModule(
  overrides?: Partial<MockPricingListModule>
): MockPricingListModule {
  return {
    _type: 'pricing-list',
    _key: generateKey(),
    options: { uid: 'pricing-list' },
    pretitle: 'Pricing',
    intro: createMockPortableText(['Simple, transparent pricing']),
    tiers: [],
    ...overrides,
  };
}

export function createMockProductComparisonModule(
  overrides?: Partial<MockProductComparisonModule>
): MockProductComparisonModule {
  return {
    _type: 'product-comparison',
    _key: generateKey(),
    pretitle: 'Compare',
    intro: createMockPortableText(['See how our products stack up']),
    products: [
      { _key: generateKey(), name: 'Basic', highlight: false },
      { _key: generateKey(), name: 'Premium', highlight: true },
    ],
    features: [
      {
        _key: generateKey(),
        name: 'Feature A',
        featureDetails: ['Limited', 'Full'],
      },
    ],
    ...overrides,
  };
}

export function createMockRichtextModule(
  overrides?: Partial<MockRichtextModule>
): MockRichtextModule {
  return {
    _type: 'richtext',
    _key: generateKey(),
    options: { uid: 'richtext-section' },
    content: createMockPortableText([
      'This is a rich text section.',
      'It supports multiple paragraphs and formatting.',
    ]),
    ...overrides,
  };
}

export function createMockComponentGalleryModule(
  overrides?: Partial<MockComponentGalleryModule>
): MockComponentGalleryModule {
  return {
    _type: 'component-gallery',
    _key: generateKey(),
    intro: createMockPortableText(['Component Gallery']),
    groups: [],
    ...overrides,
  };
}

export function createMockVideoHeroModule(
  overrides?: Partial<MockVideoHeroModule>
): MockVideoHeroModule {
  return {
    _type: 'videoHero',
    _key: generateKey(),
    uid: 'video-hero',
    title: 'Watch Our Story',
    type: 'youtube',
    videoId: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    thumbnail: createMockImage(),
    ...overrides,
  };
}

// ============================================================================
// Generic Module Factory
// ============================================================================

export function createMockModule(type: string, overrides?: Partial<MockModule>): MockModule {
  switch (type) {
    case 'hero':
      return createMockHeroModule(overrides as Partial<MockHeroModule>);
    case 'callout':
      return createMockCalloutModule(overrides as Partial<MockCalloutModule>);
    case 'accordion-list':
      return createMockAccordionListModule(overrides as Partial<MockAccordionListModule>);
    case 'blog-frontpage':
      return createMockBlogFrontpageModule(overrides as Partial<MockBlogFrontpageModule>);
    case 'latest-articles':
      return createMockLatestArticlesModule(overrides as Partial<MockLatestArticlesModule>);
    case 'breadcrumbs':
      return createMockBreadcrumbsModule(overrides as Partial<MockBreadcrumbsModule>);
    case 'features':
      return createMockFeaturesModule(overrides as Partial<MockFeaturesModule>);
    case 'logo-cloud':
      return createMockLogoCloudModule(overrides as Partial<MockLogoCloudModule>);
    case 'team':
      return createMockTeamModule(overrides as Partial<MockTeamModule>);
    case 'pricing-comparison':
      return createMockPricingComparisonModule(overrides as Partial<MockPricingComparisonModule>);
    case 'pricing-list':
      return createMockPricingListModule(overrides as Partial<MockPricingListModule>);
    case 'product-comparison':
      return createMockProductComparisonModule(overrides as Partial<MockProductComparisonModule>);
    case 'richtext':
      return createMockRichtextModule(overrides as Partial<MockRichtextModule>);
    case 'videoHero':
      return createMockVideoHeroModule(overrides as Partial<MockVideoHeroModule>);
    case 'component-gallery':
      return createMockComponentGalleryModule(overrides as Partial<MockComponentGalleryModule>);
    default:
      throw new Error(`Unknown module type: ${type}`);
  }
}

// ============================================================================
// Module Types Registry
// ============================================================================

export const MODULE_TYPES = [
  'hero',
  'callout',
  'accordion-list',
  'blog-frontpage',
  'latest-articles',
  'breadcrumbs',
  'features',
  'logo-cloud',
  'team',
  'pricing-comparison',
  'pricing-list',
  'product-comparison',
  'richtext',
  'videoHero',
  'component-gallery',
] as const;

export type ModuleType = (typeof MODULE_TYPES)[number];

export function createAllMockModules(): Record<ModuleType, MockModule> {
  return MODULE_TYPES.reduce(
    (acc, type) => {
      acc[type] = createMockModule(type);
      return acc;
    },
    {} as Record<ModuleType, MockModule>
  );
}
