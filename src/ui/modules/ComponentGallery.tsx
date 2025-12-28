import { Suspense } from 'react';
import moduleProps from '@/lib/moduleProps';
import Loading from '@/ui/Loading';
import Modules from '@/ui/modules';
import ComponentGalleryClient, { type GalleryComponent } from './ComponentGallery.client';

export default function ComponentGallery({ intro, groups, ...props }: Sanity.ComponentGallery) {
  if (!groups?.length) return null;

  // Helper to extract title from portable text content
  interface ContentBlock {
    _type: string;
    style?: string;
    children?: Array<{ text?: string }>;
  }

  const getContentTitle = (content: ContentBlock[] | undefined) => {
    if (!content || !Array.isArray(content)) return null;
    // Try to find a heading
    const heading = content.find(
      (block) => block._type === 'block' && ['h1', 'h2', 'h3'].includes(block.style || '')
    );
    if (heading?.children?.[0]?.text) return heading.children[0].text;

    // Fallback to first text block
    const firstBlock = content.find((block) => block._type === 'block');
    return firstBlock?.children?.[0]?.text;
  };

  // Extended module type for gallery items
  interface ExtendedModule extends Sanity.Module {
    title?: string;
    summary?: string;
    content?: ContentBlock[];
    description?: string;
    subtitle?: string;
  }

  // Flatten groups into a single list of components with category info
  const components: GalleryComponent[] =
    groups?.flatMap(
      (group) =>
        group.items?.map((item) => {
          // item IS the module now
          const extItem = item as ExtendedModule;

          // Infer title/name from module data
          const title =
            extItem.title || extItem.summary || getContentTitle(extItem.content) || item._type;

          return {
            id: item._key,
            name: title || 'Untitled',
            description: extItem.description || extItem.subtitle || '',
            category: group.title,
            moduleType: item._type,
            componentData: item,
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
      <ComponentGalleryClient intro={intro} components={components} {...moduleProps(props)} />
    </Suspense>
  );
}
