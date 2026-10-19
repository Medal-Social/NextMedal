/**
 * Newsletter list: All newsletter issues, newest first.
 * Layout, limits, filters and the RSS link come from blockDesign (Vault spec
 * 2026-10-18 D2). The page holding this block is the collection's index page.
 */

import { EnvelopeIcon } from '@sanity/icons/Envelope';
import { defineType } from 'sanity';
import { richTextField } from '../../fragments/rich-text';
import { blockPreview } from '../preview';

export default defineType({
  name: 'newsletter-frontpage',
  title: 'Newsletter list',
  description: 'All newsletter issues, newest first.',
  icon: EnvelopeIcon,
  type: 'object',
  fields: [richTextField('intro', 'Intro', 'listIntro')],
  preview: blockPreview('Newsletter list', { title: 'intro' }),
});
