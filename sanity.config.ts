'use client';
import { apiVersion, dataset, projectId } from '@/sanity/lib/env';
import { defineConfig, defineField } from 'sanity';
import { presentation } from '@/sanity/presentation';
import { visionTool } from '@sanity/vision';
import { structure } from '@/sanity/structure';
import { orderStudioTools } from '@/sanity/studio-tools';
import { MUX_ENABLED } from '@/sanity/lib/mux';
import { resolveUrlSync } from '@/lib/sanity/resolve-url';
import { codeInput } from '@sanity/code-input';
import { documentInternationalization } from '@sanity/document-internationalization';
import { internationalizedArray } from 'sanity-plugin-internationalized-array';
import { languageFilter } from '@sanity/language-filter';
import { media, mediaAssetSource } from 'sanity-plugin-media';
import { muxInput } from 'sanity-plugin-mux-input';
import { schemaTypes } from '@/sanity/schemaTypes';
import { blockContentField } from '@/sanity/schemaTypes/fragments/rich-text';
import StudioIcon from '@/sanity/ui/StudioIcon';

import { routing, localeConfig, type Locale } from '@/i18n/routing';

export default defineConfig({
  title: `Studio by Medal Social${dataset === 'staging' ? ' (STAGING)' : ''}`,
  icon: StudioIcon,
  projectId,
  dataset,
  basePath: '/studio',
  apiVersion,

  announcements: { enabled: false },
  tasks: { enabled: false },
  scheduledPublishing: { enabled: false },

  form: {
    image: {
      assetSources: () => [mediaAssetSource],
    },
  },

  plugins: [
    presentation,
    structure,
    codeInput(),
    media(),
    // Mux is opt-in: set MUX_ENABLED in src/sanity/lib/mux.ts to add the plugin.
    ...(MUX_ENABLED ? [muxInput({ mp4_support: 'standard' })] : []),
    documentInternationalization({
      supportedLanguages: routing.locales.map((locale) => ({
        id: locale,
        title: localeConfig[locale as Locale].title,
      })),
      schemaTypes: ['page', 'collection.article', 'collection.documentation'],
    }),
    internationalizedArray({
      languages: routing.locales.map((locale) => ({
        id: locale,
        title: localeConfig[locale as Locale].title,
      })),
      defaultLanguages: [routing.defaultLocale],
      fieldTypes: [
        'string',
        'text',
        blockContentField,
        // Navigation array types for site settings
        defineField({
          name: 'headerNavArray',
          type: 'array',
          of: [{ type: 'menuItem' }, { type: 'dropdownMenu' }],
        }),
        defineField({
          name: 'ctaArray',
          type: 'array',
          of: [{ type: 'cta' }],
        }),
        defineField({
          name: 'dropdownMenuArray',
          type: 'array',
          of: [{ type: 'dropdownMenu' }],
        }),
        defineField({
          name: 'menuItemArray',
          type: 'array',
          of: [{ type: 'menuItem' }],
        }),
      ],
      buttonAddAll: false,
    }),
    languageFilter({
      supportedLanguages: routing.locales.map((locale) => ({
        id: locale,
        title: localeConfig[locale as Locale].title,
      })),
      defaultLanguages: [routing.defaultLocale],
      documentTypes: [
        'person',
        'article.category',
        'docs.category',
        'form',
        'collection.newsletter',
        'collection.changelog',
        'collection.events',
        'site',
      ],
    }),
    // Registered in every environment; the tools list shows it to administrators only.
    visionTool({ defaultApiVersion: apiVersion }),
  ],

  tools: orderStudioTools,

  schema: {
    types: schemaTypes,
    templates: (prev) =>
      prev.filter(
        (template) =>
          !['page', 'site', 'collection.article', 'collection.documentation'].includes(template.id)
      ),
  },
  document: {
    comments: { enabled: false },
    newDocumentOptions: (prev, { creationContext }) => {
      if (creationContext.type === 'global') {
        return prev.filter((templateItem) => templateItem.templateId !== 'site');
      }
      return prev;
    },
    actions: (prev, context) => {
      // Singleton protection: Prevent delete/duplicate/unpublish for 'site' document
      if (context.schemaType === 'site') {
        return prev.filter(
          ({ action }) => action && !['delete', 'duplicate', 'unpublish'].includes(action)
        );
      }
      return prev;
    },
    productionUrl: async (prev, { document }) => {
      if (
        [
          'page',
          'collection.article',
          'collection.newsletter',
          'collection.documentation',
          'collection.changelog',
          'collection.events',
        ].includes(document?._type)
      ) {
        return resolveUrlSync(document as Sanity.PageBase, { base: true });
      }

      return prev;
    },
  },
});
