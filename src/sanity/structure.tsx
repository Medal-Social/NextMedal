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
                .items([
                  S.listItem()
                    .title('Pages')
                    .icon(DocumentsIcon)
                    .child(
                      S.documentList()
                        .title('Pages Missing SEO Metadata')
                        .filter(
                          '_type == "page" && !(_id match "drafts.*") && metadata.noIndex != true && (!defined(metadata.metaDescription) || !defined(metadata.openGraphImage))'
                        )
                        .defaultOrdering([{ field: '_updatedAt', direction: 'desc' }])
                    ),
                  S.listItem()
                    .title('Blog Posts')
                    .icon(EditIcon)
                    .child(
                      S.documentList()
                        .title('Blog Posts Missing SEO Metadata')
                        .filter(
                          '_type == "collection.blog" && !(_id match "drafts.*") && metadata.noIndex != true && (!defined(metadata.metaDescription) || !defined(metadata.openGraphImage))'
                        )
                        .defaultOrdering([{ field: '_updatedAt', direction: 'desc' }])
                    ),
                  S.listItem()
                    .title('Documentation')
                    .icon(BookIcon)
                    .child(
                      S.documentList()
                        .title('Documentation Missing SEO Metadata')
                        .filter(
                          '_type == "collection.documentation" && !(_id match "drafts.*") && metadata.noIndex != true && (!defined(metadata.metaDescription) || !defined(metadata.openGraphImage))'
                        )
                        .defaultOrdering([{ field: '_updatedAt', direction: 'desc' }])
                    ),
                  S.listItem()
                    .title('Events')
                    .icon(CalendarIcon)
                    .child(
                      S.documentList()
                        .title('Events Missing SEO Metadata')
                        .filter(
                          '_type == "collection.events" && !(_id match "drafts.*") && metadata.noIndex != true && (!defined(metadata.metaDescription) || !defined(metadata.openGraphImage))'
                        )
                        .defaultOrdering([{ field: '_updatedAt', direction: 'desc' }])
                    ),
                  S.listItem()
                    .title('Changelog')
                    .icon(DocumentTextIcon)
                    .child(
                      S.documentList()
                        .title('Changelog Missing SEO Metadata')
                        .filter(
                          '_type == "collection.changelog" && !(_id match "drafts.*") && metadata.noIndex != true && (!defined(metadata.metaDescription) || !defined(metadata.openGraphImage))'
                        )
                        .defaultOrdering([{ field: '_updatedAt', direction: 'desc' }])
                    ),
                  S.listItem()
                    .title('Newsletter')
                    .icon(EnvelopeIcon)
                    .child(
                      S.documentList()
                        .title('Newsletter Missing SEO Metadata')
                        .filter(
                          '_type == "collection.newsletter" && !(_id match "drafts.*") && metadata.noIndex != true && (!defined(metadata.metaDescription) || !defined(metadata.openGraphImage))'
                        )
                        .defaultOrdering([{ field: '_updatedAt', direction: 'desc' }])
                    ),
                ])
            ),
          // Drafts Pending - by document type
          S.listItem()
            .id('drafts-pending')
            .title('Drafts Pending')
            .icon(EditIcon)
            .child(
              S.list()
                .title('Drafts Pending')
                .items([
                  S.listItem()
                    .title('Pages')
                    .icon(DocumentsIcon)
                    .child(
                      S.documentList()
                        .title('Draft Pages')
                        .filter('_type == "page" && _id match "drafts.*"')
                        .defaultOrdering([{ field: '_updatedAt', direction: 'desc' }])
                    ),
                  S.listItem()
                    .title('Blog Posts')
                    .icon(EditIcon)
                    .child(
                      S.documentList()
                        .title('Draft Blog Posts')
                        .filter('_type == "collection.blog" && _id match "drafts.*"')
                        .defaultOrdering([{ field: '_updatedAt', direction: 'desc' }])
                    ),
                  S.listItem()
                    .title('Documentation')
                    .icon(BookIcon)
                    .child(
                      S.documentList()
                        .title('Draft Documentation')
                        .filter('_type == "collection.documentation" && _id match "drafts.*"')
                        .defaultOrdering([{ field: '_updatedAt', direction: 'desc' }])
                    ),
                  S.listItem()
                    .title('Events')
                    .icon(CalendarIcon)
                    .child(
                      S.documentList()
                        .title('Draft Events')
                        .filter('_type == "collection.events" && _id match "drafts.*"')
                        .defaultOrdering([{ field: '_updatedAt', direction: 'desc' }])
                    ),
                  S.listItem()
                    .title('Changelog')
                    .icon(DocumentTextIcon)
                    .child(
                      S.documentList()
                        .title('Draft Changelog')
                        .filter('_type == "collection.changelog" && _id match "drafts.*"')
                        .defaultOrdering([{ field: '_updatedAt', direction: 'desc' }])
                    ),
                  S.listItem()
                    .title('Newsletter')
                    .icon(EnvelopeIcon)
                    .child(
                      S.documentList()
                        .title('Draft Newsletter')
                        .filter('_type == "collection.newsletter" && _id match "drafts.*"')
                        .defaultOrdering([{ field: '_updatedAt', direction: 'desc' }])
                    ),
                ])
            ),
          // Published Documents - by document type
          S.listItem()
            .id('published-documents')
            .title('Published Documents')
            .icon(CheckmarkCircleIcon)
            .child(
              S.list()
                .title('Published Documents')
                .items([
                  S.listItem()
                    .title('Pages')
                    .icon(DocumentsIcon)
                    .child(
                      S.documentList()
                        .title('Published Pages')
                        .filter('_type == "page" && !(_id match "drafts.*")')
                        .defaultOrdering([{ field: '_updatedAt', direction: 'desc' }])
                    ),
                  S.listItem()
                    .title('Blog Posts')
                    .icon(EditIcon)
                    .child(
                      S.documentList()
                        .title('Published Blog Posts')
                        .filter('_type == "collection.blog" && !(_id match "drafts.*")')
                        .defaultOrdering([{ field: '_updatedAt', direction: 'desc' }])
                    ),
                  S.listItem()
                    .title('Documentation')
                    .icon(BookIcon)
                    .child(
                      S.documentList()
                        .title('Published Documentation')
                        .filter('_type == "collection.documentation" && !(_id match "drafts.*")')
                        .defaultOrdering([{ field: '_updatedAt', direction: 'desc' }])
                    ),
                  S.listItem()
                    .title('Events')
                    .icon(CalendarIcon)
                    .child(
                      S.documentList()
                        .title('Published Events')
                        .filter('_type == "collection.events" && !(_id match "drafts.*")')
                        .defaultOrdering([{ field: '_updatedAt', direction: 'desc' }])
                    ),
                  S.listItem()
                    .title('Changelog')
                    .icon(DocumentTextIcon)
                    .child(
                      S.documentList()
                        .title('Published Changelog')
                        .filter('_type == "collection.changelog" && !(_id match "drafts.*")')
                        .defaultOrdering([{ field: '_updatedAt', direction: 'desc' }])
                    ),
                  S.listItem()
                    .title('Newsletter')
                    .icon(EnvelopeIcon)
                    .child(
                      S.documentList()
                        .title('Published Newsletter')
                        .filter('_type == "collection.newsletter" && !(_id match "drafts.*")')
                        .defaultOrdering([{ field: '_updatedAt', direction: 'desc' }])
                    ),
                ])
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
