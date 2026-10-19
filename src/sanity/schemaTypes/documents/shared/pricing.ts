/**
 * Pricing Tier Schema
 * @version 2.0.0
 * @lastUpdated 2025-12-31
 * @description Defines a pricing tier or plan (e.g., Free, Pro, Enterprise).
 * @changelog
 * - 3.0.0: Lean — no card style or tabs; plain labels
 * - 2.0.0: Flattened price object - moved fields to root level for simpler editing
 * - 1.0.1: Updated header documentation
 * - 1.0.0: Initial version
 */

import { BillIcon } from '@sanity/icons/Bill';
import { defineArrayMember, defineField, defineType } from 'sanity';
import { richTextField } from '../../fragments/rich-text';

export default defineType({
  name: 'pricing',
  title: 'Price plan',
  icon: BillIcon,
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Name',
      description: 'E.g. "Free" or "Pro".',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'description',
      title: 'Short text',
      description: 'Who the plan is for, in one line.',
      type: 'text',
    }),
    defineField({
      name: 'monthlyPrice',
      title: 'Price per month',
      type: 'string',
      description: 'E.g. "99", "Free" or "Contact us". Leave empty to hide.',
    }),
    defineField({
      name: 'yearlyPrice',
      title: 'Price per year',
      type: 'string',
      description: 'E.g. "999". Leave empty if there is no yearly price.',
    }),
    defineField({
      name: 'currency',
      title: 'Currency',
      type: 'string',
      description: 'Shown before the price, e.g. $, € or kr.',
      initialValue: '$',
    }),
    defineField({
      name: 'priceSuffix',
      title: 'After the price',
      type: 'string',
      description: 'E.g. /month or /user.',
      initialValue: '/month',
    }),
    defineField({
      name: 'ctas',
      title: 'Buttons',
      type: 'array',
      of: [defineArrayMember({ type: 'cta' })],
    }),
    richTextField('content', 'Features', 'tier', {
      description: 'What the plan includes.',
    }),
    defineField({
      name: 'highlight',
      title: 'Badge',
      type: 'string',
      description: 'Optional, e.g. "Most popular".',
    }),
  ],
  preview: {
    select: {
      title: 'title',
      monthlyPrice: 'monthlyPrice',
      currency: 'currency',
      suffix: 'priceSuffix',
    },
    prepare: ({ title, monthlyPrice, currency, suffix }) => ({
      title,
      subtitle: [currency, monthlyPrice || 'Free', suffix].filter(Boolean).join(' '),
    }),
  },
});
