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
  media: {
    url: 'https://pbs.twimg.com/card_img/example.jpg',
    width: 600,
    height: 314,
    alt: 'Anthropic logo',
  },
  youtubeId: null,
  isFallback: false,
};

describe('SocialEmbedCard', () => {
  it('renders author, text, media, date, and link-out for an X post', () => {
    render(
      <SocialEmbedCard data={anthropicCard} labels={labels} formattedDate="October 13, 2026" />
    );

    expect(screen.getByText('Anthropic')).toBeInTheDocument();
    expect(screen.getByText(/@AnthropicAI/)).toBeInTheDocument();
    expect(screen.getByText(/Creating in-house source control/)).toBeInTheDocument();
    expect(screen.getByText('October 13, 2026')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /View on X/i })).toHaveAttribute(
      'href',
      anthropicCard.url
    );
    expect(screen.getByRole('article')).toHaveAttribute('data-platform', 'x');
    expect(screen.getByRole('article').getAttribute('data-fallback')).toBeNull();
  });

  it('renders the graceful fallback path with a link when data cannot be fetched', () => {
    const fallback: SocialEmbedData = {
      ...anthropicCard,
      authorAvatarUrl: null,
      text: null,
      media: null,
      publishedAt: null,
      isFallback: true,
    };

    render(<SocialEmbedCard data={fallback} labels={labels} />);

    expect(screen.getByText(labels.openOriginal)).toBeInTheDocument();
    const link = screen.getByRole('link', { name: /View on X/i });
    expect(link).toHaveAttribute('href', fallback.url);
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
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
      },
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

    expect(screen.queryByTitle('Never Gonna Give You Up')).not.toBeInTheDocument();
    const play = screen.getByRole('button', { name: /Play video/i });
    await user.click(play);

    const iframe = screen.getByTitle('Never Gonna Give You Up');
    expect(iframe).toHaveAttribute(
      'src',
      expect.stringContaining('youtube-nocookie.com/embed/dQw4w9WgXcQ')
    );
  });
});
