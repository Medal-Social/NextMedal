import { Suspense } from 'react';
import Loading from '@/ui/Loading';
import Modules from '@/ui/modules';
import ComponentGalleryClient, { type GalleryComponent } from './ComponentGallery.client';

type GalleryItem = Sanity.Module & {
  _key: string;
};

type Group = {
  _key: string;
  title: string;
  items: GalleryItem[];
};

export default function ComponentGallery({
  intro,
  groups,
}: Partial<{
  intro: any[];
  groups: Group[];
}>) {
  if (!groups?.length) return null;

  // Helper to extract title from portable text content
  const getContentTitle = (content: any) => {
    if (!content || !Array.isArray(content)) return null;
    // Try to find a heading
    const heading = content.find(
      (block: any) => block._type === 'block' && ['h1', 'h2', 'h3'].includes(block.style)
    );
    if (heading?.children?.[0]?.text) return heading.children[0].text;

    // Fallback to first text block
    const firstBlock = content.find((block: any) => block._type === 'block');
    return firstBlock?.children?.[0]?.text;
  };

  // Flatten groups into a single list of components with category info
  const components: GalleryComponent[] =
    groups?.flatMap(
      (group) =>
        group.items?.map((item) => {
          // item IS the module now

          // Infer title/name from module data
          const title =
            // @ts-expect-error - dynamic access
            item.title ||
            // @ts-expect-error - dynamic access
            item.summary ||
            // @ts-expect-error - dynamic access
            getContentTitle(item.content) ||
            item._type;

          return {
            id: item._key,
            name: title || 'Untitled',
            // @ts-expect-error - dynamic access
            description: item.description || item.subtitle || '',
            category: group.title,
            moduleType: item._type,
            children: <Modules modules={[item]} />,
          };
        }) || []
    ) || [];

  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <Loading />
        </div>
      }
    >
      <ComponentGalleryClient intro={intro} components={components} />
    </Suspense>
  );
}
