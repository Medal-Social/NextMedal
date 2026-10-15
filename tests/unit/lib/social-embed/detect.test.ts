import { describe, expect, it } from 'vitest';
import {
  cleanPlatform,
  cleanUrl,
  detectPlatformFromUrl,
  extractInstagramId,
  extractLinkedInActivityId,
  extractTikTokId,
  extractXStatusId,
  extractYouTubeId,
  parseSocialEmbedInput,
} from '@/lib/social-embed';
import { stegaEncodeForTest } from './stega-encode';

const ANTHROPIC_X = 'https://x.com/AnthropicAI/status/2110047081414987957';
const GITLAB_X = 'https://x.com/gitlab/status/2110167424234295775';

describe('social-embed detect', () => {
  describe('stega-encoded platform / url', () => {
    it('cleans stega-encoded twitter and normalizes to x', () => {
      const dirty = stegaEncodeForTest('twitter');
      expect(dirty).not.toBe('twitter');
      expect(cleanPlatform(dirty)).toBe('x');
    });

    it('parses stega-encoded platform + url for the Anthropic test post', () => {
      const parsed = parseSocialEmbedInput(
        stegaEncodeForTest('twitter'),
        stegaEncodeForTest(ANTHROPIC_X)
      );
      expect(parsed).toEqual({
        platform: 'x',
        url: ANTHROPIC_X,
        id: '2110047081414987957',
        username: 'AnthropicAI',
      });
    });

    it('parses stega-encoded GitLab test post', () => {
      const parsed = parseSocialEmbedInput(
        stegaEncodeForTest('twitter'),
        stegaEncodeForTest(GITLAB_X)
      );
      expect(parsed?.id).toBe('2110167424234295775');
      expect(parsed?.username).toBe('gitlab');
      expect(parsed?.platform).toBe('x');
    });
  });

  describe('URL parsing per platform', () => {
    it('parses X status urls (x.com and twitter.com)', () => {
      expect(extractXStatusId(ANTHROPIC_X)).toBe('2110047081414987957');
      expect(extractXStatusId('https://twitter.com/gitlab/status/2110167424234295775')).toBe(
        '2110167424234295775'
      );
      expect(detectPlatformFromUrl(ANTHROPIC_X)).toBe('x');
    });

    it('parses YouTube watch, short, embed, and live urls', () => {
      expect(extractYouTubeId('https://www.youtube.com/watch?v=dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ');
      expect(extractYouTubeId('https://youtu.be/dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ');
      expect(extractYouTubeId('https://www.youtube.com/embed/dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ');
      expect(extractYouTubeId('https://www.youtube.com/shorts/dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ');
      expect(extractYouTubeId('https://www.youtube.com/live/Svz_KbFAz9Y')).toBe('Svz_KbFAz9Y');
      expect(detectPlatformFromUrl('https://youtu.be/dQw4w9WgXcQ')).toBe('youtube');
      expect(detectPlatformFromUrl('https://www.youtube.com/live/Svz_KbFAz9Y')).toBe('youtube');
    });

    it('parses TikTok, Instagram, LinkedIn ids', () => {
      expect(extractTikTokId('https://www.tiktok.com/@user/video/6718339398022827270')).toBe(
        '6718339398022827270'
      );
      expect(extractInstagramId('https://www.instagram.com/p/AbC123/')).toBe('AbC123');
      expect(extractInstagramId('https://www.instagram.com/reel/ReEl456/')).toBe('ReEl456');
      expect(
        extractLinkedInActivityId('https://www.linkedin.com/feed/update/urn:li:activity:1234567890')
      ).toBe('1234567890');
      expect(
        extractLinkedInActivityId('https://www.linkedin.com/posts/someone_activity-9876543210-abcd')
      ).toBe('9876543210');
    });

    it('infers platform from url when Sanity platform is missing', () => {
      const parsed = parseSocialEmbedInput(undefined, ANTHROPIC_X);
      expect(parsed?.platform).toBe('x');
      expect(parsed?.id).toBe('2110047081414987957');
    });

    it('rejects non-http urls after cleaning', () => {
      expect(cleanUrl('javascript:alert(1)')).toBeNull();
      expect(cleanUrl(stegaEncodeForTest('not a url'))).toBeNull();
    });
  });
});

describe('X oEmbed body / date helpers', () => {
  it('extracts only the <p> body and ISO date from oEmbed HTML', async () => {
    const { extractXOembedBodyHtml, extractDateFromXOembedHtml, stripHtml } = await import(
      '@/lib/social-embed'
    );
    const html =
      '<blockquote class="twitter-tweet"><p lang="en">Hello — world about agents.</p>&mdash; Anthropic (@AnthropicAI) <a href="https://x.com/x/status/1">October 13, 2026</a></blockquote>';
    const text = stripHtml(extractXOembedBodyHtml(html));
    expect(text).toBe('Hello — world about agents.');
    expect(text).not.toContain('Anthropic');
    // Date-only — oEmbed footers never carry a clock time.
    expect(extractDateFromXOembedHtml(html)).toBe('2026-10-13');
  });
});
