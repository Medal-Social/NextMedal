/**
 * Questions and answers: questions that open to show their answer.
 * The anchor comes from blockDesign; every item starts closed.
 * @changelog
 * - 2.0.0: Lean — no anchor option, no "open by default"; plain labels
 */

import { StackCompactIcon } from '@sanity/icons/StackCompact';
import { defineArrayMember, defineField, defineType } from 'sanity';
import { getBlockText } from '@/sanity/lib/utils';
import { richTextField } from '../../fragments/rich-text';
import { blockPreview } from '../preview';

export default defineType({
  name: 'accordion-list',
  title: 'Questions and answers',
  description: 'Questions that open to show their answer.',
  type: 'object',
  icon: StackCompactIcon,
  fields: [
    richTextField('content', 'Intro', 'section', {
      description: 'Optional. Shown above the questions.',
    }),
    defineField({
      name: 'items',
      type: 'array',
      title: 'Questions',
      of: [
        defineArrayMember({
          name: 'accordion-item',
          type: 'object',
          title: 'Question',
          icon: StackCompactIcon,
          fields: [
            defineField({
              name: 'summary',
              title: 'Question',
              type: 'string',
              validation: (Rule) => Rule.required(),
            }),
            richTextField('content', 'Answer', 'plain', {
              description: 'Shown when the question is opened.',
            }),
          ],
          preview: {
            select: { title: 'summary', content: 'content' },
            prepare: ({ title, content }) => ({ title, subtitle: getBlockText(content, ' ') }),
          },
        }),
      ],
    }),
  ],
  preview: blockPreview('Questions and answers', { title: 'content' }),
});
