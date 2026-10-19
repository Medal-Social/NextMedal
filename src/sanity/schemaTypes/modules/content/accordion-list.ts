/**
 * Accordion List Module Schema
 * @version 1.0.1
 * @lastUpdated 2025-12-23
 * @description A list of collapsible content items (e.g. FAQs).
 * @changelog
 * - 1.0.1: Updated header documentation
 * - 1.0.0: Initial version
 */

import { StackCompactIcon } from '@sanity/icons/StackCompact';
import { defineArrayMember, defineField, defineType } from 'sanity';
import { getBlockText } from '@/sanity/lib/utils';
import { richTextField } from '../../fragments/rich-text';

export default defineType({
  name: 'accordion-list',
  title: 'Accordion list',
  type: 'object',
  icon: StackCompactIcon,
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
    richTextField('content', 'Intro', 'section', {
      description: 'Optional introductory text before the accordion list.',
      group: 'content',
    }),
    defineField({
      name: 'items',
      type: 'array',
      title: 'Accordion Items',
      description: 'List of collapsible items.',
      of: [
        defineArrayMember({
          name: 'accordion-item',
          type: 'object',
          icon: StackCompactIcon,
          fields: [
            defineField({
              name: 'summary',
              title: 'Title',
              description: 'The heading text that is always visible',
              type: 'string',
              validation: (Rule) => Rule.required(),
            }),
            richTextField('content', 'Answer', 'plain', {
              description: 'The hidden content that is revealed when opened.',
            }),
            defineField({
              name: 'open',
              title: 'Open by default',
              type: 'boolean',
              initialValue: false,
            }),
          ],
          preview: {
            select: {
              title: 'summary',
              content: 'content',
            },
            prepare: ({ title, content }) => ({
              title,
              subtitle: getBlockText(content),
            }),
          },
        }),
      ],
      group: 'content',
    }),
  ],
  preview: {
    select: {
      content: 'content',
    },
    prepare: ({ content }) => ({
      title: getBlockText(content),
      subtitle: 'Accordion list',
    }),
  },
});
