import { defineEnableDraftMode } from 'next-sanity/draft-mode';
import { client } from '@/sanity/lib/client';
import { token } from '@/sanity/lib/token';

// The preview secret is checked on the server. The Viewer token stays here.
export const { GET } = defineEnableDraftMode({
  client: client.withConfig({ token }),
});
