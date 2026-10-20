import { defineCliConfig } from 'sanity/cli';
import { dataset, projectId } from '@/sanity/lib/env';
import { studioDeployment } from '@/sanity/lib/studio-deployment';

export default defineCliConfig({
  api: {
    projectId,
    dataset,
  },
  deployment: studioDeployment(projectId),
});
