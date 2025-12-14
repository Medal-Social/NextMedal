/**
 * Sanity Validation Utility Tests
 * @description Tests for Sanity schema validation utilities
 * Tests requiredField, minMaxValidation, uniqueArrayValues, validateUrl, validateMediaField, validatePastDate, validateSlug, validateHexColor
 * _Requirements: 16.5_
 */

import { describe, expect, it, vi } from 'vitest';
import {
  minMaxValidation,
  requiredField,
  uniqueArrayValues,
  validateHexColor,
  validateMediaField,
  validatePastDate,
  validateSlug,
  validateUrl,
} from '@/sanity/lib/validation-utils';

// Mock Rule class to simulate Sanity's Rule behavior
function createMockRule() {
  const rule: Record<string, unknown> = {};

  rule.required = vi.fn(() => rule);
  rule.error = vi.fn((msg: string) => ({ ...rule, _error: msg }));
  rule.min = vi.fn(() => rule);
  rule.max = vi.fn(() => rule);
  rule.unique = vi.fn(() => rule);
  rule.uri = vi.fn(() => rule);
  rule.custom = vi.fn((fn: (value: unknown) => unknown) => {
    return { ...rule, _customValidator: fn };
  });

  return rule;
}

describe('Sanity Validation Utilities', () => {
  describe('requiredField', () => {
    it('returns a rule with required validation', () => {
      const mockRule = createMockRule();
      const result = requiredField(mockRule as never);

      expect(mockRule.required).toHaveBeenCalled();
      expect(mockRule.error).toHaveBeenCalledWith('This field is required');
      expect(result).toBeDefined();
    });
  });

  describe('minMaxValidation', () => {
    it('returns a rule with min and max validation', () => {
      const mockRule = createMockRule();
      const result = minMaxValidation(mockRule as never, 2, 5);

      expect(mockRule.min).toHaveBeenCalledWith(2);
      expect(mockRule.max).toHaveBeenCalledWith(5);
      expect(mockRule.error).toHaveBeenCalledWith('Must be between 2 and 5 items');
      expect(result).toBeDefined();
    });
  });

  describe('uniqueArrayValues', () => {
    it('returns a rule with unique validation', () => {
      const mockRule = createMockRule();
      const result = uniqueArrayValues(mockRule as never);

      expect(mockRule.unique).toHaveBeenCalled();
      expect(mockRule.error).toHaveBeenCalledWith('All items must be unique');
      expect(result).toBeDefined();
    });
  });

  describe('validateUrl', () => {
    it('returns a rule with URI validation', () => {
      const mockRule = createMockRule();
      const result = validateUrl(mockRule as never);

      expect(mockRule.uri).toHaveBeenCalledWith({
        scheme: ['http', 'https', 'mailto', 'tel'],
      });
      expect(result).toBeDefined();
    });

    it('custom validator returns true for empty URL', () => {
      const mockRule = createMockRule();
      const result = validateUrl(mockRule as never) as unknown as {
        _customValidator: (url: unknown) => unknown;
      };

      expect(result._customValidator(null)).toBe(true);
      expect(result._customValidator(undefined)).toBe(true);
      expect(result._customValidator('')).toBe(true);
    });

    it('custom validator rejects javascript: URLs', () => {
      const mockRule = createMockRule();
      const result = validateUrl(mockRule as never) as unknown as {
        _customValidator: (url: unknown) => unknown;
      };

      expect(result._customValidator('javascript:alert(1)')).toBe(
        'JavaScript in URLs is not allowed for security reasons'
      );
    });

    it('custom validator accepts valid URLs', () => {
      const mockRule = createMockRule();
      const result = validateUrl(mockRule as never) as unknown as {
        _customValidator: (url: unknown) => unknown;
      };

      expect(result._customValidator('https://example.com')).toBe(true);
      expect(result._customValidator('http://example.com/path')).toBe(true);
      expect(result._customValidator('mailto:test@example.com')).toBe(true);
    });

    it('custom validator rejects invalid URLs', () => {
      const mockRule = createMockRule();
      const result = validateUrl(mockRule as never) as unknown as {
        _customValidator: (url: unknown) => unknown;
      };

      expect(result._customValidator('not-a-valid-url')).toBe('Please enter a valid URL');
    });
  });

  describe('validateMediaField', () => {
    it('returns error for empty array', () => {
      expect(validateMediaField([], undefined as never)).toBe('An image is required');
    });

    it('returns error for undefined', () => {
      expect(validateMediaField(undefined, undefined as never)).toBe('An image is required');
    });

    it('returns true for array with items', () => {
      expect(validateMediaField([{ _type: 'image' }], undefined as never)).toBe(true);
    });
  });

  describe('validatePastDate', () => {
    it('returns a rule with custom validation', () => {
      const mockRule = createMockRule();
      const result = validatePastDate(mockRule as never);

      expect(mockRule.custom).toHaveBeenCalled();
      expect(result).toBeDefined();
    });

    it('custom validator returns true for empty date', () => {
      const mockRule = createMockRule();
      const result = validatePastDate(mockRule as never) as unknown as {
        _customValidator: (date: unknown) => unknown;
      };

      expect(result._customValidator(null)).toBe(true);
      expect(result._customValidator(undefined)).toBe(true);
    });

    it('custom validator accepts past dates', () => {
      const mockRule = createMockRule();
      const result = validatePastDate(mockRule as never) as unknown as {
        _customValidator: (date: unknown) => unknown;
      };

      const pastDate = new Date(Date.now() - 86400000).toISOString(); // Yesterday
      expect(result._customValidator(pastDate)).toBe(true);
    });

    it('custom validator accepts current date', () => {
      const mockRule = createMockRule();
      const result = validatePastDate(mockRule as never) as unknown as {
        _customValidator: (date: unknown) => unknown;
      };

      const now = new Date().toISOString();
      expect(result._customValidator(now)).toBe(true);
    });

    it('custom validator rejects future dates', () => {
      const mockRule = createMockRule();
      const result = validatePastDate(mockRule as never) as unknown as {
        _customValidator: (date: unknown) => unknown;
      };

      const futureDate = new Date(Date.now() + 86400000 * 2).toISOString(); // Day after tomorrow
      expect(result._customValidator(futureDate)).toBe('Date cannot be in the future');
    });
  });

  describe('validateSlug', () => {
    it('returns a rule with custom validation', () => {
      const mockRule = createMockRule();
      const result = validateSlug(mockRule as never);

      expect(mockRule.custom).toHaveBeenCalled();
      expect(result).toBeDefined();
    });

    it('custom validator returns true for empty slug', () => {
      const mockRule = createMockRule();
      const result = validateSlug(mockRule as never) as unknown as {
        _customValidator: (slug: unknown) => unknown;
      };

      expect(result._customValidator(null)).toBe(true);
      expect(result._customValidator(undefined)).toBe(true);
      expect(result._customValidator({})).toBe(true);
    });

    it('custom validator accepts valid slugs', () => {
      const mockRule = createMockRule();
      const result = validateSlug(mockRule as never) as unknown as {
        _customValidator: (slug: unknown) => unknown;
      };

      expect(result._customValidator({ current: 'valid-slug' })).toBe(true);
      expect(result._customValidator({ current: 'another-valid-slug-123' })).toBe(true);
      expect(result._customValidator({ current: 'simple' })).toBe(true);
    });

    it('custom validator rejects slugs with invalid characters', () => {
      const mockRule = createMockRule();
      const result = validateSlug(mockRule as never) as unknown as {
        _customValidator: (slug: unknown) => unknown;
      };

      expect(result._customValidator({ current: 'Invalid-Slug' })).toBe(
        'Slug can only contain lowercase letters, numbers, and hyphens'
      );
      expect(result._customValidator({ current: 'slug with spaces' })).toBe(
        'Slug can only contain lowercase letters, numbers, and hyphens'
      );
      expect(result._customValidator({ current: 'slug_underscore' })).toBe(
        'Slug can only contain lowercase letters, numbers, and hyphens'
      );
    });

    it('custom validator rejects slugs that are too long', () => {
      const mockRule = createMockRule();
      const result = validateSlug(mockRule as never) as unknown as {
        _customValidator: (slug: unknown) => unknown;
      };

      const longSlug = 'a'.repeat(101);
      expect(result._customValidator({ current: longSlug })).toBe(
        'Slug is too long (max 100 characters)'
      );
    });
  });

  describe('validateHexColor', () => {
    it('returns a rule with custom validation', () => {
      const mockRule = createMockRule();
      const result = validateHexColor(mockRule as never);

      expect(mockRule.custom).toHaveBeenCalled();
      expect(result).toBeDefined();
    });

    it('custom validator returns true for empty color', () => {
      const mockRule = createMockRule();
      const result = validateHexColor(mockRule as never) as unknown as {
        _customValidator: (color: unknown) => unknown;
      };

      expect(result._customValidator(null)).toBe(true);
      expect(result._customValidator(undefined)).toBe(true);
    });

    it('custom validator accepts valid 6-digit hex colors', () => {
      const mockRule = createMockRule();
      const result = validateHexColor(mockRule as never) as unknown as {
        _customValidator: (color: unknown) => unknown;
      };

      expect(result._customValidator('#FF0000')).toBe(true);
      expect(result._customValidator('#00ff00')).toBe(true);
      expect(result._customValidator('#0000FF')).toBe(true);
      expect(result._customValidator('#123456')).toBe(true);
    });

    it('custom validator accepts valid 3-digit hex colors', () => {
      const mockRule = createMockRule();
      const result = validateHexColor(mockRule as never) as unknown as {
        _customValidator: (color: unknown) => unknown;
      };

      expect(result._customValidator('#F00')).toBe(true);
      expect(result._customValidator('#0f0')).toBe(true);
      expect(result._customValidator('#00F')).toBe(true);
    });

    it('custom validator rejects invalid hex colors', () => {
      const mockRule = createMockRule();
      const result = validateHexColor(mockRule as never) as unknown as {
        _customValidator: (color: unknown) => unknown;
      };

      expect(result._customValidator('FF0000')).toBe('Must be a valid hex color code'); // Missing #
      expect(result._customValidator('#GG0000')).toBe('Must be a valid hex color code'); // Invalid chars
      expect(result._customValidator('#12345')).toBe('Must be a valid hex color code'); // Wrong length
      expect(result._customValidator('#1234567')).toBe('Must be a valid hex color code'); // Too long
    });
  });
});
