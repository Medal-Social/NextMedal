import { describe, expect, it, vi } from 'vitest';

vi.mock('sanity/structure', () => ({ structureTool: (config: unknown) => config }));

import { contentStructure } from '@/sanity/structure';

type Entry = { kind: string; type?: string; label?: string };

/** A stand-in for Sanity's structure builder that records what the sidebar lists. */
function fakeBuilder() {
  const item = (kind: string, type?: string) => {
    const node: Entry & Record<string, unknown> = { kind, type };
    node.title = (label: string) => Object.assign(node, { label });
    node.icon = () => node;
    node.child = () => node;
    return node;
  };
  const editor = { id: () => editor, schemaType: () => editor, documentId: () => editor };
  return {
    list: () => {
      const list = { title: () => list, items: (items: unknown[]) => ({ items }) };
      return list;
    },
    documentTypeListItem: (type: string) => item('type', type),
    listItem: () => item('item'),
    divider: () => ({ kind: 'divider' }),
    editor: () => editor,
  };
}

const user = (...roles: string[]) => ({ roles: roles.map((name) => ({ name, title: name })) });

function sidebar(currentUser: unknown) {
  const { items } = contentStructure(
    fakeBuilder() as never,
    { currentUser } as never
  ) as unknown as {
    items: Entry[];
  };
  return items;
}

const EDITOR_ITEMS = [
  'Pages',
  'Articles',
  'Docs',
  'Changelog',
  'Events',
  'Newsletter',
  'People',
  'Price plans',
  'Logos',
  'Forms',
  'divider',
  'Site settings',
];

describe('Studio sidebar', () => {
  it.each([
    ['an editor', user('editor')],
    ['nobody signed in', null],
  ])('lists only what editors edit, in plain words, for %s', (_, currentUser) => {
    const items = sidebar(currentUser);
    expect(items.map((entry) => entry.label ?? entry.kind)).toEqual(EDITOR_ITEMS);
    expect(items.filter((entry) => entry.type).map((entry) => entry.type)).toEqual([
      'page',
      'collection.article',
      'collection.documentation',
      'collection.changelog',
      'collection.events',
      'collection.newsletter',
      'person',
      'pricing',
      'logo',
      'form',
    ]);
  });

  it('adds placement rules, redirects and the other settings lists for administrators', () => {
    const items = sidebar(user('administrator'));
    expect(items.map((entry) => entry.label ?? entry.kind)).toEqual([
      ...EDITOR_ITEMS,
      'divider',
      'Placement rules',
      'Redirects',
      'Banners',
      'Article topics',
      'Docs categories',
    ]);
  });

  it('has no form submissions list: submissions go to Medal Social, not the public dataset', () => {
    const items = sidebar(user('administrator'));
    expect(items.map((entry) => entry.label ?? '')).not.toContain('Form submissions');
    expect(items.map((entry) => entry.type)).not.toContain('lead');
  });

  it('has no Content Health folder or other developer views', () => {
    const labels = sidebar(user('administrator')).map((entry) => entry.label ?? '');
    expect(labels.filter((label) => /health|draft|seo|published/i.test(label))).toEqual([]);
  });
});
