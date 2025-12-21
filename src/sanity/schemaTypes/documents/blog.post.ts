/**
 * Blog Post Schema
 * @version 1.0.0
 * @lastUpdated 2024-03-21
 * @description Defines the structure for blog posts, including content, categories, authors, and metadata.
 * @changelog
 * - 1.0.0: Initial version with core blog post functionality
 */

import { EditIcon, EyeClosedIcon } from '@sanity/icons';
import { defineField, defineType } from 'sanity';
import { imageBlock } from '../fragments';

export default defineType({
  name: 'blog.post',
  title: 'Blog post',
  icon: EditIcon,
  type: 'document',
  groups: [
    { name: 'content', default: true },
    { name: 'options' },
    { name: 'metadata', title: 'SEO & Metadata' },
  ],
  fields: [
    defineField({
      name: 'language',
      type: 'string',
      readOnly: true,
      hidden: true,
    }),
    defineField({
      name: 'body',
      title: 'Content',
      description: 'The main content of the blog post.',
      type: 'array',
      of: [
        {
          type: 'block',
          styles: [
            { title: 'Normal', value: 'normal' },
            { title: 'Heading 2', value: 'h2' },
            { title: 'Heading 3', value: 'h3' },
            { title: 'Heading 4', value: 'h4' },
            { title: 'Quote', value: 'blockquote' },
          ],
        },
        imageBlock,
        { type: 'code' },
        { type: 'video' },
      ],
      group: 'content',
    }),
    defineField({
      name: 'categories',
      title: 'Categories',
      description: 'Categories this post belongs to.',
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
      title: 'Authors',
      description: 'People who contributed to this post.',
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
      title: 'Publish Date',
      description: 'Date when the post is published.',
      type: 'date',
      validation: (Rule) => Rule.required(),
      group: 'content',
    }),
    defineField({
      name: 'featured',
      title: 'Featured',
      description: 'Highlight this post on the blog homepage.',
      type: 'string',
      options: {
        list: [
          { title: 'Standard', value: 'standard' },
          { title: 'Featured', value: 'featured' },
        ],
        layout: 'radio',
      },
      initialValue: 'standard',
      group: 'options',
    }),
    defineField({
      name: 'metadata',
      title: 'SEO & Metadata',
      description: 'Search engine optimization settings.',
      type: 'metadata',
      group: 'metadata',
    }),
  ],
  preview: {
    select: {
      featured: 'featured',
      title: 'metadata.title',
      slug: 'metadata.slug.current',
      publishDate: 'publishDate',
      media: 'metadata.image',
      language: 'language',
      noindex: 'metadata.noIndex',
    },
    prepare: ({ title, slug, publishDate, media, featured, language, noindex }) => {
      const languageLabel =
        language === 'en' ? '🇺🇸 EN' : language === 'nb' ? '🇳🇴 NO' : language?.toUpperCase();

      const subtitle = [languageLabel, publishDate, slug && `/${slug}`].filter(Boolean).join(' • ');

      return {
        title: [featured === 'featured' && '★', title].filter(Boolean).join(' '),
        subtitle,
        media: media || (noindex ? EyeClosedIcon : EditIcon),
      };
    },
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
