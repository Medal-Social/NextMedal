/**
 * Site Settings Schema
 * @version 1.0.0
 * @lastUpdated 2024-03-21
 * @description Defines global site settings including branding, SEO defaults, and social media links.
 * @changelog
 * - 1.0.0: Initial version with core site configuration options
 */

import { defineField, defineType } from 'sanity';
import { getBlockText } from '@/sanity/lib/utils';
// import modules from '../fragments/modules';

export default defineType({
  name: 'site',
  title: 'Site Settings',
  type: 'document',
  groups: [
    { name: 'general', title: 'General', default: true },
    { name: 'navigation', title: 'Navigation' },
    { name: 'compliance', title: 'Compliance' },
  ],
  fieldsets: [
    { name: 'header', title: 'Header', options: { collapsible: true, collapsed: false } },
    { name: 'footer', title: 'Footer', options: { collapsible: true, collapsed: false } },
    {
      name: 'cookies',
      title: 'Cookie Settings',
      options: { collapsible: true, collapsed: false },
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
      description:
        'Special banners shown across the site. Useful for promotions or urgent news.',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'banner' }] }],
      group: 'general',
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
        Rule.custom((blocks: any) => {
          const text = getBlockText(blocks, ' ');
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
      name: 'ctas',
      title: 'Action Buttons',
      description: 'Primary action buttons displayed in the header (e.g., "Get Started", "Contact").',
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
      title: 'Copyright Text',
      description: 'Copyright notice displayed in the footer.',
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
        Rule.custom((blocks: any) => {
          const text = getBlockText(blocks, ' ');
          return text.length > 300
            ? 'Copyright text should be concise (recommended max 300 characters)'
            : true;
        }).warning(),
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
    defineField({
      name: 'cookieConsent',
      title: 'Cookie Consent Settings',
      description: 'Configure cookie consent banner and preferences',
      type: 'object',
      group: 'compliance',
      fieldset: 'cookies',
      fields: [
        {
          name: 'enabled',
          title: 'Enable Cookie Consent',
          type: 'boolean',
          description: 'Show cookie consent banner to visitors',
          initialValue: true,
        },
        {
          name: 'bannerTitle',
          title: 'Banner Title',
          type: 'string',
          description: 'Title shown in the cookie consent banner',
          initialValue: 'We use cookies',
        },
        {
          name: 'bannerText',
          title: 'Banner Description',
          type: 'array',
          of: [{ type: 'block' }],
          description: 'Main text shown in the cookie consent banner',
        },
        {
          name: 'acceptButtonText',
          title: 'Accept Button Text',
          type: 'string',
          description: 'Text for the accept all cookies button',
          initialValue: 'Accept All',
        },
        {
          name: 'rejectButtonText',
          title: 'Reject Button Text',
          type: 'string',
          description: 'Text for the reject non-essential cookies button',
          initialValue: 'Reject Non-Essential',
        },
        {
          name: 'preferencesButtonText',
          title: 'Preferences Button Text',
          type: 'string',
          description: 'Text for the cookie preferences button',
          initialValue: 'Cookie Preferences',
        },
        {
          name: 'cookieCategories',
          title: 'Cookie Categories',
          type: 'array',
          of: [
            {
              type: 'object',
              fields: [
                {
                  name: 'category',
                  title: 'Category',
                  type: 'string',
                  options: {
                    list: [
                      { title: 'Necessary', value: 'necessary' },
                      { title: 'Functional', value: 'functional' },
                      { title: 'Analytics', value: 'analytics' },
                      { title: 'Marketing', value: 'marketing' },
                    ],
                  },
                  validation: (Rule: any) => Rule.required(),
                },
                {
                  name: 'categoryTitle',
                  title: 'Category Title',
                  type: 'string',
                  validation: (Rule: any) => Rule.required(),
                },
                {
                  name: 'description',
                  title: 'Description',
                  type: 'text',
                  rows: 3,
                  validation: (Rule: any) => Rule.required(),
                },
                {
                  name: 'required',
                  title: 'Required',
                  type: 'boolean',
                  initialValue: false,
                  validation: (Rule: any) => Rule.required(),
                },
                {
                  name: 'cookies',
                  title: 'Cookies',
                  type: 'array',
                  of: [
                    {
                      type: 'object',
                      fields: [
                        {
                          name: 'name',
                          title: 'Name',
                          type: 'string',
                          validation: (Rule: any) => Rule.required(),
                        },
                        {
                          name: 'type',
                          title: 'Type',
                          type: 'string',
                          options: {
                            list: [
                              { title: 'HTTP Cookie', value: 'http' },
                              { title: 'Local Storage', value: 'local' },
                            ],
                          },
                          validation: (Rule: any) => Rule.required(),
                        },
                        {
                          name: 'description',
                          title: 'Description',
                          type: 'text',
                          rows: 2,
                          validation: (Rule: any) => Rule.required(),
                        },
                        {
                          name: 'duration',
                          title: 'Duration',
                          type: 'string',
                          validation: (Rule: any) => Rule.required(),
                        },
                        {
                          name: 'vendor',
                          title: 'Vendor',
                          type: 'string',
                          description: 'The company or service that provides this cookie',
                          validation: (Rule: any) => Rule.required(),
                        },
                      ],
                    },
                  ],
                },
              ],
              preview: {
                select: {
                  title: 'categoryTitle',
                  category: 'category',
                  required: 'required',
                },
                prepare(value: Record<string, any>) {
                  return {
                    title: value.title,
                    subtitle: `${value.category}${value.required ? ' (Required)' : ''}`,
                  };
                },
              },
            },
          ],
        },
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
        tagline?.[0]?.children ? tagline[0]?.children.map((c: any) => c.text).join(' ') : '',
      ]
        .filter(Boolean)
        .join(' '),
    }),
  },
});
