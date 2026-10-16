import { describe, expect, it } from 'vitest';
import {
  isAppProductionEnv,
  isQaFixtureSitemapPath,
  isSocialEmbedQaFixtureAllowed,
  QA_SOCIAL_EMBEDS_PATH,
} from '@/lib/social-embed/qa-fixture-access';

describe('isAppProductionEnv', () => {
  it('is production when NEXT_PUBLIC_APP_ENV is production', () => {
    expect(isAppProductionEnv('production', 'preview')).toBe(true);
  });

  it('is production when VERCEL_ENV is production', () => {
    expect(isAppProductionEnv('staging', 'production')).toBe(true);
  });

  it('is not production for staging / preview / development', () => {
    expect(isAppProductionEnv('staging', 'preview')).toBe(false);
    expect(isAppProductionEnv('preview', undefined)).toBe(false);
    expect(isAppProductionEnv('development', undefined)).toBe(false);
    expect(isAppProductionEnv(undefined, undefined)).toBe(false);
  });
});

describe('isSocialEmbedQaFixtureAllowed (prod 404 gate)', () => {
  it('404s production when the QA flag is unset', () => {
    expect(
      isSocialEmbedQaFixtureAllowed({
        appEnv: 'production',
        vercelEnv: 'production',
        qaFlag: undefined,
      })
    ).toBe(false);
  });

  it('404s production when the QA flag is empty or falsey', () => {
    for (const qaFlag of ['', '0', 'false', 'no', 'off']) {
      expect(
        isSocialEmbedQaFixtureAllowed({
          appEnv: 'production',
          vercelEnv: undefined,
          qaFlag,
        })
      ).toBe(false);
    }
  });

  it('allows production only when ALLOW_QA_SOCIAL_EMBEDS is truthy', () => {
    for (const qaFlag of ['1', 'true', 'TRUE', 'yes', 'on']) {
      expect(
        isSocialEmbedQaFixtureAllowed({
          appEnv: 'production',
          vercelEnv: 'production',
          qaFlag,
        })
      ).toBe(true);
    }
  });

  it('allows non-production without a QA flag (staging / preview / Lighthouse)', () => {
    expect(
      isSocialEmbedQaFixtureAllowed({
        appEnv: 'staging',
        vercelEnv: undefined,
        qaFlag: undefined,
      })
    ).toBe(true);
    expect(
      isSocialEmbedQaFixtureAllowed({
        appEnv: 'preview',
        vercelEnv: 'preview',
        qaFlag: undefined,
      })
    ).toBe(true);
    expect(
      isSocialEmbedQaFixtureAllowed({
        appEnv: 'development',
        vercelEnv: undefined,
        qaFlag: undefined,
      })
    ).toBe(true);
  });
});

describe('isQaFixtureSitemapPath (sitemap exclusion)', () => {
  it('excludes the QA social-embeds path', () => {
    expect(isQaFixtureSitemapPath(QA_SOCIAL_EMBEDS_PATH)).toBe(true);
    expect(isQaFixtureSitemapPath('/qa/social-embeds/')).toBe(true);
  });

  it('excludes locale-prefixed and absolute URLs for the fixture', () => {
    expect(isQaFixtureSitemapPath('/nb/qa/social-embeds')).toBe(true);
    expect(isQaFixtureSitemapPath('/ar/qa/social-embeds')).toBe(true);
    expect(isQaFixtureSitemapPath('https://www.medalsocial.com/qa/social-embeds')).toBe(true);
    expect(isQaFixtureSitemapPath('https://example.com/nb/qa/social-embeds')).toBe(true);
  });

  it('does not exclude ordinary marketing paths', () => {
    expect(isQaFixtureSitemapPath('/')).toBe(false);
    expect(isQaFixtureSitemapPath('/about')).toBe(false);
    expect(isQaFixtureSitemapPath('/articles/hello')).toBe(false);
    expect(isQaFixtureSitemapPath('/qa')).toBe(false);
    expect(isQaFixtureSitemapPath('/qa/other')).toBe(false);
    expect(isQaFixtureSitemapPath('https://example.com/pricing')).toBe(false);
  });
});

describe('isSocialEmbedQaFixtureAllowed (no deploy identity)', () => {
  it('404s a production-mode build that has no app/Vercel environment set', () => {
    expect(isSocialEmbedQaFixtureAllowed({ nodeEnv: 'production' })).toBe(false);
  });

  it('allows a development-mode build without a deploy identity', () => {
    expect(isSocialEmbedQaFixtureAllowed({ nodeEnv: 'development' })).toBe(true);
  });

  it('still allows an explicitly identified staging build in production mode', () => {
    expect(isSocialEmbedQaFixtureAllowed({ appEnv: 'staging', nodeEnv: 'production' })).toBe(true);
  });
});
