/**
 * Sanity Schema Validation Utilities
 * @version 1.0.0
 * @lastUpdated 2024-03-13
 */

import type { Rule } from 'sanity';
import type { CustomValidator } from 'sanity';

/**
 * Marks a field as required
 */
export function requiredField(rule: Rule) {
  return rule.required().error('This field is required');
}

/**
 * Validates array length between min and max values
 */
export function minMaxValidation(rule: Rule, min: number, max: number) {
  return rule.min(min).max(max).error(`Must be between ${min} and ${max} items`);
}

/**
 * Ensures array values are unique
 */
export function uniqueArrayValues(rule: Rule) {
  return rule.unique().error('All items must be unique');
}

/**
 * Validates URLs with security checks
 */
export function validateUrl(rule: Rule) {
  return rule
    .uri({
      scheme: ['http', 'https', 'mailto', 'tel'],
    })
    .custom((url) => {
      if (!url) return true;

      // Security checks
      if (typeof url === 'string' && url.includes('javascript:')) {
        return 'JavaScript in URLs is not allowed for security reasons';
      }

      // Ensure URL is properly formatted
      try {
        if (typeof url === 'string') {
          new URL(url);
        }
        return true;
      } catch {
        return 'Please enter a valid URL';
      }
    });
}

/**
 * Validates media fields to ensure they meet requirements
 * @param value The field value to validate
 * @returns true if valid, error message if invalid
 */
export const validateMediaField: CustomValidator<unknown[] | undefined> = (value) => {
  const hasImage = value && value.length > 0;

  if (!hasImage) {
    return 'An image is required';
  }

  return true;
};

/**
 * Validates date is not in the future
 */
export function validatePastDate(rule: Rule) {
  return rule.custom((date) => {
    if (!date) return true;
    if (typeof date === 'string') {
      return new Date(date) <= new Date() ? true : 'Date cannot be in the future';
    }
    return true;
  });
}

/**
 * Validates slug format
 */
export function validateSlug(rule: Rule) {
  return rule.custom((slug: any) => {
    if (!slug?.current) return true;

    const current = String(slug.current);

    // Check for valid characters
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(current)) {
      return 'Slug can only contain lowercase letters, numbers, and hyphens';
    }

    // Check length
    if (current.length > 100) {
      return 'Slug is too long (max 100 characters)';
    }

    return true;
  });
}

/**
 * Validates hex color code
 */
export function validateHexColor(rule: Rule) {
  return rule.custom((color) => {
    if (!color) return true;
    if (typeof color === 'string') {
      return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color)
        ? true
        : 'Must be a valid hex color code';
    }
    return true;
  });
}
