/**
 * Video Schema
 * @version 1.0.1
 * @lastUpdated 2025-12-23
 * @description Standardized video object supporting Mux and YouTube.
 * @changelog
 * - 1.0.1: Added header documentation
 * - 1.0.0: Initial version
 */

import { PlayIcon } from '@sanity/icons';
import type { Rule } from 'sanity';
import { defineField } from 'sanity';

// Extract YouTube video ID from various URL formats
export const getYouTubeVideoId = (url: string) => {
  if (!url) return '';

  // Handle youtu.be format
  if (url.includes('youtu.be/')) {
    const id = url.split('youtu.be/')[1];
    return id.split('?')[0];
  }

  // Handle youtube.com/watch?v= format
  if (url.includes('youtube.com/watch')) {
    const queryString = url.split('?')[1];
    if (queryString) {
      const urlParams = new URLSearchParams(queryString);
      return urlParams.get('v') || '';
    }
    return '';
  }

  // Handle youtube.com/embed/ format
  if (url.includes('youtube.com/embed/')) {
    const id = url.split('youtube.com/embed/')[1];
    return id.split('?')[0];
  }

  // If it's already just an ID (no slashes or dots)
  if (!url.includes('/') && !url.includes('.')) {
    return url;
  }

  return '';
};

export default defineField({
  name: 'video',
  title: 'Video',
  type: 'object',
  icon: PlayIcon,
  fieldsets: [
    {
      name: 'videoOptions',
      title: 'Video Source',
      options: { collapsible: false },
    },
  ],
  preview: {
    select: {
      videoType: 'type',
      media: 'thumbnail',
      title: 'title',
    },
    prepare({ videoType, media, title }) {
      const displayTitle = title || 'Video';
      let subtitle = '';

      if (videoType === 'youtube') {
        subtitle = 'YouTube Video';
      } else if (videoType === 'mux') {
        subtitle = 'Mux Video';
      }

      return {
        title: displayTitle,
        subtitle,
        media,
      };
    },
  },
  fields: [
    {
      name: 'title',
      title: 'Title',
      type: 'string',
      description: 'Optional title for the video',
    },
    {
      name: 'type',
      title: 'Video Type',
      type: 'string',
      fieldset: 'videoOptions',
      options: {
        list: [
          { title: 'Mux', value: 'mux' },
          { title: 'YouTube', value: 'youtube' },
        ],
        layout: 'radio',
      },
      validation: (rule: Rule) => rule.required(),
    },
    {
      name: 'videoId',
      title: 'YouTube URL or ID',
      type: 'string',
      description:
        'Paste the full YouTube video URL (or just the ID). The video ID will be automatically extracted.',
      fieldset: 'videoOptions',
      hidden: ({ parent }) => parent?.type !== 'youtube',
      validation: (rule: Rule) =>
        rule.custom((value, context) => {
          const parent = context.parent as { type?: string } | undefined;
          if (parent?.type === 'youtube' && !value) {
            return 'YouTube URL is required';
          }
          const videoId = getYouTubeVideoId(value as string);
          if (parent?.type === 'youtube' && !videoId) {
            return 'Invalid YouTube URL';
          }
          return true;
        }),
    },
    {
      name: 'muxVideo',
      title: 'Mux Video',
      type: 'mux.video',
      description: 'Upload or select a video from Mux',
      fieldset: 'videoOptions',
      hidden: ({ parent }) => parent?.type !== 'mux',
      validation: (rule: Rule) =>
        rule.custom((value, context) => {
          const parent = context.parent as { type?: string } | undefined;
          if (parent?.type === 'mux' && !value) {
            return 'Mux video is required';
          }
          return true;
        }),
    },
    {
      name: 'thumbnail',
      title: 'Thumbnail Image',
      type: 'image',
      description: 'This image will be shown before the video plays',
      options: {
        hotspot: true,
      },
      validation: (rule: Rule) =>
        rule.warning('A thumbnail is recommended for better user experience'),
    },
  ],
});
