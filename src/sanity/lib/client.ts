import { createClient, createDataAttribute } from 'next-sanity';
import { dev } from '@/lib/core/env';
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
