/**
 * OG Image Schema
 * @version 2.0.1
 * @lastUpdated 2025-12-23
 * @description A simplified image schema specifically for Open Graph and social media sharing.
 * @changelog
 * - 2.0.1: Updated header documentation
 * - 2.0.0: Simplified schema for OG images only
 * - 1.1.0: Added improved validation and documentation
 */

import { ImageIcon } from '@sanity/icons';
import { defineField, defineType } from 'sanity';

export default defineType({
  name: 'img',
  title: 'Image',
  type: 'object',
  icon: ImageIcon,
  description: 'Image for OG and social sharing (optional - will auto-generate if not provided)',
  fields: [
    defineField({
      name: 'image',
      title: 'Image',
      description:
        'The image to be used for social media sharing. If not provided, an auto-generated OG image will be used.',
      type: 'image',
      options: {
        hotspot: true,
      },
      validation: (Rule) => Rule.required().warning('Adding an image is recommended'),
    }),
  ],
  preview: {
    select: {
      image: 'image',
    },
    prepare: ({ image }) => ({
      title: 'OG Image',
      media: image,
    }),
  },
});
