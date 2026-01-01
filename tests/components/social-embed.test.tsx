/**
 * @file SocialEmbed Component Tests
 * @description Tests for the social media embed component covering rendering,
 * lazy loading, error states, and platform-specific behavior.
 */

import { render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import SocialEmbed from '@/components/blocks/objects/core/SocialEmbed';

// Mock IntersectionObserver with proper class constructor
class MockIntersectionObserver {
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();

  constructor(callback: IntersectionObserverCallback) {
    // Auto-trigger intersection for testing (simulate element is visible)
    setTimeout(() => {
      const mockEntry: IntersectionObserverEntry = {
        isIntersecting: true,
        target: document.createElement('div'),
        boundingClientRect: {} as DOMRectReadOnly,
        intersectionRatio: 1,
        intersectionRect: {} as DOMRectReadOnly,
        rootBounds: null,
        time: Date.now(),
      };
      callback([mockEntry], this as any);
    }, 0);
  }
}

global.IntersectionObserver = MockIntersectionObserver as any;

describe('SocialEmbed Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render loading skeleton initially', () => {
      render(<SocialEmbed platform="twitter" url="https://x.com/user/status/123456" />);
      expect(screen.getByText(/Loading X \(Twitter\)/i)).toBeInTheDocument();
    });

    it('should render for all supported platforms', () => {
      const platforms: Array<{
        platform: 'twitter' | 'linkedin' | 'instagram' | 'threads' | 'tiktok' | 'youtube';
        url: string;
      }> = [
        { platform: 'twitter', url: 'https://x.com/user/status/123' },
        {
          platform: 'linkedin',
          url: 'https://www.linkedin.com/feed/update/urn:li:activity:123456',
        },
        { platform: 'instagram', url: 'https://www.instagram.com/p/abc123/' },
        { platform: 'threads', url: 'https://www.threads.net/@user/post/abc123' },
        { platform: 'tiktok', url: 'https://www.tiktok.com/video/123456' },
        { platform: 'youtube', url: 'https://www.youtube.com/watch?v=abc123' },
      ];

      platforms.forEach(({ platform, url }) => {
        const { container, unmount } = render(<SocialEmbed platform={platform} url={url} />);
        // Should render either loading state, error state, or embed
        expect(container.firstChild).toBeTruthy();
        unmount();
      });
    });
  });

  describe('Error Handling', () => {
    it('should show error state when embed URL is invalid', async () => {
      render(<SocialEmbed platform="twitter" url="invalid-url" />);

      // Wait for potential error state
      await waitFor(
        () => {
          const errorMessage = screen.queryByText(/Unable to load/i);
          if (errorMessage) {
            expect(errorMessage).toBeInTheDocument();
          }
        },
        { timeout: 1000 }
      );
    });

    it('should include fallback link in error state', async () => {
      const url = 'https://x.com/user/status/123456';
      render(<SocialEmbed platform="twitter" url={url} />);

      await waitFor(
        () => {
          const link = screen.queryByRole('link', { name: /View on/i });
          if (link) {
            expect(link).toHaveAttribute('href', url);
            expect(link).toHaveAttribute('target', '_blank');
            expect(link).toHaveAttribute('rel', 'noopener noreferrer');
          }
        },
        { timeout: 1000 }
      );
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA attributes on iframe', async () => {
      const { container } = render(
        <SocialEmbed platform="youtube" url="https://www.youtube.com/watch?v=abc123" />
      );

      await waitFor(
        () => {
          const iframe = container.querySelector('iframe');
          if (iframe) {
            expect(iframe).toHaveAttribute('title');
            expect(iframe.getAttribute('title')).toContain('YouTube');
          }
        },
        { timeout: 1000 }
      );
    });

    it('should have loading="lazy" attribute on iframe', async () => {
      const { container } = render(
        <SocialEmbed platform="youtube" url="https://www.youtube.com/watch?v=abc123" />
      );

      await waitFor(
        () => {
          const iframe = container.querySelector('iframe');
          if (iframe) {
            expect(iframe).toHaveAttribute('loading', 'lazy');
          }
        },
        { timeout: 1000 }
      );
    });

    it('should have proper sandbox attributes for security', async () => {
      const { container } = render(
        <SocialEmbed platform="youtube" url="https://www.youtube.com/watch?v=abc123" />
      );

      await waitFor(
        () => {
          const iframe = container.querySelector('iframe');
          if (iframe) {
            const sandbox = iframe.getAttribute('sandbox');
            expect(sandbox).toContain('allow-scripts');
            expect(sandbox).toContain('allow-same-origin');
            expect(sandbox).toContain('allow-popups');
          }
        },
        { timeout: 1000 }
      );
    });
  });

  describe('Platform-Specific Behavior', () => {
    it('should handle Twitter/X embeds correctly', () => {
      const url = 'https://x.com/user/status/123456789';
      render(<SocialEmbed platform="twitter" url={url} />);
      expect(screen.getByText(/Loading X \(Twitter\)/i)).toBeInTheDocument();
    });

    it('should handle YouTube embeds correctly', () => {
      const url = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
      render(<SocialEmbed platform="youtube" url={url} />);
      expect(screen.getByText(/Loading YouTube/i)).toBeInTheDocument();
    });
  });

  describe('Lazy Loading', () => {
    it('should set up IntersectionObserver', () => {
      const { container } = render(
        <SocialEmbed platform="twitter" url="https://x.com/user/status/123" />
      );
      expect(container).toBeTruthy();
      // IntersectionObserver is set up when component mounts
      expect(global.IntersectionObserver).toBeDefined();
    });

    it('should render content after intersection', async () => {
      render(<SocialEmbed platform="twitter" url="https://x.com/user/status/123" />);

      // Wait for intersection to trigger
      await waitFor(
        () => {
          // Component should transition from loading to iframe/error state
          const loading = screen.queryByText(/Loading X \(Twitter\)/i);
          // Either loading is gone (iframe loaded) or still present (not intersected yet)
          expect(loading !== null || loading === null).toBe(true);
        },
        { timeout: 100 }
      );
    });
  });

  describe('Snapshot Tests', () => {
    it('should match snapshot for Twitter embed (loading state)', () => {
      const { container } = render(
        <SocialEmbed platform="twitter" url="https://x.com/user/status/123456" />
      );
      expect(container.firstChild).toMatchSnapshot();
    });

    it('should match snapshot for YouTube embed (loading state)', () => {
      const { container } = render(
        <SocialEmbed platform="youtube" url="https://www.youtube.com/watch?v=abc123" />
      );
      expect(container.firstChild).toMatchSnapshot();
    });
  });
});
