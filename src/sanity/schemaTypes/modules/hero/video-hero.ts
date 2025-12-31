/**
 * Video Hero Module Schema
 * @version 1.0.1
 * @lastUpdated 2025-12-23
 * @description A high-impact hero section featuring a background video (Mux or YouTube).
 * @changelog
 * - 1.0.1: Added header documentation
 * - 1.0.0: Initial version
 */

import { VideoIcon } from '@sanity/icons';
import type { Rule } from 'sanity';
import { defineField } from 'sanity';
import { createUidField } from '../ui/uid-input';

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
    const urlParams = new URLSearchParams(url.split('?')[1]);
    return urlParams.get('v') || '';
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
  name: 'videoHero',
  title: 'Video Hero',
  type: 'object',
  icon: VideoIcon,
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
    },
    prepare({ videoType, media }) {
      const title = 'Video Hero';
      let subtitle = '';

      if (videoType === 'youtube') {
        subtitle = 'YouTube Video';
      } else if (videoType === 'mux') {
        subtitle = 'Mux Video';
      }

      return {
        title,
        subtitle,
        media,
      };
    },
  },
  fields: [
    createUidField(),
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
