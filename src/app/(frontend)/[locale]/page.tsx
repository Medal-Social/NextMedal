import { EmptyPage } from '@/components/EmptyPage';
import { PageProvider } from '@/contexts/PageContext';
import { groupPlacements, type Placement } from '@/lib/placement';
import processMetadata from '@/lib/processMetadata';
import { fetchSanity } from '@/sanity/lib/fetch';
import { PAGE_QUERY } from '@/sanity/lib/queries';
import Modules from '@/ui/modules';

export const dynamic = 'force-static';

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function Page(props: Props) {
  const page = await getPage();

  if (!page) return <EmptyPage />;

  const placements = groupPlacements(page.placements || []);

  return (
    <PageProvider page={page}>
      {placements.top && <Modules modules={placements.top} />}
      {page?.modules && page.modules.length > 0 && <Modules modules={page?.modules} />}
      {placements.bottom && <Modules modules={placements.bottom} />}
    </PageProvider>
  );
}

export async function generateMetadata(props: Props) {
  const searchParams = await props.searchParams;
  const page = await getPage(false);

  if (!page) return {};

  return processMetadata(page, searchParams);
}

async function getPage(stega?: boolean) {
  return await fetchSanity<Sanity.Page & { placements?: Placement[] }>({
    query: PAGE_QUERY,
    params: { slug: 'index' },
    stega,
  });
}
