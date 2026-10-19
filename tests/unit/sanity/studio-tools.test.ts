import { describe, expect, it } from 'vitest';
import { isAdministrator, orderStudioTools } from '@/sanity/studio-tools';

const tool = (name: string, title = name) => ({ name, title }) as never;
const all = [tool('vision'), tool('media'), tool('editor'), tool('structure')];
const user = (...roles: string[]) => ({ roles: roles.map((name) => ({ name, title: name })) });

describe('Studio tools', () => {
  it('orders the editor tools and shows Vision to an administrator', () => {
    const tools = orderStudioTools(all, { currentUser: user('administrator') } as never);
    expect(tools.map((t) => t.name)).toEqual(['structure', 'editor', 'media', 'vision']);
  });

  it.each([
    ['an editor', user('editor')],
    ['a viewer', user('viewer')],
    ['nobody signed in', null],
  ])('hides Vision from %s', (_, currentUser) => {
    const tools = orderStudioTools(all, { currentUser } as never);
    expect(tools.map((t) => t.name)).toEqual(['structure', 'editor', 'media']);
  });

  it('keeps the Mux videos tool after media when a fork turns Mux on', () => {
    const tools = orderStudioTools([...all, tool('mux', 'Videos')], {
      currentUser: user('editor'),
    } as never);
    expect(tools.map((t) => t.name)).toEqual(['structure', 'editor', 'media', 'mux']);
  });

  it('knows an administrator by role name', () => {
    expect(isAdministrator(user('editor', 'administrator') as never)).toBe(true);
    expect(isAdministrator(user('editor') as never)).toBe(false);
    expect(isAdministrator(undefined)).toBe(false);
  });

  it('fails closed for a user without roles', () => {
    expect(isAdministrator({} as never)).toBe(false);
  });
});
