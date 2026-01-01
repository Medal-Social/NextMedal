/**
 * Article Category Schema
 * @version 1.0.1
 * @lastUpdated 2025-12-31
 * @description Defines categories for organizing articles with title and slug.
 * @changelog
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
      description: 'The name of the category (e.g. "Technology", "Design").',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      description: 'URL-friendly version of the name.',
      type: 'slug',
      options: {
        source: 'title',
      },
      validation: (Rule) => Rule.required(),
    }),
  ],
  preview: {
    select: {
      title: 'title',
      slug: 'slug.current',
    },
    prepare: ({ title, slug }) => ({
      title: title || 'Untitled Category',
      subtitle: slug ? `/${slug}` : 'No slug',
    }),
  },
});
