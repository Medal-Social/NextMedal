/**
 * Collection Article Schema
 * @version 1.0.0
 * @lastUpdated 2025-12-30
 * @description Articles with flexible collection reference for dynamic URLs.
 * Items reference a parent collection page, enabling CMS-configurable collection names/URLs.
 * @changelog
 * - 1.0.0: Initial version with collection reference pattern
 */

import { ControlsIcon, EditIcon, EyeClosedIcon, SearchIcon } from '@sanity/icons';
import { defineField, defineType } from 'sanity';
import { DEFAULT_LOCALE } from '@/i18n/config';
import { isUniqueAcrossLocale } from '@/sanity/lib/isUniqueAcrossLocale';
import PageIdentityField from '@/sanity/ui/PageIdentityField';
import PageIdentityInput from '@/sanity/ui/PageIdentityInput';
import { imageBlock, socialEmbedBlock } from '../../fragments';
import link from '../../objects/link';

export default defineType({
  name: 'collection.article',
  title: 'Article',
  icon: EditIcon,
  type: 'document',
  groups: [
    { name: 'content', title: 'Content', icon: EditIcon, default: true },
    { name: 'seo', title: 'SEO', icon: SearchIcon },
    { name: 'advanced', title: 'Advanced Options', icon: ControlsIcon },
  ],
  fields: [
    defineField({
      name: 'language',
      type: 'string',
      readOnly: true,
      hidden: true,
      initialValue: DEFAULT_LOCALE,
    }),
    // Post Identity - Title and URL Slug together in Content tab
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
          title: 'Article Title',
          description: 'The title of the article',
          type: 'string',
          validation: (Rule) => Rule.required(),
        }),
        defineField({
          name: 'slug',
          title: 'URL Slug',
          type: 'slug',
          description: 'The URL path for this article (appended to collection URL)',
          options: {
            source: (doc) => {
              const document = doc as { metadata?: { title?: string } };
              return document.metadata?.title || '';
            },
            isUnique: isUniqueAcrossLocale,
          },
          validation: (Rule) =>
            Rule.required().custom((slug) => {
              // Only ban system paths - language codes are fine since articles are under /articles/ prefix
              const reserved = ['studio', 'api', 'monitoring', 'rss.xml'];
              if (slug?.current && reserved.includes(slug.current.toLowerCase())) {
                return `"${slug.current}" is a reserved path.`;
              }
              if (slug?.current?.includes('/')) {
                return "Slugs cannot contain slashes. Use a flat structure (e.g., 'my-article').";
              }
              return true;
            }),
        }),
      ],
    }),
    defineField({
      name: 'body',
      title: 'Content',
      description: 'The main content of the article.',
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
        socialEmbedBlock,
        { type: 'code' },
        { type: 'video' },
      ],
      group: 'content',
    }),
    defineField({
      name: 'categories',
      title: 'Categories',
      description: 'Categories this article belongs to.',
      type: 'array',
      of: [
        {
          type: 'reference',
          to: [{ type: 'article.category' }],
        },
      ],
      group: 'content',
    }),
    defineField({
      name: 'authors',
      title: 'Authors',
      description:
        'People who contributed to this article (localized fields handled per language).',
      type: 'array',
      of: [
        {
          type: 'reference',
          to: [{ type: 'person' }],
        },
      ],
      group: 'content',
    }),
    defineField({
      name: 'publishDate',
      title: 'Publish Date',
      description: 'Date when the article is published.',
      type: 'date',
      initialValue: () => new Date().toISOString().split('T')[0],
      validation: (Rule) => Rule.required(),
      group: 'content',
    }),
    // SEO Settings
    defineField({
      name: 'seo',
      type: 'seo-metadata',
      group: 'seo',
    }),
  ],
  preview: {
    select: {
      title: 'metadata.title',
      slug: 'metadata.slug.current',
      publishDate: 'publishDate',
      media: 'seo.image',
      language: 'language',
      noindex: 'seo.noIndex',
      categoryTitle: 'categories.0.title',
    },
    prepare: ({ title, slug, _publishDate, _media, language, _noindex, categoryTitle }) => {
      const languageLabel =
        language === 'en' ? 'EN' : language === 'nb' ? 'NO' : language?.toUpperCase();

      // Collection slug will be determined from site settings at runtime
      const subtitle = [languageLabel, categoryTitle, `/${slug}`].filter(Boolean).join(' • ');

      return {
        title,
        subtitle,
        media: media || (noindex ? EyeClosedIcon : EditIcon),
      };
    },
  },
  orderings: [
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
