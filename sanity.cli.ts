import { dataset, projectId } from '@/sanity/lib/env';
import { defineCliConfig } from 'sanity/cli';

export default defineCliConfig({
  api: {
    projectId,
    dataset,
  },
});
