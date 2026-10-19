/**
 * Event list: All events, upcoming first.
 * Layout, limits, filters and the RSS link come from blockDesign (Vault spec
 * 2026-10-18 D2). The page holding this block is the collection's index page.
 */

import { CalendarIcon } from '@sanity/icons/Calendar';
import { defineType } from 'sanity';
import { richTextField } from '../../fragments/rich-text';
import { blockPreview } from '../preview';

export default defineType({
  name: 'events-frontpage',
  title: 'Event list',
  description: 'All events, upcoming first.',
  icon: CalendarIcon,
  type: 'object',
  fields: [richTextField('intro', 'Intro', 'listIntro')],
  preview: blockPreview('Event list', { title: 'intro' }),
});
