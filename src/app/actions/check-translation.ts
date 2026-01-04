'use server';

import type { TranslationDetectionResult } from '@/lib/sanity/translation-detector';
import { findAvailableTranslation } from '@/lib/sanity/translation-detector';

/**
 * Server action to check if a translation is available for a given pathname and target locale
 *
 * @param pathname - The current pathname (e.g., /articles/my-post, /nb/om)
 * @param currentLocale - The current locale (e.g., 'en', 'nb', 'ar')
 * @param targetLocale - The target locale the user wants to switch to
 * @returns Translation detection result with found status, redirect URL, and available locales
 */
export async function checkTranslationAvailability(
  pathname: string,
  currentLocale: string,
  targetLocale: string
): Promise<TranslationDetectionResult> {
  return await findAvailableTranslation(pathname, currentLocale, targetLocale);
}
