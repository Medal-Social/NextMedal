/**
 * Hero Module Schema
 * @version 2.0.0
 * @lastUpdated 2024-12-XX
 * @changelog
 * - 2.0.0: Added video support (Mux and URL), removed text alignment, simplified layout
 * - 1.4.0: Added stats row for displaying metrics with icons
 * - 1.3.0: Removed video/Mux support to simplify
 * - 1.2.0: Added video support with Mux integration
 * - 1.1.0: Added side-by-side layout option
 * - 1.0.0: Initial version
 */

import { BlockContentIcon } from '@sanity/icons';
import { defineArrayMember, defineField, defineType } from 'sanity';
import { getBlockText } from '@/sanity/lib/utils';
import { createUidField } from '../ui/uid-input';

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
  fieldsets: [
    {
      name: 'videoOptions',
      title: 'Video Source',
      options: { collapsible: false },
    },
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
    defineField({
      name: 'content',
      title: 'Content',
      description: 'Main text content (H1 for title, Normal for description)',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'block',
          styles: [
            { title: 'Normal', value: 'normal' },
            { title: 'Heading 1', value: 'h1' },
          ],
          lists: [],
          marks: {
            decorators: [
              { title: 'Strong', value: 'strong' },
              { title: 'Emphasis', value: 'em' },
            ],
          },
        }),
      ],
      group: 'content',
    }),
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
      name: 'videoType',
      title: 'Media Type',
      description: 'Choose between image, Mux video, or YouTube video',
      type: 'string',
      options: {
        list: [
          { title: 'Image', value: 'image' },
          { title: 'Mux Video', value: 'mux' },
          { title: 'YouTube', value: 'youtube' },
        ],
        layout: 'radio',
      },
      initialValue: 'image',
      group: 'media',
    }),
    defineField({
      name: 'image',
      type: 'img',
      group: 'media',
      description: 'Image to display (will show play icon overlay if video is selected)',
    }),
    defineField({
      name: 'muxVideo',
      title: 'Mux Video',
      type: 'mux.video',
      description: 'Upload or select a video from Mux',
      group: 'media',
      hidden: ({ parent }) => parent?.videoType !== 'mux',
    }),
    defineField({
      name: 'videoUrl',
      title: 'YouTube URL',
      description: 'Enter a YouTube video URL (e.g., https://www.youtube.com/watch?v=VIDEO_ID)',
      type: 'url',
      group: 'media',
      hidden: ({ parent }) => parent?.videoType !== 'youtube',
      validation: (Rule) =>
        Rule.custom((value, context) => {
          const parent = context.parent as { videoType?: string } | undefined;
          if (parent?.videoType === 'youtube' && !value) {
            return 'Please enter a YouTube URL';
          }
          if (value && parent?.videoType === 'youtube') {
            const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/;
            if (!youtubeRegex.test(value)) {
              return 'Please enter a valid YouTube URL';
            }
          }
          return true;
        }),
    }),
  ],
  preview: {
    select: {
      media: 'image',
      videoType: 'videoType',
      description: 'content',
    },
    prepare: ({ media, videoType, description }) => {
      const mediaLabel =
        videoType === 'mux' ? 'Mux Video' : videoType === 'url' ? 'Video URL' : 'Image';
      return {
        title: getBlockText(description) || 'Hero',
        subtitle: `Hero • ${mediaLabel}`,
        media: media?.image || BlockContentIcon,
      };
    },
  },
});
