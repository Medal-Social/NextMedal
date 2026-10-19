/** Hosted Studio app per Sanity project (`sanity deploy` reuses it). Forks add their own. */
const STUDIO_APP_IDS: Readonly<Record<string, string>> = {
  ekjn2yf6: 'jouu0fkhamrp3bb4jrv5u43z', // https://nextmedal.sanity.studio
};

/** `deployment` for sanity.cli.ts; undefined lets a fork's first deploy create its own app. */
export function studioDeployment(
  project: string,
  override = process.env.SANITY_STUDIO_APP_ID
): { appId: string } | undefined {
  const appId = override || STUDIO_APP_IDS[project];
  return appId ? { appId } : undefined;
}
