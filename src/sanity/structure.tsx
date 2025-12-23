import { ControlsIcon, DatabaseIcon, DocumentsIcon, EditIcon } from '@sanity/icons';
import { structureTool } from 'sanity/structure';
import { group, singleton } from './lib/utils';
export const structure = structureTool({
  structure: (S) =>
    S.list()
      .title('Content')
      .items([
        S.documentTypeListItem('page').title('Pages').icon(DocumentsIcon),
        // S.documentTypeListItem('component.library').title('Components'),
        S.divider(),

        S.documentTypeListItem('blog.post').title('Blog').icon(EditIcon),
        S.divider(),

        singleton(S, 'site', 'Site Settings').icon(ControlsIcon),
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
        ]).icon(DatabaseIcon),
      ]),
});

export function icon() {
  // biome-ignore lint/performance/noImgElement: Sanity admin favicon
  return <img style={{ width: '100%', aspectRatio: 1 }} src="/favicon.ico" alt="Medal Social" />;
}
