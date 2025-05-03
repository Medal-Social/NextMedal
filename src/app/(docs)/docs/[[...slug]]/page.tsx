import { source } from '@/lib/source';
import { DocsBody, DocsDescription, DocsPage, DocsTitle } from 'fumadocs-ui/page';
import { notFound } from 'next/navigation';
import { getMDXComponents } from '@/mdx-components';

const Page = async ({ params }: Props) => {
  const page = await getPage(await params);
  if (!page) notFound();

  const MDX = page.data.body;

  return (
    <DocsPage
      toc={page.data.toc}
      full={page.data.full}
      editOnGithub={{
        owner: 'Medal-Social',
        repo: 'NextMedal',
        sha: 'dev',
        path: `content/docs/${(await params).slug?.join('/') || 'index'}.mdx`,
      }}
    >
      <DocsTitle>{page.data.title}</DocsTitle>
      {page.data.description && <DocsDescription>{page.data.description}</DocsDescription>}
      <DocsBody>
        <MDX components={getMDXComponents()} />
      </DocsBody>
    </DocsPage>
  );
};

export async function generateStaticParams() {
  return source.generateParams();
}

export async function generateMetadata({ params }: Props) {
  const page = await getPage(await params);
  if (!page) notFound();

  return {
    title: page.data.title,
    description: page.data.description,
  };
}

async function getPage(params: { slug?: string[] }) {
  const page = source.getPage(params.slug);
  if (!page) notFound();
  return page;
}

type Props = {
  params: Promise<{ slug?: string[] }>;
};

export default Page;
