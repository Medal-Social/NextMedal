import { describe, expect, it } from 'vitest';
import { getYouTubeId } from '@/lib/youtube';

const ID = 'dQw4w9WgXcQ';

describe('getYouTubeId: a link to one YouTube video', () => {
  it.each([
    `https://www.youtube.com/watch?v=${ID}`,
    `https://youtube.com/watch?feature=share&v=${ID}`,
    `https://m.youtube.com/watch?v=${ID}`,
    `https://youtu.be/${ID}`,
    `https://youtu.be/${ID}?t=42`,
    `https://www.youtube.com/embed/${ID}`,
    `https://www.youtube.com/shorts/${ID}`,
    `https://www.youtube.com/v/${ID}`,
    `www.youtube.com/watch?v=${ID}`,
  ])('accepts %s', (url) => {
    expect(getYouTubeId(url)).toBe(ID);
  });

  it.each([
    undefined,
    '',
    'https://www.youtube.com/@medalsocial',
    'https://www.youtube.com/channel/UC1234567890',
    'https://www.youtube.com/playlist?list=PL1234567890abcdef',
    'https://www.youtube.com/watch?v=short',
    `https://www.youtube.com/watch?v=${ID}xyz`,
    `https://vimeo.com/${ID}`,
    `https://example.com/youtube.com/watch?v=${ID}`,
  ])('rejects %s', (url) => {
    expect(getYouTubeId(url)).toBeUndefined();
  });
});
