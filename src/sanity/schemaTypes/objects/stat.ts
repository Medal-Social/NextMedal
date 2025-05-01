/**
 * Stat Schema
 * @version 1.0.0
 * @lastUpdated 2024-06-18
 * @description Schema for statistics with value, label and icon
 */

import { BiStats } from 'react-icons/bi';
import { defineType } from 'sanity';

export default defineType({
  name: 'stat',
  title: 'Statistic',
  type: 'object',
  icon: BiStats,
  fields: [
    {
      name: 'value',
      title: 'Value',
      type: 'string',
      description: "The metric value (e.g. '10k+', '24%', etc.)",
      validation: (Rule) => Rule.required(),
    },
    {
      name: 'label',
      title: 'Label',
      type: 'string',
      description: "Description of the metric (e.g. 'Active users', 'Avg. engagement')",
      validation: (Rule) => Rule.required(),
    },
    {
      name: 'icon',
      title: 'Icon',
      type: 'icon',
      description: 'Icon to display with this stat',
    },
  ],
  preview: {
    select: {
      value: 'value',
      label: 'label',
    },
    prepare(selection) {
      const { value, label } = selection;
      return {
        title: value,
        subtitle: label,
        media: BiStats,
      };
    },
  },
});
