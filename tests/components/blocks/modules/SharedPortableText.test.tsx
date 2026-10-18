// tests/components/blocks/modules/SharedPortableText.test.tsx
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';

vi.mock('next-intl', () => ({ useLocale: () => 'en' }));
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
