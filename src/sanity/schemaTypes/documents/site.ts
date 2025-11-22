/**
 * Site Settings Schema
 * @version 1.0.0
 * @lastUpdated 2024-03-21
 * @description Defines global site settings including branding, SEO defaults, and social media links.
 * @changelog
 * - 1.0.0: Initial version with core site configuration options
 */

import { defineField, defineType } from 'sanity';

export default defineType({
  name: 'site',
  title: 'Site Settings',
  type: 'document',
  groups: [
    { name: 'general', title: 'General', default: true },
    { name: 'appearance', title: 'Site Logo' },
    { name: 'navigation', title: 'Navigation' },
  ],
  fieldsets: [
    { name: 'branding', title: 'Branding', options: { collapsible: true, collapsed: false } },
    { name: 'footer', title: 'Footer', options: { collapsible: false } },
  ],
  fields: [
    // General Group - Basic site information and content
    defineField({
      name: 'title',
      title: 'Site Title',
      description: 'The name of your website. This appears in the browser tab and search results.',
      type: 'string',
      validation: (Rule) => Rule.required().min(3).max(60),
      group: 'general',
    }),
    defineField({
      name: 'tagline',
      title: 'Site Tagline',
      description: 'A short slogan or motto for your site. Shown in meta tags and some layouts.',
      type: 'array',
      of: [{ type: 'block' }],
      group: 'general',
    }),
    defineField({
      name: 'announcements',
      title: 'Site Announcements',
      description:
        'Special announcements shown across the site. Useful for promotions or urgent news.',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'announcement' }] }],
      group: 'general',
      initialValue: [],
    }),
    // Appearance & Branding Group - Visual elements
    defineField({
      name: 'logo',
      title: 'Site Logo',
      description: "Upload your site's logo. Used in the header and for social sharing.",
      type: 'logo',
      group: 'appearance',
      fieldset: 'branding',
    }),
    // Navigation Group - Header first, then footer, then rest
    defineField({
      name: 'headerMenu',
      title: 'Header Menu',
      description: 'Navigation links shown in the site header.',
      type: 'reference',
      to: [{ type: 'navigation' }],
      group: 'navigation',
    }),
    defineField({
      name: 'ctas',
      title: 'Header Call-to-Actions',
      description: 'Call to action buttons that appear in the header.',
      type: 'array',
      of: [{ type: 'cta' }],
      group: 'navigation',
      initialValue: [],
      validation: (Rule) => Rule.min(1).error('Add at least one CTA.'),
    }),
    defineField({
      name: 'footerMenu',
      title: 'Footer Menu',
      description: 'Navigation links shown in the site footer.',
      type: 'reference',
      to: [{ type: 'navigation' }],
      group: 'navigation',
      fieldset: 'footer',
    }),
    defineField({
      name: 'copyright',
      title: 'Copyright Text',
      description: 'Copyright notice displayed in the footer.',
      type: 'array',
      of: [
        {
          type: 'block',
          styles: [{ title: 'Normal', value: 'normal' }],
        },
      ],
      group: 'general',
      fieldset: 'footer',
    }),
    defineField({
      name: 'socialLinks',
      title: 'Social Media Links',
      description: 'List of social media channels (e.g., LinkedIn, Twitter, etc.).',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            {
              name: 'text',
              title: 'Label',
              type: 'string',
              description: 'Label for the social channel (e.g., LinkedIn, Twitter)',
              validation: (Rule) => Rule.required(),
            },
            {
              name: 'url',
              title: 'URL',
              type: 'url',
              description: 'Link to the social profile or page',
              validation: (Rule) => Rule.required().uri({ scheme: ['http', 'https'] }),
            },
          ],
        },
      ],
      group: 'navigation',
      initialValue: [],
      validation: (Rule) => Rule.min(1).error('Add at least one social link.'),
    }),
  ],
  preview: {
    select: {
      title: 'title',
      tagline: 'tagline',
    },
    prepare: ({ title, tagline }) => ({
      title: title || 'Site settings',
      subtitle: tagline?.[0]?.children
        ? tagline[0]?.children.map((c: any) => c.text).join(' ')
        : '',
    }),
  },
});
