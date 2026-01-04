/**
 * Testimonials Module Schema
 * @version 1.0.0
 * @lastUpdated 2026-01-03
 * @description Displays customer testimonials/reviews with schema.org Review markup for SEO.
 * @changelog
 * - 1.0.0: Initial version with Review schema support
 */

import { CommentIcon } from '@sanity/icons';
import { defineArrayMember, defineField, defineType } from 'sanity';
import { getBlockText } from '@/sanity/lib/utils';

export default defineType({
  name: 'testimonials',
  title: 'Testimonials',
  type: 'object',
  icon: CommentIcon,
  groups: [
    { name: 'content', title: 'Content', default: true },
    { name: 'options', title: 'Advanced Options' },
  ],
  fields: [
    defineField({
      name: 'options',
      type: 'module-options',
      group: 'options',
    }),
    defineField({
      name: 'intro',
      title: 'Intro',
      description: 'Optional introductory text before the testimonials.',
      type: 'array',
      of: [
        {
          type: 'block',
          styles: [
            { title: 'Normal', value: 'normal' },
            { title: 'Heading 2', value: 'h2' },
            { title: 'Heading 3', value: 'h3' },
          ],
          lists: [],
          marks: {
            decorators: [
              { title: 'Strong', value: 'strong' },
              { title: 'Emphasis', value: 'em' },
            ],
          },
        },
      ],
      group: 'content',
    }),
    defineField({
      name: 'reviews',
      title: 'Testimonials',
      description: 'Customer reviews and testimonials.',
      type: 'array',
      of: [
        defineArrayMember({
          name: 'testimonial',
          type: 'object',
          icon: CommentIcon,
          fields: [
            defineField({
              name: 'authorName',
              title: 'Author Name',
              type: 'string',
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: 'authorTitle',
              title: 'Author Title',
              description: 'Job title, company, or other identifier',
              type: 'string',
            }),
            defineField({
              name: 'authorImage',
              title: 'Author Photo',
              type: 'image',
              options: {
                hotspot: true,
              },
            }),
            defineField({
              name: 'rating',
              title: 'Rating',
              description: 'Star rating out of 5',
              type: 'number',
              validation: (Rule) => Rule.required().min(1).max(5).integer(),
              initialValue: 5,
            }),
            defineField({
              name: 'reviewText',
              title: 'Review Text',
              type: 'text',
              rows: 4,
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: 'reviewDate',
              title: 'Review Date',
              type: 'date',
            }),
            defineField({
              name: 'embed',
              title: 'Social Media Embed',
              description:
                'Optional social media post or video embed to showcase with the testimonial',
              type: 'socialEmbed',
            }),
          ],
          preview: {
            select: {
              title: 'authorName',
              subtitle: 'reviewText',
              rating: 'rating',
              media: 'authorImage',
            },
            prepare: ({ title, subtitle, rating, media }) => ({
              title,
              subtitle: `${'⭐'.repeat(rating || 0)} ${subtitle ? subtitle.substring(0, 60) : ''}`,
              media,
            }),
          },
        }),
      ],
      group: 'content',
    }),
  ],
  preview: {
    select: {
      intro: 'intro',
      reviews: 'reviews',
    },
    prepare: ({ intro, reviews }) => ({
      title: getBlockText(intro) || 'Testimonials',
      subtitle: `${reviews?.length || 0} testimonials`,
    }),
  },
});
