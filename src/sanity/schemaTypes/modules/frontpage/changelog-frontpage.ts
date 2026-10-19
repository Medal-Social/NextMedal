/**
 * Changelog: All changelog entries, newest first, grouped by year.
 * Layout, limits, filters and the RSS link come from blockDesign (Vault spec
 * 2026-10-18 D2). The page holding this block is the collection's index page.
 */

import { DocumentTextIcon } from '@sanity/icons/DocumentText';
import { defineType } from 'sanity';
import { richTextField } from '../../fragments/rich-text';
import { blockPreview } from '../preview';

export default defineType({
  name: 'changelog-frontpage',
  title: 'Changelog',
  description: 'All changelog entries, newest first, grouped by year.',
  icon: DocumentTextIcon,
  type: 'object',
  fields: [richTextField('intro', 'Intro', 'listIntro')],
  preview: blockPreview('Changelog', { title: 'intro' }),
});
