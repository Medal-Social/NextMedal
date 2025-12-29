/**
 * Site Settings Schema
 * @version 1.0.1
 * @lastUpdated 2025-12-23
 * @description Defines global site settings including branding, SEO defaults, and social media links.
 * @changelog
 * - 1.0.1: Updated header documentation
 * - 1.0.0: Initial version with core site configuration options
 */

import { CogIcon, ControlsIcon, MenuIcon } from '@sanity/icons';
import { defineField, defineType } from 'sanity';
import { getBlockText } from '@/sanity/lib/utils';
// import modules from '../fragments/modules';

export default defineType({
  name: 'site',
  title: 'Site Settings',
  type: 'document',
  groups: [
    { name: 'general', title: 'General', icon: CogIcon, default: true },
    { name: 'navigation', title: 'Navigation', icon: MenuIcon },
    { name: 'advanced', title: 'Advanced Options', icon: ControlsIcon },
  ],
  fieldsets: [
    { name: 'header', title: 'Header', options: { collapsible: true, collapsed: true } },
    { name: 'footer', title: 'Footer', options: { collapsible: true, collapsed: true } },
    {
      name: 'cookies',
      title: 'Cookie Settings',
      options: { collapsible: true, collapsed: true },
    },
  ],
  fields: [
    // General Group
    defineField({
      name: 'language',
      type: 'string',
      readOnly: true,
      hidden: true,
    }),
    defineField({
      name: 'banners',
      title: 'Site Banners',
      description: 'Special banners shown across the site. Useful for promotions or urgent news.',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'banner' }] }],
      group: 'advanced',
      initialValue: [],
    }),
    defineField({
      name: 'title',
      title: 'Site Title',
      description: 'The name of your website. This appears in the browser tab and search results.',
      type: 'string',
      validation: (Rule) => Rule.required().min(3).max(60),
      group: 'general',
    }),
    defineField({
      name: 'logo',
      title: 'Site Logo',
      description: "Upload your site's logo. Used in the header and for social sharing.",
      type: 'reference',
      to: [{ type: 'logo' }],
      group: 'general',
    }),
    defineField({
      name: 'tagline',
      title: 'Site Tagline',
      description: 'A short slogan or motto for your site. Shown in meta tags and some layouts.',
      type: 'array',
      of: [
        {
          type: 'block',
          styles: [],
          lists: [],
          marks: {
            decorators: [
              { title: 'Strong', value: 'strong' },
              { title: 'Emphasis', value: 'em' },
            ],
          },
        },
      ],
      group: 'general',
      validation: (Rule) =>
        Rule.custom((blocks) => {
          const text = getBlockText(blocks as Sanity.BlockContent, ' ');
          return text.length > 200
            ? 'Tagline should be concise (recommended max 200 characters)'
            : true;
        }).warning(),
    }),

    // Navigation Group
    defineField({
      name: 'headerMenu',
      title: 'Header Menu',
      description: 'Navigation links shown in the site header.',
      type: 'reference',
      to: [{ type: 'navigation' }],
      group: 'navigation',
      fieldset: 'header',
    }),
    defineField({
      name: 'enableSearch',
      title: 'Enable Search',
      description: 'Show the search bar in the header.',
      type: 'boolean',
      initialValue: true,
      group: 'advanced',
    }),
    defineField({
      name: 'ctas',
      title: 'Action Buttons',
      description:
        'Primary action buttons displayed in the header (e.g., "Get Started", "Contact").',
      type: 'array',
      of: [{ type: 'cta' }],
      group: 'navigation',
      fieldset: 'header',
      initialValue: [],
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
      title: 'Footer Text',
      description: 'Copyright notice and credits displayed in the footer.',
      type: 'array',
      of: [
        {
          type: 'block',
          styles: [],
          lists: [],
          marks: {
            decorators: [
              { title: 'Strong', value: 'strong' },
              { title: 'Emphasis', value: 'em' },
            ],
          },
        },
      ],
      group: 'navigation',
      fieldset: 'footer',
      validation: (Rule) =>
        Rule.custom((blocks) => {
          const text = getBlockText(blocks as Sanity.BlockContent, ' ');
          return text.length > 500
            ? 'Footer text should be concise (recommended max 500 characters)'
            : true;
        }).warning(),
    }),
    defineField({
      name: 'footerLinks',
      title: 'Additional Links',
      description: 'Additional links to display in the footer (e.g. Locations, Legal)',
      type: 'array',
      of: [{ type: 'menuItem' }],
      group: 'navigation',
      fieldset: 'footer',
    }),
    defineField({
      name: 'systemStatus',
      title: 'System Status',
      description: 'System status indicator link',
      type: 'object',
      group: 'navigation',
      fieldset: 'footer',
      fields: [
        defineField({
          name: 'title',
          title: 'Title',
          type: 'string',
          initialValue: 'All Systems Normal',
          validation: (Rule) => Rule.required(),
        }),
        defineField({
          name: 'url',
          title: 'URL',
          type: 'url',
          validation: (Rule) => Rule.required().uri({ scheme: ['http', 'https'] }),
        }),
      ],
    }),
    defineField({
      name: 'socialLinks',
      title: 'Social Media Links',
      description: 'List of social media channels (e.g., LinkedIn, Twitter, etc.).',
      type: 'array',
      of: [
        {
          name: 'social-link',
          type: 'object',
          fields: [
            {
              name: 'text',
              title: 'Platform',
              type: 'string',
              options: {
                list: [
                  'Facebook',
                  'Instagram',
                  'LinkedIn',
                  'X (Twitter)',
                  'YouTube',
                  'TikTok',
                  'GitHub',
                ],
              },
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
          preview: {
            select: {
              title: 'text',
              subtitle: 'url',
            },
          },
        },
      ],
      group: 'navigation',
      fieldset: 'footer',
      initialValue: [],
    }),

    // Cookie Consent Group
    defineField({
      name: 'cookieConsent',
      title: 'Cookie Consent',
      type: 'object',
      group: 'advanced',
      fieldset: 'cookies',
      fields: [
        defineField({
          name: 'enabled',
          title: 'Enable Cookie Consent',
          type: 'boolean',
          initialValue: true,
        }),
        defineField({
          name: 'privacyPolicy',
          title: 'Privacy Policy Link',
          type: 'reference',
          to: [{ type: 'page' }], // Assuming 'page' exists, need to verify or use url
          description: 'Link to the privacy policy page.',
          hidden: ({ parent }) => !parent?.enabled,
          validation: (Rule) =>
            Rule.custom((value, context) => {
              const parent = context.parent as { enabled?: boolean } | undefined;
              if (parent?.enabled && !value) {
                return 'Privacy Policy is required when Cookie Consent is enabled';
              }
              return true;
            }),
        }),
      ],
    }),
  ],

  preview: {
    select: {
      title: 'title',
      tagline: 'tagline',
      language: 'language',
    },
    prepare: ({ title, tagline, language }) => ({
      title: [language && `[${language}] `, title || 'Site settings'].filter(Boolean).join(' '),
      subtitle: [
        language && `[${language}] `,
        tagline?.[0]?.children
          ? tagline[0]?.children
              .map((c: { text?: string }) => c.text)
              .filter(Boolean)
              .join(' ')
          : '',
      ]
        .filter(Boolean)
        .join(' '),
    }),
  },
});
