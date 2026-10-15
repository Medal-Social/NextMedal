import { render, screen } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import { describe, expect, it } from 'vitest';
import { SocialEmbedFallback } from '@/components/blocks/objects/core/social-embed/social-embed-fallback';
import messages from '@/messages/en.json';

function wrap(ui: React.ReactNode) {
  return (
    <NextIntlClientProvider locale="en" messages={messages}>
      {ui}
    </NextIntlClientProvider>
  );
}

describe('SocialEmbedFallback', () => {
  it('renders a Medal link-out card without server fetches', () => {
    render(
      wrap(
        <SocialEmbedFallback
          platform="twitter"
          url="https://x.com/gitlab/status/2110167424234295775"
        />
      )
    );

    const article = screen.getByRole('article');
    expect(article).toHaveAttribute('data-fallback', 'true');
    expect(article).toHaveAttribute('data-platform', 'x');
    expect(screen.getByRole('link', { name: /View on X/i })).toHaveAttribute(
      'href',
      'https://x.com/gitlab/status/2110167424234295775'
    );
  });
});
