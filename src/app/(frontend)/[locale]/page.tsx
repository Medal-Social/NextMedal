import { redirect } from 'next/navigation';
import { Modules } from '@/components/blocks/modules';
import { EmptyPage } from '@/components/EmptyPage';
import { PageProvider } from '@/contexts';
import { DEFAULT_LOCALE } from '@/i18n/config';
import { hasIndexInDefaultLocale } from '@/lib/sanity/page-fallback';
import { groupPlacements, type Placement } from '@/lib/sanity/placement';
import processMetadata from '@/lib/sanity/process-metadata';
import { fetchSanity } from '@/sanity/lib/fetch';
import { PAGE_QUERY } from '@/sanity/lib/queries';

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function Page(props: Props) {
  const { locale } = await props.params;
  const page = await getPage(locale);

  if (!page) {
    // Only show EmptyPage for default locale (en)
    if (locale === DEFAULT_LOCALE) {
      return <EmptyPage />;
    }

    // For non-default locales (nb, ar), check if default has index
    const hasDefaultIndex = await hasIndexInDefaultLocale();

    if (hasDefaultIndex) {
      // Redirect to English homepage (no prefix due to localePrefix: 'as-needed')
      redirect('/');
    }

    // No index exists anywhere - show EmptyPage
    return <EmptyPage />;
  }

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
  const { locale } = await props.params;
  const searchParams = await props.searchParams;
  const page = await getPage(locale, false);

  if (!page) return {};

  return processMetadata(page, searchParams);
}

async function getPage(locale: string, stega?: boolean) {
  return await fetchSanity<Sanity.Page & { placements?: Placement[] }>({
    query: PAGE_QUERY,
    params: { slug: 'index', locale },
    stega,
  });
}
