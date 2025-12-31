/**
 * Rich Text Module Schema
 * @version 1.0.1
 * @lastUpdated 2025-12-23
 * @description A standard rich text module for long-form content.
 * @changelog
 * - 1.0.1: Added header documentation
 * - 1.0.0: Initial version
 */

import { TextIcon } from '@sanity/icons';
import { defineField, defineType } from 'sanity';
import { getBlockText } from '@/sanity/lib/utils';
import { imageBlock } from '../../fragments';

export default defineType({
  name: 'richtext',
  title: 'Text',
  icon: TextIcon,
  type: 'object',
  groups: [
    { name: 'content', title: 'Content', default: true },
    { name: 'options', title: 'Advanced Options' },
  ],
  fields: [
    defineField({
      name: 'options',
      type: 'module-options',
      group: 'options',
    }),
    defineField({
      name: 'content',
      type: 'array',
      of: [
        {
          type: 'block',
          marks: {
            annotations: [
              {
                name: 'link',
                type: 'link',
              },
            ],
          },
        },
        imageBlock,
      ],
      group: 'content',
    }),
  ],
  preview: {
    select: {
      content: 'content',
    },
    prepare: ({ content }) => ({
      title: getBlockText(content) || 'Text',
      subtitle: 'Text',
    }),
  },
});
