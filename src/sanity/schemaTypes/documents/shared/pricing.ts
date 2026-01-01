/**
 * Pricing Tier Schema
 * @version 2.0.0
 * @lastUpdated 2025-12-31
 * @description Defines a pricing tier or plan (e.g., Free, Pro, Enterprise).
 * @changelog
 * - 2.0.0: Flattened price object - moved fields to root level for simpler editing
 * - 1.0.1: Updated header documentation
 * - 1.0.0: Initial version
 */

import { BillIcon, ControlsIcon, EditIcon } from '@sanity/icons';
import { defineField, defineType } from 'sanity';

export default defineType({
  name: 'pricing',
  title: 'Pricing Tier',
  icon: BillIcon,
  type: 'document',
  groups: [
    { name: 'content', title: 'Content', icon: EditIcon, default: true },
    { name: 'options', title: 'Advanced Options', icon: ControlsIcon },
  ],
  fields: [
    defineField({
      name: 'title',
      title: 'Tier Name',
      description: 'Name of the pricing tier (e.g. "Free", "Pro").',
      type: 'string',
      validation: (Rule) => Rule.required(),
      group: 'content',
    }),
    defineField({
      name: 'description',
      title: 'Description',
      description: 'Brief summary of what this tier offers.',
      type: 'text',
      group: 'content',
    }),
    defineField({
      name: 'monthlyPrice',
      title: 'Monthly Price',
      type: 'string',
      description: 'Monthly price (e.g., "99", "Free", "Contact us"). Leave empty to hide.',
      placeholder: 'e.g., 99, Free, Contact us',
      group: 'content',
    }),
    defineField({
      name: 'yearlyPrice',
      title: 'Yearly Price',
      type: 'string',
      description: 'Yearly price (e.g., "999"). Leave empty to hide yearly option.',
      placeholder: 'e.g., 999',
      group: 'content',
    }),
    defineField({
      name: 'currency',
      title: 'Currency Symbol',
      type: 'string',
      description: 'Currency symbol displayed before the price (e.g., $, €, kr)',
      placeholder: 'e.g., $, €, kr',
      initialValue: '$',
      group: 'content',
    }),
    defineField({
      name: 'priceSuffix',
      title: 'Price Suffix',
      type: 'string',
      description: 'Text shown after the price (e.g., /month, /user, /year)',
      placeholder: 'e.g., /month, /user, /year',
      initialValue: '/month',
      group: 'content',
    }),
    defineField({
      name: 'ctas',
      title: 'Call-to-Actions',
      description: 'Buttons for this pricing tier.',
      type: 'array',
      of: [{ type: 'cta' }],
      group: 'content',
    }),
    defineField({
      name: 'content',
      title: 'Features',
      description: 'List of features included in this tier.',
      type: 'array',
      of: [{ type: 'block' }],
      group: 'content',
    }),
    defineField({
      name: 'highlight',
      title: 'Highlight Badge',
      type: 'string',
      description: 'e.g. Recommended, Most Popular, etc.',
      group: 'options',
    }),
    defineField({
      name: 'style',
      title: 'Card Style',
      type: 'string',
      description: 'Visual style of the pricing card.',
      options: {
        list: [
          { title: 'Default', value: 'default' },
          { title: 'Featured (Purple accent)', value: 'featured' },
          { title: 'Dark (Dark background)', value: 'dark' },
        ],
        layout: 'radio',
      },
      initialValue: 'default',
      group: 'options',
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
