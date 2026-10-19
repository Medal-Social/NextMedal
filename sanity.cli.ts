import { defineCliConfig } from 'sanity/cli';
import { dataset, projectId } from '@/sanity/lib/env';

export default defineCliConfig({
  api: {
    projectId,
    dataset,
  },
  // Hosted Studio https://nextmedal.sanity.studio: `sanity deploy` reuses this app.
  deployment: { appId: 'jouu0fkhamrp3bb4jrv5u43z' },
});
