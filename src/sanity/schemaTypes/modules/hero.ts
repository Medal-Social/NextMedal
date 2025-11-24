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

import { TfiLayoutCtaCenter } from 'react-icons/tfi';
import { defineArrayMember, defineField, defineType } from 'sanity';
import { getBlockText } from '@/sanity/lib/utils';
import { createUidField } from './uid-input';

export default defineType({
  name: 'hero',
  title: 'Hero',
  icon: TfiLayoutCtaCenter,
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
      fields: [createUidField()],
    }),
    defineField({
      name: 'content',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'block',
          marks: {
            decorators: [
              { title: 'Strong', value: 'strong' },
              { title: 'Emphasis', value: 'em' },
              { title: 'Code', value: 'code' },
              {
                title: 'Gradient (Purple)',
                value: 'gradient',
              },
              {
                title: 'Primary Color',
                value: 'primary',
              },
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
      of: [
        defineArrayMember({
          name: 'heroCta',
          type: 'object',
          title: 'Hero Button',
          fields: [
            defineField({
              name: 'text',
              title: 'Button Text',
              description: 'The text displayed on the button',
              type: 'string',
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: 'linkType',
              title: 'Link Type',
              description: 'Choose where this button should link to',
              type: 'string',
              options: {
                layout: 'radio',
                list: [
                  { title: 'Internal Page', value: 'internal' },
                  { title: 'External Website', value: 'external' },
                ],
              },
              validation: (Rule) => Rule.required(),
              initialValue: 'internal',
            }),
            defineField({
              name: 'internalLink',
              title: 'Internal Page',
              description: 'Select a page within this website',
              type: 'reference',
              to: [
                { type: 'page' },
                { type: 'blog.post' },
                // { type: "help" }, // Commented out as help might not exist in NextMedal yet
                // { type: "changelog" }, // Commented out as changelog might not exist in NextMedal yet
              ],
              validation: (Rule) =>
                Rule.custom((value, context: any) => {
                  if (context.parent?.linkType === 'internal' && !value) {
                    return 'Please select a page';
                  }
                  return true;
                }),
              hidden: ({ parent }) => parent?.linkType !== 'internal',
            }),
            defineField({
              name: 'externalLink',
              title: 'External URL',
              description: 'Enter a link to an external website',
              placeholder: 'https://example.com',
              type: 'url',
              validation: (Rule) =>
                Rule.uri({
                  scheme: ['http', 'https', 'mailto', 'tel'],
                  allowRelative: true,
                }).custom((value, context: any) => {
                  if (context.parent?.linkType === 'external' && !value) {
                    return 'Please enter a URL';
                  }
                  return true;
                }),
              hidden: ({ parent }) => parent?.linkType !== 'external',
            }),
            defineField({
              name: 'style',
              title: 'Button Style',
              description: 'Choose the visual style of the button',
              type: 'string',
              options: {
                list: [
                  {
                    title: '→ Primary',
                    value: 'default',
                  },
                  {
                    title: '⇢ Secondary',
                    value: 'outline',
                  },
                ],
              },
              initialValue: 'default',
            }),
          ],
          preview: {
            select: {
              text: 'text',
              style: 'style',
              internalTitle: 'internalLink.title',
              externalLink: 'externalLink',
            },
            prepare: ({ text, style, internalTitle, externalLink }) => {
              const styleDisplay = style === 'outline' ? 'Secondary' : 'Primary';
              const destination = internalTitle || externalLink || 'No link';
              return {
                title: text || 'Untitled Button',
                subtitle: `${styleDisplay} → ${destination}`,
              };
            },
          },
        }),
      ],
      validation: (Rule) =>
        Rule.max(2).custom((ctas) => {
          if (!ctas || ctas.length === 0) return true;

          const styles = ctas.map((cta: any) => cta?.style || 'default');

          // Check for invalid styles
          const invalidStyles = styles.filter(
            (style: string) => style !== 'default' && style !== 'outline'
          );
          if (invalidStyles.length > 0) {
            return 'Only Primary (default) and Secondary (outline) styles are allowed';
          }

          // Check for duplicates
          const defaultCount = styles.filter((s: string) => s === 'default').length;
          const outlineCount = styles.filter((s: string) => s === 'outline').length;
          if (defaultCount > 1) {
            return 'Only one Primary button is allowed';
          }
          if (outlineCount > 1) {
            return 'Only one Secondary button is allowed';
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
      validation: (Rule) => Rule.required(),
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
        Rule.custom((value, context: any) => {
          if (context.parent?.videoType === 'youtube' && !value) {
            return 'Please enter a YouTube URL';
          }
          if (value && context.parent?.videoType === 'youtube') {
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
      title: 'title',
      media: 'image',
      videoType: 'videoType',
      description: 'content',
    },
    prepare: ({ title, media, videoType, description }) => {
      const mediaLabel =
        videoType === 'mux' ? 'Mux Video' : videoType === 'url' ? 'Video URL' : 'Image';
      return {
        title: title || getBlockText(description) || 'Hero',
        subtitle: `Hero • ${mediaLabel}`,
        media: media?.image || TfiLayoutCtaCenter,
      };
    },
  },
});
