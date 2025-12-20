/**
 * Sanity Module Mock Factories
 * @description Factories for creating mock Sanity module types
 */

import {
  createMockCta,
  createMockIcon,
  createMockImage,
  createMockImg,
  createMockLink,
  createMockPortableText,
  createMockStat,
  generateKey,
} from './helpers';
import type {
  MockAccordionListModule,
  MockBlogFrontpageModule,
  MockBlogListModule,
  MockBlogPostContentModule,
  MockBreadcrumbsModule,
  MockCalloutModule,
  MockFeaturedHeroModule,
  MockFeatureGridModule,
  MockGalleryHeroModule,
  MockHeroModule,
  MockLogoListModule,
  MockModule,
  MockPersonListModule,
  MockPricingComparisonModule,
  MockPricingListModule,
  MockProductComparisonModule,
  MockRichtextModule,
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
      {
        _key: generateKey(),
        text: 'Get Started',
        linkType: 'external',
        externalLink: 'https://example.com/signup',
        style: 'default',
      },
      {
        _key: generateKey(),
        text: 'Learn More',
        linkType: 'external',
        externalLink: 'https://example.com/about',
        style: 'outline',
      },
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
    ctas: [createMockCta({ text: 'Sign Up Now' })],
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
    isFullWidth: false,
    pretitle: 'FAQ',
    intro: createMockPortableText(['Frequently Asked Questions']),
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
    layout: 'vertical',
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

export function createMockBlogListModule(
  overrides?: Partial<MockBlogListModule>
): MockBlogListModule {
  return {
    _type: 'blog-list',
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

export function createMockBlogPostContentModule(
  overrides?: Partial<MockBlogPostContentModule>
): MockBlogPostContentModule {
  return {
    _type: 'blog-post-content',
    _key: generateKey(),
    options: { uid: 'blog-content' },
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
      createMockLink({ label: 'Home', type: 'internal' }),
      createMockLink({ label: 'Products', type: 'internal' }),
    ],
    hideCurrent: false,
    ...overrides,
  };
}

export function createMockFeatureGridModule(
  overrides?: Partial<MockFeatureGridModule>
): MockFeatureGridModule {
  return {
    _type: 'feature-grid',
    _key: generateKey(),
    options: { uid: 'features-section' },
    showBorder: false,
    pretitle: 'Features',
    intro: createMockPortableText(['Everything you need to succeed']),
    items: [
      {
        _key: generateKey(),
        icon: createMockIcon('zap'),
        pretitle: 'Fast',
        summary: 'Lightning Speed',
        content: createMockPortableText(['Experience blazing fast performance.']),
      },
      {
        _key: generateKey(),
        icon: createMockIcon('shield'),
        pretitle: 'Secure',
        summary: 'Enterprise Security',
        content: createMockPortableText(['Bank-level security for your data.']),
      },
    ],
    layout: 'vertical',
    textAlign: 'center',
    columns: 3,
    ...overrides,
  };
}

export function createMockFeaturedHeroModule(
  overrides?: Partial<MockFeaturedHeroModule>
): MockFeaturedHeroModule {
  return {
    _type: 'featuredHero',
    _key: generateKey(),
    options: { uid: 'featured-hero' },
    pretitle: 'New Feature',
    content: createMockPortableText([
      'Introducing Our Latest Innovation',
      'Transform the way you work with our new tools.',
    ]),
    ctas: [createMockCta({ text: 'Try It Now' })],
    videoType: 'image',
    image: createMockImg(),
    textAlign: 'left',
    ...overrides,
  };
}

export function createMockGalleryHeroModule(
  overrides?: Partial<MockGalleryHeroModule>
): MockGalleryHeroModule {
  return {
    _type: 'galleryHero',
    _key: generateKey(),
    pretitle: 'Gallery',
    content: createMockPortableText(['Explore Our Work']),
    ctas: [createMockCta({ text: 'View All' })],
    stats: [
      createMockStat({ value: '500+', label: 'Projects' }),
      createMockStat({ value: '100+', label: 'Clients' }),
    ],
    assets: [createMockImg(), createMockImg()],
    alignment: 'center',
    options: { uid: 'gallery-hero' },
    ...overrides,
  };
}

export function createMockLogoListModule(
  overrides?: Partial<MockLogoListModule>
): MockLogoListModule {
  return {
    _type: 'logo-list',
    _key: generateKey(),
    options: { uid: 'logo-list' },
    pretitle: 'Trusted By',
    intro: createMockPortableText(['Industry leaders trust our platform']),
    logos: [],
    logoType: 'default',
    autoScroll: false,
    duration: 12,
    ...overrides,
  };
}

export function createMockPersonListModule(
  overrides?: Partial<MockPersonListModule>
): MockPersonListModule {
  return {
    _type: 'person-list',
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
        cta: createMockCta({ text: 'Start Free' }),
        popular: false,
      },
      {
        _key: generateKey(),
        name: 'Pro',
        price: '$29/mo',
        description: 'Best for growing teams',
        cta: createMockCta({ text: 'Get Pro' }),
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
    _type: 'richtext-module',
    _key: generateKey(),
    options: { uid: 'richtext-section' },
    content: createMockPortableText([
      'This is a rich text section.',
      'It supports multiple paragraphs and formatting.',
    ]),
    tableOfContents: false,
    tocPosition: 'right',
    stretch: false,
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
    case 'blog-list':
      return createMockBlogListModule(overrides as Partial<MockBlogListModule>);
    case 'blog-post-content':
      return createMockBlogPostContentModule(overrides as Partial<MockBlogPostContentModule>);
    case 'breadcrumbs':
      return createMockBreadcrumbsModule(overrides as Partial<MockBreadcrumbsModule>);
    case 'feature-grid':
      return createMockFeatureGridModule(overrides as Partial<MockFeatureGridModule>);
    case 'featuredHero':
      return createMockFeaturedHeroModule(overrides as Partial<MockFeaturedHeroModule>);
    case 'galleryHero':
      return createMockGalleryHeroModule(overrides as Partial<MockGalleryHeroModule>);
    case 'logo-list':
      return createMockLogoListModule(overrides as Partial<MockLogoListModule>);
    case 'person-list':
      return createMockPersonListModule(overrides as Partial<MockPersonListModule>);
    case 'pricing-comparison':
      return createMockPricingComparisonModule(overrides as Partial<MockPricingComparisonModule>);
    case 'pricing-list':
      return createMockPricingListModule(overrides as Partial<MockPricingListModule>);
    case 'product-comparison':
      return createMockProductComparisonModule(overrides as Partial<MockProductComparisonModule>);
    case 'richtext-module':
      return createMockRichtextModule(overrides as Partial<MockRichtextModule>);
    case 'videoHero':
      return createMockVideoHeroModule(overrides as Partial<MockVideoHeroModule>);
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
  'blog-list',
  'blog-post-content',
  'breadcrumbs',
  'feature-grid',
  'featuredHero',
  'galleryHero',
  'logo-list',
  'person-list',
  'pricing-comparison',
  'pricing-list',
  'product-comparison',
  'richtext-module',
  'videoHero',
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
