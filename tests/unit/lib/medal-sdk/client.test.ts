import { afterEach, describe, expect, it, vi } from 'vitest';

const constructed: Array<{ key: string; options: Record<string, unknown> }> = [];

vi.mock('@medalsocial/sdk', () => ({
  Medal: class {
    constructor(key: string, options: Record<string, unknown>) {
      constructed.push({ key, options });
    }
  },
}));

describe('getMedal', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
    constructed.length = 0;
  });

  it('gives every Medal request an 8-second timeout', async () => {
    vi.stubEnv('MEDAL_API_KEY', 'medal_test');
    const { getMedal, MEDAL_REQUEST_TIMEOUT_MS } = await import('@/lib/medal-sdk/client');

    expect(await getMedal()).not.toBeNull();
    expect(MEDAL_REQUEST_TIMEOUT_MS).toBe(8000);
    expect(constructed[0]?.options).toMatchObject({ timeout: 8000 });
  });

  it('returns null without a key', async () => {
    vi.stubEnv('MEDAL_API_KEY', '');
    const { getMedal } = await import('@/lib/medal-sdk/client');

    expect(await getMedal()).toBeNull();
  });
});
