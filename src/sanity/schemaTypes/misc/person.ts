import { GoPerson } from 'react-icons/go';
import { defineField, defineType } from 'sanity';

export default defineType({
  name: 'person',
  title: 'Person',
  type: 'document',
  icon: GoPerson,
  fields: [
    defineField({
      name: 'name',
      title: 'Name',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'title',
      title: 'Job Title',
      type: 'string',
      description: 'Professional title or role that appears under the name',
    }),
    defineField({
      name: 'bio',
      title: 'Biography',
      type: 'text',
      description: 'A short biography or description of the person',
      rows: 3,
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'name',
      },
    }),
    defineField({
      name: 'image',
      type: 'image',
      options: {
        hotspot: true,
      },
    }),
    defineField({
      name: 'socialLinks',
      title: 'Social Media Links',
      type: 'object',
      fields: [
        defineField({
          name: 'linkedIn',
          title: 'LinkedIn URL',
          type: 'url',
          description: 'Full LinkedIn profile URL',
        }),
        defineField({
          name: 'twitter',
          title: 'X/Twitter URL',
          type: 'url',
          description: 'Full X/Twitter profile URL',
        }),
        defineField({
          name: 'instagram',
          title: 'Instagram URL',
          type: 'url',
          description: 'Full Instagram profile URL',
        }),
        defineField({
          name: 'youtube',
          title: 'YouTube URL',
          type: 'url',
          description: 'Full YouTube channel or video URL',
        }),
      ],
    }),
  ],
  preview: {
    select: {
      title: 'name',
      subtitle: 'title',
      media: 'image',
    },
    prepare: ({ title, subtitle, media }) => ({
      title: title || 'Untitled',
      subtitle: subtitle || '',
      media: media || GoPerson,
    }),
  },
});
