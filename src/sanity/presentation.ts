'use client';

import { groq } from 'next-sanity';
import { defineLocations, presentationTool } from 'sanity/presentation';
import { DEFAULT_COLLECTION_SLUGS } from '@/lib/collections/generated/collections.generated';

export const presentation = presentationTool({
  name: 'editor',
  title: 'Editor',
  previewUrl: {
    previewMode: {
      enable: '/api/draft-mode/enable',
    },
  },
  resolve: {
    mainDocuments: [
      {
        route: '/',
        filter: groq`_type == 'page' && metadata.slug.current == 'index'`,
      },
      {
        route: '/:slug',
        filter: groq`
					_type == 'page' &&
					array::join([...parent[]->metadata.slug.current, metadata.slug.current], '/') == $slug
				`,
      },
      {
        route: '/:collection/:slug',
        filter: groq`_type in ['collection.article', 'collection.newsletter', 'collection.documentation'] && metadata.slug.current == $slug`,
      },
    ],
    locations: {
      site: defineLocations({
        message: 'This document is used on all pages',
        locations: [
          {
            title: 'Home',
            href: '/',
          },
        ],
      }),
      page: defineLocations({
        select: {
          title: 'metadata.title',
          parent1: 'parent.0.metadata.slug.current',
          parent2: 'parent.1.metadata.slug.current',
          parent3: 'parent.2.metadata.slug.current',
          slug: 'metadata.slug.current',
        },
        resolve: (doc) => ({
          locations: [
            {
              title: doc?.title || 'Untitled',
              href: [
                doc?.parent1 &&
                  `/${[doc.parent1, doc.parent2, doc.parent3].filter(Boolean).join('/')}`,
                doc?.slug ? (doc.slug === 'index' ? '/' : `/${doc.slug}`) : '/',
              ]
                .filter(Boolean)
                .join(''),
            },
          ],
        }),
      }),
      'collection.article': defineLocations({
        select: {
          title: 'metadata.title',
          slug: 'metadata.slug.current',
        },
        resolve: (doc) => ({
          locations: [
            {
              title: doc?.title || 'Untitled',
              href: doc?.slug
                ? `/${DEFAULT_COLLECTION_SLUGS['collection.article']}/${doc.slug}`
                : `/${DEFAULT_COLLECTION_SLUGS['collection.article']}`,
            },
          ],
        }),
      }),
      'collection.newsletter': defineLocations({
        select: {
          title: 'metadata.title',
          slug: 'metadata.slug.current',
        },
        resolve: (doc) => ({
          locations: [
            {
              title: doc?.title || 'Untitled',
              href: doc?.slug
                ? `/${DEFAULT_COLLECTION_SLUGS['collection.newsletter']}/${doc.slug}`
                : `/${DEFAULT_COLLECTION_SLUGS['collection.newsletter']}`,
            },
          ],
        }),
      }),
      'collection.documentation': defineLocations({
        select: {
          title: 'metadata.title',
          slug: 'metadata.slug.current',
        },
        resolve: (doc) => ({
          locations: [
            {
              title: doc?.title || 'Untitled',
              href: doc?.slug
                ? `/${DEFAULT_COLLECTION_SLUGS['collection.documentation']}/${doc.slug}`
                : `/${DEFAULT_COLLECTION_SLUGS['collection.documentation']}`,
            },
          ],
        }),
      }),
      'article.category': defineLocations({
        select: {
          title: 'title',
          slug: 'slug.current',
        },
        resolve: (doc) => ({
          locations: [
            {
              title: doc?.title || 'Untitled',
              href: doc?.slug
                ? `/${DEFAULT_COLLECTION_SLUGS['collection.article']}?category=${doc.slug}`
                : `/${DEFAULT_COLLECTION_SLUGS['collection.article']}`,
            },
          ],
        }),
      }),
      help: defineLocations({
        select: {
          title: 'metadata.title',
          parent1: 'parent.0.metadata.slug.current',
          parent2: 'parent.1.metadata.slug.current',
          parent3: 'parent.2.metadata.slug.current',
          slug: 'metadata.slug.current',
        },
        resolve: (doc) => ({
          locations: [
            {
              title: doc?.title || 'Untitled',
              href: [
                doc?.parent1 &&
                  `/help/${[doc.parent1, doc.parent2, doc.parent3].filter(Boolean).join('/')}`,
                doc?.slug ? (doc.slug === 'index' ? '/' : `/${doc.slug}`) : '/',
              ]
                .filter(Boolean)
                .join(''),
            },
          ],
        }),
      }),
      'help-page': defineLocations({
        select: {
          title: 'title',
        },
        resolve: (doc) => ({
          locations: [
            {
              title: doc?.title || 'Untitled',
              href: '/help',
            },
          ],
        }),
      }),
      event: defineLocations({
        select: {
          title: 'title',
          slug: 'metadata.slug.current',
        },
        resolve: (doc) => ({
          locations: [
            {
              title: doc?.title || 'Untitled',
              href: doc?.slug
                ? `/${DEFAULT_COLLECTION_SLUGS['collection.events']}/${doc.slug}`
                : `/${DEFAULT_COLLECTION_SLUGS['collection.events']}`,
            },
          ],
        }),
      }),
    },
  },
});
