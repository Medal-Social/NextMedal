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
      <div className="flex items-center justify-between px-4 h-14 border-b bg-background">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-muted-foreground px-2">{moduleType}</span>
        </div>
        <div className="flex items-center">
          <TabsList variant="line">
            <TabsTrigger value="preview">Preview</TabsTrigger>
            {componentData && <TabsTrigger value="json">Copy to Studio</TabsTrigger>}
          </TabsList>
        </div>
      </div>

      <TabsContent value="preview" className="mt-0">
        <div className="relative border-b border-border/40">{children}</div>
      </TabsContent>

      {componentData && (
        <TabsContent value="json" className="mt-0">
          <div className="relative group bg-muted/30 p-8">
            <div className="max-w-2xl mx-auto space-y-8">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">Ready to use in Sanity Studio</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Copy this component and paste it directly into your content.
                  </p>
                </div>
                <SanityCopyButton
                  data={getRawData()}
                  className="bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground shadow-sm h-10 px-4 rounded-md"
                />
              </div>

              <div className="grid gap-6 md:grid-cols-3">
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-background border shadow-sm text-muted-foreground">
                    <Copy className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Step 1
                    </span>
                    <p className="font-medium text-sm mt-1">Click the Copy button</p>
                  </div>
                </div>

                <div className="flex flex-col gap-3 relative">
                  <div className="hidden md:block absolute top-5 -left-1/2 w-full h-[1px] bg-border/50 -z-10" />
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-background border shadow-sm text-muted-foreground">
                    <ArrowRight className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Step 2
                    </span>
                    <p className="font-medium text-sm mt-1">Navigate to Page Content</p>
                  </div>
                </div>

                <div className="flex flex-col gap-3 relative">
                  <div className="hidden md:block absolute top-5 -left-1/2 w-full h-[1px] bg-border/50 -z-10" />
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-background border shadow-sm text-muted-foreground">
                    <MoreHorizontal className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Step 3
                    </span>
                    <p className="font-medium text-sm mt-1">Paste into Page Content</p>
                    <p className="text-xs text-muted-foreground mt-1">
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
