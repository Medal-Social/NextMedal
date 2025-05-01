/**
 * Pricing Comparison Module Schema
 * @version 1.0.0
 * @lastUpdated 2024-03-21
 * @description A module for displaying and comparing pricing plans with features and tiers.
 * @changelog
 * - 1.0.0: Initial version with pricing plan comparison functionality
 */

import { LuFileSymlink } from 'react-icons/lu';
import { defineArrayMember, defineField, defineType } from 'sanity';
import { getBlockText } from '@/sanity/lib/utils';

// Define a type for the document structure that we expect

export default defineType({
  name: 'pricing-comparison',
  title: 'Pricing Comparison',
  icon: LuFileSymlink,
  type: 'object',
  groups: [
    { name: 'content', default: true, title: 'Content' },
    { name: 'options', title: 'Options' },
  ],
  fields: [
    defineField({
      name: 'options',
      type: 'module-options',
      group: 'options',
    }),
    defineField({
      name: 'title',
      type: 'string',
      description: 'Title for the pricing comparison section',
      group: 'content',
    }),
    defineField({
      name: 'description',
      type: 'text',
      description: 'Optional description text',
      group: 'content',
    }),
    defineField({
      name: 'tiers',
      title: 'Pricing Tiers',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'object',
          fields: [
            defineField({
              name: 'name',
              type: 'string',
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: 'price',
              type: 'string',
              description: 'Price (leave empty for custom pricing)',
            }),
            defineField({
              name: 'description',
              type: 'text',
              description: 'Short description of this tier',
            }),
            defineField({
              title: 'CTA',
              name: 'cta',
              type: 'cta',
            }),
            defineField({
              name: 'popular',
              type: 'boolean',
              description: 'Mark this tier as popular',
              initialValue: false,
            }),
          ],
          preview: {
            select: {
              name: 'name',
              price: 'price',
              popular: 'popular',
            },
            prepare: ({ name, price, popular }) => ({
              title: name,
              subtitle: popular
                ? `Popular • ${price || 'Custom pricing'}`
                : price || 'Custom pricing',
            }),
          },
        }),
      ],
      validation: (Rule) => Rule.min(1),
      group: 'content',
    }),
    defineField({
      name: 'featureCategories',
      title: 'Feature Categories',
      type: 'array',

      of: [
        defineArrayMember({
          type: 'object',
          fields: [
            defineField({
              name: 'category',
              type: 'string',
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: 'items',
              title: 'Features',
              type: 'array',
              of: [
                defineArrayMember({
                  type: 'object',
                  fields: [
                    defineField({
                      name: 'name',
                      type: 'string',
                      validation: (Rule) => Rule.required(),
                    }),
                    defineField({
                      name: 'tooltip',
                      type: 'text',
                      description: 'Explanation text shown in a tooltip',
                    }),
                    defineField({
                      name: 'tiers',
                      title: 'Availability per tier',
                      type: 'array',
                      of: [
                        defineArrayMember({
                          type: 'string',
                          title: 'Custom value',
                          placeholder: 'Text value like "Coming soon" or "UNLIMITED"',
                          description: 'Text value like "Coming soon" or "UNLIMITED"',
                        }),
                        defineArrayMember({
                          type: 'boolean',
                          title: 'Yes/No',
                          description: 'Feature is available (yes) or not available (no)',
                        }),
                      ],
                      validation: (Rule) =>
                        Rule.custom((featureTiers, context) => {
                          // Look for the root document
                          //@ts-ignore
                          const doc = context.document.modules.find(
                            //@ts-ignore
                            (module) => module._key === context.path[1]._key
                          );
                          // Ensure document tiers is an array before accessing length
                          const docTiers = Array.isArray(doc.tiers) ? doc.tiers : [];
                          const tierCount = docTiers.length;

                          if (!featureTiers)
                            return `You must define availability for all ${tierCount} tiers`; // Handle case when featureTiers is undefined during initial setup

                          if (featureTiers.length !== tierCount) {
                            return `You must define availability for all ${tierCount} tiers`;
                          }
                          return true;
                        }),
                    }),
                    defineField({
                      name: 'subItems',
                      title: 'Sub-features',
                      type: 'array',
                      of: [
                        defineArrayMember({
                          type: 'object',
                          fields: [
                            defineField({
                              name: 'name',
                              type: 'string',
                              validation: (Rule) => Rule.required(),
                            }),
                            defineField({
                              name: 'tooltip',
                              type: 'text',
                              description: 'Explanation text shown in a tooltip',
                            }),
                            defineField({
                              name: 'tiers',
                              title: 'Availability per tier',
                              type: 'array',
                              of: [
                                defineArrayMember({
                                  type: 'string',
                                  title: 'Custom value',
                                  description: 'Text value like "Coming soon" or "UNLIMITED"',
                                }),
                                defineArrayMember({
                                  type: 'boolean',
                                  title: 'Yes/No',
                                  description: 'Feature is available (yes) or not available (no)',
                                }),
                              ],
                              validation: (Rule) =>
                                Rule.custom((featureTiers, context) => {
                                  // Look for the root document
                                  //@ts-ignore
                                  const doc = context.document.modules.find(
                                    //@ts-ignore
                                    (module) =>
                                      //@ts-ignore
                                      module._key === context.path[1]._key
                                  );
                                  // Ensure document tiers is an array before accessing length
                                  const docTiers = Array.isArray(doc.tiers) ? doc.tiers : [];
                                  const tierCount = docTiers.length;

                                  if (!featureTiers)
                                    return `You must define availability for all ${tierCount} tiers`; // Handle case when featureTiers is undefined during initial setup

                                  if (featureTiers.length !== tierCount) {
                                    return `You must define availability for all ${tierCount} tiers`;
                                  }
                                  return true;
                                }),
                            }),
                          ],
                          preview: {
                            select: {
                              name: 'name',
                            },
                            prepare: ({ name }) => ({
                              title: `↳ ${name}`,
                            }),
                          },
                        }),
                      ],
                    }),
                  ],
                  preview: {
                    select: {
                      name: 'name',
                      subItemsCount: 'subItems',
                    },
                    prepare: ({ name, subItemsCount = [] }) => ({
                      title: name,
                      subtitle:
                        subItemsCount.length > 0
                          ? `${subItemsCount.length} sub-features`
                          : undefined,
                    }),
                  },
                }),
              ],
              validation: (Rule) => Rule.min(1),
            }),
          ],
          preview: {
            select: {
              category: 'category',
              itemsCount: 'items',
            },
            prepare: ({ category, itemsCount = [] }) => ({
              title: category,
              subtitle: `${itemsCount.length} features`,
            }),
          },
        }),
      ],
      validation: (Rule) => Rule.min(1),
      group: 'content',
    }),
  ],
  preview: {
    select: {
      title: 'title',
      tiersCount: 'tiers',
      categoriesCount: 'featureCategories',
    },
    prepare: ({ title, tiersCount = [], categoriesCount = [] }) => ({
      title: title || 'Pricing Comparison',
      subtitle: `${tiersCount.length} tiers • ${categoriesCount.length} feature categories`,
      media: LuFileSymlink,
    }),
  },
});
