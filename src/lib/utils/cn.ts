import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merges Tailwind CSS class names intelligently.
 * Combines clsx for conditional classes with tailwind-merge for conflict resolution.
 * @param inputs - Class values (strings, objects, arrays, or conditional expressions)
 * @returns Merged class string with Tailwind conflicts resolved
 * @example
 * cn("px-2 py-1", "px-4") // "py-1 px-4" (px-4 wins)
 * cn("text-red-500", isError && "text-green-500") // conditional classes
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
