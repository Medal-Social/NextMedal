'use server';

import { promises as fs } from 'node:fs';
import path from 'node:path';
import { codeToHtml } from 'shiki';
import { z } from 'zod';
import { sanitizeSchema, schemaMap, schemaObjects } from '@/lib/schema-config';

// Schema validation for inputs
const GetSchemaInput = z
  .string()
  .min(1)
  .regex(/^[a-zA-Z0-9._-]+$/);

export async function getComponentSchema(type: string) {
  // Validate input
  const parseResult = GetSchemaInput.safeParse(type);
  if (!parseResult.success) {
    console.error('Security Warning: Invalid schema type requested:', type);
    return {
      code: '// Error: Invalid schema type',
      html: '',
      object: null,
    };
  }

  const safeType = parseResult.data;
  const filename = schemaMap[safeType];

  if (!filename) {
    return {
      code: '// Schema definition not found',
      html: '',
      object: null,
    };
  }

  // Security check: Ensure filename doesn't contain path traversal characters
  if (filename.includes('..')) {
    console.error('Security Warning: Potential path traversal in schema filename:', filename);
    return {
      code: '// Error: Invalid schema filename',
      html: '',
      object: null,
    };
  }

  try {
    const schemaRoot = path.join(process.cwd(), 'src/sanity/schemaTypes');
    let filePath = path.resolve(schemaRoot, filename);

    // Security check: Ensure the resolved path is within the schemaRoot
    const relativePath = path.relative(schemaRoot, filePath);
    if (relativePath.startsWith('..') || path.isAbsolute(relativePath)) {
      console.error('Security Warning: Attempted to access file outside schema root:', filePath);
      return {
        code: '// Error: Invalid schema path',
        html: '',
        object: null,
      };
    }

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

    const html = await codeToHtml(content, {
      lang: 'typescript',
      themes: {
        light: 'github-light',
        dark: 'github-dark',
      },
    });

    return {
      code: content,
      html,
      object: sanitizeSchema(schemaObjects[safeType]),
    };
  } catch (error) {
    // safeType is already validated by Zod above
    console.error('Error loading schema for:', safeType, error);
    return {
      code: `// Error loading schema: ${filename}`,
      html: '',
      object: null,
    };
  }
}
