/**
 * Featured Hero Module Schema
 * @version 2.0.0
 * @lastUpdated 2024-12-XX
 * @changelog
 * - 2.0.0: Added video support, removed features/stats/direction fields
 * - 1.0.0: Initial version
 */

import { BsColumnsGap } from 'react-icons/bs';
import { defineField, defineType } from 'sanity';
import { createAlignmentField } from '@/sanity/lib/schema-factory';
import { getBlockText } from '@/sanity/lib/utils';

export default defineType({
  name: 'featuredHero',
  title: 'Featured Hero',
  icon: BsColumnsGap,
  type: 'object',
  groups: [
    { name: 'content', title: 'Content', default: true },
    { name: 'media', title: 'Media' },
    { name: 'options', title: 'Layout Options' },
  ],
  fieldsets: [
    {
      name: 'alignment',
      title: 'Alignment',
      options: { columns: 2 },
    },
    {
      name: 'videoOptions',
      title: 'Video Source',
      options: { collapsible: false },
    },
  ],
  fields: [
    defineField({
      name: 'options',
      type: 'module-options',
      group: 'options',
    }),
    defineField({
      name: 'pretitle',
      type: 'string',
      group: 'content',
    }),
    defineField({
      name: 'content',
      type: 'array',
      of: [{ type: 'block' }],
      group: 'content',
    }),
    defineField({
      name: 'ctas',
      title: 'Call-to-actions',
      type: 'array',
      of: [{ type: 'cta' }],
      group: 'content',
    }),
    defineField({
      name: 'videoType',
      title: 'Media Type',
      description: 'Choose between video or image',
      type: 'string',
      options: {
        list: [
          { title: 'Image', value: 'image' },
          { title: 'Mux Video', value: 'mux' },
          { title: 'Video URL', value: 'url' },
        ],
        layout: 'radio',
      },
      initialValue: 'image',
      group: 'media',
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
      title: 'Video URL',
      description: 'URL for the video (MP4, WebM, etc.)',
      type: 'url',
      group: 'media',
      hidden: ({ parent }) => parent?.videoType !== 'url',
    }),
    defineField({
      name: 'image',
      type: 'img',
      group: 'media',
      description: 'Image to show if no video is provided or as fallback',
      hidden: ({ parent }) => parent?.videoType === 'mux' || parent?.videoType === 'url',
    }),
    createAlignmentField({
      name: 'textAlign',
      title: 'Text alignment',
      group: 'options',
      fieldset: 'alignment',
      initialValue: 'left',
    }),
  ],
  preview: {
    select: {
      title: 'title',
      pretitle: 'pretitle',
      media: 'image',
      videoType: 'videoType',
      description: 'content',
    },
    prepare: ({ title, pretitle, media, videoType, description }) => {
      const mediaLabel =
        videoType === 'mux' ? 'Mux Video' : videoType === 'url' ? 'Video URL' : 'Image';
      return {
        title: title || getBlockText(description) || 'Featured Hero',
        subtitle: `${pretitle || 'Featured Hero'} • ${mediaLabel}`,
        media: media?.image || BsColumnsGap,
      };
    },
  },
});
