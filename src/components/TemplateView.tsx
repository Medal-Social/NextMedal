'use client';

import { Copy, Monitor, Smartphone, Tablet } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface TemplateViewProps {
  template: {
    title: string;
    description: string;
    modules: any[];
  };
  children: React.ReactNode;
}

export function TemplateView({ template, children }: TemplateViewProps) {
  const [viewport, setViewport] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');

  const handleCopy = () => {
    const json = JSON.stringify(template.modules, null, 2);
    navigator.clipboard.writeText(json);
    toast.success('Configuration copied to clipboard', {
      description: 'Paste this directly into your Sanity Studio.',
    });
  };

  return (
    <div className="flex flex-col h-full bg-muted/5">
      {/* Header Toolbar */}
      <div className="flex items-center justify-between px-6 py-4 border-b bg-background sticky top-0 z-20">
        <div>
          <h2 className="text-xl font-bold">{template.title}</h2>
          <p className="text-sm text-muted-foreground">{template.description}</p>
        </div>

        <div className="flex items-center gap-4">
          {/* Viewport Toggles */}
          <div className="hidden md:flex items-center bg-muted rounded-lg p-1 border">
            <button
              type="button"
              onClick={() => setViewport('desktop')}
              className={cn(
                'p-2 rounded-md transition-all',
                viewport === 'desktop'
                  ? 'bg-background shadow-sm text-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              )}
              title="Desktop view"
            >
              <Monitor className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => setViewport('tablet')}
              className={cn(
                'p-2 rounded-md transition-all',
                viewport === 'tablet'
                  ? 'bg-background shadow-sm text-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              )}
              title="Tablet view"
            >
              <Tablet className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => setViewport('mobile')}
              className={cn(
                'p-2 rounded-md transition-all',
                viewport === 'mobile'
                  ? 'bg-background shadow-sm text-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              )}
              title="Mobile view"
            >
              <Smartphone className="h-4 w-4" />
            </button>
          </div>

          <div className="h-6 w-px bg-border hidden md:block" />

          <Button onClick={handleCopy} className="gap-2 shadow-sm">
            <Copy className="h-4 w-4" />
            Copy JSON
          </Button>
        </div>
      </div>

      {/* Preview Area */}
      <div className="flex-1 overflow-auto bg-muted/20 p-4 md:p-8 flex justify-center">
        <div
          className={cn(
            'bg-background shadow-xl transition-all duration-300 ease-in-out border origin-top overflow-hidden',
            viewport === 'desktop' && 'w-full max-w-[1400px]',
            viewport === 'tablet' && 'w-[768px]',
            viewport === 'mobile' && 'w-[375px]'
          )}
          style={{ minHeight: 'calc(100vh - 200px)' }}
        >
          <div className="w-full h-full bg-white">{children}</div>
        </div>
      </div>
    </div>
  );
}
