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
import { structureTool } from 'sanity/structure';
import { group, singleton } from './lib/utils';
export const structure = structureTool({
  structure: (S) =>
    S.list()
      .title('Content')
      .items([
        S.documentTypeListItem('page').title('Pages').icon(DocumentsIcon),
        S.divider(),

        // Content Health - Grouped filtered views
        group(S, 'Content Health', [
          S.listItem()
            .id('seo-issues')
            .title('SEO Issues')
            .icon(SearchIcon)
            .child(
              S.documentList()
                .title('Pages Missing SEO Metadata')
                .filter(
                  '_type == "page" && !(_id match "drafts.*") && metadata.noIndex != true && (!defined(metadata.metaDescription) || !defined(metadata.openGraphImage))'
                )
                .defaultOrdering([{ field: '_updatedAt', direction: 'desc' }])
            ),
          S.listItem()
            .id('drafts-pending')
            .title('Drafts Pending')
            .icon(EditIcon)
            .child(
              S.documentList()
                .title('All Drafts')
                .filter('_id match "drafts.*"')
                .defaultOrdering([{ field: '_updatedAt', direction: 'desc' }])
            ),
          S.listItem()
            .id('published-pages')
            .title('Published Pages')
            .icon(CheckmarkCircleIcon)
            .child(
              S.documentList()
                .title('All Published Pages')
                .filter('_type == "page" && !(_id match "drafts.*")')
                .defaultOrdering([{ field: '_updatedAt', direction: 'desc' }])
            ),
        ]).icon(SearchIcon),
        S.divider(),

        group(S, 'Collections', [
          S.documentTypeListItem('collection.blog').title('Blog Posts').icon(EditIcon),
          S.documentTypeListItem('collection.changelog').title('Changelog').icon(DocumentTextIcon),
          S.documentTypeListItem('collection.documentation').title('Documentation').icon(BookIcon),
          S.documentTypeListItem('collection.events').title('Events').icon(CalendarIcon),
          S.documentTypeListItem('collection.newsletter')
            .title('Newsletter Issues')
            .icon(EnvelopeIcon),
        ]).icon(StackCompactIcon),
        S.divider(),

        singleton(S, 'site', 'Site Settings').icon(CogIcon),
        S.divider(),

        group(S, 'Shared Content', [
          S.documentTypeListItem('banner').title('Banners'),
          S.documentTypeListItem('form').title('Forms'),
          S.documentTypeListItem('placement').title('Placement Rules'),
          S.documentTypeListItem('logo').title('Logos'),
          S.documentTypeListItem('person').title('Team Members'),
          S.documentTypeListItem('navigation'),
          S.documentTypeListItem('redirect').title('Redirects'),
          S.documentTypeListItem('pricing').title('Pricing tiers'),
          S.documentTypeListItem('blog.category').title('Blog categories'),
          S.documentTypeListItem('docs.category').title('Documentation categories'),
        ]).icon(DatabaseIcon),
      ]),
});

export function icon() {
  // biome-ignore lint/performance/noImgElement: Sanity admin favicon
  return <img style={{ width: '100%', aspectRatio: 1 }} src="/favicon.ico" alt="Medal Social" />;
}
