/**
 * Message with buttons: a short centred message with one or two buttons.
 * Button looks and the anchor come from blockDesign.
 * @changelog
 * - 2.0.0: Lean — no anchor field; plain labels
 */

import { BulbOutlineIcon } from '@sanity/icons/BulbOutline';
import { defineArrayMember, defineField, defineType } from 'sanity';
import { richTextField } from '../../fragments/rich-text';
import { blockPreview } from '../preview';

export default defineType({
  name: 'callout',
  title: 'Message with buttons',
  description: 'A short message with one or two buttons, centred on the page.',
  icon: BulbOutlineIcon,
  type: 'object',
  fields: [
    richTextField('content', 'Text', 'section'),
    defineField({
      name: 'ctas',
      title: 'Buttons',
      description: 'The first is a solid button, the second a quieter one.',
      type: 'array',
      of: [defineArrayMember({ type: 'cta' })],
    }),
  ],
  preview: blockPreview('Message with buttons', { title: 'content' }),
});
