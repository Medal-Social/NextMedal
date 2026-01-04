/**
 * UID Input Schema Helper
 * @version 1.0.1
 * @lastUpdated 2025-12-23
 * @description Helper function to create a standardized unique identifier field for modules.
 * @changelog
 * - 1.0.1: Added header documentation
 * - 1.0.0: Initial version
 */

import { defineField } from 'sanity';
import { UidInputComponent } from './UidInputComponent';

export function createUidField() {
  return defineField({
    name: 'anchorId',
    title: 'Anchor ID',
    description:
      'Custom URL identifier (e.g., #pricing). If left empty, a system-generated ID will be used.',
    type: 'string',
    validation: (Rule) =>
      Rule.regex(/^[a-zA-Z0-9-]+$/g).error('Must not contain spaces or special characters'),
    components: {
      input: UidInputComponent,
    },
  });
}
