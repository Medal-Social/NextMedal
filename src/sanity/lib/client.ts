import { createClient, createDataAttribute } from 'next-sanity';
import { dev, env } from '@/lib/core/env';
import { apiVersion, dataset, projectId } from '@/sanity/lib/env';

/** Studio base path for visual editing */
export const studioBasePath = '/studio';

/**
 * Create data attribute for Sanity visual editing.
 * Pre-configured with the studio base path.
 */
export function createStegaAttribute(config: { id: string; type: string; path?: string }) {
  return createDataAttribute({
    ...config,
    baseUrl: studioBasePath,
  });
}

export const client = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: !dev,
  stega: {
    enabled: true,
    studioUrl: studioBasePath,
  },
});

/**
 * Write client for server-side mutations (creating leads, etc.)
 * Only available server-side - requires SANITY_WRITE_TOKEN env var
 */
export const writeClient = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: false,
  token: env.SANITY_WRITE_TOKEN,
});
