/**
 * Sanity Document Mock Factories
 * @description Factories for creating mock Sanity document types
 */

import {
  createMockCta,
  createMockImage,
  createMockMenuItem,
  createMockMetadata,
  createMockPortableText,
  createMockSeo,
  createMockSlug,
  generateId,
  generateKey,
} from './helpers';
import type { MockBlogCategory, MockBlogPost, MockPage, MockPerson, MockSite } from './types';

/**
 * Creates a mock Page document
 */
export function createMockPage(overrides?: Partial<MockPage>): MockPage {
  const now = new Date().toISOString();
  return {
    _id: generateId('page'),
    _type: 'page',
    _createdAt: now,
    _updatedAt: now,
    _rev: generateId('rev'),
    language: 'en',
    title: 'Test Page',
    modules: [],
    metadata: createMockMetadata(),
    seo: createMockSeo(),
    ...overrides,
  };
}

/**
 * Creates a mock Blog Post document
 */
export function createMockBlogPost(overrides?: Partial<MockBlogPost>): MockBlogPost {
  const now = new Date().toISOString();
  return {
    _id: generateId('blog-post'),
    _type: 'blog.post',
    _createdAt: now,
    _updatedAt: now,
    _rev: generateId('rev'),
    language: 'en',
    body: createMockPortableText([
      'This is the first paragraph of the blog post.',
      'This is the second paragraph with more content.',
    ]),
    categories: [],
    authors: [],
    publishDate: new Date().toISOString().split('T')[0],
    featured: false,
    metadata: createMockMetadata({
      slug: createMockSlug('test-blog-post'),
      title: 'Test Blog Post Title - Engaging Content for Readers',
    }),
    seo: createMockSeo({
      description:
        'This is a test blog post description that summarizes the content and encourages readers to click.',
    }),
    ...overrides,
  };
}

/**
 * Creates a mock Blog Category document
 */
export function createMockBlogCategory(overrides?: Partial<MockBlogCategory>): MockBlogCategory {
  const now = new Date().toISOString();
  return {
    _id: generateId('blog-category'),
    _type: 'blog.category',
    _createdAt: now,
    _updatedAt: now,
    _rev: generateId('rev'),
    title: 'Test Category',
    slug: createMockSlug('test-category'),
    ...overrides,
  };
}

/**
 * Creates a mock Person document
 */
export function createMockPerson(overrides?: Partial<MockPerson>): MockPerson {
  const now = new Date().toISOString();
  return {
    _id: generateId('person'),
    _type: 'person',
    _createdAt: now,
    _updatedAt: now,
    _rev: generateId('rev'),
    name: 'John Doe',
    title: 'Software Engineer',
    image: createMockImage(),
    socialLinks: [
      {
        _key: generateKey(),
        platform: 'twitter',
        url: 'https://twitter.com/johndoe',
      },
      {
        _key: generateKey(),
        platform: 'linkedin',
        url: 'https://linkedin.com/in/johndoe',
      },
    ],
    ...overrides,
  };
}

/**
 * Creates a mock Site document
 */
export function createMockSite(overrides?: Partial<MockSite>): MockSite {
  const now = new Date().toISOString();
  return {
    _id: generateId('site'),
    _type: 'site',
    _createdAt: now,
    _updatedAt: now,
    _rev: generateId('rev'),
    language: 'en',
    title: 'Test Site',
    tagline: createMockPortableText(['Building the future of web development']),
    ctas: [
      createMockCta({
        link: createMockMenuItem({ label: 'Get Started' }),
      }),
    ],
    copyright: createMockPortableText(['© 2024 Test Site. All rights reserved.']),
    socialLinks: [
      {
        _type: 'social-link',
        _key: 'twitter',
        text: 'Twitter',
        url: 'https://twitter.com/example',
      },
      {
        _type: 'social-link',
        _key: 'linkedin',
        text: 'LinkedIn',
        url: 'https://linkedin.com/company/example',
      },
    ],
    ...overrides,
  };
}

/**
 * Generic document factory that creates any document type
 */
export function createMockDocument(type: 'page', overrides?: Partial<MockPage>): MockPage;
export function createMockDocument(
  type: 'blog.post',
  overrides?: Partial<MockBlogPost>
): MockBlogPost;
export function createMockDocument(
  type: 'blog.category',
  overrides?: Partial<MockBlogCategory>
): MockBlogCategory;
export function createMockDocument(type: 'person', overrides?: Partial<MockPerson>): MockPerson;
export function createMockDocument(type: 'site', overrides?: Partial<MockSite>): MockSite;
export function createMockDocument(
  type: string,
  overrides?: Record<string, unknown>
): MockPage | MockBlogPost | MockBlogCategory | MockPerson | MockSite {
  switch (type) {
    case 'page':
      return createMockPage(overrides as Partial<MockPage>);
    case 'blog.post':
      return createMockBlogPost(overrides as Partial<MockBlogPost>);
    case 'blog.category':
      return createMockBlogCategory(overrides as Partial<MockBlogCategory>);
    case 'person':
      return createMockPerson(overrides as Partial<MockPerson>);
    case 'site':
      return createMockSite(overrides as Partial<MockSite>);
    default:
      throw new Error(`Unknown document type: ${type}`);
  }
}
