import { describe, expect, it } from 'vitest';
import { schemaTypes } from '@/sanity/schemaTypes';
import { planMutations } from '$/migrations/lean-schema/index';
import { DELETE_TYPES, mapDocument } from '$/migrations/lean-schema/map-documents';

/**
 * Form submissions go to Medal Social only (owner decision 2026-10-19). The
 * production dataset is public, so a `lead` document would publish a
 * visitor's email, name and phone number.
 */
describe('no form submissions in Sanity', () => {
  it('has no lead document type', () => {
    const names = (schemaTypes as unknown as Array<{ name: string }>).map((t) => t.name);
    expect(names).not.toContain('lead');
  });

  it('the lean-schema migration deletes any lead document left in a dataset', () => {
    expect(DELETE_TYPES).toContain('lead');
    const lead = {
      _id: 'lead-0b6f',
      _type: 'lead',
      _rev: 'r1',
      email: 'visitor@example.com',
      source: { type: 'event', reference: { _type: 'reference', _ref: 'event-1' } },
    };
    expect(mapDocument(lead as never)).toEqual({ action: 'delete' });
    expect(planMutations([lead as never])).toEqual([
      expect.objectContaining({ type: 'delete', id: 'lead-0b6f' }),
    ]);
  });
});
