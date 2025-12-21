'use client';

import type * as React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import SanityCopyButton from './SanityCopyButton';
import { SchemaVisualizer } from './SchemaVisualizer';
import ClipboardInspector from './ClipboardInspector';

interface ComponentPreviewProps {
  moduleType: string;
  schemaObject?: any;
  componentData?: any;
  children: React.ReactNode;
  hasRegistry?: boolean;
}

export function ComponentPreview({
  moduleType,
  schemaObject,
  componentData,
  children,
}: ComponentPreviewProps) {
  const jsonString = componentData
    ? JSON.stringify(
        componentData,
        (key, value) => {
          // Remove keys that are not part of the Sanity data structure but used for frontend rendering
          if (['src', 'width', 'height', 'alt', 'schemaCode', 'schemaHtml', 'schemaObject'].includes(key)) {
            return undefined;
          }
          return value;
        },
        2
      )
    : '';
    
  // Prepare raw data for the copy button (stripping the same keys but keeping it as object)
  const getRawData = () => {
    if (!componentData) return null;
    return JSON.parse(JSON.stringify(componentData, (key, value) => {
       if (['src', 'width', 'height', 'alt', 'schemaCode', 'schemaHtml', 'schemaObject'].includes(key)) {
            return undefined;
          }
          return value;
    }));
  };

  return (
    <Tabs defaultValue="preview" className="w-full">
      <div className="flex items-center justify-between px-4 py-2 border-b bg-muted/40">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center rounded-full border bg-muted px-2.5 py-0.5 text-xs font-semibold text-muted-foreground shadow-sm">
            {moduleType}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <TabsList>
            <TabsTrigger value="preview">Preview</TabsTrigger>
            {componentData && <TabsTrigger value="json">Sanity Data</TabsTrigger>}
            <TabsTrigger value="structure">Structure</TabsTrigger>
          </TabsList>
        </div>
      </div>

      <TabsContent value="preview" className="mt-0">
        <div className="relative border-b border-border/40">{children}</div>
      </TabsContent>

      {componentData && (
        <TabsContent value="json" className="mt-0">
          <div className="relative group">
            <div className="absolute right-4 top-4 z-10">
              <SanityCopyButton
                data={getRawData()}
                className="text-muted-foreground hover:bg-muted hover:text-foreground"
              />
            </div>
            <div className="p-4 bg-muted/30 overflow-x-auto">
              <pre className="text-sm font-mono p-4 rounded-lg bg-card border text-card-foreground">
                <code>{jsonString}</code>
              </pre>
            </div>
          </div>
        </TabsContent>
      )}

      <TabsContent value="structure" className="mt-0">
        <div className="p-4 bg-background">
          {schemaObject ? (
            <SchemaVisualizer schema={schemaObject} />
          ) : (
            <div className="text-muted-foreground p-4">Structure definition not available</div>
          )}
        </div>
      </TabsContent>
    </Tabs>
  );
}
