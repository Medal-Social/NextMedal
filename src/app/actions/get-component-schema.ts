'use server';

import { promises as fs } from 'node:fs';
import path from 'node:path';
import { sanitizeSchema, schemaMap, schemaObjects } from '@/lib/schema-config';

export async function getComponentSchema(type: string) {
  const filename = schemaMap[type];
  if (!filename) {
    return {
      code: '// Schema definition not found',
      object: null,
    };
  }

  try {
    let filePath = path.join(process.cwd(), 'src/sanity/schemaTypes/modules', filename);

    // Check if file exists, if not try .tsx if .ts was requested or vice versa
    try {
      await fs.access(filePath);
    } catch {
      if (filename.endsWith('.ts')) {
        const altPath = filePath.replace(/\.ts$/, '.tsx');
        try {
          await fs.access(altPath);
          filePath = altPath;
        } catch {
          // Keep original path to throw error later
        }
      } else if (filename.endsWith('.tsx')) {
        const altPath = filePath.replace(/\.tsx$/, '.ts');
        try {
          await fs.access(altPath);
          filePath = altPath;
        } catch {
          // Keep original path
        }
      }
    }

    const content = await fs.readFile(filePath, 'utf-8');

    return {
      code: content,
      object: sanitizeSchema(schemaObjects[type]),
    };
  } catch (error) {
    console.error(`Error loading schema for ${type}:`, error);
    return {
      code: `// Error loading schema: ${filename}`,
      object: null,
    };
  }
}
