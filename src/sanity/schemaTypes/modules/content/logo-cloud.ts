/**
 * Logo Cloud Module Schema
 * @version 1.0.1
 * @lastUpdated 2025-12-23
 * @description Displays a grid of partner/client logos.
 * @changelog
 * - 1.0.1: Updated header documentation
 * - 1.0.0: Initial version
 */

import { ComponentIcon } from '@sanity/icons';
import { defineField, defineType } from 'sanity';
import { getBlockText } from '@/sanity/lib/utils';
import { createUidField } from '../ui/uid-input';

export default defineType({
  name: 'logo-cloud',
  title: 'Logo Cloud',
  icon: ComponentIcon,
  type: 'object',
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
      name: 'content',
      type: 'array',
      title: 'Content',
      description: 'Optional introductory text.',
      of: [
        {
          type: 'block',
          styles: [
            { title: 'Normal', value: 'normal' },
            { title: 'Heading 2', value: 'h2' },
            { title: 'Heading 3', value: 'h3' },
            { title: 'Heading 4', value: 'h4' },
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
      name: 'logos',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'logo' }] }],
      description: 'Leave empty to display all logos',
      group: 'content',
    }),
  ],
  preview: {
    select: {
      content: 'content',
    },
    prepare: ({ content }) => ({
      title: getBlockText(content) || 'Logo Cloud',
      subtitle: 'Logo Cloud',
    }),
  },
});
