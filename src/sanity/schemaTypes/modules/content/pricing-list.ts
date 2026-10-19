/**
 * Prices: the price plans, side by side. The anchor comes from blockDesign.
 * @changelog
 * - 2.0.0: Lean — no anchor option; plain labels
 */

import { BillIcon } from '@sanity/icons/Bill';
import { defineArrayMember, defineField, defineType } from 'sanity';
import { richTextField } from '../../fragments/rich-text';
import { blockPreview } from '../preview';

export default defineType({
  name: 'pricing-list',
  title: 'Prices',
  description: 'The price plans, side by side.',
  icon: BillIcon,
  type: 'object',
  fields: [
    richTextField('intro', 'Intro', 'section'),
    defineField({
      name: 'tiers',
      title: 'Plans',
      type: 'array',
      of: [defineArrayMember({ type: 'reference', to: [{ type: 'pricing' }] })],
    }),
  ],
  preview: blockPreview('Prices', { title: 'intro' }),
});
