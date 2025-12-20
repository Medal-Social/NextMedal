'use client';

import type * as React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SchemaVisualizer } from './SchemaVisualizer';
import { OpenInV0Button } from './OpenInV0Button';

interface ComponentPreviewProps {
  moduleType: string;
  schemaCode: string;
  schemaHtml?: string;
  schemaObject?: any;
  children: React.ReactNode;
  hasRegistry?: boolean;
}

export function ComponentPreview({
  moduleType,
  schemaCode,
  schemaHtml,
  schemaObject,
  children,
  hasRegistry = false,
}: ComponentPreviewProps) {
  return (
    <Tabs defaultValue="preview" className="w-full">
      <div className="flex items-center justify-between px-4 py-2 border-b bg-muted/40">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center rounded-full border bg-muted px-2.5 py-0.5 text-xs font-semibold text-muted-foreground shadow-sm">
            {moduleType}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {hasRegistry && <OpenInV0Button name={moduleType} />}
          <TabsList>
            <TabsTrigger value="preview">Preview</TabsTrigger>
            <TabsTrigger value="structure">Structure</TabsTrigger>
            <TabsTrigger value="schema">Code</TabsTrigger>
          </TabsList>
        </div>
      </div>

      <TabsContent value="preview" className="mt-0">
        <div className="relative border-b border-border/40">{children}</div>
      </TabsContent>

      <TabsContent value="structure" className="mt-0">
        <div className="p-4 bg-background">
          {schemaObject ? (
            <SchemaVisualizer schema={schemaObject} />
          ) : (
            <div className="text-muted-foreground p-4">Structure definition not available</div>
          )}
        </div>
      </TabsContent>

      <TabsContent value="schema" className="mt-0">
        <div className="p-4 bg-muted/30 overflow-x-auto">
          {schemaHtml ? (
            <div
              className="text-sm font-mono p-4 rounded-lg bg-card border text-card-foreground [&>pre]:!bg-transparent [&>pre]:p-0"
              dangerouslySetInnerHTML={{ __html: schemaHtml }}
            />
          ) : (
            <pre className="text-sm font-mono p-4 rounded-lg bg-card border text-card-foreground">
              <code>{schemaCode}</code>
            </pre>
          )}
        </div>
      </TabsContent>
    </Tabs>
  );
}
