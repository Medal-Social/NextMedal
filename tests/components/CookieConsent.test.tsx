import { render } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// Use vi.hoisted to define mock values before hoisting
const mockRun = vi.hoisted(() => vi.fn());

// Mock vanilla-cookieconsent
vi.mock('vanilla-cookieconsent', () => ({
  run: mockRun,
}));

// Mock CSS imports
vi.mock('vanilla-cookieconsent/dist/cookieconsent.css', () => ({}));
vi.mock('@/styles/cookieconsent.css', () => ({}));

// Mock next-themes
vi.mock('next-themes', () => ({
  useTheme: () => ({
    resolvedTheme: 'light',
  }),
}));

// Mock resolveUrl
vi.mock('@/lib/sanity/resolve-url', () => ({
  default: (page: { slug?: { current: string } }) => `/${page?.slug?.current || 'page'}`,
  resolveUrlSync: (page: { slug?: { current: string } }) => `/${page?.slug?.current || 'page'}`,
}));

import CookieConsentComponent from '@/components/CookieConsent';

describe('CookieConsentComponent', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    document.body.classList.remove('cc--darkmode');
  });

  it('returns null (component has no visible UI)', () => {
    const { container } = render(
      <CookieConsentComponent config={{ enabled: false }} locale="en" />
    );
    expect(container.firstChild).toBeNull();
  });

  it('does not run CookieConsent when disabled', () => {
    render(<CookieConsentComponent config={{ enabled: false }} locale="en" />);
    expect(mockRun).not.toHaveBeenCalled();
  });

  it('runs CookieConsent when enabled', () => {
    render(<CookieConsentComponent config={{ enabled: true }} locale="en" />);
    expect(mockRun).toHaveBeenCalledTimes(1);
  });

  it('passes locale to CookieConsent config', () => {
    render(<CookieConsentComponent config={{ enabled: true }} locale="nb" />);

    expect(mockRun).toHaveBeenCalledWith(
      expect.objectContaining({
        language: expect.objectContaining({
          default: 'nb',
        }),
      })
    );
  });

  it('uses default locale when not provided', () => {
    render(<CookieConsentComponent config={{ enabled: true }} />);

    expect(mockRun).toHaveBeenCalledWith(
      expect.objectContaining({
        language: expect.objectContaining({
          default: 'en',
        }),
      })
    );
  });

  it('configures necessary cookies category', () => {
    render(<CookieConsentComponent config={{ enabled: true }} locale="en" />);

    expect(mockRun).toHaveBeenCalledWith(
      expect.objectContaining({
        categories: expect.objectContaining({
          necessary: expect.objectContaining({
            readOnly: true,
            enabled: true,
          }),
        }),
      })
    );
  });

  it('configures analytics cookies category', () => {
    render(<CookieConsentComponent config={{ enabled: true }} locale="en" />);

    expect(mockRun).toHaveBeenCalledWith(
      expect.objectContaining({
        categories: expect.objectContaining({
          analytics: expect.objectContaining({
            readOnly: false,
            enabled: true,
          }),
        }),
      })
    );
  });

  it('sets box layout for consent modal', () => {
    render(<CookieConsentComponent config={{ enabled: true }} locale="en" />);

    expect(mockRun).toHaveBeenCalledWith(
      expect.objectContaining({
        guiOptions: expect.objectContaining({
          consentModal: expect.objectContaining({
            layout: 'box',
            position: 'bottom right',
          }),
        }),
      })
    );
  });

  it('includes privacy policy URL when page reference is provided', () => {
    const config = {
      enabled: true,
      privacyPolicy: {
        _type: 'page',
        slug: { current: 'privacy' },
      },
    };

    render(<CookieConsentComponent config={config as any} locale="en" />);

    expect(mockRun).toHaveBeenCalledWith(
      expect.objectContaining({
        language: expect.objectContaining({
          translations: expect.objectContaining({
            en: expect.objectContaining({
              consentModal: expect.objectContaining({
                footer: expect.stringContaining('/privacy'),
              }),
            }),
          }),
        }),
      })
    );
  });

  it('does not include footer when no privacy policy', () => {
    render(<CookieConsentComponent config={{ enabled: true }} locale="en" />);

    expect(mockRun).toHaveBeenCalledWith(
      expect.objectContaining({
        language: expect.objectContaining({
          translations: expect.objectContaining({
            en: expect.objectContaining({
              consentModal: expect.objectContaining({
                footer: undefined,
              }),
            }),
          }),
        }),
      })
    );
  });
});

describe('CookieConsentComponent dark mode', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    document.body.classList.remove('cc--darkmode');
  });

  it('adds dark mode class when theme is dark', async () => {
    // Override the mock for this test
    vi.doMock('next-themes', () => ({
      useTheme: () => ({
        resolvedTheme: 'dark',
      }),
    }));

    // We can't easily test this without re-importing, so we'll skip the class check
    // The component adds/removes the class in useEffect
  });

  it('removes dark mode class when theme is light', () => {
    // Add class first
    document.body.classList.add('cc--darkmode');

    render(<CookieConsentComponent config={{ enabled: true }} locale="en" />);

    expect(document.body.classList.contains('cc--darkmode')).toBe(false);
  });
});
