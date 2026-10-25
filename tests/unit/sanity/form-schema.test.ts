import { describe, expect, it } from 'vitest';
import form from '@/sanity/schemaTypes/documents/shared/form';

type Field = { name: string; title?: string; type: string; fieldset?: string; fields?: Field[] };

describe('form schema texts', () => {
  const fields = (form as unknown as { fields: Field[] }).fields;
  const byName = (name: string) => fields.find((f) => f.name === name);

  it('lets editors set the button, thank-you and consent texts per language', () => {
    expect(byName('submitButtonText')).toMatchObject({
      title: 'Send button text',
      type: 'internationalizedArrayString',
      fieldset: 'texts',
    });
    expect(byName('successMessage')).toMatchObject({
      title: 'Thank-you message',
      type: 'internationalizedArrayText',
      fieldset: 'texts',
    });
    const acceptance = byName('acceptance');
    expect(acceptance).toMatchObject({ title: 'Consent checkbox', fieldset: 'texts' });
    expect(acceptance?.fields?.map((f) => [f.name, f.type])).toEqual([
      ['text', 'internationalizedArrayString'],
      ['link', 'menuItem'],
    ]);
  });
});
