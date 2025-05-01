/**
 * OG Image Schema
 * @version 2.0.0
 * @lastUpdated 2024-03-13
 * @changelog
 * - 2.0.0: Simplified schema for OG images only
 * - 1.1.0: Added improved validation and documentation
 * - 1.0.0: Initial version
 *
 * @description
 * A simplified image schema specifically for Open Graph and social media sharing.
 * This schema provides a single image field with hotspot support for better image cropping.
 * If no image is provided, an auto-generated OG image will be used instead.
 *
 * @usage
 * Used in metadata for generating social media previews and Open Graph images.
 * The image will be automatically resized to 1200x630px for optimal social sharing.
 * When no custom image is uploaded, the system will generate an OG image using the page title.
 */

import { VscFileMedia } from 'react-icons/vsc';
import { defineField, defineType } from 'sanity';

export default defineType({
  name: 'img',
  title: 'Image',
  type: 'object',
  icon: VscFileMedia,
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
      validation: (Rule) => Rule.required(),
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
