import { createClient } from 'next-sanity';
import { dev } from '@/lib/env';
import { apiVersion, dataset, projectId } from '@/sanity/lib/env';

export const client = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: !dev,
  stega: {
    studioUrl: '/studio',
  },
});
