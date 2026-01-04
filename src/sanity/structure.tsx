import {
  BookIcon,
  CalendarIcon,
  CheckmarkCircleIcon,
  CogIcon,
  DatabaseIcon,
  DocumentsIcon,
  DocumentTextIcon,
  EditIcon,
  EnvelopeIcon,
  SearchIcon,
  StackCompactIcon,
} from '@sanity/icons';
import type { ComponentType } from 'react';
import type { ListItemBuilder, StructureBuilder } from 'sanity/structure';
import { structureTool } from 'sanity/structure';
import { group } from './lib/utils';

// Document type configuration for Content Health views
interface DocumentTypeConfig {
  title: string;
  type: string;
  icon: ComponentType;
}

const CONTENT_TYPES: DocumentTypeConfig[] = [
  { title: 'Pages', type: 'page', icon: DocumentsIcon },
  { title: 'Articles', type: 'collection.article', icon: EditIcon },
  { title: 'Documentation', type: 'collection.documentation', icon: BookIcon },
  { title: 'Events', type: 'collection.events', icon: CalendarIcon },
  { title: 'Changelog', type: 'collection.changelog', icon: DocumentTextIcon },
  { title: 'Newsletter', type: 'collection.newsletter', icon: EnvelopeIcon },
];

// Helper to create document type list items with custom filters
function createDocTypeListItems(
  S: StructureBuilder,
  filterFn: (docType: string) => string,
  titleSuffix: string
): ListItemBuilder[] {
  return CONTENT_TYPES.map((config) =>
    S.listItem()
      .title(config.title)
      .icon(config.icon)
      .child(
        S.documentList()
          .title(`${config.title} ${titleSuffix}`)
          .filter(filterFn(config.type))
          .defaultOrdering([{ field: '_updatedAt', direction: 'desc' }])
      )
  );
}
export const structure = structureTool({
  name: 'structure',
  structure: (S) =>
    S.list()
      .title('Content')
      .items([
        S.documentTypeListItem('page').title('Pages').icon(DocumentsIcon),
        S.divider(),

        group(S, 'Collections', [
          S.documentTypeListItem('collection.article').title('Articles').icon(EditIcon),
          S.documentTypeListItem('collection.changelog').title('Changelog').icon(DocumentTextIcon),
          S.documentTypeListItem('collection.documentation').title('Documentation').icon(BookIcon),
          S.documentTypeListItem('collection.events').title('Events').icon(CalendarIcon),
          S.documentTypeListItem('collection.newsletter')
            .title('Newsletter Issues')
            .icon(EnvelopeIcon),
        ]).icon(StackCompactIcon),
        S.divider(),

        // Content Health - Grouped filtered views by document type
        group(S, 'Content Health', [
          // SEO Issues - by document type
          S.listItem()
            .id('seo-issues')
            .title('SEO Issues')
            .icon(SearchIcon)
            .child(
              S.list()
                .title('SEO Issues')
                .items(
                  createDocTypeListItems(
                    S,
                    (type) =>
                      `_type == "${type}" && !(_id in path("drafts.**")) && metadata.noIndex != true && (!defined(metadata.metaDescription) || !defined(metadata.openGraphImage))`,
                    'Missing SEO Metadata'
                  )
                )
            ),
          // All Drafts - every document type
          S.listItem()
            .id('all-drafts')
            .title('All Drafts')
            .icon(EditIcon)
            .child(
              S.documentList()
                .title('All Draft Documents')
                .filter('_id in path("drafts.**")')
                .defaultOrdering([{ field: '_updatedAt', direction: 'desc' }])
            ),
          // Drafts Pending - by document type
          S.listItem()
            .id('drafts-pending')
            .title('Drafts by Type')
            .icon(EditIcon)
            .child(
              S.list()
                .title('Drafts by Type')
                .items(
                  createDocTypeListItems(
                    S,
                    (type) => `_type == "${type}" && _id in path("drafts.**")`,
                    'Drafts'
                  )
                )
            ),
          // Published Documents - by document type
          S.listItem()
            .id('published-documents')
            .title('Published Documents')
            .icon(CheckmarkCircleIcon)
            .child(
              S.list()
                .title('Published Documents')
                .items(
                  createDocTypeListItems(
                    S,
                    (type) => `_type == "${type}" && !(_id in path("drafts.**"))`,
                    'Published'
                  )
                )
            ),
        ]).icon(SearchIcon),
        S.divider(),

        // Site Settings - single document with field-level translation
        S.listItem()
          .title('Site Settings')
          .icon(CogIcon)
          .child(S.editor().id('site').schemaType('site').documentId('site')),
        S.divider(),

        group(S, 'Shared Content', [
          S.documentTypeListItem('banner').title('Banners'),
          S.documentTypeListItem('form').title('Forms'),
          S.documentTypeListItem('placement').title('Placement Rules'),
          S.documentTypeListItem('logo').title('Logos'),
          S.documentTypeListItem('person').title('Team Members'),
          S.documentTypeListItem('redirect').title('Redirects'),
          S.documentTypeListItem('pricing').title('Pricing tiers'),
          S.documentTypeListItem('article.category').title('Article categories'),
          S.documentTypeListItem('docs.category').title('Documentation categories'),
        ]).icon(DatabaseIcon),
      ]),
});

export function icon() {
  // biome-ignore lint/performance/noImgElement: Sanity admin favicon
  return <img style={{ width: '100%', aspectRatio: 1 }} src="/favicon.ico" alt="Medal Social" />;
}
