import { getTranslations } from 'next-intl/server';
import { Suspense } from 'react';
import { Loading } from '@/components/blocks/objects/core';
import moduleProps from '@/lib/sanity/module-props';
import ComponentGalleryClient from './ComponentGallery.client';

// Helper to extract title from portable text content
interface ContentBlock {
  _type: string;
  style?: string;
  children?: Array<{ text?: string }>;
}

function getContentTitle(content: ContentBlock[] | undefined) {
  if (!content || !Array.isArray(content)) return null;
  // Try to find a heading
  const heading = content.find(
    (block) => block._type === 'block' && ['h1', 'h2', 'h3'].includes(block.style || '')
  );
  if (heading?.children?.[0]?.text) return heading.children[0].text;

  // Fallback to first text block
  const firstBlock = content.find((block) => block._type === 'block');
  return firstBlock?.children?.[0]?.text;
}

// Extended module type for gallery items
interface ExtendedModule extends Sanity.Module {
  title?: string;
  summary?: string;
  content?: ContentBlock[];
  description?: string;
  subtitle?: string;
}

export interface GalleryComponentData {
  id: string;
  name: string;
  description: string;
  category: string;
  moduleType: string;
  moduleData: Sanity.Module;
}

export default async function ComponentGallery({
  intro,
  groups,
  ...props
}: Sanity.ComponentGallery) {
  if (!groups?.length) return null;

  const t = await getTranslations('common');

  // Flatten groups into component data (no React elements - client will render)
  const components: GalleryComponentData[] =
    groups?.flatMap(
      (group) =>
        group.items?.map((item) => {
          const extItem = item as ExtendedModule;
          const title =
            extItem.title || extItem.summary || getContentTitle(extItem.content) || item._type;

          return {
            id: item._key,
            name: title || t('untitled'),
            description: extItem.description || extItem.subtitle || '',
            category: group.title,
            moduleType: item._type,
            moduleData: item,
          };
        }) || []
    ) || [];

  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <Loading>{t('loading')}</Loading>
        </div>
      }
    >
      <ComponentGalleryClient intro={intro} components={components} {...moduleProps(props)} />
    </Suspense>
  );
}
