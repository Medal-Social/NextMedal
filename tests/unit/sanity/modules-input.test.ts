/**
 * Pinned to Sanity 6.10.1 (installed; package.json asks for 6.11): the
 * insert menus read their types from two places — the add button's menu
 * (All items, groups, search) from `props.schemaType.of`, and each item's
 * insert before / after menu from `member.parentSchemaType.of`. If an
 * upgrade moves either read site, this test still passes but the Studio
 * offers old blocks again: re-check both in the Studio after upgrading.
 */
import { describe, expect, it } from 'vitest';
import { insertableModulesProps } from '@/sanity/components/ModulesInput';
import modulesField from '@/sanity/schemaTypes/fragments/modules';
import { DEVELOPER_BLOCK_NAMES, PAGE_BLOCK_NAMES } from '@/sanity/schemaTypes/page-blocks';

const HIDDEN = [...DEVELOPER_BLOCK_NAMES];

// The compiled array type as Sanity hands it to the input: one member type per
// `of` entry of the real field, named after its type.
const field = modulesField as unknown as { name: string; of: Array<{ type: string }> };
const schemaType = {
  name: field.name,
  jsonType: 'array',
  of: field.of.map((member) => ({ name: member.type, jsonType: 'object' })),
};
const props = {
  schemaType,
  members: [
    { kind: 'item', key: 'a', parentSchemaType: schemaType, item: {} },
    { kind: 'error', key: 'b' },
  ],
  renderDefault: () => null,
};

describe('the page modules input', () => {
  const insertable = insertableModulesProps(props as never) as unknown as typeof props;
  const names = (type: typeof schemaType) => type.of.map((t) => t.name);

  it('starts from the real field, which still accepts the developer showcase', () => {
    for (const name of HIDDEN) expect(names(schemaType)).toContain(name);
  });

  it("offers only the 14 blocks in the add button's insert menu (All items, groups, search)", () => {
    expect(PAGE_BLOCK_NAMES).toHaveLength(14);
    expect(names(insertable.schemaType)).toEqual([...PAGE_BLOCK_NAMES]);
    for (const name of HIDDEN) expect(names(insertable.schemaType)).not.toContain(name);
  });

  it("offers only the 14 blocks in every item's insert before / after menu", () => {
    const item = insertable.members[0] as { parentSchemaType: typeof schemaType };
    expect(names(item.parentSchemaType)).toEqual([...PAGE_BLOCK_NAMES]);
    expect(insertable.members[1]).toBe(props.members[1]);
  });

  it('leaves the stored schema type untouched, so the showcase still validates', () => {
    expect(names(schemaType)).toContain('component-gallery');
  });
});
