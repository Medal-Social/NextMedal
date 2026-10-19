import { NextIntlClientProvider } from 'next-intl';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';

vi.mock('next-intl/server', () => ({
  getTranslations: async () => (key: string) => key,
}));
vi.mock('@/components/blocks/modules/content/RichtextModule/Content.server', () => ({
  default: () => <div data-body />,
}));
vi.mock('@/components/blocks/modules/frontpage/articles/SocialShare', () => ({
  default: () => <div data-share />,
}));
vi.mock('@/components/blocks/modules/Modules', () => ({
  default: ({
    modules,
    isSidebar,
    locale,
  }: {
    modules?: Sanity.Module[];
    isSidebar?: boolean;
    locale?: string;
  }) =>
    modules?.length ? (
      <div
        data-placement={modules.map((m) => m._type).join(',')}
        data-sidebar={String(Boolean(isSidebar))}
        data-locale={locale}
      />
    ) : null,
}));

import ArticleDetail from '@/components/blocks/modules/frontpage/articles/ArticleDetail';
import nb from '@/messages/nb.json';

const offer = { _type: 'lead-magnet', _key: 'lm' } as unknown as Sanity.Module;
const post = (placements?: unknown) =>
  ({
    _id: 'a1',
    _type: 'collection.article',
    language: 'nb',
    metadata: { title: 'Hei', slug: { current: 'hei' } },
    body: [],
    placements,
  }) as unknown as Sanity.CollectionArticlePost;

const html = async (p: Sanity.CollectionArticlePost) =>
  renderToStaticMarkup(
    <NextIntlClientProvider locale="nb" messages={nb}>
      {await ArticleDetail({ post: p, collectionSlug: 'now' })}
    </NextIntlClientProvider>
  );

describe('article pages show their placements (download offer)', () => {
  it('a sidebar placement renders once, as a sidebar block, in the article language', async () => {
    const out = await html(
      post([{ _id: 'pl', scope: 'articles-frontpage', location: 'sidebar', modules: [offer] }])
    );
    const matches = out.match(/data-placement="lead-magnet"/g) ?? [];
    expect(matches).toHaveLength(1);
    expect(out).toContain('data-sidebar="true"');
    expect(out).toContain('data-locale="nb"');
  });

  it('the sidebar placement is visible on small screens too (not inside the desktop-only aside)', async () => {
    const out = await html(
      post([{ _id: 'pl', scope: 'articles-frontpage', location: 'sidebar', modules: [offer] }])
    );
    const aside = out.slice(out.indexOf('<aside'), out.indexOf('</aside>'));
    expect(aside).not.toContain('data-placement');
  });

  it('top and bottom placements render around the article', async () => {
    const out = await html(
      post([
        {
          _id: 't',
          scope: 'articles-frontpage',
          location: 'top',
          modules: [{ _type: 'callout', _key: 't' }],
        },
        {
          _id: 'b',
          scope: 'articles-frontpage',
          location: 'bottom',
          modules: [{ _type: 'callout', _key: 'b' }],
        },
      ])
    );
    expect(out.match(/data-placement="callout"/g)).toHaveLength(2);
    expect(out).toContain('data-sidebar="false"');
  });

  it('no placements: nothing extra', async () => {
    expect(await html(post())).not.toContain('data-placement');
  });
});
