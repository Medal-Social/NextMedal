import { z } from 'zod';

/**
 * Schema for sitemap index XML response validation
 * Validates the XML structure contains required elements
 */
export const SitemapIndexResponseSchema = z
  .string()
  .refine((xml) => xml.includes('<?xml version="1.0"'), {
    message: 'Sitemap must have XML declaration',
  })
  .refine((xml) => xml.includes('<sitemapindex'), {
    message: 'Sitemap index must have sitemapindex element',
  })
  .refine((xml) => xml.includes('<sitemap>'), {
    message: 'Sitemap index must contain at least one sitemap entry',
  })
  .refine((xml) => xml.includes('<loc>'), {
    message: 'Sitemap entries must have loc elements',
  });

/**
 * Schema for locale-specific sitemap XML response
 */
export const LocaleSitemapResponseSchema = z
  .string()
  .refine((xml) => xml.includes('<?xml version="1.0"'), {
    message: 'Sitemap must have XML declaration',
  })
  .refine((xml) => xml.includes('<urlset'), {
    message: 'Sitemap must have urlset element',
  });

export type SitemapIndexResponse = z.infer<typeof SitemapIndexResponseSchema>;
export type LocaleSitemapResponse = z.infer<typeof LocaleSitemapResponseSchema>;
