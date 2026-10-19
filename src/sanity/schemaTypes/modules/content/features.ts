/**
 * Feature grid: features with an icon, a title and a short text.
 * The anchor comes from blockDesign.
 * @changelog
 * - 2.0.0: Lean — no anchor option; plain labels
 */

import { ThLargeIcon } from '@sanity/icons/ThLarge';
import { defineArrayMember, defineField, defineType } from 'sanity';
import { getBlockText } from '@/sanity/lib/utils';
import { richTextField } from '../../fragments/rich-text';
import { blockPreview } from '../preview';

export default defineType({
  name: 'features',
  title: 'Feature grid',
  description: 'A grid of features, each with an icon, a title and a short text.',
  type: 'object',
  icon: ThLargeIcon,
  fields: [
    richTextField('intro', 'Intro', 'section'),
    defineField({
      name: 'items',
      title: 'Features',
      type: 'array',
      of: [
        defineArrayMember({
          name: 'feature-item',
          type: 'object',
          title: 'Feature',
          icon: ThLargeIcon,
          fields: [
            defineField({ name: 'icon', title: 'Icon', type: 'icon' }),
            defineField({
              name: 'summary',
              title: 'Title',
              type: 'string',
              validation: (Rule) => Rule.required(),
            }),
            richTextField('content', 'Text', 'plain', { required: true }),
          ],
          preview: {
            select: { title: 'summary', content: 'content', icon: 'icon' },
            prepare: ({ title, content, icon }) => ({
              title: title || 'Feature',
              subtitle: getBlockText(content, ' '),
              media: icon,
            }),
          },
        }),
      ],
      validation: (Rule) => Rule.min(1).max(12).error('Add between 1 and 12 features'),
    }),
  ],
  preview: blockPreview('Feature grid', { title: 'intro' }),
});
