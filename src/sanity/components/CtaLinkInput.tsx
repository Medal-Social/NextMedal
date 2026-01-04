import { Box } from '@sanity/ui';
import { type FieldMember, MemberField, type ObjectInputProps } from 'sanity';

/**
 * This component is used specifically for the 'link' field inside the CTA.
 * The CTA Input handles the main layout (Label, Style, External Link, etc.).
 * This component's ONLY job is to render the 'Internal Reference' picker
 * when the link type is 'internal'.
 *
 * It purposely ignores all other fields (label, type, external, params)
 * because they are already rendered by the parent CtaInput.
 */
export function CtaLinkInput(props: ObjectInputProps) {
  const { members, renderInput, renderItem, renderPreview, renderField } = props;

  // We only want to render the 'internal' field (the reference picker)
  const internalMember = members.find((m) => m.kind === 'field' && m.name === 'internal') as
    | FieldMember
    | undefined;

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
