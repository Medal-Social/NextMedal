import { LayoutTemplate } from 'lucide-react';
import { groq } from 'next-sanity';
import { Button } from '@/components/ui/button';
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty';
import { Section } from '@/components/ui/section';
import { PageProvider } from '@/contexts/PageContext';
import { groupPlacements, type Placement } from '@/lib/placement';
import processMetadata from '@/lib/processMetadata';
import { fetchSanity } from '@/sanity/lib/fetch';
import { MODULES_QUERY, placementQuery, TRANSLATIONS_QUERY } from '@/sanity/lib/queries';
import Modules from '@/ui/modules';

export const dynamic = 'force-static';

export default async function Page() {
  const page = await getPage();

  if (!page)
    return (
      <Section className="min-h-[50vh] flex items-center justify-center">
        <Empty className="border-none max-w-lg mx-auto">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <LayoutTemplate />
            </EmptyMedia>
            <EmptyTitle>No Index Page Found</EmptyTitle>
            <EmptyDescription>
              There's no place like... index?
              <br className="mb-2" />
              Add a new Page document in your Medal Social Studio with the slug "index".
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button
              nativeButton={false}
              render={
                <a href="https://www.medalsocial.com" target="_blank" rel="noopener noreferrer">
                  Visit Medal Social
                </a>
              }
              variant="outline"
            />
          </EmptyContent>
        </Empty>
      </Section>
    );

  const placements = groupPlacements(page.placements || []);

  return (
    <PageProvider page={page}>
      {placements.top && <Modules modules={placements.top} />}
      {page?.modules && page.modules.length > 0 && <Modules modules={page?.modules} />}
      {placements.bottom && <Modules modules={placements.bottom} />}
    </PageProvider>
  );
}

export async function generateMetadata() {
  const page = await getPage(false);
  if (!page) return {};
  return processMetadata(page);
}

async function getPage(stega?: boolean) {
  const page = await fetchSanity<Sanity.Page & { placements?: Placement[] }>({
    query: groq`*[_type == 'page' && metadata.slug.current == 'index'][0]{
			...,
			'modules': modules[]{ ${MODULES_QUERY} },
			'placements': ${placementQuery("scope == 'page'")},
			metadata {
				...,
				'ogimage': image.asset->url + '?w=1200',
			},
			${TRANSLATIONS_QUERY}
		}`,
    stega,
  });

  return page;
}
