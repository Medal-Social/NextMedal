/**
 * Brand/Logo Schema
 * @version 1.0.1
 * @lastUpdated 2025-12-23
 * @description Central place to manage brand assets like logos.
 * @changelog
 * - 1.0.1: Updated header documentation
 * - 1.0.0: Initial version
 */

import { CheckmarkCircleIcon } from '@sanity/icons';
import { defineField, defineType } from 'sanity';

export default defineType({
  name: 'logo',
  title: 'Brand',
  icon: CheckmarkCircleIcon,
  type: 'document',
  fieldsets: [
    {
      name: 'brand-info',
      title: 'Brand Info',
      options: { columns: 2 },
    },
  ],
  fields: [
    defineField({
      name: 'title',
      title: 'Brand Name',
      description: 'The name of the brand.',
      type: 'string',
      fieldset: 'brand-info',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'link',
      title: 'Link',
      description: 'Optional link for the logo (usually the home page).',
      type: 'url',
      fieldset: 'brand-info',
    }),
    defineField({
      name: 'image',
      title: 'Assets',
      type: 'object',
      description: 'Upload SVG or transparent PNG.',
      options: {
        columns: 2,
      },
      fields: [
        defineField({
          name: 'default',
          title: 'Primary Logo',
          description: 'For light backgrounds.',
          type: 'image',
          options: {
            hotspot: true,
            accept: 'image/svg+xml,image/png',
          },
          validation: (Rule) => Rule.required(),
        }),
        defineField({
          name: 'dark',
          title: 'Dark Mode',
          description: 'For dark backgrounds (optional).',
          type: 'image',
          options: {
            hotspot: true,
            accept: 'image/svg+xml,image/png',
          },
        }),
      ],
    }),
  ],
  preview: {
    select: {
      title: 'title',
      media: 'image.default',
      link: 'link',
    },
    prepare: ({ title, media, link }) => ({
      title,
      subtitle: link || 'No link provided',
      media,
    }),
  },
});
