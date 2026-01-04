/**
 * Create Locale Filter
 * @description Utility function to create a language-aware filter for Sanity reference fields
 * @version 1.0.0
 * @lastUpdated 2026-01-03
 * @changelog
 * - 1.0.0: Initial version - creates filter that shows only same-language references
 */

/**
 * Creates a filter configuration that filters reference fields by the document's language.
 * When editing a document in a specific language (e.g., Norwegian), only references
 * to documents in the same language will appear in the reference picker.
 *
 * @returns Filter configuration object for Sanity reference field options
 *
 * @example
 * ```typescript
 * import { createLocaleFilter } from '@/sanity/lib/createLocaleFilter';
 *
 * defineField({
 *   name: 'authors',
 *   type: 'array',
 *   of: [
 *     {
 *       type: 'reference',
 *       to: [{ type: 'person' }],
 *       options: createLocaleFilter(), // Only show authors in same language
 *     },
 *   ],
 * })
 * ```
 */
export function createLocaleFilter() {
  return {
    filter: ({ document }: { document: { language?: string } }) => {
      const language = document?.language;
      return {
        filter: 'language == $language',
        params: { language },
      };
    },
  };
}
