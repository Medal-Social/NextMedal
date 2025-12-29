/**
 * Blog Post Schema
 * @version 1.4.0
 * @lastUpdated 2025-12-29
 * @description Defines the structure for blog posts, including content, categories, authors, and metadata.
 * @changelog
 * - 1.4.0: Clean separation - URL Slug in Content tab, SEO in SEO tab (no nested tabs)
 * - 1.3.0: Split metadata - slug in Content tab, SEO fields in SEO tab
 * - 1.2.0: Moved metadata to content group for better visibility of URL slug
 * - 1.1.0: Updated to latest UX standards (standardized icons, radio buttons for featured status)
 * - 1.0.0: Initial version with core blog post functionality
 */

import { ControlsIcon, EditIcon, EyeClosedIcon, SearchIcon } from '@sanity/icons';
import { defineField, defineType } from 'sanity';
import { isUniqueAcrossLocale } from '@/sanity/lib/isUniqueAcrossLocale';
import CharacterCount from '@/sanity/ui/CharacterCount';
import PageIdentityField from '@/sanity/ui/PageIdentityField';
import PageIdentityInput from '@/sanity/ui/PageIdentityInput';
import PreviewOG from '@/sanity/ui/PreviewOG';
import { imageBlock } from '../fragments';
import link from '../objects/link';

export default defineType({
  name: 'blog.post',
  title: 'Blog post',
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
          title: 'Post Title',
          description: 'The title of the blog post',
          type: 'string',
          validation: (Rule) => Rule.required(),
        }),
        defineField({
          name: 'slug',
          title: 'URL Slug',
          type: 'slug',
          description: 'The URL path for this blog post',
          options: {
            source: (doc) => {
              const d = doc as { metadata?: { title?: string } };
              return d.metadata?.title || '';
            },
            isUnique: isUniqueAcrossLocale,
          },
          validation: (Rule) =>
            Rule.required().custom((slug) => {
              if (slug?.current?.includes('/')) {
                return "Slugs cannot contain slashes. Use a flat structure (e.g., 'my-post').";
              }
              return true;
            }),
        }),
      ],
    }),
    defineField({
      name: 'body',
      title: 'Content',
      description: 'The main content of the blog post.',
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
        { type: 'video' },
      ],
      group: 'content',
    }),
    defineField({
      name: 'categories',
      title: 'Categories',
      description: 'Categories this post belongs to.',
      type: 'array',
      of: [
        {
          type: 'reference',
          to: [{ type: 'blog.category' }],
        },
      ],
      group: 'content',
    }),
    defineField({
      name: 'authors',
      title: 'Authors',
      description: 'People who contributed to this post.',
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
      description: 'Date when the post is published.',
      type: 'date',
      validation: (Rule) => Rule.required(),
      group: 'content',
    }),
    // SEO Settings - SEO tab only
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
            'Prevents this post from appearing in search results and removes it from the sitemap.',
          initialValue: false,
        }),
      ],
    }),
    defineField({
      name: 'featured',
      title: 'Featured',
      description: 'Highlight this post on the blog homepage.',
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
      title: 'metadata.title',
      slug: 'metadata.slug.current',
      publishDate: 'publishDate',
      media: 'seo.image',
      language: 'language',
      noindex: 'seo.noIndex',
    },
    prepare: ({ title, slug, publishDate, media, featured, language, noindex }) => {
      const languageLabel =
        language === 'en' ? '🇺🇸 EN' : language === 'nb' ? '🇳🇴 NO' : language?.toUpperCase();

      const subtitle = [languageLabel, publishDate, slug && `/${slug}`].filter(Boolean).join(' • ');

      return {
        title: [featured === 'featured' && '★', title].filter(Boolean).join(' '),
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
