import { describe, expect, it } from 'vitest';
import { anchorChoices, FIXED_ANCHORS, pageAnchors, SECTION_TITLES } from '@/lib/block-anchors';

const m = (_type: string, _key: string) => ({ _type, _key });

describe('fixed anchors (spec D3)', () => {
  it('gives each anchored block its type anchor and numbers repeats', () => {
    const home = [
      m('hero', 'h'),
      m('product-comparison', 'pc'),
      m('callout', 'c1'),
      m('logo-cloud', 'l'),
      m('accordion-list', 'a1'),
      m('features', 'f1'),
      m('features', 'f2'),
      m('accordion-list', 'a2'),
      m('callout', 'c2'),
    ];
    expect(Object.fromEntries(pageAnchors(home))).toEqual({
      pc: 'comparison',
      c1: 'message',
      l: 'logos',
      a1: 'questions',
      f1: 'features',
      f2: 'features-2',
      a2: 'questions-2',
      c2: 'message-2',
    });
  });

  it('leaves the page top and unknown types on their default id', () => {
    expect(pageAnchors([m('hero', 'h'), m('constructor', 'x'), null, undefined]).size).toBe(0);
  });

  it('offers editors exactly the anchors the site renders, with plain names', () => {
    expect(anchorChoices([m('richtext', 'r'), m('features', 'f')])).toEqual([
      { anchor: 'text', label: 'Text (#text)', type: 'richtext', _key: 'r', isExplicit: true },
      {
        anchor: 'features',
        label: 'Feature grid (#features)',
        type: 'features',
        _key: 'f',
        isExplicit: true,
      },
    ]);
    expect(Object.keys(SECTION_TITLES).sort()).toEqual(Object.keys(FIXED_ANCHORS).sort());
  });
});
