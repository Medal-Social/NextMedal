import 'server-only';

/**
 * Server-only Sanity Viewer token (`SANITY_API_READ_TOKEN`).
 * Draft mode and server reads use this value. Bracket access keeps Next.js
 * from inlining it into a client or server bundle.
 */
function readSanityApiReadToken(): string | undefined {
  // biome-ignore lint/complexity/useLiteralKeys: a literal key is inlined into the bundle
  const raw = process.env['SANITY_API_READ_TOKEN'];
  if (typeof raw !== 'string') return undefined;
  const value = raw.trim();
  return value.length > 0 ? value : undefined;
}

export const token = readSanityApiReadToken();

const isBuildTime = process.env.NEXT_PHASE === 'phase-production-build';

if (!token && !isBuildTime) {
  throw new Error('Missing SANITY_API_READ_TOKEN environment variable');
}
