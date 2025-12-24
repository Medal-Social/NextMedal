/**
 * Sanity Mock Helpers
 * @description Helper functions for generating mock Sanity data
 */

import type {
  MockCta,
  MockIcon,
  MockImage,
  MockImg,
  MockMenuItem,
  MockMetadata,
  MockPortableTextBlock,
  MockSlug,
  MockStat,
} from './types';

// ============================================================================
// ID Generation
// ============================================================================

let idCounter = 0;

/**
 * Generates a unique ID for mock documents
 */
export function generateId(prefix = 'mock'): string {
  return `${prefix}-${++idCounter}-${Date.now()}`;
}

/**
 * Generates a unique key for array items
 */
export function generateKey(): string {
  return `key-${++idCounter}-${Math.random().toString(36).substring(2, 9)}`;
}

// ============================================================================
// Base Type Factories
// ============================================================================

/**
 * Generates a valid Sanity asset ID hash (alphanumeric, no hyphens)
 * Format: image-{hash}-{width}x{height}-{extension}
 */
function generateAssetHash(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let hash = '';
  for (let i = 0; i < 24; i++) {
    hash += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return hash;
}

/**
 * Creates a mock Sanity image reference
 * Uses valid Sanity asset ID format: image-{hash}-{width}x{height}-{extension}
 */
export function createMockImage(overrides?: Partial<MockImage>): MockImage {
  return {
    _type: 'image',
    asset: {
      _ref: `image-${generateAssetHash()}-1200x630-png`,
      _type: 'reference',
    },
    ...overrides,
  };
}

/**
 * Creates a mock img object (wrapper around image)
 */
export function createMockImg(overrides?: Partial<MockImg>): MockImg {
  return {
    _type: 'img',
    image: createMockImage(),
    ...overrides,
  };
}

/**
 * Creates a mock slug
 */
export function createMockSlug(current = 'test-slug'): MockSlug {
  return {
    _type: 'slug',
    current,
  };
}

/**
 * Creates a mock portable text block
 */
export function createMockPortableTextBlock(
  text: string,
  style: MockPortableTextBlock['style'] = 'normal'
): MockPortableTextBlock {
  return {
    _type: 'block',
    _key: generateKey(),
    style,
    children: [
      {
        _type: 'span',
        _key: generateKey(),
        text,
        marks: [],
      },
    ],
    markDefs: [],
  };
}

/**
 * Creates an array of mock portable text blocks
 */
export function createMockPortableText(texts: string[]): MockPortableTextBlock[] {
  return texts.map((text) => createMockPortableTextBlock(text));
}

/**
 * Creates a mock CTA
 */
export function createMockCta(overrides?: Partial<MockCta>): MockCta {
  return {
    _type: 'cta',
    _key: generateKey(),
    link: createMockMenuItem({
      label: 'Learn More',
      type: 'external',
      externalLink: 'https://example.com',
    }),
    style: 'primary',
    ...overrides,
  };
}

/**
 * Creates a mock icon
 */
export function createMockIcon(name = 'star'): MockIcon {
  return {
    _type: 'icon',
    name,
  };
}

/**
 * Creates a mock menu item
 */
export function createMockMenuItem(overrides?: Partial<MockMenuItem>): MockMenuItem {
  return {
    _type: 'menuItem',
    _key: generateKey(),
    type: 'external',
    label: 'Test Link',
    externalLink: 'https://example.com',
    ...overrides,
  };
}

/**
 * Creates a mock stat
 */
export function createMockStat(overrides?: Partial<MockStat>): MockStat {
  return {
    _type: 'stat',
    _key: generateKey(),
    value: '100+',
    label: 'Customers',
    ...overrides,
  };
}

/**
 * Creates a mock metadata object
 */
export function createMockMetadata(overrides?: Partial<MockMetadata>): MockMetadata {
  return {
    slug: createMockSlug(),
    title: 'Test Page Title - SEO Optimized for Search Engines',
    description:
      'This is a test page description that is optimized for search engines and provides valuable information to users.',
    noIndex: false,
    ...overrides,
  };
}
