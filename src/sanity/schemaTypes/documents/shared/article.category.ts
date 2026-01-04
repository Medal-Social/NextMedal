/**
 * Article Category Schema
 * @version 1.1.0
 * @lastUpdated 2026-01-03
 * @description Defines categories for organizing articles with title and slug.
 * @changelog
 * - 1.1.0: Added language field for translation support
 * - 1.0.1: Renamed from article.category to article.category
 * - 1.0.0: Initial version with basic category structure
 */

import { TagIcon } from '@sanity/icons';
import { defineField, defineType } from 'sanity';

export default defineType({
  name: 'article.category',
  title: 'Article category',
  type: 'document',
  icon: TagIcon,
  fields: [
    defineField({
      name: 'title',
      title: 'Name',
      description:
        'The name of the category (e.g. "Technology", "Design") - localized per language',
      type: 'internationalizedArrayString',
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      description: 'URL-friendly version of the name (shared across all languages).',
      type: 'slug',
      options: {
        source: (doc) => {
          const document = doc as { title?: Array<{ value?: string }> };
          // Use first available language value for slug generation
          return document.title?.[0]?.value || '';
        },
      },
      validation: (Rule) => Rule.required(),
    }),
  ],
  preview: {
    select: {
      title: 'title',
      slug: 'slug.current',
    },
    prepare: ({ title, slug }) => {
      // Extract first available language value from internationalized array
      const titleText =
        Array.isArray(title) && title.length > 0
          ? title[0].value || 'Untitled Category'
          : 'Untitled Category';

      return {
        title: titleText,
        subtitle: `/${slug || 'no-slug'}`,
      };
    },
  },
});
