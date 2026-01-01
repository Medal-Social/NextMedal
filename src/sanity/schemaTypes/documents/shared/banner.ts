import { defineField, defineType } from 'sanity';

export default defineType({
  name: 'banner',
  type: 'document',
  title: 'Banner',
  fields: [
    defineField({
      name: 'start',
      type: 'datetime',
      description: 'Optional start date for scheduling the banner.',
    }),
    defineField({
      name: 'end',
      type: 'datetime',
      description: 'Optional end date for scheduling the banner.',
    }),
    defineField({
      name: 'content',
      type: 'array',
      of: [{ type: 'block' }],
      description: 'The banner content.',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'cta',
      type: 'menuItem',
      description: 'Optional call-to-action link.',
    }),
  ],
  preview: {
    select: {
      content: 'content',
      start: 'start',
      end: 'end',
    },
    prepare: ({ content, start, end }) => {
      const text =
        content?.[0]?.children
          ?.map((child: { text?: string }) => child.text)
          .filter(Boolean)
          .join(' ') || 'Banner';
      const schedule =
        start || end
          ? ` (${start ? `from ${new Date(start).toLocaleDateString()}` : ''}${start && end ? ' ' : ''}${end ? `to ${new Date(end).toLocaleDateString()}` : ''})`
          : '';
      return {
        title: text,
        subtitle: schedule,
      };
    },
  },
});
