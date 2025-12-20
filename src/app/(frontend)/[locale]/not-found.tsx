import { groq } from 'next-sanity';
import { fetchSanityLive } from '@/sanity/lib/fetch';
import { MODULES_QUERY } from '@/sanity/lib/queries';
import { Section } from '@/components/ui/section';
import Modules from '@/ui/modules';

export default async function NotFound() {
  const page = await get404();
  if (!page)
    return (
      <Section className="text-center text-5xl" as="h1">
        404
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
