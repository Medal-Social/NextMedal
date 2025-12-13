/**
 * Sanity Mock Fixtures
 * @description Pre-built mock data for common testing scenarios
 */

import { createMockBlogPost, createMockPage, createMockSite } from './documents';
import { createMockMetadata, createMockPortableText, createMockSlug } from './helpers';
import {
  createMockCalloutModule,
  createMockFeatureGridModule,
  createMockHeroModule,
} from './modules';

/**
 * Pre-built mock page with common modules
 */
export const mockPage = createMockPage({
  title: 'Home Page',
  modules: [createMockHeroModule(), createMockFeatureGridModule(), createMockCalloutModule()],
  metadata: createMockMetadata({
    slug: createMockSlug('index'),
    title: 'Home - Your Trusted Platform for Modern Development',
    description:
      'Discover the best tools and resources for modern web development. Start building amazing products today.',
  }),
});

/**
 * Pre-built mock blog post
 */
export const mockBlogPost = createMockBlogPost({
  metadata: createMockMetadata({
    slug: createMockSlug('getting-started-guide'),
    title: 'Getting Started Guide - Everything You Need to Know',
    description:
      'Learn how to get started with our platform in this comprehensive guide covering all the basics.',
  }),
  featured: true,
});

/**
 * Pre-built mock site settings
 */
export const mockSite = createMockSite({
  title: 'NextMedal',
  tagline: createMockPortableText(['Building the future of web development']),
});
