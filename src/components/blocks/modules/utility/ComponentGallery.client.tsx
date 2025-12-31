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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-4">
          <div className="richtext text-center mx-auto max-w-3xl">
            <PortableText value={intro} />
          </div>
        </div>
      )}

      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-lg border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
            {/* Category Pills - Horizontal Scroll */}
            <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-1 no-scrollbar">
              <button
                type="button"
                onClick={() => setSelectedCategory(null)}
                className={`px-4 py-2 rounded-md text-sm font-medium whitespace-nowrap transition-all ${
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
                  className={`px-4 py-2 rounded-md text-sm font-medium whitespace-nowrap transition-all ${
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
            <div className="relative w-full sm:w-64 sm:ml-auto">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
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
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <div className="space-y-16">
          {filteredComponents.map((item) => (
            <div key={item.id} id={item.id} className="scroll-mt-32">
              <div className="mb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-semibold capitalize">
                      {item.name.replace(/-/g, ' ')}
                    </h3>
                    <p className="text-sm text-muted-foreground">{item.category}</p>
                  </div>
                </div>
                {item.description && (
                  <p className="mt-2 text-sm text-muted-foreground max-w-2xl">{item.description}</p>
                )}
              </div>

              <div className="rounded-xl border border-border bg-background shadow-sm overflow-hidden ring-1 ring-border/50 relative">
                <ComponentPreview
                  moduleType={item.moduleType}
                  componentData={item.moduleData as unknown as Record<string, unknown>}
                >
                  <div className="bg-checkered absolute inset-0 opacity-[0.03] pointer-events-none" />
                  <div className="relative">
                    <GalleryModuleRenderer module={item.moduleData} />
                  </div>
                </ComponentPreview>
              </div>
            </div>
          ))}
        </div>

        {filteredComponents.length === 0 && (
          <div className="text-center py-16">
            <p className="text-muted-foreground text-lg">No components found</p>
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
