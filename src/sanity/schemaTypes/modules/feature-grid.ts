/**
 * Feature Grid Module Schema
 * @version 1.1.0
 * @lastUpdated 2024-03-13
 * @changelog
 * - 1.1.0: Added alignment options and improved validation
 * - 1.0.0: Initial version
 */

import { createAlignmentField } from '@/sanity/lib/schema-factory';
import { getBlockText } from '@/sanity/lib/utils';
import { Grid2x2 } from 'lucide-react';
import { defineArrayMember, defineField, defineType } from 'sanity';

export default defineType({
  name: 'feature-grid',
  title: 'Feature grid',
  type: 'object',
  icon: Grid2x2,
  description: 'Grid layout of features with icons and descriptions',
  groups: [
    { name: 'content', title: 'Content', default: true },
    { name: 'options', title: 'Layout Options' },
  ],
  fieldsets: [
    {
      name: 'alignment',
      title: 'Alignment Options',
      options: { columns: 2 },
    },
  ],
  fields: [
    defineField({
      name: 'options',
      type: 'module-options',
      group: 'options',
    }),
    defineField({
      name: 'showBorder',
      title: 'Show Border',
      description: 'Show a border around the feature grid',
      type: 'boolean',
      options: {
        layout: 'switch',
      },
      initialValue: false,
      group: 'options',
    }),
    defineField({
      name: 'pretitle',
      title: 'Pre-title',
      description: 'Optional pre-title displayed above the main content',
      type: 'string',
      group: 'content',
    }),
    defineField({
      name: 'intro',
      title: 'Introduction',
      description: 'Introductory text for the feature grid',
      type: 'array',
      of: [{ type: 'block' }],
      group: 'content',
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
              name: 'icon',
              title: 'Feature Icon',
              description: 'Icon representing this feature',
              type: 'icon',
            }),
            defineField({
              name: 'pretitle',
              title: 'Pre-title',
              description: 'Pre-title for this feature',
              type: 'string',
            }),
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
              name: 'link',
              title: 'Link',
              description: 'Link to more information about this feature',
              type: 'link',
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
      group: 'content',
    }),
    defineField({
      name: 'layout',
      title: 'Layout Style',
      description: 'Choose how features are arranged in the grid',
      type: 'string',
      options: {
        layout: 'radio',
        list: [
          { title: 'Vertical (stacked)', value: 'vertical' },
          { title: 'Horizontal (side by side)', value: 'horizontal' },
        ],
      },
      initialValue: 'vertical',
      group: 'options',
    }),
    createAlignmentField({
      name: 'textAlign',
      title: 'Text alignment',
      group: 'options',
      fieldset: 'alignment',
    }),
    defineField({
      name: 'columns',
      title: 'Number of Columns',
      description: 'Number of columns to display on desktop (will adjust for mobile)',
      type: 'number',
      options: {
        list: [
          { title: '2 Columns', value: 2 },
          { title: '3 Columns', value: 3 },
          { title: '4 Columns', value: 4 },
        ],
      },
      initialValue: 3,
      group: 'options',
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
