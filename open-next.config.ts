import { defineCloudflareConfig } from '@opennextjs/cloudflare';

export default defineCloudflareConfig({
  // Defaults are correct for this setup. An R2 incremental cache / sharded tag
  // cache + queue can be layered on later if ISR revalidation needs it; for now
  // SanityLive drives on-demand revalidation, so the defaults are enough.
});
