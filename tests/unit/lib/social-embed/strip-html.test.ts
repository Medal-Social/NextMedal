import { describe, expect, it } from 'vitest';
import { stripHtml } from '@/lib/social-embed/strip-html';

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
