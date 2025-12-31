import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import {
  IconBluesky,
  IconFacebook,
  IconFacebookF,
  IconGithub,
  IconInstagram,
  IconLink,
  IconLinkedin,
  IconLinkedinIn,
  IconTiktok,
  IconTwitterX,
  IconUser,
  IconWhatsapp,
  IconYoutube,
} from '@/components/icons/social-icons';

describe('Social Icons', () => {
  describe('IconTwitterX', () => {
    it('renders SVG with role img', () => {
      render(<IconTwitterX data-testid="icon" />);
      const svg = screen.getByTestId('icon');
      expect(svg.tagName).toBe('svg');
      expect(svg).toHaveAttribute('role', 'img');
    });

    it('has title for accessibility', () => {
      render(<IconTwitterX />);
      expect(screen.getByTitle('X (Twitter)')).toBeInTheDocument();
    });

    it('forwards props', () => {
      render(<IconTwitterX className="custom-class" />);
      expect(screen.getByRole('img')).toHaveClass('custom-class');
    });
  });

  describe('IconFacebook', () => {
    it('renders with title', () => {
      render(<IconFacebook />);
      expect(screen.getByTitle('Facebook')).toBeInTheDocument();
    });

    it('has correct viewBox', () => {
      render(<IconFacebook data-testid="icon" />);
      expect(screen.getByTestId('icon')).toHaveAttribute('viewBox', '0 0 512 512');
    });
  });

  describe('IconFacebookF', () => {
    it('renders with title', () => {
      render(<IconFacebookF />);
      expect(screen.getByTitle('Facebook')).toBeInTheDocument();
    });

    it('has correct viewBox for F variant', () => {
      render(<IconFacebookF data-testid="icon" />);
      expect(screen.getByTestId('icon')).toHaveAttribute('viewBox', '0 0 320 512');
    });
  });

  describe('IconInstagram', () => {
    it('renders with title', () => {
      render(<IconInstagram />);
      expect(screen.getByTitle('Instagram')).toBeInTheDocument();
    });
  });

  describe('IconLinkedin', () => {
    it('renders with title', () => {
      render(<IconLinkedin />);
      expect(screen.getByTitle('LinkedIn')).toBeInTheDocument();
    });

    it('has correct viewBox', () => {
      render(<IconLinkedin data-testid="icon" />);
      expect(screen.getByTestId('icon')).toHaveAttribute('viewBox', '0 0 448 512');
    });
  });

  describe('IconLinkedinIn', () => {
    it('renders with title', () => {
      render(<IconLinkedinIn />);
      expect(screen.getByTitle('LinkedIn')).toBeInTheDocument();
    });
  });

  describe('IconYoutube', () => {
    it('renders with title', () => {
      render(<IconYoutube />);
      expect(screen.getByTitle('YouTube')).toBeInTheDocument();
    });

    it('has correct viewBox', () => {
      render(<IconYoutube data-testid="icon" />);
      expect(screen.getByTestId('icon')).toHaveAttribute('viewBox', '0 0 576 512');
    });
  });

  describe('IconGithub', () => {
    it('renders with title', () => {
      render(<IconGithub />);
      expect(screen.getByTitle('GitHub')).toBeInTheDocument();
    });

    it('has correct viewBox', () => {
      render(<IconGithub data-testid="icon" />);
      expect(screen.getByTestId('icon')).toHaveAttribute('viewBox', '0 0 496 512');
    });
  });

  describe('IconTiktok', () => {
    it('renders with title', () => {
      render(<IconTiktok />);
      expect(screen.getByTitle('TikTok')).toBeInTheDocument();
    });
  });

  describe('IconBluesky', () => {
    it('renders with title', () => {
      render(<IconBluesky />);
      expect(screen.getByTitle('Bluesky')).toBeInTheDocument();
    });
  });

  describe('IconWhatsapp', () => {
    it('renders with title', () => {
      render(<IconWhatsapp />);
      expect(screen.getByTitle('WhatsApp')).toBeInTheDocument();
    });
  });

  describe('IconLink', () => {
    it('renders with title', () => {
      render(<IconLink />);
      expect(screen.getByTitle('Link')).toBeInTheDocument();
    });

    it('has correct viewBox', () => {
      render(<IconLink data-testid="icon" />);
      expect(screen.getByTestId('icon')).toHaveAttribute('viewBox', '0 0 640 512');
    });
  });

  describe('IconUser', () => {
    it('renders with title', () => {
      render(<IconUser />);
      expect(screen.getByTitle('User')).toBeInTheDocument();
    });
  });

  describe('Common props', () => {
    it('all icons have currentColor fill', () => {
      const { rerender, container } = render(<IconTwitterX data-testid="icon" />);
      expect(container.querySelector('svg')).toHaveAttribute('fill', 'currentColor');

      rerender(<IconFacebook data-testid="icon" />);
      expect(container.querySelector('svg')).toHaveAttribute('fill', 'currentColor');

      rerender(<IconGithub data-testid="icon" />);
      expect(container.querySelector('svg')).toHaveAttribute('fill', 'currentColor');
    });

    it('all icons have 1em dimensions by default', () => {
      render(<IconTwitterX data-testid="icon" />);
      const svg = screen.getByTestId('icon');
      expect(svg).toHaveAttribute('width', '1em');
      expect(svg).toHaveAttribute('height', '1em');
    });

    it('all icons forward custom props', () => {
      render(
        <IconGithub
          data-testid="icon"
          className="my-icon"
          aria-hidden="true"
          width="24"
          height="24"
        />
      );
      const svg = screen.getByTestId('icon');
      expect(svg).toHaveClass('my-icon');
      expect(svg).toHaveAttribute('aria-hidden', 'true');
      expect(svg).toHaveAttribute('width', '24');
      expect(svg).toHaveAttribute('height', '24');
    });
  });
});
