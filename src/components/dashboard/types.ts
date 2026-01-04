/**
 * Shared TypeScript types for Dashboard components
 */

import type { KeyboardEvent } from 'react';

/**
 * Content statistics from Sanity
 */
export interface ContentStats {
  draftsCount: number;
  publishedCount: number;
  seoIssuesCount: number;
}

/**
 * Handle keyboard events for card navigation (Enter/Space)
 */
export function handleCardKeyDown(event: KeyboardEvent<HTMLDivElement>, onClick: () => void): void {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault();
    onClick();
  }
}
