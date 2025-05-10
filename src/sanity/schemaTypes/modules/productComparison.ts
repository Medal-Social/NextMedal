/**
 * Product Comparison Module Schema
 * @version 1.3.0
 * @lastUpdated 2024-07-10
 * @description A comparison table for products/features with customizable details for each cell
 * @changelog
 * - 1.3.0: Fixed validation logic to properly access parent module
 * - 1.2.0: Updated field descriptions for improved UX and clarity
 * - 1.1.0: Removed options field and options group for simplified schema
 * - 1.0.0: Initial version with basic comparison functionality
 */

import { LuFileSymlink } from 'react-icons/lu';
import { defineArrayMember, defineField, defineType } from 'sanity';

export default defineType({
  name: 'product-comparison',
  title: 'Product Comparison',
  icon: LuFileSymlink,
  type: 'object',
  description:
    'Create a side-by-side comparison table to highlight differences between products or service tiers',
  groups: [{ name: 'content', default: true, title: 'Content' }],
  fields: [
    defineField({
      name: 'pretitle',
      title: 'Pre-title',
      description: 'Optional badge text that appears above the main heading',
      type: 'string',
      group: 'content',
    }),
    defineField({
      name: 'intro',
      title: 'Introduction',
      description: 'Brief text explaining the comparison (will appear centered above the table)',
      type: 'array',
      of: [{ type: 'block' }],
      group: 'content',
    }),
    defineField({
      name: 'products',
      title: 'Products to Compare',
      description: 'Add the products or service tiers that will be compared in columns',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'object',
          fields: [
            defineField({
              name: 'name',
              title: 'Product Name',
              description: 'Name that will appear in the column header',
              type: 'string',
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: 'highlight',
              title: 'Featured Product',
              description:
                'Enable to visually emphasize this product (useful for recommended options)',
              type: 'boolean',
              initialValue: false,
            }),
          ],
          preview: {
            select: {
              name: 'name',
              highlight: 'highlight',
            },
            prepare: ({ name, highlight }) => ({
              title: name,
              subtitle: highlight ? 'Featured' : undefined,
            }),
          },
        }),
      ],
      validation: (Rule) => Rule.min(1).error('At least one product is required'),
      group: 'content',
    }),
    defineField({
      name: 'features',
      title: 'Feature Rows',
      description: 'Add the features or attributes to compare across products (shown as rows)',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'object',
          fields: [
            defineField({
              name: 'name',
              title: 'Feature Name',
              description: 'The feature name that appears in the leftmost column',
              type: 'string',
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: 'featureDetails',
              title: 'Feature Values',
              description: 'Add a value for each product column. One entry required per product.',
              type: 'array',
              of: [
                defineArrayMember({
                  type: 'string',
                  title: 'Value',
                  placeholder: '"Included", "Optional", "$10/mo", etc.',
                  description:
                    'Special values: "true" shows ✓, "false" shows ✗, or enter any custom text',
                }),
              ],
              validation: (Rule) =>
                Rule.custom((featureValues, context: any) => {
                  try {
                    // Access the parent module's products array
                    const parentModule = context.parent?.parent;
                    const products = parentModule?.products || [];
                    const productCount = Array.isArray(products) ? products.length : 0;

                    if (!featureValues)
                      return `You must add a value for all ${productCount} products`;

                    if (featureValues.length !== productCount) {
                      return `You must add a value for all ${productCount} products`;
                    }
                    return true;
                  } catch (err) {
                    // Fallback in case of any errors in the validation logic
                    console.error('Validation error:', err);
                    return true;
                  }
                }),
            }),
          ],
          preview: {
            select: {
              name: 'name',
            },
            prepare: ({ name }) => ({
              title: name,
            }),
          },
        }),
      ],
      validation: (Rule) => Rule.min(1).error('At least one feature row is required'),
      group: 'content',
    }),
  ],
  preview: {
    select: {
      title: 'title',
      tiersCount: 'products',
      categoriesCount: 'features',
    },
    prepare: ({ title, tiersCount = [], categoriesCount = [] }) => ({
      title: title || 'Product Comparison',
      subtitle: `${tiersCount.length} products • ${categoriesCount.length} features`,
      media: LuFileSymlink,
    }),
  },
});
