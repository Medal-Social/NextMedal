import { LuDollarSign } from 'react-icons/lu';
import { defineField, defineType } from 'sanity';

export default defineType({
  name: 'pricing',
  title: 'Pricing tier',
  icon: LuDollarSign,
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      type: 'string',
    }),
    defineField({
      name: 'description',
      type: 'text',
    }),
    defineField({
      name: 'highlight',
      type: 'string',
      description: 'e.g. Recommended, Most popular, etc.',
    }),
    defineField({
      name: 'price',
      type: 'object',
      options: {
        columns: 2,
      },
      fields: [
        defineField({
          name: 'base',
          type: 'string',
          description: '0 for free, empty to hide',
        }),
        defineField({
          name: 'yearly',
          type: 'string',
          description: '0 for free, empty to hide',
        }),
        defineField({
          name: 'currency',
          type: 'string',
          description: 'e.g. $',
        }),
        defineField({
          name: 'suffix',
          type: 'string',
          placeholder: 'e.g. /mo, per seat, forever, etc.',
        }),
      ],
    }),
    defineField({
      name: 'ctas',
      title: 'Call-to-actions',
      type: 'array',
      of: [{ type: 'cta' }],
    }),
    defineField({
      name: 'content',
      type: 'array',
      of: [{ type: 'block' }],
    }),
  ],
  preview: {
    select: {
      title: 'title',
      price: 'price',
    },
    prepare: ({ title, price }) => ({
      title,
      subtitle: [
        price?.base || 'Free',
        price?.strikethrough && `(${price.strikethrough})`,
        price?.suffix,
      ]
        .filter(Boolean)
        .join(' '),
    }),
  },
});
