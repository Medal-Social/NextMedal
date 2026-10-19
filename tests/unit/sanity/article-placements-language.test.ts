import { evaluate, parse } from 'groq-js';
import { describe, expect, it } from 'vitest';
import { DEFAULT_LOCALE } from '@/i18n/config';
import { ARTICLE_PLACEMENT_SCOPE } from '@/lib/sanity/placement-scopes';
import { COLLECTION_ARTICLE_POST_QUERY } from '@/sanity/lib/queries';

// The download offer (an article placement) has no language of its own and is
// written in English, so for now it shows on English articles only.
const dataset = [
  ...['en', 'nb', 'ar'].map((language) => ({
    _id: `article-${language}`,
    _type: 'collection.article',
    language,
    metadata: { slug: { current: 'hello' } },
    body: [],
  })),
  {
    _id: 'offer',
    _type: 'placement',
    scope: ARTICLE_PLACEMENT_SCOPE,
    location: 'sidebar',
    modules: [{ _key: 'lm', _type: 'lead-magnet', buttonText: 'Download' }],
  },
];

async function placementsFor(locale: string) {
  const result = await (
    await evaluate(parse(COLLECTION_ARTICLE_POST_QUERY), {
      dataset,
      params: { itemSlug: 'hello', locale },
    })
  ).get();
  return result.placements as Array<{ _id: string }>;
}

describe('article placements by language', () => {
  it('the default language article gets the placements', async () => {
    expect((await placementsFor(DEFAULT_LOCALE)).map((p) => p._id)).toEqual(['offer']);
  });

  it.each(['nb', 'ar'])('a %s article gets none', async (locale) => {
    expect(await placementsFor(locale)).toEqual([]);
  });
});
