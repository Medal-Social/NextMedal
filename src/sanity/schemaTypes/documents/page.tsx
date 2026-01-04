/**
 * Page Schema
 * @version 1.5.0
 * @lastUpdated 2025-12-29
 * @description Defines the structure for content pages with modular sections and metadata.
 * @changelog
 * - 1.5.0: Clean separation - Page Title + URL Slug in Content tab, SEO in SEO tab
 * - 1.4.0: Split metadata - slug in Content tab, SEO fields in SEO tab
 * - 1.3.0: Moved metadata to content group for better visibility of URL slug
 * - 1.2.0: Updated to latest standards and standardized icons
 * - 1.1.0: Added improved validation, documentation, and organization
 * - 1.0.0: Initial version
 */

import {
  DocumentIcon,
  EditIcon,
  EyeClosedIcon,
  HelpCircleIcon,
  HomeIcon,
  SearchIcon,
} from '@sanity/icons';
import { defineField, defineType } from 'sanity';
import { DEFAULT_LOCALE, SUPPORTED_LOCALES } from '@/i18n/config';
import { isUniqueAcrossLocale } from '@/sanity/lib/isUniqueAcrossLocale';
import CharacterCount from '@/sanity/ui/CharacterCount';
import PageIdentityField from '@/sanity/ui/PageIdentityField';
import PageIdentityInput from '@/sanity/ui/PageIdentityInput';
import SocialImageInput from '@/sanity/ui/SocialImageInput';
import modules from '../fragments/modules';

export default defineType({
  name: 'page',
  title: 'Page',
  type: 'document',
  icon: DocumentIcon,
  description: 'Standard page with modules for building content',
  groups: [
    { name: 'content', title: 'Content', icon: EditIcon, default: true },
    { name: 'seo', title: 'SEO', icon: SearchIcon },
  ],
  fields: [
    defineField({
      name: 'language',
      type: 'string',
      readOnly: true,
      hidden: true,
      initialValue: DEFAULT_LOCALE,
    }),
    // Page Identity - Title and URL Slug together in Content tab
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
          title: 'Page Title',
          description: 'The main title of the page',
          type: 'string',
          validation: (Rule) => Rule.required(),
        }),
        defineField({
          name: 'slug',
          title: 'URL Slug',
          type: 'slug',
          description: 'The URL path for this page',
          options: {
            source: (doc) => {
              const d = doc as { metadata?: { title?: string } };
              return d.metadata?.title || '';
            },
            isUnique: isUniqueAcrossLocale,
          },
          validation: (Rule) =>
            Rule.required().custom((slug) => {
              const reserved = ['studio', 'api', 'monitoring', ...SUPPORTED_LOCALES];
              if (slug?.current && reserved.includes(slug.current.toLowerCase())) {
                return `"${slug.current}" is a reserved path used by the system.`;
              }
              if (slug?.current?.includes('/')) {
                return "Slugs cannot contain slashes. Use a flat structure (e.g., 'about').";
              }
              return true;
            }),
        }),
      ],
    }),
    // Page Content modules - Content tab
    defineField({
      ...modules,
      title: 'Page Content',
      description: 'Add content modules to build the page',
      group: 'content',
    }),
    // SEO Settings - SEO tab only
    // Note: Using 'seo' as field name. For backward compatibility with existing queries,
    // consider also updating GROQ queries from metadata.title to seo.title, etc.
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
          description:
            'Image displayed when sharing on social media (1200×630px recommended). If not provided, an auto-generated image will be created from your SEO title.',
          options: {
            hotspot: true,
          },
          components: {
            input: SocialImageInput,
          },
        }),
        defineField({
          name: 'noIndex',
          title: 'Hide from search engines',
          type: 'boolean',
          description:
            'Prevents this page from appearing in search results and removes it from the sitemap.',
          initialValue: false,
        }),
      ],
    }),
  ],
  preview: {
    select: {
      title: 'metadata.title',
      slug: 'metadata.slug.current',
      media: 'seo.image',
      noindex: 'seo.noIndex',
      language: 'language',
    },
    prepare: ({ title, slug, media, noindex, language }) => {
      // Choose an appropriate icon based on the page type
      const icon =
        media ||
        (slug === 'index' && HomeIcon) ||
        (slug === '404' && HelpCircleIcon) ||
        (slug === 'search' && SearchIcon) ||
        (slug === 'articles' && EditIcon) ||
        (noindex && EyeClosedIcon) ||
        DocumentIcon;

      // Format language display
      const languageLabel =
        language === 'en' ? '🇺🇸 EN' : language === 'nb' ? '🇳🇴 NO' : language?.toUpperCase();

      // Build subtitle with language and slug
      const urlPath = slug === 'index' ? '/' : `/${slug}`;
      const subtitle = language ? `${languageLabel} • ${urlPath}` : urlPath;

      return {
        title: title || 'Untitled Page',
        subtitle,
        media: icon,
      };
    },
  },
});
