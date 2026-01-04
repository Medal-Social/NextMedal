/**
 * Site Settings Schema
 * @version 2.0.0
 * @lastUpdated 2026-01-03
 * @description Global site settings with field-level translation support.
 * Single document contains all language versions for simpler management.
 * @changelog
 * - 2.0.0: Converted to field-level translation (title, tagline, navigation, copyright internationalized)
 * - 1.0.1: Updated header documentation
 * - 1.0.0: Initial version with core site configuration options
 */

import { CogIcon, ControlsIcon, MenuIcon } from '@sanity/icons';
import { defineField, defineType } from 'sanity';
import { DEFAULT_LOCALE } from '@/i18n/config';
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
    defineField({
      name: 'language',
      type: 'string',
      readOnly: true,
      hidden: true,
      initialValue: DEFAULT_LOCALE,
    }),
    // General Group
    defineField({
      name: 'banners',
      title: 'Site Banners',
      description:
        'Special banners shown across the site - shared across all languages (banner content is internationalized).',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'banner' }] }],
      group: 'advanced',
      initialValue: [],
    }),
    defineField({
      name: 'title',
      title: 'Site Title',
      description:
        'The name of your website - localized per language. Appears in browser tab and search results.',
      type: 'internationalizedArrayString',
      validation: (Rule) => Rule.required(),
      group: 'general',
    }),
    defineField({
      name: 'logo',
      title: 'Site Logo',
      description:
        "Upload your site's logo - shared across all languages. Used in the header and for social sharing.",
      type: 'reference',
      to: [{ type: 'logo' }],
      group: 'general',
    }),
    defineField({
      name: 'tagline',
      title: 'Site Tagline',
      description:
        'A short slogan or motto for your site - localized per language. Shown in meta tags and some layouts.',
      type: 'internationalizedArrayBlockContent',
      group: 'general',
    }),

    // Navigation Group
    defineField({
      name: 'headerNav',
      title: 'Header Navigation',
      description:
        'Navigation links shown in the site header - localized per language. Each language can have different menu structure.',
      type: 'internationalizedArrayHeaderNavArray',
      group: 'navigation',
      fieldset: 'header',
    }),
    defineField({
      name: 'enableSearch',
      title: 'Enable Search',
      description: 'Show the search bar in the header - shared across all languages.',
      type: 'boolean',
      initialValue: true,
      group: 'advanced',
    }),
    defineField({
      name: 'ctas',
      title: 'Action Buttons',
      description:
        'Primary action buttons displayed in the header - localized per language (e.g., "Get Started", "Contact").',
      type: 'internationalizedArrayCtaArray',
      group: 'navigation',
      fieldset: 'header',
    }),

    defineField({
      name: 'footerNav',
      title: 'Footer Navigation',
      description:
        'Navigation links shown in the site footer - localized per language. Each language can have different footer structure.',
      type: 'internationalizedArrayDropdownMenuArray',
      group: 'navigation',
      fieldset: 'footer',
    }),
    defineField({
      name: 'copyright',
      title: 'Footer Text',
      description: 'Copyright notice and credits displayed in the footer - localized per language.',
      type: 'internationalizedArrayBlockContent',
      group: 'navigation',
      fieldset: 'footer',
    }),
    defineField({
      name: 'footerLinks',
      title: 'Additional Links',
      description:
        'Additional links to display in the footer - localized per language (e.g. Locations, Legal)',
      type: 'internationalizedArrayMenuItemArray',
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
          to: [{ type: 'page' }],
          description:
            'Link to the privacy policy page - shows all pages (page content is internationalized).',
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
    },
    prepare: ({ title }) => {
      // Extract first available language value from internationalized array
      const titleText =
        Array.isArray(title) && title.length > 0
          ? title[0].value || 'Site Settings'
          : 'Site Settings';

      return {
        title: titleText,
      };
    },
  },
});
