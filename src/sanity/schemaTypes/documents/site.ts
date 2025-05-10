/**
 * Site Settings Schema
 * @version 1.0.0
 * @lastUpdated 2024-03-21
 * @description Defines global site settings including branding, SEO defaults, and social media links.
 * @changelog
 * - 1.0.0: Initial version with core site configuration options
 */

import { VscGlobe } from 'react-icons/vsc';
import { defineField, defineType } from 'sanity';

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
    defineField({
      name: 'themeSettings',
      title: 'Theme Options',
      description: 'Configure dark and light mode appearances',
      type: 'object',
      group: 'appearance',
      options: {
        collapsible: true,
        collapsed: false,
      },
      fields: [
        defineField({
          name: 'defaultTheme',
          title: 'Default Theme Mode',
          description:
            'The default theme that will be used when a user visits the site for the first time',
          type: 'string',
          options: {
            list: [
              { title: 'Light Mode', value: 'light' },
              { title: 'Dark Mode', value: 'dark' },
              { title: 'System Default', value: 'system' },
            ],
          },
          initialValue: 'dark',
        }),
        defineField({
          name: 'darkMode',
          title: 'Dark Mode Colors',
          description: 'Color theme used in dark mode',
          type: 'reference',
          to: [{ type: 'theme' }],
        }),
        defineField({
          name: 'lightMode',
          title: 'Light Mode Colors',
          description: 'Color theme used in light mode',
          type: 'reference',
          to: [{ type: 'theme' }],
        }),
      ],
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
      name: 'social',
      title: 'Social Media Links',
      description: 'Links to your social media profiles',
      type: 'reference',
      to: [{ type: 'navigation' }],
      group: 'navigation',
    }),
    defineField({
      name: 'ctas',
      title: 'Global Call-to-Actions',
      description: 'Buttons that appear in the header and/or footer',
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
