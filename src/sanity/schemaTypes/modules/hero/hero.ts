/**
 * Page top: title and text, up to two buttons, and a picture or a YouTube
 * link. Background, button looks and anchor come from blockDesign (Vault spec
 * 2026-10-18 D2/D3).
 * @changelog
 * - 4.0.0: Lean — no background, anchor or button-style options; plain labels
 * - 3.0.0: Picture or YouTube link; Mux and the media type switch removed (Mux is opt-in)
 */

import { BlockContentIcon } from '@sanity/icons/BlockContent';
import { defineArrayMember, defineField, defineType } from 'sanity';
import { getYouTubeId } from '@/lib/youtube';
import { richTextField } from '../../fragments/rich-text';
import { blockPreview } from '../preview';

export default defineType({
  name: 'hero',
  title: 'Page top',
  description: 'The top of a page: a title, a short text, buttons, and a picture or a video.',
  icon: BlockContentIcon,
  type: 'object',
  fields: [
    richTextField('content', 'Title and text', 'pageTop'),
    defineField({
      name: 'ctas',
      title: 'Buttons',
      description: 'The first is a solid button, the second a quieter one.',
      type: 'array',
      of: [defineArrayMember({ type: 'cta' })],
      validation: (Rule) => Rule.max(2),
    }),
    defineField({
      name: 'image',
      title: 'Picture',
      type: 'img',
      description: 'Shown when there is no video link, and as the video cover.',
    }),
    defineField({
      name: 'videoUrl',
      title: 'Video link',
      description: 'A YouTube link. Leave empty to show the picture.',
      type: 'url',
      validation: (Rule) =>
        Rule.custom((value) => {
          if (!value) return true;
          return getYouTubeId(value) ? true : 'Please paste a link to one YouTube video';
        }),
    }),
  ],
  preview: blockPreview('Page top', { title: 'content', media: 'image.image' }),
});
