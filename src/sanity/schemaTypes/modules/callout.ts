import { getBlockText } from '@/sanity/lib/utils';
import { VscInspect } from 'react-icons/vsc';
import { defineField, defineType } from 'sanity';

export default defineType({
  name: 'callout',
  title: 'Callout',
  icon: VscInspect,
  type: 'object',
  fields: [
    defineField({
      name: 'content',
      type: 'array',
      of: [{ type: 'block' }],
    }),
    defineField({
      name: 'ctas',
      title: 'Call-to-actions',
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
