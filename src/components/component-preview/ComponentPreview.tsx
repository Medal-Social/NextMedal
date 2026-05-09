'use client';

import { ArrowRight, Copy, MoreHorizontal } from 'lucide-react';
import type * as React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import SanityCopyButton from './SanityCopyButton';

interface ComponentPreviewProps {
  moduleType: string;
  componentData?: Record<string, unknown>;
  children: React.ReactNode;
}

export function ComponentPreview({ moduleType, componentData, children }: ComponentPreviewProps) {
  // Prepare raw data for the copy button (stripping keys used for frontend rendering)
  const getRawData = () => {
    if (!componentData) {
      return null;
    }
    return JSON.parse(
      JSON.stringify(componentData, (key, value) => {
        if (['src', 'width', 'height', 'alt', 'sanityData'].includes(key)) {
          return undefined;
        }
        return value;
      })
    );
  };

  return (
    <Tabs defaultValue="preview" className="w-full">
      <div className="flex h-14 items-center justify-between border-b bg-background px-4">
        <div className="flex items-center gap-2">
          <span className="px-2 font-medium text-muted-foreground text-sm">{moduleType}</span>
        </div>
        <div className="flex items-center">
          <TabsList variant="line">
            <TabsTrigger value="preview">Preview</TabsTrigger>
            {componentData && <TabsTrigger value="json">Copy to Studio</TabsTrigger>}
          </TabsList>
        </div>
      </div>

      <TabsContent value="preview" className="mt-0">
        <div className="relative border-border/40 border-b">{children}</div>
      </TabsContent>

      {componentData && (
        <TabsContent value="json" className="mt-0">
          <div className="group relative bg-muted/30 p-8">
            <div className="mx-auto max-w-2xl space-y-8">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-lg">Ready to use in Sanity Studio</h3>
                  <p className="mt-1 text-muted-foreground text-sm">
                    Copy this component and paste it directly into your content.
                  </p>
                </div>
                <SanityCopyButton
                  data={getRawData()}
                  className="h-10 rounded-md bg-primary px-4 text-primary-foreground shadow-sm hover:bg-primary/90 hover:text-primary-foreground"
                />
              </div>

              <div className="grid gap-6 md:grid-cols-3">
                <div className="flex flex-col gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full border bg-background text-muted-foreground shadow-sm">
                    <Copy className="h-5 w-5" />
                  </div>
                  <div>
                    <span className="font-semibold text-muted-foreground text-xs uppercase tracking-wider">
                      Step 1
                    </span>
                    <p className="mt-1 font-medium text-sm">Click the Copy button</p>
                  </div>
                </div>

                <div className="relative flex flex-col gap-3">
                  <div className="absolute top-5 -left-1/2 -z-10 hidden h-[1px] w-full bg-border/50 md:block" />
                  <div className="flex h-10 w-10 items-center justify-center rounded-full border bg-background text-muted-foreground shadow-sm">
                    <ArrowRight className="h-5 w-5" />
                  </div>
                  <div>
                    <span className="font-semibold text-muted-foreground text-xs uppercase tracking-wider">
                      Step 2
                    </span>
                    <p className="mt-1 font-medium text-sm">Navigate to Page Content</p>
                  </div>
                </div>

                <div className="relative flex flex-col gap-3">
                  <div className="absolute top-5 -left-1/2 -z-10 hidden h-[1px] w-full bg-border/50 md:block" />
                  <div className="flex h-10 w-10 items-center justify-center rounded-full border bg-background text-muted-foreground shadow-sm">
                    <MoreHorizontal className="h-5 w-5" />
                  </div>
                  <div>
                    <span className="font-semibold text-muted-foreground text-xs uppercase tracking-wider">
                      Step 3
                    </span>
                    <p className="mt-1 font-medium text-sm">Paste into Page Content</p>
                    <p className="mt-1 text-muted-foreground text-xs">
                      Click the three dots (...) and select Paste Field
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
      )}
    </Tabs>
  );
}
