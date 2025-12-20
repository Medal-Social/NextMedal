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
import processMetadata from '@/lib/processMetadata';
import { fetchSanityLive } from '@/sanity/lib/fetch';
import { MODULES_QUERY, TRANSLATIONS_QUERY } from '@/sanity/lib/queries';
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

  return (
    <PageProvider page={page}>
      <Modules modules={page?.modules} />
    </PageProvider>
  );
}

export async function generateMetadata() {
  const page = await getPage();
  if (!page) return {};
  return processMetadata(page);
}

async function getPage() {
  const page = await fetchSanityLive<Sanity.Page>({
    query: groq`*[_type == 'page' && metadata.slug.current == 'index'][0]{
			...,
			'modules': (
				// global modules (before)
				*[_type == 'global-module' && path == '*'].before[]{ ${MODULES_QUERY} }
				// page modules
				+ modules[]{ ${MODULES_QUERY} }
				// global modules (after)
				+ *[_type == 'global-module' && path == '*'].after[]{ ${MODULES_QUERY} }
			),
			metadata {
				...,
				'ogimage': image.asset->url + '?w=1200',
			},
			${TRANSLATIONS_QUERY}
		}`,
  });

  return page;
}
