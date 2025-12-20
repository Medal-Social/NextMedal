import { FileQuestion } from 'lucide-react';
import Link from 'next/link';
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
import { fetchSanityLive } from '@/sanity/lib/fetch';
import { MODULES_QUERY } from '@/sanity/lib/queries';
import Modules from '@/ui/modules';

export default async function NotFound() {
  const page = await get404();
  if (!page)
    return (
      <Section className="min-h-[50vh] flex items-center justify-center">
        <Empty className="border-none max-w-md mx-auto">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <FileQuestion />
            </EmptyMedia>
            <EmptyTitle>Page not found</EmptyTitle>
            <EmptyDescription>
              Sorry, we couldn't find the page you're looking for. It might have been removed,
              deleted, or possibly never existed.
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button asChild>
              <Link href="/">Go to Homepage</Link>
            </Button>
          </EmptyContent>
        </Empty>
      </Section>
    );
  return <Modules modules={page?.modules || []} />;
}

export async function generateMetadata() {
  return (await get404())?.metadata;
}

async function get404() {
  return await fetchSanityLive<Sanity.Page>({
    query: groq`*[_type == 'page' && metadata.slug.current == '404'][0]{
			...,
			modules[]{ ${MODULES_QUERY} }
		}`,
  });
}
