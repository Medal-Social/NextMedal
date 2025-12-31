/**
 * Lead Magnet Module Schema
 * @version 2.3.1
 * @lastUpdated 2025-12-23
 * @description Flexible lead generation module with refined Studio UX.
 * @changelog
 * - 2.3.1: Updated header documentation
 * - 2.3.0: Refined Studio UX and validation
 */

import { DownloadIcon } from '@sanity/icons';
import { defineField, defineType } from 'sanity';
import { createUidField } from '../ui/uid-input';

export default defineType({
  name: 'lead-magnet',
  title: 'Lead Magnet',
  icon: DownloadIcon,
  type: 'object',
  groups: [
    { name: 'content', title: 'Content', default: true },
    { name: 'options', title: 'Advanced Options' },
  ],
  fields: [
    defineField({
      name: 'style',
      title: 'Visual Style',
      description: 'Choose the overall look and feel of the lead magnet.',
      type: 'string',
      options: {
        list: [
          { title: 'Featured (Large)', value: 'featured' },
          { title: 'Sidebar (Small)', value: 'sidebar' },
        ],
      },
      initialValue: 'featured',
      group: 'content',
    }),
    defineField({
      name: 'content',
      title: 'Content',
      description: 'The main text content. Use H2/H3 for headlines and lists for benefits.',
      type: 'array',
      of: [
        {
          type: 'block',
          styles: [
            { title: 'Normal', value: 'normal' },
            { title: 'Heading 2', value: 'h2' },
            { title: 'Heading 3', value: 'h3' },
          ],
          lists: [{ title: 'Bullet', value: 'bullet' }],
          marks: {
            decorators: [
              { title: 'Strong', value: 'strong' },
              { title: 'Emphasis', value: 'em' },
            ],
          },
        },
      ],
      group: 'content',
      initialValue: [
        {
          _type: 'block',
          style: 'h2',
          children: [{ _type: 'span', text: 'Get your free resource' }],
        },
        {
          _type: 'block',
          style: 'normal',
          children: [
            {
              _type: 'span',
              text: 'Download this exclusive guide to learn the best practices and strategies for your business.',
            },
          ],
        },
        {
          _type: 'block',
          style: 'normal',
          listItem: 'bullet',
          children: [{ _type: 'span', text: 'Step-by-step implementation guide' }],
        },
        {
          _type: 'block',
          style: 'normal',
          listItem: 'bullet',
          children: [{ _type: 'span', text: 'Exclusive industry insights' }],
        },
        {
          _type: 'block',
          style: 'normal',
          listItem: 'bullet',
          children: [{ _type: 'span', text: 'Proven templates and checklists' }],
        },
      ],
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'image',
      title: 'Resource Image',
      description:
        'A professional mockup or cover image of your resource (e.g., Book cover, Course preview).',
      type: 'img',
      group: 'content',
      hidden: ({ parent }) => parent?.style === 'sidebar',
    }),
    defineField({
      name: 'buttonText',
      title: 'Button Text',
      description: 'The text displayed on the button that triggers the form modal',
      type: 'string',
      initialValue: 'Download now',
      group: 'content',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'form',
      title: 'Form',
      description: 'Select the form document to capture leads',
      type: 'reference',
      to: [{ type: 'form' }],
      group: 'content',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'options',
      type: 'object',
      title: 'Advanced Options',
      group: 'options',
      fields: [createUidField()],
    }),
  ],
  preview: {
    select: {
      content: 'content',
      media: 'image.image',
      style: 'style',
    },
    prepare({ content, media, style }) {
      type BlockItem = { _type: string; children?: Array<{ text?: string }> };
      const block = (content || []).find((b: BlockItem) => b._type === 'block') as
        | BlockItem
        | undefined;
      const title =
        block?.children
          ?.map((child) => child.text)
          .filter(Boolean)
          .join('') || 'Lead Magnet';
      return {
        title,
        subtitle: `Lead Magnet • ${style === 'sidebar' ? 'Sidebar' : 'Featured'}`,
        media: media || DownloadIcon,
      };
    },
  },
});
