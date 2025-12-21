'use server';

import path from 'node:path';
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
    const filePath = path.resolve(schemaRoot, filename);

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

    // We no longer need the code or HTML for the schema preview as the "Code" tab has been removed.
    // Returning empty strings to avoid unnecessary file reading and processing.
    return {
      code: '',
      html: '',
      object: sanitizeSchema(schemaObjects[safeType]),
    };
  } catch (error) {
    // safeType is already validated by Zod above
    console.error('Error loading schema for:', safeType, error);
    return {
      code: '',
      html: '',
      object: null,
    };
  }
}
