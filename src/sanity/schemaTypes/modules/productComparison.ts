/**
 * Product Comparison Module Schema
 * @version 1.1.0
 * @lastUpdated 2025-05-15
 * @description A comparison table for products/features with customizable details for each cell
 * @changelog
 * - 1.1.0: Removed options field and options group for simplified schema
 * - 1.0.0: Initial version with basic comparison functionality
 */

import { LuFileSymlink } from "react-icons/lu";
import { defineArrayMember, defineField, defineType } from "sanity";

export default defineType({
  name: "product-comparison",
  title: "Product Comparison",
  icon: LuFileSymlink,
  type: "object",
  description: "Create a comparison table to showcase differences between products or service tiers",
  groups: [
    { name: "content", default: true, title: "Content" },
  ],
  fields: [
    defineField({
      name: "pretitle",
      title: "Pre-title",
      description: "Optional pre-title displayed above the main content",
      type: "string",
      group: "content",
    }),
    defineField({
      name: "intro",
      title: "Introduction",
      description: "Introductory text for the product comparison",
      type: "array",
      of: [{ type: "block" }],
      group: "content",
    }),
    defineField({
      name: "products",
      title: "Products",
      description: "Define the products or service tiers to compare",
      type: "array",
      of: [
        defineArrayMember({
          type: "object",
          fields: [
            defineField({
              name: "name",
              title: "Product Name",
              description: "Name of the product or service tier",
              type: "string",
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: "highlight",
              title: "Highlight",
              description: "Mark this product as highlighted/recommended",
              type: "boolean",
              initialValue: false,
            }),
          ],
          preview: {
            select: {
              name: "name",
              highlight: "highlight",
            },
            prepare: ({ name, highlight }) => ({
              title: name,
              subtitle: highlight ? "Highlighted" : undefined,
            }),
          },
        }),
      ],
      validation: (Rule) => Rule.min(1).error("At least one product is required"),
      group: "content",
    }),
    defineField({
      name: "features",
      title: "Features",
      description: "Define the features to compare across products",
      type: "array",
      of: [
        defineArrayMember({
          type: "object",
          fields: [
            defineField({
              name: "name",
              title: "Feature Name",
              description: "Name of the feature being compared",
              type: "string",
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: "featureDetails",
              title: "Feature details",
              description: "Specify the availability or details for each product. Enter 'true' for checkmark or 'false' for X mark.",
              type: "array",
              of: [
                defineArrayMember({
                  type: "string",
                  title: "Custom value",
                  placeholder: 'Text value like "Coming soon" or "UNLIMITED"',
                  description: 'Use "true" for checkmark, "false" for X mark, or custom text',
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
                  const docTiers = Array.isArray(doc.products)
                    ? doc.products
                    : [];
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
              name: "name",
            },
            prepare: ({ name }) => ({
              title: name,
            }),
          },
        }),
      ],
      validation: (Rule) => Rule.min(1).error("At least one feature is required"),
      group: "content",
    }),
  ],
  preview: {
    select: {
      title: "title",
      tiersCount: "products",
      categoriesCount: "features",
    },
    prepare: ({ title, tiersCount = [], categoriesCount = [] }) => ({
      title: title || "Product Comparison",
      subtitle: `${tiersCount.length} tiers • ${categoriesCount.length} features`,
      media: LuFileSymlink,
    }),
  },
}); 