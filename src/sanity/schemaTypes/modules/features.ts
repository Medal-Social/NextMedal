/**
 * Feature Grid Module Schema
 * @version 1.1.0
 * @lastUpdated 2024-03-13
 * @changelog
 * - 1.1.0: Added alignment options and improved validation
 * - 1.0.0: Initial version
 */

import { TfiLayoutGrid2 } from 'react-icons/tfi';
import { defineArrayMember, defineField, defineType } from 'sanity';
import { getBlockText } from '@/sanity/lib/utils';
import { createUidField } from './uid-input';

export default defineType({
  name: 'features',
  title: 'Features',
  type: 'object',
  icon: TfiLayoutGrid2,
  description: 'Grid layout of features with icons and descriptions',
  groups: [
    { name: 'content', title: 'Content', default: true },
    { name: 'options', title: 'Advanced Options' },
  ],
  fields: [
    defineField({
      name: 'options',
      type: 'object',
      title: 'Advanced Options',
      group: 'options',
      fields: [createUidField()],
    }),
    defineField({
      name: 'intro',
      title: 'Introduction',
      description: 'Introductory text for the feature grid',
      type: 'array',
      of: [
        {
          type: 'block',
          styles: [
            { title: 'Normal', value: 'normal' },
            { title: 'Heading 2', value: 'h2' },
            { title: 'Heading 3', value: 'h3' },
          ],
          lists: [],
          marks: {
            decorators: [
              { title: 'Strong', value: 'strong' },
              { title: 'Emphasis', value: 'em' },
            ],
          },
        },
      ],
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
          icon: TfiLayoutGrid2,
          fields: [
            defineField({
              name: 'icon',
              title: 'Feature Icon',
              description: 'Icon representing this feature',
              type: 'icon',
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
              of: [
                {
                  type: 'block',
                  styles: [{ title: 'Normal', value: 'normal' }],
                  lists: [],
                  marks: {
                    decorators: [
                      { title: 'Strong', value: 'strong' },
                      { title: 'Emphasis', value: 'em' },
                      {
                        title: 'Highlight',
                        value: 'highlight',
                        icon: () => '✨',
                      },
                    ],
                  },
                },
              ],
              validation: (Rule) => Rule.required(),
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
  ],
  preview: {
    select: {
      intro: 'intro',
      items: 'items',
    },
    prepare: ({ intro, items = [] }) => ({
      title: getBlockText(intro) || 'Feature Grid',
      subtitle: `${items.length || 0} feature items`,
      media: TfiLayoutGrid2,
    }),
  },
});
