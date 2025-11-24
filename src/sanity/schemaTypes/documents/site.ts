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
    { name: 'compliance', title: 'Compliance' },
  ],
  fieldsets: [
    { name: 'branding', title: 'Branding', options: { collapsible: true, collapsed: false } },
    { name: 'footer', title: 'Footer', options: { collapsible: false } },
    {
      name: 'cookies',
      title: 'Cookie Settings',
      options: { collapsible: true, collapsed: false },
    },
  ],
  fields: [
    // General Group - Basic site information and content
    defineField({
      name: 'language',
      type: 'string',
      readOnly: true,
      hidden: true,
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
          validation: (Rule: any) => Rule.required().min(1),
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
