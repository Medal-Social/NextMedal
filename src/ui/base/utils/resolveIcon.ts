import type { LucideIcon } from 'lucide-react';
import * as Lucide from 'lucide-react';
import { stegaClean } from 'next-sanity';

/**
 * Resolves an icon name to a Lucide icon component.
 * Handles various formats:
 * - Direct name: "Activity"
 * - With prefix: "lucide/Activity"
 * - Lu prefix: "LuActivity"
 *
 * @param iconName - The icon name to resolve
 * @returns The Lucide icon component or null if not found
 */
export function resolveIcon(iconName: string): LucideIcon | null {
  const cleanName = stegaClean(iconName);
  if (!cleanName) return null;

  // Handle "lucide/Activity" format
  const name = cleanName.includes('/') ? cleanName.split('/')[1] : cleanName;

  // Check if the icon exists directly
  if (name in Lucide) {
    // @ts-expect-error - dynamically accessing the icon
    // biome-ignore lint/performance/noDynamicNamespaceImportAccess: needed for dynamic icon loading
    return Lucide[name] as LucideIcon;
  }

  // Handle "Lu" prefix (e.g., "LuActivity" -> "Activity")
  if (name.startsWith('Lu') && name.length > 2) {
    const strippedName = name.substring(2);
    if (strippedName in Lucide) {
      // @ts-expect-error - dynamically accessing the icon
      // biome-ignore lint/performance/noDynamicNamespaceImportAccess: needed for dynamic icon loading
      return Lucide[strippedName] as LucideIcon;
    }
  }

  return null;
}

/**
 * Gets the fallback icon URL for external icon service
 * @param iconName - The icon name
 * @returns The icon URL
 */
export function getFallbackIconUrl(iconName: string): string {
  return `https://ic0n.dev/${stegaClean(iconName)}`;
}
