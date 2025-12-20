/**
 * Callout Module Schema
 * @version 1.0.0
 * @lastUpdated 2024-03-22
 * @description A highlighted section with content and call-to-actions.
 * @changelog
 * - 1.0.0: Initial version
 */

import { VscInspect } from 'react-icons/vsc';
import { defineField, defineType } from 'sanity';
import { getBlockText } from '@/sanity/lib/utils';
import { createUidField } from './uid-input';

export default defineType({
  name: 'callout',
  title: 'Callout',
  icon: VscInspect,
  type: 'object',
  fields: [
    createUidField(),
    defineField({
      name: 'content',
      title: 'Content',
      description: 'The main text of the callout.',
      type: 'array',
      of: [{ type: 'block' }],
    }),
    defineField({
      name: 'ctas',
      title: 'Call-to-actions',
      description: 'Buttons to display in the callout.',
      type: 'array',
      of: [{ type: 'cta' }],
    }),
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
