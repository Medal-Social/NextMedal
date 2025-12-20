/**
 * Tests for Sanity Mock Data Factories
 * @description Verifies that mock factories generate valid data structures
 */

import { describe, expect, it } from 'vitest';
import {
  createAllMockModules,
  createMockBlogCategory,
  createMockBlogPost,
  createMockCta,
  createMockDocument,
  createMockImage,
  createMockImg,
  createMockMetadata,
  createMockModule,
  createMockPage,
  createMockPerson,
  createMockPortableText,
  createMockPortableTextBlock,
  createMockSite,
  createMockSlug,
  MODULE_TYPES,
  mockBlogPost,
  mockPage,
  mockSite,
} from './sanity';

describe('Sanity Mock Factories', () => {
  describe('Helper Functions', () => {
    it('creates a valid mock image', () => {
      const image = createMockImage();
      expect(image._type).toBe('image');
      expect(image.asset._type).toBe('reference');
      expect(image.asset._ref).toBeDefined();
    });

    it('creates a valid mock img wrapper', () => {
      const img = createMockImg();
      expect(img._type).toBe('img');
      expect(img.image._type).toBe('image');
    });

    it('creates a valid mock slug', () => {
      const slug = createMockSlug('test-page');
      expect(slug._type).toBe('slug');
      expect(slug.current).toBe('test-page');
    });

    it('creates a valid portable text block', () => {
      const block = createMockPortableTextBlock('Hello World', 'h1');
      expect(block._type).toBe('block');
      expect(block.style).toBe('h1');
      expect(block.children[0].text).toBe('Hello World');
    });

    it('creates an array of portable text blocks', () => {
      const blocks = createMockPortableText(['First', 'Second']);
      expect(blocks).toHaveLength(2);
      expect(blocks[0].children[0].text).toBe('First');
      expect(blocks[1].children[0].text).toBe('Second');
    });

    it('creates a valid mock CTA', () => {
      const cta = createMockCta({ text: 'Click Me' });
      expect(cta._type).toBe('cta');
      expect(cta.text).toBe('Click Me');
      expect(cta.linkType).toBeDefined();
    });

    it('creates a valid mock metadata', () => {
      const metadata = createMockMetadata();
      expect(metadata.slug).toBeDefined();
      expect(metadata.title).toBeDefined();
      expect(metadata.description).toBeDefined();
    });
  });

  describe('Document Factories', () => {
    it('creates a valid mock page', () => {
      const page = createMockPage();
      expect(page._type).toBe('page');
      expect(page._id).toBeDefined();
      expect(page.title).toBeDefined();
      expect(page.metadata).toBeDefined();
    });

    it('creates a valid mock blog post', () => {
      const post = createMockBlogPost();
      expect(post._type).toBe('blog.post');
      expect(post._id).toBeDefined();
      expect(post.publishDate).toBeDefined();
      expect(post.metadata).toBeDefined();
    });

    it('creates a valid mock blog category', () => {
      const category = createMockBlogCategory();
      expect(category._type).toBe('blog.category');
      expect(category.title).toBeDefined();
      expect(category.slug).toBeDefined();
    });

    it('creates a valid mock person', () => {
      const person = createMockPerson();
      expect(person._type).toBe('person');
      expect(person.name).toBeDefined();
    });

    it('creates a valid mock site', () => {
      const site = createMockSite();
      expect(site._type).toBe('site');
      expect(site.title).toBeDefined();
    });

    it('creates documents using generic factory', () => {
      const page = createMockDocument('page');
      expect(page._type).toBe('page');

      const post = createMockDocument('blog.post');
      expect(post._type).toBe('blog.post');

      const site = createMockDocument('site');
      expect(site._type).toBe('site');
    });

    it('throws error for unknown document type', () => {
      expect(() => createMockDocument('unknown' as 'page')).toThrow('Unknown document type');
    });
  });

  describe('Module Factories', () => {
    it('creates all 17 module types', () => {
      expect(MODULE_TYPES).toHaveLength(17);
    });

    it.each(MODULE_TYPES)('creates a valid %s module', (moduleType) => {
      const module = createMockModule(moduleType);
      expect(module._type).toBe(moduleType);
      expect(module._key).toBeDefined();
    });

    it('creates all mock modules at once', () => {
      const allModules = createAllMockModules();
      expect(Object.keys(allModules)).toHaveLength(17);

      for (const type of MODULE_TYPES) {
        expect(allModules[type]).toBeDefined();
        expect(allModules[type]._type).toBe(type);
      }
    });

    it('throws error for unknown module type', () => {
      expect(() => createMockModule('unknown')).toThrow('Unknown module type');
    });
  });

  describe('Pre-built Mock Data', () => {
    it('provides a pre-built mock page', () => {
      expect(mockPage._type).toBe('page');
      expect(mockPage.modules).toBeDefined();
      expect(mockPage.modules!.length).toBeGreaterThan(0);
    });

    it('provides a pre-built mock blog post', () => {
      expect(mockBlogPost._type).toBe('blog.post');
      expect(mockBlogPost.featured).toBe(true);
    });

    it('provides a pre-built mock site', () => {
      expect(mockSite._type).toBe('site');
      expect(mockSite.title).toBe('NextMedal');
    });
  });
});
