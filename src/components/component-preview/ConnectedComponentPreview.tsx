'use client';

import { useEffect, useState } from 'react';
import { getComponentSchema } from '@/app/actions/get-component-schema';
import { ComponentPreview } from './ComponentPreview';

interface ConnectedComponentPreviewProps {
  moduleType: string;
  children: React.ReactNode;
}

export function ConnectedComponentPreview({
  moduleType,
  children,
}: ConnectedComponentPreviewProps) {
  const [schemaData, setSchemaData] = useState<{
    code: string;
    html: string;
    object: any;
  } | null>(null);

  useEffect(() => {
    let mounted = true;

    async function fetchData() {
      try {
        const data = await getComponentSchema(moduleType);
        if (mounted) {
          console.log(`Schema data for ${moduleType}:`, data);
          setSchemaData(data);
        }
      } catch (error) {
        console.error('Failed to fetch schema data', error);
      }
    }

    fetchData();

    return () => {
      mounted = false;
    };
  }, [moduleType]);

  return (
    <ComponentPreview
      moduleType={moduleType}
      schemaCode={schemaData?.code || 'Loading schema...'}
      schemaHtml={schemaData?.html}
      schemaObject={schemaData?.object}
      hasRegistry={true}
    >
      {children}
    </ComponentPreview>
  );
}
