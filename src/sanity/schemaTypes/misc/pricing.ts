/**
 * Pricing Tier Schema
 * @version 1.0.0
 * @lastUpdated 2024-03-22
 * @description Defines a pricing tier or plan (e.g., Free, Pro, Enterprise).
 * @changelog
 * - 1.0.0: Initial version
 */

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
      title: 'Tier Name',
      description: 'Name of the pricing tier (e.g. "Free", "Pro").',
      type: 'string',
    }),
    defineField({
      name: 'description',
      title: 'Description',
      description: 'Brief summary of what this tier offers.',
      type: 'text',
    }),
    defineField({
      name: 'highlight',
      type: 'string',
      description: 'e.g. Recommended, Most popular, etc.',
    }),
    defineField({
      name: 'price',
      title: 'Price',
      description: 'Pricing details.',
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
      description: 'Buttons for this pricing tier.',
      type: 'array',
      of: [{ type: 'cta' }],
    }),
    defineField({
      name: 'content',
      title: 'Features',
      description: 'List of features included in this tier.',
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
