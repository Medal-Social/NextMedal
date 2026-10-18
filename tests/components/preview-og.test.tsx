import { fireEvent, render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { beforeEach, expect, it, vi } from 'vitest';
import PreviewOG from '@/sanity/ui/PreviewOG';

const { values } = vi.hoisted(() => ({ values: {} as Record<string, unknown> }));
vi.mock('sanity', () => ({ useFormValue: (path: string[]) => values[path.join('.')] }));
vi.mock('@/sanity/lib/image', () => ({
  urlFor: (image: { asset: { _ref: string } }) => ({
    url: () => `https://cdn.sanity.io/images/project/data/${image.asset._ref}.jpg`,
  }),
}));
vi.mock('@sanity/icons/EyeOpen', () => ({ EyeOpenIcon: () => null }));
vi.mock('@sanity/ui', () => {
  const Container = ({ children }: { children?: ReactNode }) => <div>{children}</div>;
  return {
    Box: Container,
    Card: Container,
    Dialog: Container,
    Flex: Container,
    Stack: Container,
    Text: Container,
    Spinner: () => null,
    Button: ({ title, onClick }: { title: string; onClick: () => void }) => (
      <button type="button" onClick={onClick}>
        {title}
      </button>
    ),
  };
});
beforeEach(() => {
  for (const key of Object.keys(values)) delete values[key];
  values._type = 'page';
  values['metadata.slug.current'] = 'about';
});
function preview() {
  render(<PreviewOG title="About" />);
  fireEvent.click(screen.getByRole('button', { name: 'Preview social sharing image' }));
  return screen.getByAltText('Social sharing preview for About').getAttribute('src');
}
it('previews the SEO upload ahead of the metadata upload', () => {
  values['seo.image'] = { asset: { _ref: 'seo' } };
  values['metadata.image'] = { asset: { _ref: 'metadata' } };
  expect(preview()).toContain('/seo.jpg');
});
it('previews the metadata upload when SEO has none', () => {
  values['metadata.image'] = { asset: { _ref: 'metadata' } };
  expect(preview()).toContain('/metadata.jpg');
});
it('keeps the designed fallback when no upload exists', () => {
  expect(preview()).not.toContain('cdn.sanity.io');
  expect(screen.getByAltText('Social sharing preview for About')).toHaveAttribute(
    'src',
    'https://test.example.com/og-fallback.png'
  );
});
