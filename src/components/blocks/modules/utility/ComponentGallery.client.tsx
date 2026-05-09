'use client';

import { Search } from 'lucide-react';
import { PortableText } from 'next-sanity';
import { useQueryState } from 'nuqs';
import { useState } from 'react';
import { ComponentPreview } from '@/components/component-preview/ComponentPreview';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { GalleryModuleRenderer } from '../GalleryModuleRenderer';

export interface GalleryComponent {
  id: string;
  name: string;
  description?: string;
  category: string;
  moduleType: string;
  moduleData: Sanity.Module;
}

export default function ComponentGalleryClient({
  intro,
  components,
}: Partial<{
  intro: Sanity.BlockContent;
  components: GalleryComponent[];
}>) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useQueryState('category');

  if (!components?.length) return null;

  const categories = Array.from(new Set(components.map((comp) => comp.category)));

  const filteredComponents = components.filter((component) => {
    const matchesSearch = component.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || component.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen">
      {intro && (
        <div className="mx-auto max-w-7xl px-4 pt-8 pb-4 sm:px-6 lg:px-8">
          <div className="richtext mx-auto max-w-3xl text-center">
            <PortableText value={intro} />
          </div>
        </div>
      )}

      <div className="sticky top-0 z-40 border-border border-b bg-background/95 backdrop-blur-lg">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-stretch gap-4 sm:flex-row sm:items-center">
            {/* Category Pills - Horizontal Scroll */}
            <div className="scrollbar-hide no-scrollbar flex items-center gap-2 overflow-x-auto pb-1">
              <button
                type="button"
                onClick={() => setSelectedCategory(null)}
                className={`whitespace-nowrap rounded-md px-4 py-2 font-medium text-sm transition-all ${
                  selectedCategory === null
                    ? 'bg-primary/5 text-primary'
                    : 'bg-transparent text-muted-foreground hover:bg-primary/5 hover:text-primary'
                }`}
              >
                All
              </button>
              {categories.map((category) => (
                <button
                  type="button"
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`whitespace-nowrap rounded-md px-4 py-2 font-medium text-sm transition-all ${
                    selectedCategory === category
                      ? 'bg-primary/5 text-primary'
                      : 'bg-transparent text-muted-foreground hover:bg-primary/5 hover:text-primary'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>

            {/* Search */}
            <div className="relative w-full sm:ml-auto sm:w-64">
              <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search components..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
        <div className="space-y-16">
          {filteredComponents.map((item) => (
            <div key={item.id} id={item.id} className="scroll-mt-32">
              <div className="mb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-xl capitalize">
                      {item.name.replace(/-/g, ' ')}
                    </h3>
                    <p className="text-muted-foreground text-sm">{item.category}</p>
                  </div>
                </div>
                {item.description && (
                  <p className="mt-2 max-w-2xl text-muted-foreground text-sm">{item.description}</p>
                )}
              </div>

              <div className="relative overflow-hidden rounded-xl border border-border bg-background shadow-sm ring-1 ring-border/50">
                <ComponentPreview
                  moduleType={item.moduleType}
                  componentData={item.moduleData as unknown as Record<string, unknown>}
                >
                  <div className="pointer-events-none absolute inset-0 bg-checkered opacity-[0.03]" />
                  <div className="relative">
                    <GalleryModuleRenderer module={item.moduleData} />
                  </div>
                </ComponentPreview>
              </div>
            </div>
          ))}
        </div>

        {filteredComponents.length === 0 && (
          <div className="py-16 text-center">
            <p className="text-lg text-muted-foreground">No components found</p>
            <Button
              variant="outline"
              className="mt-4 bg-transparent"
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory(null);
              }}
            >
              Clear Filters
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}
