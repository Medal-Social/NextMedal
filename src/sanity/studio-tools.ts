import type { ConfigContext, CurrentUser, Tool } from 'sanity';

/** Vision (GROQ playground) and the admin sidebar lists are for administrators only. */
export function isAdministrator(user: Pick<CurrentUser, 'roles'> | null | undefined): boolean {
  return Boolean(user?.roles?.some((role) => role.name === 'administrator'));
}

/**
 * Studio tools in a fixed order: structure, editor, media, Mux videos (only when a
 * fork turns Mux on, see src/sanity/lib/mux.ts), then Vision for administrators.
 */
export function orderStudioTools(
  prev: Tool[],
  { currentUser }: Pick<ConfigContext, 'currentUser'>
) {
  const byName = (name: string) => prev.find((tool) => tool.name === name);
  const muxTool =
    byName('mux') ?? byName('mux-input') ?? prev.find((tool) => /mux/i.test(tool.title ?? ''));
  // Editor is the custom name for presentationTool (see presentation.ts).
  const visionTool = isAdministrator(currentUser) ? byName('vision') : undefined;

  return [byName('structure'), byName('editor'), byName('media'), muxTool, visionTool].filter(
    (tool): tool is Tool => Boolean(tool)
  );
}
