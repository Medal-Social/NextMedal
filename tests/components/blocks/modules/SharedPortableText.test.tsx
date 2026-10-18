// tests/components/blocks/modules/SharedPortableText.test.tsx
import { renderToStaticMarkup } from 'react-dom/server';
import { afterEach, describe, expect, it, vi } from 'vitest';

const intl = vi.hoisted(() => ({ locale: 'en' }));
vi.mock('next-intl', () => ({ useLocale: () => intl.locale }));
afterEach(() => {
  intl.locale = 'en';
});
vi.mock('@/i18n/navigation', () => ({
  Link: ({ href, children }: { href: string; children: React.ReactNode }) => (
    <a href={href}>{children}</a>
  ),
}));

import SharedPortableText from '@/components/blocks/modules/SharedPortableText';

const span = (text: string, marks: string[] = [], key = `s-${text}`) => ({
  _type: 'span',
  _key: key,
  text,
  marks,
});
const para = (key: string, children: ReturnType<typeof span>[]) =>
  ({ _type: 'block', _key: key, style: 'normal', markDefs: [], children }) as never;

describe('SharedPortableText fidelity (lean schema rule 8)', () => {
  it('renders italic (em) as <em>, not a bold coloured span', () => {
    const html = renderToStaticMarkup(
      <SharedPortableText value={[para('a', [span('Built by '), span('Medal Social', ['em'])])]} />
    );
    expect(html).toContain('<em>Medal Social</em>');
    expect(html).not.toContain('font-bold');
  });

  it('renders Shift+Enter line breaks as <br>', () => {
    const html = renderToStaticMarkup(
      <SharedPortableText value={[para('a', [span('one\ntwo')])]} />
    );
    expect(html).toMatch(/one<br\/?>two/);
  });

  it('renders a "\\n" paragraph (as stored in feature texts) as one empty line', () => {
    const html = renderToStaticMarkup(
      <SharedPortableText
        value={[
          para('a', [span('Hi')]),
          para('b', [span('\n', [], 'n')]),
          para('c', [span('There')]),
        ]}
      />
    );
    expect(html).toContain('<p>Hi</p><p><br/></p><p>There</p>');
  });
});

describe('SharedPortableText links (spec D4)', () => {
  const target = (slug: string, language: string) => ({
    _id: `${slug}.${language}`,
    _type: 'page',
    language,
    metadata: { slug: { current: slug } },
  });
  const linked = (markDef: Record<string, unknown>) =>
    ({
      _type: 'block',
      _key: 'l',
      style: 'normal',
      markDefs: [{ _key: 'm', _type: 'link', ...markDef }],
      children: [span('Go', ['m'])],
    }) as never;

  it('nb page linking to an untranslated English page: href="/features" (no /en/ 308)', () => {
    intl.locale = 'nb';
    const html = renderToStaticMarkup(
      <SharedPortableText
        value={[
          linked({ type: 'internal', internal: { ...target('features', 'en'), translations: [] } }),
        ]}
      />
    );
    expect(html).toContain('href="/features"');
  });

  it('nb page linking to a translated page: href="/nb/now"', () => {
    intl.locale = 'nb';
    const html = renderToStaticMarkup(
      <SharedPortableText
        value={[
          linked({
            type: 'internal',
            internal: { ...target('now', 'en'), translations: [target('now', 'nb')] },
          }),
        ]}
      />
    );
    expect(html).toContain('href="/nb/now"');
  });

  it('a link marked external but holding an internal reference still renders <a> to the internal path', () => {
    const html = renderToStaticMarkup(
      <SharedPortableText value={[linked({ type: 'external', internal: target('about', 'en') })]} />
    );
    expect(html).toMatch(/<a [^>]*href="\/about"[^>]*>Go<\/a>/);
  });
});
