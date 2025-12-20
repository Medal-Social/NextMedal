/**
 * Schema Validation Tests
 * @description Validates that mock data factories produce data conforming to actual Sanity schemas.
 * These tests will fail if schemas are updated but mocks are not, helping catch drift.
 */

import type { SchemaTypeDefinition } from 'sanity';
import { describe, expect, it } from 'vitest';

import { schemaTypes } from '@/sanity/schemaTypes';

import {
  createMockAccordionListModule,
  createMockBlogFrontpageModule,
  createMockBlogListModule,
  createMockBlogPost,
  createMockBlogPostContentModule,
  createMockBreadcrumbsModule,
  createMockCalloutModule,
  createMockFeaturedHeroModule,
  createMockFeatureGridModule,
  createMockGalleryHeroModule,
  createMockHeroModule,
  createMockLogoListModule,
  createMockPage,
  createMockPerson,
  createMockPersonListModule,
  createMockPricingComparisonModule,
  createMockPricingListModule,
  createMockProductComparisonModule,
  createMockRichtextModule,
  createMockSite,
  createMockVideoHeroModule,
  MODULE_TYPES,
} from './sanity';

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Finds a schema type by name from the registered schema types
 */
function findSchema(name: string): SchemaTypeDefinition | undefined {
  return schemaTypes.find((s) => s.name === name);
}

/**
 * Gets field names from a schema type definition
 */
function getSchemaFieldNames(schema: SchemaTypeDefinition): string[] {
  if (!('fields' in schema) || !schema.fields) return [];
  return schema.fields.map((f) => f.name);
}

/**
 * Type helper to convert mock objects to Record for validation
 */
function toRecord<T extends object>(obj: T): Record<string, unknown> {
  return obj as unknown as Record<string, unknown>;
}

/**
 * Validates that a mock object has the correct _type
 */
function validateMockType(mock: { _type: string }, expectedType: string): void {
  expect(mock._type).toBe(expectedType);
}

/**
 * Validates that a mock object contains fields defined in the schema
 * This checks that mock fields are a subset of schema fields (allowing extra internal fields like _key)
 */
function validateMockFieldsExistInSchema(
  mock: Record<string, unknown>,
  schema: SchemaTypeDefinition,
  schemaName: string
): void {
  const schemaFields = getSchemaFieldNames(schema);
  const mockFields = Object.keys(mock).filter((k) => !k.startsWith('_')); // Exclude internal fields

  for (const field of mockFields) {
    // Skip common internal/computed fields
    if (['uid'].includes(field)) continue;

    expect(
      schemaFields.includes(field),
      `Mock field "${field}" not found in ${schemaName} schema. Schema fields: ${schemaFields.join(', ')}`
    ).toBe(true);
  }
}

// ============================================================================
// Document Schema Validation Tests
// ============================================================================

describe('Document Schema Validation', () => {
  describe('Page Schema', () => {
    const schema = findSchema('page');
    const mock = createMockPage();

    it('schema exists', () => {
      expect(schema).toBeDefined();
    });

    it('mock has correct _type', () => {
      validateMockType(mock, 'page');
    });

    it('mock fields exist in schema', () => {
      if (schema) {
        validateMockFieldsExistInSchema(toRecord(mock), schema, 'page');
      }
    });

    it('mock has required document fields', () => {
      expect(mock._id).toBeDefined();
      expect(mock._type).toBeDefined();
      expect(mock.title).toBeDefined();
      expect(mock.metadata).toBeDefined();
    });
  });

  describe('Blog Post Schema', () => {
    const schema = findSchema('blog.post');
    const mock = createMockBlogPost();

    it('schema exists', () => {
      expect(schema).toBeDefined();
    });

    it('mock has correct _type', () => {
      validateMockType(mock, 'blog.post');
    });

    it('mock fields exist in schema', () => {
      if (schema) {
        validateMockFieldsExistInSchema(toRecord(mock), schema, 'blog.post');
      }
    });

    it('mock has required document fields', () => {
      expect(mock._id).toBeDefined();
      expect(mock._type).toBeDefined();
      expect(mock.publishDate).toBeDefined();
      expect(mock.metadata).toBeDefined();
    });
  });

  describe('Person Schema', () => {
    const schema = findSchema('person');
    const mock = createMockPerson();

    it('schema exists', () => {
      expect(schema).toBeDefined();
    });

    it('mock has correct _type', () => {
      validateMockType(mock, 'person');
    });

    it('mock fields exist in schema', () => {
      if (schema) {
        validateMockFieldsExistInSchema(toRecord(mock), schema, 'person');
      }
    });
  });

  describe('Site Schema', () => {
    const schema = findSchema('site');
    const mock = createMockSite();

    it('schema exists', () => {
      expect(schema).toBeDefined();
    });

    it('mock has correct _type', () => {
      validateMockType(mock, 'site');
    });

    it('mock fields exist in schema', () => {
      if (schema) {
        validateMockFieldsExistInSchema(toRecord(mock), schema, 'site');
      }
    });
  });
});

