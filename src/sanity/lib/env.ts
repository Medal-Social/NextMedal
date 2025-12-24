import { env } from '../../lib/env';
import {
  apiVersion as projectApiVersion,
  dataset as projectDataset,
  projectId as projectProjectId,
} from './project';

export const apiVersion = env.NEXT_PUBLIC_SANITY_API_VERSION || projectApiVersion;
export const dataset = env.NEXT_PUBLIC_SANITY_DATASET || projectDataset;
export const projectId = env.NEXT_PUBLIC_SANITY_PROJECT_ID || projectProjectId;
