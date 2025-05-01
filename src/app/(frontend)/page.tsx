import processMetadata from '@/lib/processMetadata';
import { fetchSanityLive } from '@/sanity/lib/fetch';
import { MODULES_QUERY } from '@/sanity/lib/queries';
import Modules from '@/ui/modules';
import { groq } from 'next-sanity';
export const dynamic = 'force-static';

export default async function Page() {
  const page = await getPage();
  return <Modules modules={page?.modules} />;
}

export async function generateMetadata() {
  const page = await getPage();
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
			}
		}`,
  });

  if (!page)
    throw new Error(
      "Missing homepage: 🏚️ There's no place like... index?\n\n" +
        'Solution: Add a new Page document in your Medal Social Studio with the slug "index".\n\n' +
        '💁‍♂️ https://www.medalsocial.com'
    );

  return page;
}
