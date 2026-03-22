import { Box } from '@sanity/ui';
import { type FieldMember, type FieldSetMember, MemberField, type ObjectInputProps } from 'sanity';

/**
 * This component is used specifically for the 'link' field inside the CTA.
 * The CTA Input handles the main layout (Label, Style, External Link, etc.).
 * This component's ONLY job is to render the 'Internal Reference' picker
 * when the link type is 'internal'.
 *
 * It purposely ignores all other fields (label, type, external, params)
 * because they are already rendered by the parent CtaInput.
 */
const findMember = (members: ObjectInputProps['members'], memberName: string) => {
  if (!members || !Array.isArray(members)) return undefined;

  const direct = members.find((m) => m.kind === 'field' && m.name === memberName) as
    | FieldMember
    | undefined;
  if (direct) return direct;

  const fieldsets = members.filter((m) => m.kind === 'fieldSet') as FieldSetMember[];
  for (const fs of fieldsets) {
    const nested = fs.fieldSet.members.find((m) => m.kind === 'field' && m.name === memberName) as
      | FieldMember
      | undefined;
    if (nested) return nested;
  }
  return undefined;
};

export function CtaLinkInput(props: ObjectInputProps) {
  const { members, renderInput, renderItem, renderPreview, renderField } = props;

  const internalMember = findMember(members, 'internal');

  if (!internalMember) {
    return null;
  }

  return (
    <Box>
      <MemberField
        member={internalMember}
        renderInput={renderInput}
        renderItem={renderItem}
        renderPreview={renderPreview}
        renderField={renderField}
      />
    </Box>
  );
}
