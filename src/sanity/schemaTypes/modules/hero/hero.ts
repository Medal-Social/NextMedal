/**
 * Hero Module Schema
 * @version 3.0.0
 * @lastUpdated 2024-12-XX
 * @changelog
 * - 3.0.0: Picture or YouTube link; Mux and the media type switch removed (Mux is opt-in)
 * - 2.0.0: Added video support (Mux and URL), removed text alignment, simplified layout
 * - 1.4.0: Added stats row for displaying metrics with icons
 * - 1.3.0: Removed video/Mux support to simplify
 * - 1.2.0: Added video support with Mux integration
 * - 1.1.0: Added side-by-side layout option
 * - 1.0.0: Initial version
 */

import { BlockContentIcon } from '@sanity/icons/BlockContent';
import { defineArrayMember, defineField, defineType } from 'sanity';
import { getBlockText } from '@/sanity/lib/utils';
import { richTextField } from '../../fragments/rich-text';
import { createUidField } from '../ui/uid-input';

const YOUTUBE_LINK = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/;

export default defineType({
  name: 'hero',
  title: 'Hero',
  icon: BlockContentIcon,
  type: 'object',
  groups: [
    { name: 'content', title: 'Content', default: true },
    { name: 'media', title: 'Media' },
    { name: 'options', title: 'Advanced Options' },
  ],
  fields: [
    defineField({
      name: 'options',
      type: 'object',
      title: 'Advanced Options',
      group: 'options',
      fields: [
        createUidField(),
        defineField({
          name: 'bgFrom',
          title: 'Background Gradient Start',
          type: 'string',
          options: {
            list: [
              { title: 'Vibrant', value: 'brand-vibrant' },
              { title: 'Purple', value: 'brand-purple' },
              { title: 'Cyan', value: 'brand-cyan' },
              { title: 'Rich', value: 'brand-rich' },
              { title: 'Lavender', value: 'brand-lavender' },
              { title: 'Navy', value: 'brand-navy' },
            ],
          },
          initialValue: 'brand-vibrant',
        }),
        defineField({
          name: 'bgTo',
          title: 'Background Gradient End',
          type: 'string',
          options: {
            list: [
              { title: 'Vibrant', value: 'brand-vibrant' },
              { title: 'Purple', value: 'brand-purple' },
              { title: 'Cyan', value: 'brand-cyan' },
              { title: 'Rich', value: 'brand-rich' },
              { title: 'Lavender', value: 'brand-lavender' },
              { title: 'Navy', value: 'brand-navy' },
            ],
          },
          initialValue: 'brand-purple',
        }),
      ],
    }),
    richTextField('content', 'Title and text', 'pageTop', { group: 'content' }),
    defineField({
      name: 'ctas',
      title: 'Call-to-actions',
      description: 'Add up to 2 buttons (one primary, one secondary)',
      type: 'array',
      of: [defineArrayMember({ type: 'cta' })],
      validation: (Rule) =>
        Rule.max(2)
          .warning('More than 2 buttons may clutter the Hero layout')
          .custom((ctas) => {
            if (!ctas || ctas.length === 0) return true;

            const styles = ctas.map((cta) => (cta as { style?: string })?.style || 'primary');

            // Check for duplicates
            const primaryCount = styles.filter((style) => style === 'primary').length;

            if (primaryCount > 1) {
              return 'Only one Primary button is allowed';
            }

            return true;
          }),
      group: 'content',
    }),
    defineField({
      name: 'image',
      type: 'img',
      group: 'media',
      description: 'Shown when there is no video link, and as the video cover.',
    }),
    defineField({
      name: 'videoUrl',
      title: 'Video link',
      description: 'A YouTube link. Leave empty to show the picture.',
      type: 'url',
      group: 'media',
      validation: (Rule) =>
        Rule.custom((value) => {
          if (!value) return true;
          return YOUTUBE_LINK.test(value) || 'Please enter a valid YouTube link';
        }),
    }),
  ],
  preview: {
    select: {
      media: 'image',
      videoUrl: 'videoUrl',
      description: 'content',
    },
    prepare: ({ media, videoUrl, description }) => ({
      title: getBlockText(description) || 'Page top',
      subtitle: `Page top • ${videoUrl ? 'Video link' : 'Picture'}`,
      media: media?.image || BlockContentIcon,
    }),
  },
});
