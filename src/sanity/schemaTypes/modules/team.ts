/**
 * Team Module Schema
 * @version 1.0.0
 * @lastUpdated 2024-03-22
 * @description Displays a list of team members in a grid or list layout.
 * @changelog
 * - 1.0.0: Initial version
 */

import { GoPerson } from 'react-icons/go';
import { defineField, defineType } from 'sanity';
import { getBlockText } from '@/sanity/lib/utils';
import { createUidField } from './uid-input';

export default defineType({
  name: 'team',
  title: 'Team',
  type: 'object',
  icon: GoPerson,
  groups: [{ name: 'content', default: true }, { name: 'options' }],
  fields: [
    defineField({
      name: 'options',
      type: 'object',
      title: 'Options',
      group: 'options',
      fields: [createUidField()],
    }),
    defineField({
      name: 'pretitle',
      title: 'Pretitle',
      description: 'Small text above the main title.',
      type: 'string',
      group: 'content',
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
    defineField({
      name: 'layout',
      title: 'Layout',
      type: 'string',
      description: 'Choose how team members are displayed',
      options: {
        list: [
          { title: 'Grid (Cards)', value: 'grid' },
          { title: 'Split (List)', value: 'split' },
        ],
        layout: 'radio',
      },
      group: 'options',
      initialValue: 'grid',
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
