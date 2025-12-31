/**
 * Team Module Schema
 * @version 1.1.1
 * @lastUpdated 2025-12-23
 * @description Displays a list of team members in a grid or list layout.
 * @changelog
 * - 1.1.1: Updated header documentation
 * - 1.1.0: Added professional visual style selector
 * - 1.0.0: Initial version
 */

import { UserIcon } from '@sanity/icons';
import { defineField, defineType } from 'sanity';
import { getBlockText } from '@/sanity/lib/utils';
import { createUidField } from '../ui/uid-input';

export default defineType({
  name: 'team',
  title: 'Team',
  type: 'object',
  icon: UserIcon,
  groups: [
    { name: 'content', title: 'Content', default: true },
    { name: 'options', title: 'Advanced Options' },
  ],
  fields: [
    defineField({
      name: 'layout',
      title: 'Visual Style',
      type: 'string',
      description: 'Choose how team members are displayed',
      options: {
        list: [
          { title: 'Grid (Cards)', value: 'grid' },
          { title: 'Split (List)', value: 'split' },
        ],
      },
      initialValue: 'grid',
      group: 'content',
    }),
    defineField({
      name: 'options',
      type: 'object',
      title: 'Advanced Options',
      group: 'options',
      fields: [createUidField()],
    }),
    defineField({
      name: 'intro',
      title: 'Intro',
      description: 'Introduction text/title for the team section.',
      type: 'array',
      of: [
        {
          type: 'block',
          styles: [
            { title: 'Normal', value: 'normal' },
            { title: 'Heading 1', value: 'h1' },
            { title: 'Heading 2', value: 'h2' },
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
      name: 'people',
      title: 'Team Members',
      description: 'Select team members to display.',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'person' }] }],
      group: 'content',
    }),
  ],
  preview: {
    select: {
      intro: 'intro',
    },
    prepare: ({ intro }) => ({
      title: getBlockText(intro),
      subtitle: 'Team',
    }),
  },
});
