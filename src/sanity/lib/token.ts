export const token = process.env.SANITY_API_READ_TOKEN;

const isBuildTime = process.env.NEXT_PHASE === 'phase-production-build';

if (!token && !isBuildTime) {
  throw new Error('Missing SANITY_API_READ_TOKEN environment variable');
}
