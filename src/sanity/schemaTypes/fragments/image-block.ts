/**
 * Image Block Fragment
 * @version 1.0.1
 * @lastUpdated 2025-12-23
 * @description A reusable image block for Portable Text arrays.
 * @changelog
 * - 1.0.1: Added header documentation
 * - 1.0.0: Initial version
 */

import { ImageIcon } from '@sanity/icons';
import { defineArrayMember } from 'sanity';

export default defineArrayMember({
  type: 'image',
  icon: ImageIcon,
  options: {
    hotspot: true,
  },
  fields: [],
  preview: {
    select: {
      title: 'asset.altText',
      filename: 'asset.originalFilename',
      media: 'asset',
    },
    prepare({ title, filename, media }) {
      return {
        title: title || filename || 'Untitled',
        subtitle: title ? filename : undefined,
        media,
      };
    },
  },
});
