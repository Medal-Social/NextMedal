import { afterEach, describe, expect, it, vi } from 'vitest';

const ANTHROPIC_X = 'https://x.com/AnthropicAI/status/2110047081414987957';

describe('resolveSocialEmbed', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.resetModules();
  });

  it('returns a non-fallback X card when syndication responds', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async (input: RequestInfo | URL) => {
        const url = String(input);
        if (url.includes('cdn.syndication.twimg.com')) {
          return new Response(
            JSON.stringify({
              text: 'Creating in-house source control.',
              created_at: '2026-10-13T16:36:41.000Z',
              user: {
                name: 'Anthropic',
                screen_name: 'AnthropicAI',
                profile_image_url_https: 'https://pbs.twimg.com/profile_images/abc_normal.jpg',
              },
              card: {
                binding_values: {
                  title: {
                    type: 'STRING',
                    string_value: 'Redesigning source control at Anthropic',
                  },
                  description: {
                    type: 'STRING',
                    string_value: 'As our merges per day grew more than tenfold…',
                  },
                  vanity_url: { type: 'STRING', string_value: 'anthropic.com' },
                  photo_image_full_size_large: {
                    type: 'IMAGE',
                    image_value: {
                      url: 'https://pbs.twimg.com/card_img/example.jpg',
                      width: 600,
                      height: 314,
                    },
                  },
                  photo_image_full_size_alt_text: {
                    type: 'STRING',
                    string_value: 'Anthropic logo',
                  },
                },
              },
            }),
            { status: 200, headers: { 'Content-Type': 'application/json' } }
          );
        }
        return new Response('{}', { status: 404 });
      })
    );

    const { resolveSocialEmbed } = await import('@/lib/social-embed/resolve');
    const data = await resolveSocialEmbed('twitter', ANTHROPIC_X);

    expect(data).not.toBeNull();
    expect(data?.platform).toBe('x');
    expect(data?.isFallback).toBe(false);
    expect(data?.authorName).toBe('Anthropic');
    expect(data?.authorHandle).toBe('@AnthropicAI');
    expect(data?.text).toContain('source control');
    expect(data?.authorAvatarUrl).toContain('pbs.twimg.com');
    expect(data?.linkPreview).toMatchObject({
      domain: 'anthropic.com',
      title: 'Redesigning source control at Anthropic',
      description: expect.stringContaining('merges'),
    });
    expect(data?.linkPreview?.image?.url).toContain('pbs.twimg.com');
    expect(data?.linkPreview?.image?.aspectRatio).toBe('600 / 314');
  });

  it('returns a graceful fallback card for Instagram (no token)', async () => {
    const { resolveSocialEmbed } = await import('@/lib/social-embed/resolve');
    const data = await resolveSocialEmbed('instagram', 'https://www.instagram.com/p/AbCdef123/');

    expect(data).toMatchObject({
      platform: 'instagram',
      isFallback: true,
      url: 'https://www.instagram.com/p/AbCdef123/',
    });
    expect(data?.text).toBeNull();
  });

  it('returns a graceful fallback card for LinkedIn', async () => {
    const { resolveSocialEmbed } = await import('@/lib/social-embed/resolve');
    const data = await resolveSocialEmbed(
      'linkedin',
      'https://www.linkedin.com/feed/update/urn:li:activity:123456'
    );

    expect(data?.isFallback).toBe(true);
    expect(data?.platform).toBe('linkedin');
  });

  it('falls back for X when every public endpoint fails', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response('nope', { status: 503 }))
    );

    const { resolveSocialEmbed } = await import('@/lib/social-embed/resolve');
    const data = await resolveSocialEmbed('twitter', ANTHROPIC_X);

    expect(data).toMatchObject({
      platform: 'x',
      isFallback: true,
      url: ANTHROPIC_X,
      authorHandle: '@AnthropicAI',
    });
  });

  it('returns null for unusable input', async () => {
    const { resolveSocialEmbed } = await import('@/lib/social-embed/resolve');
    expect(await resolveSocialEmbed('twitter', '')).toBeNull();
    expect(await resolveSocialEmbed('twitter', 'not-a-url')).toBeNull();
  });
});
