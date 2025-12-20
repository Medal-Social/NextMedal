import { GoPerson } from 'react-icons/go';
import { defineField, defineType } from 'sanity';
import { getBlockText } from '@/sanity/lib/utils';
import { createUidField } from './uid-input';

export default defineType({
  name: 'team-list',
  title: 'Team list',
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
      type: 'string',
      group: 'content',
    }),
    defineField({
      name: 'intro',
      type: 'array',
      of: [{ type: 'block' }],
      group: 'content',
    }),
    defineField({
      name: 'people',
      title: 'Team Members',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'person' }] }],
      group: 'content',
    }),
    defineField({
      name: 'layout',
      type: 'string',
      options: {
        list: ['grid', 'carousel'],
        layout: 'radio',
      },
      group: 'options',
      initialValue: 'carousel',
    }),
  ],
  preview: {
    select: {
      intro: 'intro',
    },
    prepare: ({ intro }) => ({
      title: getBlockText(intro),
      subtitle: 'Team list',
    }),
  },
});
