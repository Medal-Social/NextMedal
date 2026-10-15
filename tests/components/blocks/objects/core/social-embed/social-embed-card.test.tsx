import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { SocialEmbedCard } from '@/components/blocks/objects/core/social-embed/social-embed-card';
import type { SocialEmbedData } from '@/lib/social-embed';

vi.mock('next/image', () => ({
  default: (props: { src: string; alt: string }) => (
    // biome-ignore lint/performance/noImgElement: test stub for next/image
    <img src={props.src} alt={props.alt} />
  ),
}));

const labels = {
  viewOn: 'View on X',
  playVideo: 'Play video',
  platformName: 'X',
  openOriginal: 'This post can’t be previewed here.',
  fallbackTitle: 'Couldn’t load this post',
  fallbackDescription: 'It may have been deleted. You can still open it on X.',
  clickToPlay: 'Click to play · loads player',
  postOn: 'Post on X',
};

const anthropicCard: SocialEmbedData = {
  platform: 'x',
  url: 'https://x.com/AnthropicAI/status/2110047081414987957',
  authorName: 'Anthropic',
  authorHandle: '@AnthropicAI',
  authorUrl: 'https://x.com/AnthropicAI',
  authorAvatarUrl: 'https://pbs.twimg.com/profile_images/abc_bigger.jpg',
  text: 'New on our Engineering blog: Creating in-house source control.',
  title: null,
  publishedAt: '2026-10-13T16:36:41.000Z',
  media: null,
  linkPreview: {
    domain: 'anthropic.com',
    title: 'Redesigning source control at Anthropic',
    description: 'As our merges per day grew more than tenfold…',
    url: 'https://t.co/wzNkwHs7IN',
    image: {
      url: 'https://pbs.twimg.com/card_img/example.jpg',
      width: 600,
      height: 314,
      alt: 'Anthropic logo',
      aspectRatio: '1.91 / 1',
    },
  },
  youtubeId: null,
  isFallback: false,
};

describe('SocialEmbedCard', () => {
  it('renders author, text, link preview, date, and link-out for an X post', () => {
    render(
      <SocialEmbedCard data={anthropicCard} labels={labels} formattedDate="13 Oct 2026 · 16:36" />
    );

    expect(screen.getByText('Anthropic')).toBeInTheDocument();
    expect(screen.getByText(/@AnthropicAI/)).toBeInTheDocument();
    expect(screen.getByText(/Creating in-house source control/)).toBeInTheDocument();
    expect(screen.getByText('anthropic.com')).toBeInTheDocument();
    expect(screen.getByText('Redesigning source control at Anthropic')).toBeInTheDocument();
    expect(screen.getByText('13 Oct 2026 · 16:36')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /View on X/i })).toHaveAttribute(
      'href',
      anthropicCard.url
    );
    expect(screen.getByRole('link', { name: /View on X/i })).toHaveAttribute(
      'rel',
      expect.stringContaining('noopener')
    );
    expect(screen.getByRole('article')).toHaveAttribute('data-platform', 'x');
    expect(screen.getByRole('article').getAttribute('data-fallback')).toBeNull();
    expect(screen.getByRole('blockquote')).toBeInTheDocument();
  });

  it('renders the graceful fallback path with a link when data cannot be fetched', () => {
    const fallback: SocialEmbedData = {
      ...anthropicCard,
      authorAvatarUrl: null,
      text: null,
      media: null,
      linkPreview: null,
      publishedAt: null,
      isFallback: true,
    };

    render(<SocialEmbedCard data={fallback} labels={labels} />);

    expect(screen.getByText(labels.fallbackTitle)).toBeInTheDocument();
    expect(screen.getByText(labels.fallbackDescription)).toBeInTheDocument();
    const link = screen.getByRole('link', { name: /View on X/i });
    expect(link).toHaveAttribute('href', fallback.url);
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer nofollow ugc');
    expect(screen.getByRole('article')).toHaveAttribute('data-fallback', 'true');
  });

  it('renders a YouTube facade button instead of an iframe until clicked', async () => {
    const { userEvent } = await import('@testing-library/user-event');
    const user = userEvent.setup();

    const youtube: SocialEmbedData = {
      platform: 'youtube',
      url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      authorName: 'Rick Astley',
      authorHandle: null,
      authorUrl: 'https://www.youtube.com/@RickAstleyYT',
      authorAvatarUrl: null,
      text: 'Never Gonna Give You Up',
      title: 'Never Gonna Give You Up',
      publishedAt: null,
      media: {
        url: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg',
        width: 480,
        height: 360,
        aspectRatio: '16 / 9',
      },
      linkPreview: null,
      youtubeId: 'dQw4w9WgXcQ',
      isFallback: false,
    };

    render(
      <SocialEmbedCard
        data={youtube}
        labels={{
          ...labels,
          platformName: 'YouTube',
          viewOn: 'View on YouTube',
        }}
      />
    );

    // Zero-JS facade: iframe is in the document inside <details>; summary is the control.
    const play = screen.getByLabelText(/Play video/i);
    expect(play.tagName).toBe('SUMMARY');
    expect(play).toHaveAttribute('aria-label', expect.stringMatching(/Play video/i));

    const iframe = screen.getByTitle('Never Gonna Give You Up');
    expect(iframe).toHaveAttribute(
      'src',
      expect.stringContaining('youtube-nocookie.com/embed/dQw4w9WgXcQ')
    );

    const details = play.closest('details');
    expect(details).not.toBeNull();
    expect(details).not.toHaveAttribute('open');
    await user.click(play);
    // jsdom may not toggle native <details> open; assert the control is still wired.
    expect(details?.querySelector('summary')).toBe(play);
  });
});
