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
import ArticleImageInput from '@/sanity/ui/ArticleImageInput';
import CharacterCount from '@/sanity/ui/CharacterCount';
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
    // SEO Settings (custom for articles with preview button)
    defineField({
      name: 'seo',
      type: 'object',
      group: 'seo',
      options: {
        collapsible: true,
        collapsed: false,
      },
      fields: [
        defineField({
          name: 'title',
          title: 'SEO Title',
          type: 'string',
          description: 'Title shown in search results (50-60 characters recommended)',
          validation: (Rule) => [
            Rule.required().warning('SEO title helps improve search visibility'),
            Rule.min(50).warning('Aim for at least 50 characters'),
            Rule.max(60).warning('Keep under 60 characters to avoid truncation'),
          ],
          components: {
            input: (props) => <CharacterCount max={60} {...props} />,
          },
        }),
        defineField({
          name: 'description',
          title: 'SEO Description',
          type: 'text',
          rows: 3,
          description: 'Description shown in search results (70-160 characters recommended)',
          validation: (Rule) => [
            Rule.required().warning('SEO description helps improve click-through rates'),
            Rule.min(70).warning('Aim for at least 70 characters'),
            Rule.max(160).warning('Keep under 160 characters to avoid truncation'),
          ],
          components: {
            input: (props) => <CharacterCount as="textarea" max={160} {...props} />,
          },
        }),
        defineField({
          name: 'image',
          title: 'Article Hero Image',
          type: 'image',
          description:
            'Main image displayed at the top of the article page and when sharing on social media (1200×630px recommended). If not provided, an auto-generated image will be created from the article title.',
          options: {
            hotspot: true,
          },
          components: {
            input: ArticleImageInput,
          },
        }),
        defineField({
          name: 'noIndex',
          title: 'Hide from search engines',
          type: 'boolean',
          description:
            'Prevents this page from appearing in search results and removes it from the sitemap.',
          initialValue: false,
          components: {
            field: (props) => (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <EyeClosedIcon style={{ opacity: 0.5 }} />
                {props.renderDefault(props)}
              </div>
            ),
          },
        }),
      ],
    }),
  ],
  preview: {
    select: {
      title: 'metadata.title',
      slug: 'metadata.slug.current',
      media: 'seo.image',
      language: 'language',
      noindex: 'seo.noIndex',
      categoryTitle: 'categories.0.title',
    },
    prepare: ({ title, slug, media, language, noindex, categoryTitle }) => {
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
