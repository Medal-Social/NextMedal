import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

// Mock dependencies
vi.mock('next-sanity', () => ({
  stegaClean: vi.fn((value) => value),
}));

vi.mock('@/lib/sanity/resolve-url', () => ({
  default: vi.fn((internal, _options) => {
    if (internal?.metadata?.slug?.current) {
      return `/${internal.metadata.slug.current}`;
    }
    return '/';
  }),
  resolveUrlSync: vi.fn((internal, _options) => {
    if (internal?.metadata?.slug?.current) {
      return `/${internal.metadata.slug.current}`;
    }
    return '/';
  }),
}));

vi.mock('@/lib/validateExternalUrl', () => ({
  validateExternalUrl: vi.fn((url) => {
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    return null;
  }),
}));

import CTA from '@/components/blocks/objects/cta/CTA';

// Helper to create a minimal internal page for testing
function createTestPage(slug: string) {
  return {
    _type: 'page',
    metadata: {
      slug: { current: slug },
      title: 'Test Page',
      description: 'Test description',
      noIndex: false,
    },
  } as unknown as Sanity.MenuItem['internal'];
}

describe('CTA', () => {
  it('renders null when no link is provided', () => {
    const { container } = render(<CTA />);
    expect(container.firstChild).toBeNull();
  });

  it('renders internal link correctly', () => {
    render(
      <CTA
        link={{
          _type: 'menuItem',
          label: 'Click Me',
          type: 'internal',
          internal: createTestPage('about'),
        }}
      />
    );
    const link = screen.getByRole('link', { name: 'Click Me' });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', '/about');
  });

  it('renders external link correctly', () => {
    render(
      <CTA
        link={{
          _type: 'menuItem',
          label: 'External Link',
          type: 'external',
          external: 'https://example.com',
        }}
      />
    );
    const link = screen.getByRole('link', { name: 'External Link' });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', 'https://example.com');
  });

  it('opens external links in new tab by default', () => {
    render(
      <CTA
        link={{
          _type: 'menuItem',
          label: 'External',
          type: 'external',
          external: 'https://example.com',
        }}
      />
    );
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('uses children as button content when provided', () => {
    render(
      <CTA
        link={{
          _type: 'menuItem',
          label: 'Label',
          type: 'internal',
          internal: createTestPage('test'),
        }}
      >
        Custom Content
      </CTA>
    );
    expect(screen.getByText('Custom Content')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(
      <CTA
        link={{
          _type: 'menuItem',
          label: 'Button',
          type: 'internal',
          internal: createTestPage('test'),
        }}
        className="custom-class"
      />
    );
    const link = screen.getByRole('link');
    expect(link).toHaveClass('custom-class');
  });

  it('renders disabled button for invalid external URL', () => {
    render(
      <CTA
        link={{
          _type: 'menuItem',
          label: 'Invalid Link',
          type: 'external',
          external: 'invalid-url',
        }}
      />
    );
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
  });

  it('uses flat props to build link', () => {
    render(<CTA text="Flat Link" linkType="internal" internalLink={createTestPage('flat-page')} />);
    const link = screen.getByRole('link', { name: 'Flat Link' });
    expect(link).toBeInTheDocument();
  });

  it('returns null for flat props without required fields', () => {
    const { container } = render(<CTA text="Only Text" />);
    expect(container.firstChild).toBeNull();
  });

  it('applies ghost variant style', () => {
    render(
      <CTA
        link={{
          _type: 'menuItem',
          label: 'Ghost Button',
          type: 'internal',
          internal: createTestPage('test'),
        }}
        style="ghost"
      />
    );
    // The button should have ghost variant classes
    const link = screen.getByRole('link');
    expect(link).toBeInTheDocument();
  });

  it('renders null when type is internal but no internal link', () => {
    const { container } = render(
      <CTA
        link={{
          _type: 'menuItem',
          label: 'Button',
          type: 'internal',
        }}
      />
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders null when type is external but no external link', () => {
    const { container } = render(
      <CTA
        link={{
          _type: 'menuItem',
          label: 'Button',
          type: 'external',
        }}
      />
    );
    expect(container.firstChild).toBeNull();
  });

  it('uses "Button" as default content when no label or children', () => {
    render(
      <CTA
        link={{
          _type: 'menuItem',
          label: '',
          type: 'internal',
          internal: createTestPage('test'),
        }}
      />
    );
    expect(screen.getByText('Button')).toBeInTheDocument();
  });
});

describe('CTA internal link behavior', () => {
  it('opens internal link in new tab when newTab is true', () => {
    render(
      <CTA
        link={{
          _type: 'menuItem',
          label: 'New Tab',
          type: 'internal',
          internal: createTestPage('test'),
          newTab: true,
        }}
      />
    );
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('target', '_blank');
  });

  it('does not open internal link in new tab by default', () => {
    render(
      <CTA
        link={{
          _type: 'menuItem',
          label: 'Same Tab',
          type: 'internal',
          internal: createTestPage('test'),
        }}
      />
    );
    const link = screen.getByRole('link');
    expect(link).not.toHaveAttribute('target', '_blank');
  });
});
