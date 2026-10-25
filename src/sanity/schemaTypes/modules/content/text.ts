/**
 * Text: running text with headings, lists, quotes, links and pictures.
 * @changelog
 * - 2.0.0: Lean — no anchor option; plain labels
 */

import { TextIcon } from '@sanity/icons/Text';
import { defineType } from 'sanity';
import { imageBlock } from '../../fragments';
import { richTextField } from '../../fragments/rich-text';
import { blockPreview } from '../preview';

export default defineType({
  name: 'richtext',
  title: 'Text',
  description: 'Running text with headings, lists, quotes and links.',
  icon: TextIcon,
  type: 'object',
  fields: [richTextField('content', 'Text', 'prose', { extraMembers: [imageBlock] })],
  preview: blockPreview('Text', { title: 'content' }),
});
