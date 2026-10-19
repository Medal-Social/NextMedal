/**
 * Picture: an image with a description for screen readers.
 * @changelog
 * - 3.0.0: Plain labels; "Describe the picture" (alt) added (Vault plan C15)
 * - 2.0.0: Simplified schema
 */

import { ImageIcon } from '@sanity/icons/Image';
import { defineField, defineType } from 'sanity';

export default defineType({
  name: 'img',
  title: 'Picture',
  type: 'object',
  icon: ImageIcon,
  fields: [
    defineField({
      name: 'image',
      title: 'Picture',
      type: 'image',
      options: { hotspot: true },
    }),
    defineField({
      name: 'alt',
      title: 'Describe the picture',
      description: 'Read aloud to people who cannot see it. Leave empty if it is decoration.',
      type: 'string',
    }),
  ],
  preview: {
    select: { image: 'image', alt: 'alt' },
    prepare: ({ image, alt }) => ({ title: alt || 'Picture', media: image }),
  },
});
