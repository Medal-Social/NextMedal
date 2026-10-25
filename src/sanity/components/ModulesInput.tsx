/**
 * The page `modules` input: the developer showcase stays in the array's `of`
 * so the /components page validates and renders (Vault spec 2026-10-18 §2),
 * but no insert menu offers it.
 *
 * Sanity 6.10 reads insertable types from two places: the add button's
 * menu (All items, groups, search) from `props.schemaType.of`, and each
 * item's insert before / after menu from `member.parentSchemaType.of`, which
 * the form state sets to the unfiltered array type. Both are replaced here.
 *
 * Side effect: copy/paste checks pasted items against the filtered `of`, so
 * pasting a hidden (developer) block into a page is refused. Stored
 * ones keep rendering and validating; only new copies are blocked.
 */
import { useMemo } from 'react';
import type { ArrayOfObjectsInputProps, ArraySchemaType } from 'sanity';
import { DEVELOPER_BLOCK_NAMES } from '../schemaTypes/page-blocks';

const HIDDEN = new Set<string>(DEVELOPER_BLOCK_NAMES);

/** The array type with the developer block types left out of `of`. */
export function insertableSchemaType(schemaType: ArraySchemaType): ArraySchemaType {
  return { ...schemaType, of: schemaType.of.filter((type) => !HIDDEN.has(type.name)) };
}

/** Members whose insert before / after menus read the filtered array type. */
export function withParentSchemaType(
  members: ArrayOfObjectsInputProps['members'],
  schemaType: ArraySchemaType
): ArrayOfObjectsInputProps['members'] {
  return members.map((member) =>
    member.kind === 'item' ? { ...member, parentSchemaType: schemaType } : member
  );
}

export function insertableModulesProps(props: ArrayOfObjectsInputProps): ArrayOfObjectsInputProps {
  const schemaType = insertableSchemaType(props.schemaType);
  return { ...props, schemaType, members: withParentSchemaType(props.members, schemaType) };
}

export default function ModulesInput(props: ArrayOfObjectsInputProps) {
  // Stable across renders, so items are not re-rendered for a new parent type each time.
  const schemaType = useMemo(() => insertableSchemaType(props.schemaType), [props.schemaType]);
  const members = useMemo(
    () => withParentSchemaType(props.members, schemaType),
    [props.members, schemaType]
  );
  return props.renderDefault({ ...props, schemaType, members });
}
