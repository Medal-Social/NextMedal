/**
 * Featured Hero Module Schema
 * @version 1.0.0
 * @lastUpdated 2024-03-26
 * @changelog
 * - 1.0.0: Initial version
 */

import { createAlignmentField } from "@/sanity/lib/schema-factory";
import { getBlockText } from "@/sanity/lib/utils";
import { BsColumnsGap } from "react-icons/bs";
import { defineField, defineType } from "sanity";

export default defineType({
  name: "featuredHero",
  title: "Featured Hero",
  icon: BsColumnsGap,
  type: "object",
  groups: [
    { name: "content", title: "Content", default: true },
    { name: "image", title: "Image" },
    { name: "features", title: "Feature Points" },
    { name: "options", title: "Layout Options" },
  ],
  fieldsets: [
    {
      name: "alignment",
      title: "Alignment",
      options: { columns: 2 },
    },
  ],
  fields: [
    defineField({
      name: "options",
      type: "module-options",
      group: "options",
    }),
    defineField({
      name: "pretitle",
      type: "string",
      group: "content",
    }),
    defineField({
      name: "content",
      type: "array",
      of: [{ type: "block" }],
      group: "content",
    }),
    defineField({
      name: "ctas",
      title: "Call-to-actions",
      type: "array",
      of: [{ type: "cta" }],
      group: "content",
    }),
    defineField({
      name: "image",
      type: "img",
      group: "image",
    }),
    createAlignmentField({
      name: "textAlign",
      title: "Text alignment",
      group: "options",
      fieldset: "alignment",
      initialValue: "left",
    }),
    defineField({
      name: "direction",
      title: "Image Direction",
      description: "Choose which side the image appears on",
      type: "string",
      options: {
        list: [
          { title: "Right Side", value: "right" },
          { title: "Left Side", value: "left" },
        ],
        layout: "radio",
      },
      initialValue: "right",
      group: "options",
    }),
    defineField({
      name: "features",
      title: "Feature Points",
      description: "Add feature points with icons",
      type: "array",
      of: [
        {
          type: "object",
          fields: [
            defineField({
              name: "name",
              title: "Feature Title",
              type: "string",
              validation: (Rule) =>
                Rule.required().error("Feature title is required"),
            }),
            defineField({
              name: "description",
              title: "Feature Description",
              type: "text",
              rows: 2,
              validation: (Rule) =>
                Rule.required().error("Feature description is required"),
            }),
            defineField({
              name: "icon",
              title: "Icon",
              type: "icon",
              validation: (Rule) =>
                Rule.required().error("Feature icon is required"),
            }),
          ],
          preview: {
            select: {
              title: "name",
              subtitle: "description",
              media: "icon",
            },
          },
        },
      ],
      group: "features",
    }),
  ],
  preview: {
    select: {
      title: "title",
      pretitle: "pretitle",
      media: "image",
      description: "description",
    },
    prepare: ({ title, pretitle, media, description }) => {
      return {
        title: title || getBlockText(description) || "Featured Hero",
        subtitle: pretitle || "Featured Hero",
        media: media?.image || BsColumnsGap,
      };
    },
  },
});
