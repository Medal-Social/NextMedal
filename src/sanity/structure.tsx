import { BsDatabaseAdd } from 'react-icons/bs';
import { VscFiles, VscServerProcess } from 'react-icons/vsc';
import { structureTool } from 'sanity/structure';
import { group, singleton } from './lib/utils';
export const structure = structureTool({
  structure: (S) =>
    S.list()
      .title('Content')
      .items([
        S.documentTypeListItem('page').title('Pages').icon(VscFiles),
        S.divider(),

        S.documentTypeListItem('blog.post').title('Blog posts'),
        S.divider(),

        singleton(S, 'site', 'Site settings').icon(VscServerProcess),
        S.divider(),

        group(S, 'Site Elements', [
          S.documentTypeListItem('announcement').title('Announcements'),
          S.documentTypeListItem('logo').title('Logos'),
          S.documentTypeListItem('person').title('People'),
          S.documentTypeListItem('pricing').title('Pricing tiers'),
          S.documentTypeListItem('theme').title('Themes'),
          S.documentTypeListItem('blog.category').title('Blog categories'),
          S.documentTypeListItem('global-module').title('Global modules'),
          S.documentTypeListItem('navigation'),
          S.documentTypeListItem('redirect').title('Redirects'),
        ]).icon(BsDatabaseAdd),
      ]),
});

export function icon() {
  return <img style={{ width: '100%', aspectRatio: 1 }} src="/favicon.ico" alt="Medal Social" />;
}
