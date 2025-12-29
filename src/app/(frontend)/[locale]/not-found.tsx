import { getLocale } from 'next-intl/server';
import { fetchSanityLive } from '@/sanity/lib/live';
import { PAGE_404_QUERY } from '@/sanity/lib/queries';
import { NotFoundFallback } from '@/ui/layout';
import { Modules } from '@/ui/modules';

export default async function NotFound() {
  const page = await get404();
  if (!page) return <NotFoundFallback />;
  return <Modules modules={page?.modules || []} />;
}

export async function generateMetadata() {
  return (await get404(false))?.metadata;
}

async function get404(stega?: boolean) {
  const locale = await getLocale();
  return await fetchSanityLive<Sanity.Page>({
    query: PAGE_404_QUERY,
    params: { locale },
    stega,
  });
}
