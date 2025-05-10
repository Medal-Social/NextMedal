/**
 * Hero Section Module Schema
 * @version 1.1.0
 * @lastUpdated 2024-07-10
 * @changelog
 * - 1.1.0: Removed options field and options group for simplified schema
 * - 1.0.0: Initial version
 */

import { BsColumns } from "react-icons/bs";
import { defineField, defineType } from "sanity";

export default defineType({
  name: "hero",
  title: "Hero Section",
  icon: BsColumns,
  type: "object",
  groups: [
    { name: "content", title: "Content", default: true },
    { name: "image", title: "Image" },
  ],
  preview: {
    select: {
      title: "title",
      highlightedTitle: "highlightedTitle",
      pretitle: "pretitle",
      media: "image",
    },
    prepare: ({ title, highlightedTitle, pretitle, media }) => {
      return {
        title: title || "Hero Section",
        subtitle: pretitle || (highlightedTitle ? `Highlighted: ${highlightedTitle}` : "Hero Section"),
        media: media?.image || BsColumns,
      };
    },
  },
  fields: [
    defineField({
      name: "pretitle",
      title: "Pre-title",
      description: "Small badge text displayed above the title",
      type: "string",
      group: "content",
    }),
    defineField({
      name: "highlightedTitle",
      title: "Highlighted Title",
      description: "This text will appear highlighted above the main title",
      type: "string",
      group: "content",
    }),
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      group: "content",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "description",
      title: "Description",
      type: "text",
      rows: 3,
      group: "content",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "ctas",
      title: "Call-to-actions",
      description: "Add buttons for the hero section",
      type: "array",
      of: [{ type: "cta" }],
      group: "content",
    }),
    defineField({
      name: "image",
      title: "Image",
      type: "img",
      group: "image",
    }),
  ],
}); 