// ============================================================================
// Module Schema Validation Tests
// ============================================================================

describe('Module Schema Validation', () => {
  // Map of module type names to their schema names and mock factories
  const moduleConfigs: Array<{
    moduleType: string;
    schemaName: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    createMock: () => any;
  }> = [
    { moduleType: 'hero', schemaName: 'hero', createMock: createMockHeroModule },
    { moduleType: 'callout', schemaName: 'callout', createMock: createMockCalloutModule },
    {
      moduleType: 'accordion-list',
      schemaName: 'accordion-list',
      createMock: createMockAccordionListModule,
    },
    {
      moduleType: 'blog-frontpage',
      schemaName: 'blog-frontpage',
      createMock: createMockBlogFrontpageModule,
    },
    { moduleType: 'blog-list', schemaName: 'blog-list', createMock: createMockBlogListModule },
    {
      moduleType: 'blog-post-content',
      schemaName: 'blog-post-content',
      createMock: createMockBlogPostContentModule,
    },
    {
      moduleType: 'breadcrumbs',
      schemaName: 'breadcrumbs',
      createMock: createMockBreadcrumbsModule,
    },
    {
      moduleType: 'feature-grid',
      schemaName: 'feature-grid',
      createMock: createMockFeatureGridModule,
    },
    {
      moduleType: 'featuredHero',
      schemaName: 'featuredHero',
      createMock: createMockFeaturedHeroModule,
    },
    {
      moduleType: 'galleryHero',
      schemaName: 'galleryHero',
      createMock: createMockGalleryHeroModule,
    },
    { moduleType: 'logo-list', schemaName: 'logo-list', createMock: createMockLogoListModule },
    {
      moduleType: 'person-list',
      schemaName: 'person-list',
      createMock: createMockPersonListModule,
    },
    {
      moduleType: 'pricing-comparison',
      schemaName: 'pricing-comparison',
      createMock: createMockPricingComparisonModule,
    },
    {
      moduleType: 'pricing-list',
      schemaName: 'pricing-list',
      createMock: createMockPricingListModule,
    },
    {
      moduleType: 'product-comparison',
      schemaName: 'product-comparison',
      createMock: createMockProductComparisonModule,
    },
    {
      moduleType: 'richtext-module',
      schemaName: 'richtext-module',
      createMock: createMockRichtextModule,
    },
    { moduleType: 'videoHero', schemaName: 'videoHero', createMock: createMockVideoHeroModule },
  ];

  it('all 18 module types have corresponding schemas', () => {
    expect(MODULE_TYPES).toHaveLength(17);
    expect(moduleConfigs).toHaveLength(17);
  });

  describe.each(moduleConfigs)('$schemaName module', ({ moduleType, schemaName, createMock }) => {
    const schema = findSchema(schemaName);
    const mock = createMock();

    it('schema exists in schemaTypes', () => {
      expect(schema, `Schema "${schemaName}" not found in schemaTypes`).toBeDefined();
    });

    it('mock has correct _type', () => {
      expect(mock._type).toBe(moduleType);
    });

    it('mock has _key for array usage', () => {
      expect(mock._key).toBeDefined();
    });

    it('mock fields exist in schema', () => {
      if (schema) {
        validateMockFieldsExistInSchema(toRecord(mock), schema, schemaName);
      }
    });
  });
});

// ============================================================================
// Schema Registry Completeness Tests
// ============================================================================

describe('Schema Registry Completeness', () => {
  it('all document schemas are registered', () => {
    const documentSchemas = ['page', 'blog.post', 'blog.category', 'site', 'person'];
    for (const name of documentSchemas) {
      expect(findSchema(name), `Document schema "${name}" not registered`).toBeDefined();
    }
  });

  it('all module schemas are registered', () => {
    for (const moduleType of MODULE_TYPES) {
      const schema = findSchema(moduleType);
      expect(schema, `Module schema "${moduleType}" not registered`).toBeDefined();
    }
  });

  it('MODULE_TYPES matches registered module schemas', () => {
    const registeredModules = schemaTypes
      .filter(
        (s) => s.type === 'object' && MODULE_TYPES.includes(s.name as (typeof MODULE_TYPES)[number])
      )
      .map((s) => s.name);

    expect(registeredModules.sort()).toEqual([...MODULE_TYPES].sort());
  });
});
