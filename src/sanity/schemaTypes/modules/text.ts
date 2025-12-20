import { VscSymbolKeyword } from 'react-icons/vsc';
import { defineField, defineType } from 'sanity';
import { getBlockText } from '@/sanity/lib/utils';
import { imageBlock } from '../fragments';

export default defineType({
  name: 'richtext',
  title: 'Text',
  icon: VscSymbolKeyword,
  type: 'object',
  groups: [
    { name: 'content', title: 'Content', default: true },
    { name: 'options', title: 'Options' },
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
      of: [{ type: 'block' }, imageBlock],
      group: 'content',
    }),
  ],
  preview: {
    select: {
      content: 'content',
    },
    prepare: ({ content }) => ({
      title: getBlockText(content),
      subtitle: 'Text',
    }),
  },
});

