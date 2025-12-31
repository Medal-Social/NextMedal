/**
 * Callout Module Schema
 * @version 1.0.1
 * @lastUpdated 2025-12-23
 * @description A highlighted section with content and call-to-actions.
 * @changelog
 * - 1.0.1: Updated header documentation
 * - 1.0.0: Initial version
 */

import { BulbOutlineIcon } from '@sanity/icons';
import { defineField, defineType } from 'sanity';
import { getBlockText } from '@/sanity/lib/utils';
import { createUidField } from '../ui/uid-input';

export default defineType({
  name: 'callout',
  title: 'Callout',
  icon: BulbOutlineIcon,
  type: 'object',
  fieldsets: [
    {
      name: 'advanced',
      title: 'Advanced Options',
      options: { collapsible: true, collapsed: true },
    },
  ],
  fields: [
    defineField({
      name: 'content',
      title: 'Content',
      description: 'The main text of the callout.',
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
    }),
    defineField({
      name: 'ctas',
      title: 'Call-to-actions',
      description: 'Buttons to display in the callout.',
      type: 'array',
      of: [{ type: 'cta' }],
    }),
    {
      ...createUidField(),
      fieldset: 'advanced',
    },
  ],
  preview: {
    select: {
      content: 'content',
    },
    prepare: ({ content }) => ({
      title: getBlockText(content),
      subtitle: 'Callout',
    }),
  },
});
