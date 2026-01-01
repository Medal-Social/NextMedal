/**
 * Person Schema
 * @version 1.1.0
 * @lastUpdated 2025-12-31
 * @description Defines a team member profile with bio and social links.
 * @changelog
 * - 1.1.0: Expanded socialLinks to 7 platforms (added GitHub and Website)
 * - 1.0.1: Updated header documentation
 * - 1.0.0: Initial version
 */

import { UserIcon } from '@sanity/icons';
import { defineField, defineType } from 'sanity';

export default defineType({
  name: 'person',
  title: 'Team Member',
  type: 'document',
  icon: UserIcon,
  fields: [
    defineField({
      name: 'name',
      title: 'Name',
      description: 'Full name of the team member.',
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
      name: 'slug',
      title: 'Slug',
      description: 'URL-friendly version of the name.',
      type: 'slug',
      options: {
        source: 'name',
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'image',
      title: 'Profile Picture',
      description: 'Image of the person.',
      type: 'image',
      options: {
        hotspot: true,
      },
      validation: (Rule) => Rule.warning('Profile pictures help readers identify team members.'),
    }),
    defineField({
      name: 'banner',
      title: 'Banner Image',
      description:
        'Optional banner image for author cards and pages. If not set, a gradient will be used.',
      type: 'image',
      options: {
        hotspot: true,
      },
    }),
    defineField({
      name: 'bio',
      title: 'Biography',
      type: 'array',
      of: [
        {
          type: 'block',
          styles: [{ title: 'Normal', value: 'normal' }],
          lists: [],
          marks: {
            decorators: [
              { title: 'Strong', value: 'strong' },
              { title: 'Emphasis', value: 'em' },
            ],
            annotations: [
              {
                title: 'Link',
                name: 'link',
                type: 'object',
                fields: [
                  {
                    title: 'URL',
                    name: 'href',
                    type: 'url',
                  },
                ],
              },
            ],
          },
        },
      ],
      description: 'A short biography or description of the person',
    }),
    defineField({
      name: 'socialLinks',
      title: 'Social Media',
      description: 'Add social media profiles',
      type: 'array',
      of: [
        defineField({
          name: 'socialLink',
          title: 'Profile',
          type: 'object',
          fields: [
            defineField({
              name: 'platform',
              title: 'Platform',
              type: 'string',
              options: {
                list: [
                  { title: 'LinkedIn', value: 'linkedin' },
                  { title: 'X (Twitter)', value: 'twitter' },
                  { title: 'GitHub', value: 'github' },
                  { title: 'Instagram', value: 'instagram' },
                  { title: 'YouTube', value: 'youtube' },
                  { title: 'Facebook', value: 'facebook' },
                  { title: 'Website', value: 'website' },
                ],
              },
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: 'url',
              title: 'Profile Link',
              type: 'url',
              validation: (Rule) => Rule.required(),
            }),
          ],
          preview: {
            select: {
              title: 'platform',
              subtitle: 'url',
            },
            prepare({ title, subtitle }) {
              const platforms = {
                linkedin: 'LinkedIn',
                twitter: 'X (Twitter)',
                github: 'GitHub',
                instagram: 'Instagram',
                youtube: 'YouTube',
                facebook: 'Facebook',
                website: 'Website',
              };
              return {
                title: platforms[title as keyof typeof platforms] || title,
                subtitle: subtitle,
              };
            },
          },
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
      media: media || UserIcon,
    }),
  },
});
