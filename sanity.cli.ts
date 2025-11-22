import { defineCliConfig } from 'sanity/cli';
import { dataset, projectId } from '@/sanity/lib/env';

export default defineCliConfig({
  api: {
    projectId,
    dataset,
  },
});
