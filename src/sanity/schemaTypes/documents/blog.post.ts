/**
 * Blog Post Schema
 * @version 1.0.0
 * @lastUpdated 2024-03-21
 * @description Defines the structure for blog posts, including content, categories, authors, and metadata.
 * @changelog
 * - 1.0.0: Initial version with core blog post functionality
 */

import { VscEdit } from 'react-icons/vsc';
import { defineField, defineType } from 'sanity';
import { imageBlock } from '../fragments';

export default defineType({
  name: 'blog.post',
  title: 'Blog post',
  icon: VscEdit,
  type: 'document',
  groups: [{ name: 'content', default: true }, { name: 'options' }, { name: 'seo', title: 'SEO' }],
  fields: [
    defineField({
      name: 'body',
      type: 'array',
      of: [{ type: 'block' }, imageBlock],
      group: 'content',
    }),
    defineField({
      name: 'categories',
      type: 'array',
      of: [
        {
          type: 'reference',
          to: [{ type: 'blog.category' }],
        },
      ],
      group: 'content',
    }),
    defineField({
      name: 'authors',
      type: 'array',
      of: [
        {
          type: 'reference',
          to: [{ type: 'person' }],
        },
      ],
      group: 'content',
    }),
    defineField({
      name: 'publishDate',
      type: 'date',
      validation: (Rule) => Rule.required(),
      group: 'content',
    }),
    defineField({
      name: 'featured',
      type: 'boolean',
      group: 'options',
      initialValue: false,
    }),
    defineField({
      name: 'hideTableOfContents',
      type: 'boolean',
      group: 'options',
      initialValue: false,
    }),
    defineField({
      name: 'metadata',
      type: 'metadata',
      group: 'seo',
    }),
  ],
  preview: {
    select: {
      featured: 'featured',
      title: 'metadata.title',
      publishDate: 'publishDate',
      media: 'metadata.image',
    },
    prepare: ({ title, publishDate, media, featured }) => ({
      title: [featured && '★', title].filter(Boolean).join(' '),
      subtitle: publishDate,
      media,
    }),
  },
  orderings: [
    {
      title: 'Date',
      name: 'date',
      by: [{ field: 'publishDate', direction: 'desc' }],
    },
    {
      title: 'Title',
      name: 'metadata.title',
      by: [{ field: 'title', direction: 'asc' }],
    },
  ],
});
