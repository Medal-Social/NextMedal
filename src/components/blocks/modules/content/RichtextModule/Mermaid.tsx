'use client';

import DOMPurify from 'isomorphic-dompurify';
import { useEffect, useRef, useState } from 'react';
import { logger } from '@/lib/core/logger';

interface MermaidProps {
  value: {
    code: string;
    language: 'mermaid';
  };
}

export function Mermaid({ value }: MermaidProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [isRendered, setIsRendered] = useState(false);

  useEffect(() => {
    let isMounted = true;

    // biome-ignore lint/complexity/noExcessiveCognitiveComplexity: Mermaid rendering requires complex error handling and state management
    async function renderMermaid() {
      if (!value?.code || !containerRef.current) return;

      try {
        // Dynamically import mermaid to avoid SSR issues
        const mermaid = (await import('mermaid')).default;

        // Initialize mermaid with configuration
        mermaid.initialize({
          startOnLoad: false,
          theme: 'dark',
          securityLevel: 'strict',
          fontFamily: 'var(--font-sans)',
        });

        // Clear container
        if (containerRef.current) {
          containerRef.current.innerHTML = '';
        }

        // Generate unique ID for this diagram
        const id = `mermaid-${Math.random().toString(36).substr(2, 9)}`;

        // Render the diagram
        const { svg } = await mermaid.render(id, value.code);

        // Sanitize SVG output before inserting
        const sanitizedSvg = DOMPurify.sanitize(svg, {
          USE_PROFILES: { svg: true, svgFilters: true },
        });

        // Insert sanitized SVG if component is still mounted
        if (isMounted && containerRef.current) {
          containerRef.current.innerHTML = sanitizedSvg;
          setIsRendered(true);
        }
      } catch (err) {
        logger.error({ err }, 'Mermaid diagram rendering failed');
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Failed to render diagram');
        }
      }
    }

    renderMermaid();

    return () => {
      isMounted = false;
    };
  }, [value.code]);

  if (error) {
    return (
      <div className="my-6 rounded-lg border border-red-700 bg-red-950/20 p-4">
        <div className="mb-2 font-medium text-red-400">Mermaid Diagram Error</div>
        <div className="text-sm text-red-300">{error}</div>
        <details className="mt-3">
          <summary className="cursor-pointer text-xs text-red-400 hover:text-red-300">
            Show diagram code
          </summary>
          <pre className="mt-2 overflow-x-auto rounded bg-black/30 p-3 text-xs text-red-200">
            <code>{value.code}</code>
          </pre>
        </details>
      </div>
    );
  }

  return (
    <div className="mermaid-diagram">
      {!isRendered && <div className="animate-pulse text-sm text-zinc-400">Loading diagram...</div>}
      <div ref={containerRef} className={isRendered ? '' : 'hidden'} />
    </div>
  );
}
