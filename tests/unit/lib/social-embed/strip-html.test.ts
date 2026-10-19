import { describe, expect, it } from 'vitest';
import { extractDateFromXOembedHtml, stripHtml } from '@/lib/social-embed/strip-html';

describe('stripHtml', () => {
  it('keeps text and line breaks from provider markup', () => {
    expect(stripHtml('<p>Hello<br>world</p><p>Again</p>')).toBe('Hello\nworld\nAgain');
  });

  it('cannot reassemble a tag from nested fragments', () => {
    const out = stripHtml('<scr<b>ipt>alert(1)</scr</b>ipt>');
    expect(out).not.toMatch(/<\s*script/i);
    expect(out).not.toMatch(/[<>]/);
  });

  it('decodes entities once (no double unescaping)', () => {
    expect(stripHtml('Tom &amp; Jerry &mdash; &quot;hi&quot; &#39;x&#39;')).toBe(
      'Tom & Jerry — "hi" \'x\''
    );
    expect(stripHtml('&amp;lt;script&amp;gt;')).toBe('&lt;script&gt;');
  });
});

describe('X footer dates', () => {
  it('ignores dates in the post body', () => {
    expect(
      extractDateFromXOembedHtml(
        '<blockquote><p>Remember January 1, 2020</p> — Author <a href="https://x.com/a/status/1">October 18, 2026</a></blockquote>'
      )
    ).toBe('2026-10-18');
  });
  it('does not invent a timestamp from body copy without a footer', () => {
    expect(
      extractDateFromXOembedHtml('<blockquote><p>January 1, 2020</p></blockquote>')
    ).toBeNull();
  });
});
