/**
 * Pricing List Module Schema
 * @version 1.0.1
 * @lastUpdated 2025-12-23
 * @description Displays a list of pricing tiers/plans.
 * @changelog
 * - 1.0.1: Added header documentation
 * - 1.0.0: Initial version
 */

import { BillIcon } from '@sanity/icons';
import { defineField, defineType } from 'sanity';
import { count } from '@/lib/utils/index';
import { getBlockText } from '@/sanity/lib/utils';

export default defineType({
  name: 'pricing-list',
  title: 'Pricing list',
  icon: BillIcon,
  type: 'object',
  groups: [
    { name: 'content', title: 'Content', default: true },
    { name: 'options', title: 'Advanced Options' },
  ],
  fields: [
    defineField({
      name: 'options',
      type: 'module-options',
      group: 'options',
    }),
    defineField({
      name: 'intro',
      type: 'array',
      of: [{ type: 'block' }],
      group: 'content',
    }),
    defineField({
      name: 'tiers',
      type: 'array',
      of: [
        {
          type: 'reference',
          to: [{ type: 'pricing' }],
        },
      ],
      group: 'content',
    }),
  ],
  preview: {
    select: {
      intro: 'intro',
      tiers: 'tiers',
    },
    prepare: ({ intro, tiers }) => ({
      title: getBlockText(intro) || count(tiers, 'tier'),
      subtitle: 'Pricing list',
    }),
  },
});
