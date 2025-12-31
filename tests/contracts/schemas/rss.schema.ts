import { z } from 'zod';

/**
 * Schema for RSS 2.0 feed response validation
 * Validates the XML structure contains required RSS elements
 */
export const RssFeedResponseSchema = z
  .string()
  .refine((xml) => xml.includes('<?xml version="1.0"'), {
    message: 'RSS feed must have XML declaration',
  })
  .refine((xml) => xml.includes('<rss version="2.0"'), {
    message: 'RSS feed must have rss element with version 2.0',
  })
  .refine((xml) => xml.includes('<channel>'), {
    message: 'RSS feed must have channel element',
  })
  .refine((xml) => xml.includes('<title>'), {
    message: 'RSS channel must have title element',
  })
  .refine((xml) => xml.includes('<link>'), {
    message: 'RSS channel must have link element',
  })
  .refine((xml) => xml.includes('<description>'), {
    message: 'RSS channel must have description element',
  });

/**
 * Schema for RSS error response (503 status)
 */
export const RssErrorResponseSchema = z
  .string()
  .refine((xml) => xml.includes('<rss version="2.0"'), {
    message: 'Error RSS must still be valid RSS 2.0',
  })
  .refine((xml) => xml.includes('<channel>'), {
    message: 'Error RSS must have channel element',
  });

export type RssFeedResponse = z.infer<typeof RssFeedResponseSchema>;
export type RssErrorResponse = z.infer<typeof RssErrorResponseSchema>;
