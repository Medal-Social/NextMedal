import { z } from 'zod';

/**
 * Schema for individual search result items
 */
export const SearchResultSchema = z.object({
  _id: z.string(),
  _type: z.string(),
  title: z.string(),
  slug: z.object({ current: z.string() }).optional(),
  excerpt: z.string().optional(),
});

/**
 * Schema for search API response
 */
export const SearchResponseSchema = z.object({
  results: z.array(SearchResultSchema),
  total: z.number().optional(),
  page: z.number().optional(),
});

export type SearchResult = z.infer<typeof SearchResultSchema>;
export type SearchResponse = z.infer<typeof SearchResponseSchema>;
