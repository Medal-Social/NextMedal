/**
 * Collection Newsletter Schema
 * @version 1.0.0
 * @lastUpdated 2025-12-30
 * @description Newsletter issues with flexible collection reference for dynamic URLs.
 * Items reference a parent collection page, enabling CMS-configurable collection names/URLs.
 * @changelog
 * - 1.0.0: Initial version with collection reference pattern
 */

import { ControlsIcon, EnvelopeIcon, EyeClosedIcon, SearchIcon } from '@sanity/icons';
import { defineField, defineType } from 'sanity';
import { isUniqueAcrossLocale } from '@/sanity/lib/isUniqueAcrossLocale';
import CharacterCount from '@/sanity/ui/CharacterCount';
import PageIdentityField from '@/sanity/ui/PageIdentityField';
import PageIdentityInput from '@/sanity/ui/PageIdentityInput';
import PreviewOG from '@/sanity/ui/PreviewOG';
import { imageBlock } from '../../fragments';
import link from '../../objects/link';

export default defineType({
  name: 'collection.newsletter',
  title: 'Newsletter Issue',
  icon: EnvelopeIcon,
  type: 'document',
  groups: [
    { name: 'content', title: 'Content', icon: EnvelopeIcon, default: true },
    { name: 'seo', title: 'SEO', icon: SearchIcon },
    { name: 'advanced', title: 'Advanced Options', icon: ControlsIcon },
  ],
  fields: [
    defineField({
      name: 'language',
      type: 'string',
      readOnly: true,
      hidden: true,
    }),
    // Collection Reference - determines the base URL for this item
    defineField({
      name: 'collection',
      title: 'Collection',
      description: 'The collection page this newsletter belongs to (determines the URL)',
      type: 'reference',
      to: [{ type: 'page' }],
      validation: (Rule) => Rule.required(),
      group: 'content',
    }),
    // Issue Number
    defineField({
      name: 'issueNumber',
      title: 'Issue Number',
      description: 'The newsletter issue number (e.g., #42)',
      type: 'number',
      validation: (Rule) => Rule.integer().positive(),
      group: 'content',
    }),
    // Newsletter Identity - Title and URL Slug together in Content tab
    defineField({
      name: 'metadata',
      type: 'object',
      group: 'content',
      components: {
        field: PageIdentityField,
        input: PageIdentityInput,
      },
      fields: [
        defineField({
          name: 'title',
          title: 'Subject Line',
          description: 'The newsletter subject line / title',
          type: 'string',
          validation: (Rule) => Rule.required(),
        }),
        defineField({
          name: 'slug',
          title: 'URL Slug',
          type: 'slug',
          description: 'The URL path for this newsletter issue (appended to collection URL)',
          options: {
            source: (doc) => {
              const document = doc as { metadata?: { title?: string } };
              return document.metadata?.title || '';
            },
            isUnique: isUniqueAcrossLocale,
          },
          validation: (Rule) =>
            Rule.required().custom((slug) => {
              const reserved = ['studio', 'api', 'monitoring', 'rss.xml'];
              if (slug?.current && reserved.includes(slug.current.toLowerCase())) {
                return `"${slug.current}" is a reserved path.`;
              }
              if (slug?.current?.includes('/')) {
                return "Slugs cannot contain slashes. Use a flat structure (e.g., 'issue-42').";
              }
              return true;
            }),
        }),
      ],
    }),
    // Preheader / Preview text
    defineField({
      name: 'preheader',
      title: 'Preview Text',
      description: 'Short preview text shown in email clients (40-100 characters)',
      type: 'string',
      group: 'content',
    }),
    defineField({
      name: 'body',
      title: 'Content',
      description: 'The main content of the newsletter.',
      type: 'array',
      of: [
        {
          type: 'block',
          styles: [
            { title: 'Normal', value: 'normal' },
            { title: 'Heading 2', value: 'h2' },
            { title: 'Heading 3', value: 'h3' },
            { title: 'Heading 4', value: 'h4' },
            { title: 'Quote', value: 'blockquote' },
          ],
          marks: {
            decorators: [
              { title: 'Strong', value: 'strong' },
              { title: 'Emphasis', value: 'em' },
              { title: 'Underline', value: 'underline' },
              { title: 'Strike', value: 'strike-through' },
            ],
            annotations: [
              {
                name: 'link',
                type: 'object',
                title: 'Link',
                fields: link.fields,
                icon: link.icon,
              },
            ],
          },
        },
        imageBlock,
        { type: 'code' },
      ],
      group: 'content',
    }),
    defineField({
      name: 'publishDate',
      title: 'Send Date',
      description: 'Date when the newsletter was sent.',
      type: 'date',
      validation: (Rule) => Rule.required(),
      group: 'content',
    }),
    // SEO Settings
    defineField({
      name: 'seo',
      title: 'SEO Settings',
      type: 'object',
      group: 'seo',
      options: {
        collapsible: false,
      },
      fields: [
        defineField({
          name: 'title',
          title: 'SEO Title',
          type: 'string',
          description: 'Title shown in search results (50-60 characters recommended)',
          validation: (Rule) => [
            Rule.required().warning(),
            Rule.min(50).warning(),
            Rule.max(60).warning(),
          ],
          components: {
            input: (props) => (
              <CharacterCount max={60} {...props}>
                <PreviewOG title={props.elementProps.value} />
              </CharacterCount>
            ),
          },
        }),
        defineField({
          name: 'description',
          title: 'SEO Description',
          type: 'text',
          rows: 3,
          description: 'Description shown in search results (70-160 characters recommended)',
          validation: (Rule) => [
            Rule.required().warning(),
            Rule.min(70).warning(),
            Rule.max(160).warning(),
          ],
          components: {
            input: (props) => <CharacterCount as="textarea" max={160} {...props} />,
          },
        }),
        defineField({
          name: 'image',
          title: 'Social Sharing Image',
          type: 'image',
          description: 'Image displayed when sharing on social media',
          options: {
            hotspot: true,
          },
        }),
        defineField({
          name: 'noIndex',
          title: 'Hide from search engines',
          type: 'boolean',
          description:
            'Prevents this newsletter from appearing in search results and removes it from the sitemap.',
          initialValue: false,
        }),
      ],
    }),
    defineField({
      name: 'featured',
      title: 'Featured',
      description: 'Highlight this newsletter on the collection page.',
      type: 'string',
      options: {
        list: [
          { title: 'Standard', value: 'standard' },
          { title: 'Featured', value: 'featured' },
        ],
        layout: 'radio',
      },
      initialValue: 'standard',
      group: 'advanced',
    }),
  ],
  preview: {
    select: {
      featured: 'featured',
      issueNumber: 'issueNumber',
      title: 'metadata.title',
      slug: 'metadata.slug.current',
      collectionSlug: 'collection.metadata.slug.current',
      publishDate: 'publishDate',
      media: 'seo.image',
      language: 'language',
      noindex: 'seo.noIndex',
    },
    prepare: ({
      title,
      issueNumber,
      slug,
      collectionSlug,
      publishDate,
      media,
      featured,
      language,
      noindex,
    }) => {
      const languageLabel =
        language === 'en' ? 'EN' : language === 'nb' ? 'NO' : language?.toUpperCase();

      const fullPath = collectionSlug ? `/${collectionSlug}/${slug}` : `/${slug}`;
      const subtitle = [languageLabel, publishDate, fullPath].filter(Boolean).join(' - ');

      const displayTitle = [featured === 'featured' && '*', issueNumber && `#${issueNumber}`, title]
        .filter(Boolean)
        .join(' ');

      return {
        title: displayTitle,
        subtitle,
        media: media || (noindex ? EyeClosedIcon : EnvelopeIcon),
      };
    },
  },
  orderings: [
    {
      title: 'Issue Number',
      name: 'issueNumber',
      by: [{ field: 'issueNumber', direction: 'desc' }],
    },
    {
      title: 'Date',
      name: 'date',
      by: [{ field: 'publishDate', direction: 'desc' }],
    },
    {
      title: 'Title',
      name: 'seo.title',
      by: [{ field: 'seo.title', direction: 'asc' }],
    },
  ],
});
