/**
 * Docs: All documentation pages with a sidebar by category.
 * Layout, limits, filters and the RSS link come from blockDesign (Vault spec
 * 2026-10-18 D2). The page holding this block is the collection's index page.
 */

import { BookIcon } from '@sanity/icons/Book';
import { defineType } from 'sanity';
import { richTextField } from '../../fragments/rich-text';
import { blockPreview } from '../preview';

export default defineType({
  name: 'docs-frontpage',
  title: 'Docs',
  description: 'All documentation pages with a sidebar by category.',
  icon: BookIcon,
  type: 'object',
  fields: [richTextField('intro', 'Intro', 'listIntro')],
  preview: blockPreview('Docs', { title: 'intro' }),
});
