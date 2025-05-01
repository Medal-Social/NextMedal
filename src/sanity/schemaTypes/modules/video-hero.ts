import { VscDeviceCameraVideo } from 'react-icons/vsc';
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
  icon: VscDeviceCameraVideo,
  fieldsets: [
    {
      name: 'videoOptions',
      title: 'Video Source',
      options: { collapsible: false },
    },
  ],
  preview: {
    select: {
      title: 'title',
      videoType: 'type',
      media: 'thumbnail',
    },
    prepare({ title, videoType, media }) {
      let subtitle = '';

      if (videoType === 'youtube') {
        subtitle = 'YouTube Video';
      } else if (videoType === 'mux') {
        subtitle = 'Mux Video';
      }

      return {
        title: title || 'Video Hero',
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
      fieldset: 'videoOptions',
      validation: (Rule: any) => Rule.required(),
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
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'videoId',
      title: 'YouTube URL or ID',
      type: 'url',
      description:
        'Paste the full YouTube video URL (or just the ID). The video ID will be automatically extracted.',
      fieldset: 'videoOptions',
      hidden: ({ parent }) => parent?.type !== 'youtube',
      validation: (Rule: any) =>
        Rule.custom((value: string, context: any) => {
          if (context.parent?.type === 'youtube' && !value) {
            return 'YouTube URL is required';
          }
          const videoId = getYouTubeVideoId(value);
          if (context.parent?.type === 'youtube' && !videoId) {
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
      validation: (Rule: any) =>
        Rule.custom((value: any, context: any) => {
          if (context.parent?.type === 'mux' && !value) {
            return 'Mux video is required for Mux videos';
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
      validation: (Rule: any) => Rule.required(),
    },
  ],
});
