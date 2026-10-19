import { describe, expect, it } from 'vitest';
import { consentLinkHref } from '@/lib/forms/consent-link';

describe('consentLinkHref, external links', () => {
  it('keeps a web address', () => {
    expect(consentLinkHref({ type: 'external', external: 'https://example.com/terms' }, 'en')).toBe(
      'https://example.com/terms'
    );
  });
  it('drops unsafe schemes', () => {
    expect(consentLinkHref({ type: 'external', external: 'javascript:alert(1)' }, 'en')).toBe(
      undefined
    );
    expect(consentLinkHref({ type: 'external', external: 'data:text/html,<b>x</b>' }, 'en')).toBe(
      undefined
    );
  });
  it('no address, no link', () => {
    expect(consentLinkHref({ type: 'external' }, 'en')).toBe(undefined);
  });
});
