/**
 * Feature Grid Module Schema
 * @version 1.1.0
 * @lastUpdated 2024-03-13
 * @changelog
 * - 1.1.0: Added alignment options and improved validation
 * - 1.0.0: Initial version
 */

import { getBlockText } from '@/sanity/lib/utils';
import { Grid2x2 } from 'lucide-react';
import { defineArrayMember, defineField, defineType } from 'sanity';

export default defineType({
  name: 'feature-grid',
  title: 'Feature grid',
  type: 'object',
  icon: Grid2x2,
  description: 'Grid layout of features with icons and descriptions',
  fields: [
    defineField({
      name: 'pretitle',
      title: 'Pre-title',
      description: 'Optional badge text that appears above the main heading',
      type: 'string',
    }),
    defineField({
      name: 'intro',
      title: 'Introduction',
      description: 'Introductory text for the feature grid',
      type: 'array',
      of: [{ type: 'block' }],
    }),
    defineField({
      name: 'items',
      title: 'Feature Items',
      description: 'Add individual feature items to the grid',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'object',
          icon: Grid2x2,
          fields: [
            defineField({
              name: 'summary',
              title: 'Feature Title',
              description: 'Short title for this feature',
              type: 'string',
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: 'content',
              title: 'Feature Description',
              description: 'Detailed description of this feature',
              type: 'array',
              of: [{ type: 'block' }],
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: 'icon',
              title: 'Feature Icon',
              description: 'Icon representing this feature',
              type: 'icon',
            }),
          ],
          preview: {
            select: {
              title: 'summary',
              content: 'content',
              icon: 'icon',
            },
            prepare: ({ title, content, icon }) => ({
              title: title || 'Untitled Feature',
              subtitle: getBlockText(content),
              media: icon,
            }),
          },
        }),
      ],
      validation: (Rule) => Rule.min(1).max(12).error('Must have between 1 and 12 feature items'),
    }),
  ],
  preview: {
    select: {
      intro: 'intro',
      items: 'items',
    },
    prepare: ({ intro, items = [] }) => ({
      title: getBlockText(intro) || 'Feature Grid',
      subtitle: `${items.length || 0} feature items`,
      media: Grid2x2,
    }),
  },
});
