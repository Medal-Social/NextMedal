export const token = process.env.NEXT_PUBLIC_SANITY_BROWSER_TOKEN;

const isBuildTime = process.env.NEXT_PHASE === 'phase-production-build';

if (!token && !isBuildTime) {
  throw new Error('Missing NEXT_PUBLIC_SANITY_BROWSER_TOKEN environment variable');
}
