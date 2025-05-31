/**
 * Site Settings Schema
 * @version 1.0.0
 * @lastUpdated 2024-03-21
 * @description Defines global site settings including branding, SEO defaults, and social media links.
 * @changelog
 * - 1.0.0: Initial version with core site configuration options
 */

import { defineField, defineType } from 'sanity';
import { VscGlobe } from 'react-icons/vsc';

export default defineType({
  name: 'site',
  title: 'Site settings',
  type: 'document',
  groups: [
    { name: 'general', title: 'General', default: true },
    { name: 'appearance', title: 'Appearance & Branding' },
    { name: 'navigation', title: 'Navigation' },
  ],
  fields: [
    // General Group - Basic site information and content
    defineField({
      name: 'title',
      title: 'Site Title',
      description: 'The name of your website',
      type: 'string',
      validation: (Rule) => Rule.required(),
      group: 'general',
    }),
    defineField({
      name: 'tagline',
      title: 'Site Tagline',
      description: 'A short slogan or motto for your site',
      type: 'array',
      of: [{ type: 'block' }],
      group: 'general',
    }),
    defineField({
      name: 'announcements',
      title: 'Site Announcements',
      description: 'Special announcements shown across the site',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'announcement' }] }],
      group: 'general',
    }),
    defineField({
      name: 'copyright',
      title: 'Copyright Text',
      description: 'Copyright notice displayed in the footer',
      type: 'array',
      of: [
        {
          type: 'block',
          styles: [{ title: 'Normal', value: 'normal' }],
        },
      ],
      group: 'general',
    }),

    // Appearance & Branding Group - Visual elements and theme
    defineField({
      name: 'logo',
      title: 'Site Logo',
      description: "Upload your site's logo",
      type: 'logo',
      group: 'appearance',
    }),

    // Navigation Group - Menus and links
    defineField({
      name: 'headerMenu',
      title: 'Header Menu',
      description: 'Navigation links shown in the site header',
      type: 'reference',
      to: [{ type: 'navigation' }],
      group: 'navigation',
    }),
    defineField({
      name: 'footerMenu',
      title: 'Footer Menu',
      description: 'Navigation links shown in the site footer',
      type: 'reference',
      to: [{ type: 'navigation' }],
      group: 'navigation',
    }),
    defineField({
      name: 'socialLinks',
      title: 'Social Media Links',
      description: 'List of social media channels (e.g., LinkedIn, Twitter, etc.)',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            { name: 'text', title: 'Text', type: 'string', description: 'Label for the social channel (e.g., LinkedIn, Twitter)' },
            { name: 'url', title: 'URL', type: 'url', description: 'Link to the social profile or page' },
          ],
        },
      ],
      group: 'navigation',
    }),
    defineField({
      name: 'ctas',
      title: 'Header Call-to-Actions',
      description: 'Call to action Buttons that appear in the header',
      type: 'array',
      of: [{ type: 'cta' }],
      group: 'navigation',
    }),
  ],
  preview: {
    prepare: () => ({
      title: 'Site settings',
    }),
  },
});
