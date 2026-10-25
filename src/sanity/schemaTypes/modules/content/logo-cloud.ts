/**
 * Logo row: customer or partner logos. The anchor comes from blockDesign.
 * @changelog
 * - 2.0.0: Lean — no anchor option; plain labels
 */

import { ComponentIcon } from '@sanity/icons/Component';
import { defineArrayMember, defineField, defineType } from 'sanity';
import { richTextField } from '../../fragments/rich-text';
import { blockPreview } from '../preview';

export default defineType({
  name: 'logo-cloud',
  title: 'Logo row',
  description: 'A row of logos, e.g. customers or partners.',
  icon: ComponentIcon,
  type: 'object',
  fields: [
    richTextField('content', 'Intro', 'section'),
    defineField({
      name: 'logos',
      title: 'Logos',
      description: 'Leave empty to show all logos.',
      type: 'array',
      of: [defineArrayMember({ type: 'reference', to: [{ type: 'logo' }] })],
    }),
  ],
  preview: blockPreview('Logo row', { title: 'content' }),
});
