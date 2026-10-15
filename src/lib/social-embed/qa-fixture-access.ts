/**
 * Access control for `/qa/social-embeds` (and other QA fixture paths).
 *
 * Available when the deploy is non-production (development / staging / preview),
 * or when `ALLOW_QA_SOCIAL_EMBEDS` is explicitly set. Production must 404 unless
 * that flag is on (emergency / one-off audits only — still no canonical/sitemap).
 */

export const QA_SOCIAL_EMBEDS_PATH = '/qa/social-embeds';

/** Paths that must never appear in the public sitemap. */
export const QA_FIXTURE_SITEMAP_DENYLIST = [QA_SOCIAL_EMBEDS_PATH] as const;

function isTruthyFlag(value: string | null | undefined): boolean {
  if (!value) return false;
  const normalized = value.trim().toLowerCase();
  return normalized === '1' || normalized === 'true' || normalized === 'yes' || normalized === 'on';
}

export function isAppProductionEnv(
  appEnv: string | null | undefined,
  vercelEnv: string | null | undefined
): boolean {
  return appEnv === 'production' || vercelEnv === 'production';
}

/**
 * Whether the social-embed QA fixture may be served.
 * Non-production always allowed; production only with ALLOW_QA_SOCIAL_EMBEDS.
 */
export function isSocialEmbedQaFixtureAllowed(opts: {
  appEnv?: string | null;
  vercelEnv?: string | null;
  qaFlag?: string | null;
}): boolean {
  if (isTruthyFlag(opts.qaFlag)) return true;
  return !isAppProductionEnv(opts.appEnv, opts.vercelEnv);
}

/** True when a pathname is a QA fixture that must stay out of the sitemap. */
export function isQaFixtureSitemapPath(pathname: string): boolean {
  const normalized = pathname.startsWith('http')
    ? (() => {
        try {
          return new URL(pathname).pathname;
        } catch {
          return pathname;
        }
      })()
    : pathname;

  const path = normalized.replace(/\/+$/, '') || '/';
  // Locale prefixes: /nb/qa/social-embeds, /ar/qa/social-embeds
  return QA_FIXTURE_SITEMAP_DENYLIST.some((denied) => path === denied || path.endsWith(denied));
}
