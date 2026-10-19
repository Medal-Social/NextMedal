import { BillIcon } from '@sanity/icons/Bill';
import { BookIcon } from '@sanity/icons/Book';
import { CalendarIcon } from '@sanity/icons/Calendar';
import { CogIcon } from '@sanity/icons/Cog';
import { DocumentsIcon } from '@sanity/icons/Documents';
import { DocumentTextIcon } from '@sanity/icons/DocumentText';
import { EditIcon } from '@sanity/icons/Edit';
import { EnvelopeIcon } from '@sanity/icons/Envelope';
import { ImageIcon } from '@sanity/icons/Image';
import { InboxIcon } from '@sanity/icons/Inbox';
import { UsersIcon } from '@sanity/icons/Users';
import { type StructureResolver, structureTool } from 'sanity/structure';
import { isAdministrator } from './studio-tools';

/**
 * Only what editors edit, in plain words (Vault spec 2026-10-18 §2, skill rule 7).
 * Placement rules, redirects and the other settings lists are for administrators.
 */
export const contentStructure: StructureResolver = (S, { currentUser }) =>
  S.list()
    .title('Content')
    .items([
      S.documentTypeListItem('page').title('Pages').icon(DocumentsIcon),
      S.documentTypeListItem('collection.article').title('Articles').icon(EditIcon),
      S.documentTypeListItem('collection.documentation').title('Docs').icon(BookIcon),
      S.documentTypeListItem('collection.changelog').title('Changelog').icon(DocumentTextIcon),
      S.documentTypeListItem('collection.events').title('Events').icon(CalendarIcon),
      S.documentTypeListItem('collection.newsletter').title('Newsletter').icon(EnvelopeIcon),
      S.documentTypeListItem('person').title('People').icon(UsersIcon),
      S.documentTypeListItem('pricing').title('Price plans').icon(BillIcon),
      S.documentTypeListItem('logo').title('Logos').icon(ImageIcon),
      S.documentTypeListItem('form').title('Forms').icon(EnvelopeIcon),
      S.documentTypeListItem('lead').title('Form submissions').icon(InboxIcon),
      S.divider(),
      S.listItem()
        .title('Site settings')
        .icon(CogIcon)
        .child(S.editor().id('site').schemaType('site').documentId('site')),
      ...(isAdministrator(currentUser)
        ? [
            S.divider(),
            S.documentTypeListItem('placement').title('Placement rules'),
            S.documentTypeListItem('redirect').title('Redirects'),
            S.documentTypeListItem('banner').title('Banners'),
            S.documentTypeListItem('article.category').title('Article topics'),
            S.documentTypeListItem('docs.category').title('Docs categories'),
          ]
        : []),
    ]);

export const structure = structureTool({ name: 'structure', structure: contentStructure });

export function icon() {
  // biome-ignore lint/performance/noImgElement: Sanity admin favicon
  return <img style={{ width: '100%', aspectRatio: 1 }} src="/favicon.ico" alt="Medal Social" />;
}
