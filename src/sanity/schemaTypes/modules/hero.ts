/**
 * Hero Module Schema
 * @version 1.4.0
 * @lastUpdated 2024-06-18
 * @changelog
 * - 1.4.0: Added stats row for displaying metrics with icons
 * - 1.3.0: Removed video/Mux support to simplify
 * - 1.2.0: Added video support with Mux integration
 * - 1.1.0: Added side-by-side layout option
 * - 1.0.0: Initial version
 */

import { createAlignmentField } from '@/sanity/lib/schema-factory';
import { getBlockText } from '@/sanity/lib/utils';
import { TfiLayoutCtaCenter } from 'react-icons/tfi';
import { defineField, defineType } from 'sanity';

export default defineType({
  name: 'hero',
  title: 'Hero',
  icon: TfiLayoutCtaCenter,
  type: 'object',
  groups: [
    { name: 'content', default: true },
    { name: 'asset' },
    { name: 'stats', title: 'Statistics' },
    { name: 'options' },
  ],
  fieldsets: [
    {
      name: 'alignment',
      title: 'Alignment',
      options: { columns: 1 },
    },
  ],
  fields: [
    defineField({
      name: 'pretitle',
      type: 'string',
      group: 'content',
    }),
    defineField({
      name: 'content',
      type: 'array',
      of: [{ type: 'block' }],
      group: 'content',
    }),
    defineField({
      name: 'ctas',
      title: 'Call-to-actions',
      type: 'array',
      of: [{ type: 'cta' }],
      group: 'content',
    }),
    defineField({
      name: 'stats',
      title: 'Statistics Row',
      description: 'Add metrics to display in a row below the content',
      type: 'array',
      of: [{ type: 'stat' }],
      group: 'stats',
    }),
    defineField({
      name: 'image',
      title: 'Image',
      description: 'Image to display in the hero section',
      type: 'img',
      group: 'asset',
    }),
    createAlignmentField({
      name: 'alignment',
      title: 'Alignment',
      group: 'options',
      fieldset: 'alignment',
      initialValue: 'center',
    }),
    defineField({
      name: 'options',
      type: 'module-options',
      group: 'options',
    }),
  ],
  preview: {
    select: {
      content: 'content',
      media: 'image.image',
    },
    prepare: ({ content, media }) => {
      return {
        title: getBlockText(content) || 'Hero',
        subtitle: 'Hero',
        media,
      };
    },
  },
});
