import { defineField } from 'sanity';
import { UidInputComponent } from './UidInputComponent';

export function createUidField() {
  return defineField({
    name: 'uid',
    title: 'Unique identifier',
    description: 'Used for anchor/jump links (HTML `id` attribute).',
    type: 'string',
    validation: (Rule) =>
      Rule.regex(/^[a-zA-Z0-9-]+$/g).error('Must not contain spaces or special characters'),
    components: {
      input: UidInputComponent,
    },
  });
}
