import { z } from 'zod';

/**
 * Schema for robots.txt response validation
 * Validates the plain text response structure
 */
export const RobotsResponseSchema = z
  .string()
  .refine((text) => text.includes('User-agent:'), {
    message: 'robots.txt must contain User-agent directive',
  })
  .refine((text) => text.includes('Sitemap:'), {
    message: 'robots.txt must contain Sitemap directive',
  });

/**
 * Schema for individual robots.txt directives
 */
export const RobotsDirectiveSchema = z.object({
  userAgent: z.string(),
  allow: z.array(z.string()).optional(),
  disallow: z.array(z.string()).optional(),
});

export type RobotsResponse = z.infer<typeof RobotsResponseSchema>;
