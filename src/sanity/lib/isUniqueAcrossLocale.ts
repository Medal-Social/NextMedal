import type { PathSegment, SlugValidationContext } from 'sanity';
import { logger } from '@/lib/core/logger';

/**
 * Converts a Sanity path to a safe GROQ path string.
 * This prevents GROQ injection by ensuring each segment is properly formatted or sanitized.
 *
 * @param path - The Sanity path array
 * @returns A safe GROQ path string (e.g., "metadata.slug")
 */
export function toSafeGroqPath(path: PathSegment[]): string {
  return path.reduce<string>((acc, segment) => {
    if (typeof segment === 'string') {
      // Strict whitelist for field names: only alphanumeric and underscores, must start with letter/underscore
      if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(segment)) {
        throw new Error(`Invalid GROQ path segment: "${segment}"`);
      }
      return acc ? `${acc}.${segment}` : segment;
    }

    if (typeof segment === 'number') {
      return `${acc}[${segment}]`;
    }

    if (typeof segment === 'object' && '_key' in segment) {
      // Sanitize the key: it must not contain quotes that could break out of the string
      const safeKey = segment._key.replace(/['"\\]/g, '');
      return `${acc}[_key == "${safeKey}"]`;
    }

    throw new Error(`Unsupported GROQ path segment type: ${typeof segment}`);
  }, '');
}

type ExtendedSlugValidationContext = SlugValidationContext & {
  defaultIsUnique: (slug: string, context: SlugValidationContext) => Promise<boolean>;
  path: PathSegment[];
};

/**
 * Custom slug uniqueness validator that checks uniqueness per locale.
 *
 * Defaults to Sanity's standard unique check if the document has no language field.
 *
 * @param slug - The slug string to check
 * @param context - Validation context provided by Sanity
 * @returns true if unique, false if duplicate
 */
export async function isUniqueAcrossLocale(
  slug: string,
  context: SlugValidationContext
): Promise<boolean> {
  const { document, getClient, defaultIsUnique, path } = context as ExtendedSlugValidationContext;

  // Fallback to default behavior if no language is present on the document
  if (!document?.language) {
    return defaultIsUnique(slug, context);
  }

  // If document doesn't have an ID yet (new document), use default behavior
  if (!document._id) {
    return defaultIsUnique(slug, context);
  }

  const client = getClient({ apiVersion: '2025-12-23' });
  const id = document._id.replace(/^drafts\./, '');
  const params = {
    draft: `drafts.${id}`,
    published: id,
    slug,
    language: document.language,
  };

  try {
    // Construct the field path safely to prevent GROQ injection
    const fieldPath = toSafeGroqPath(path || []);
    const slugField = `${fieldPath}.current`;

    // Query: find documents with same language and slug, excluding current document
    // Returns true if no duplicates found (i.e., the slug is unique)
    const query = `!defined(*[
      language == $language &&
      ${slugField} == $slug &&
      !(_id in [$draft, $published])
    ][0]._id)`;

    const result = await client.fetch(query, params);

    // Debug logging (only in development)
    if (process.env.NODE_ENV === 'development' && !result) {
      logger.warn(
        {
          slug,
          language: document.language,
          documentId: document._id,
          fieldPath,
        },
        'Slug uniqueness check failed'
      );
    }

    return result;
  } catch (error) {
    // Fail safe: if there's an error, use default validation
    logger.error({ err: error, slug, documentId: document._id }, 'Slug uniqueness check error');
    // Fall back to default instead of rejecting
    return defaultIsUnique(slug, context);
  }
}
