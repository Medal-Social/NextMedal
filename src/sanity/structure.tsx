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

        S.listItem()
          .title('Blog')
          .icon(EditIcon)
          .child(
            S.list()
              .title('Blog')
              .items([
                S.documentTypeListItem('blog.post').title('Posts'),
                S.documentTypeListItem('blog.category').title('Categories'),
              ])
          ),
        S.divider(),

        singleton(S, 'site', 'Site settings').icon(ControlsIcon),
        S.divider(),

        group(S, 'Site Elements', [
          S.documentTypeListItem('banner').title('Banners'),
          S.documentTypeListItem('logo').title('Logos'),
          S.documentTypeListItem('person').title('Team Members'),
          S.documentTypeListItem('pricing').title('Pricing tiers'),
          S.documentTypeListItem('global-module').title('Global modules'),
          S.documentTypeListItem('navigation'),
          S.documentTypeListItem('redirect').title('Redirects'),
        ]).icon(DatabaseIcon),
      ]),
});

export function icon() {
  // biome-ignore lint/performance/noImgElement: Sanity admin favicon
  return <img style={{ width: '100%', aspectRatio: 1 }} src="/favicon.ico" alt="Medal Social" />;
}
