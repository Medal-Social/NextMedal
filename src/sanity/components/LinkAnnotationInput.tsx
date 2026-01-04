import { Box, Button, Card, Flex, Label, Stack, Text, TextInput } from '@sanity/ui';
import { useCallback } from 'react';
import {
  type FieldMember,
  type FieldSetMember,
  MemberField,
  type ObjectInputProps,
  set,
  unset,
} from 'sanity';

export function LinkAnnotationInput(props: ObjectInputProps) {
  const { value, onChange, members, renderInput, renderItem, renderPreview, renderField } = props;

  const isInternal = value?.type === 'internal' || !value?.type;

  const handleFieldChange = useCallback(
    (field: string, nextValue: string | boolean) => {
      onChange(nextValue ? set(nextValue, [field]) : unset([field]));
    },
    [onChange]
  );

  const handleToggleLinkType = useCallback(() => {
    const nextType = isInternal ? 'external' : 'internal';
    onChange(set(nextType, ['type']));
  }, [isInternal, onChange]);

  // Helper to find member even if nested in Fieldset
  const findMember = (memberName: string) => {
    // 1. Check top-level
    const direct = members.find((m) => m.kind === 'field' && m.name === memberName) as
      | FieldMember
      | undefined;
    if (direct) return direct;

    // 2. Check inside fieldsets
    const fieldsets = members.filter((m) => m.kind === 'fieldSet') as FieldSetMember[];
    for (const fs of fieldsets) {
      const nested = fs.fieldSet.members.find((m) => m.kind === 'field' && m.name === memberName) as
        | FieldMember
        | undefined;
      if (nested) return nested;
    }
    return undefined;
  };

  // link.ts does not use fieldsets, but this is safer
  const internalMember = findMember('internal');

  return (
    <Card padding={0} border radius={3} overflow="hidden" tone="default">
      <Stack>
        {/* Row 1: Destination Area (No Label Row) */}
        <Box padding={3} style={{ borderBottom: '1px solid var(--card-border-color)' }}>
          <Label size={0} muted style={{ marginBottom: '0.5rem', display: 'block' }}>
            Destination
          </Label>
          <Flex
            align="center"
            gap={2}
            style={{
              background: 'var(--card-bg-color)',
              border: '1px solid var(--card-border-color)',
              borderRadius: '4px',
              padding: '4px',
            }}
          >
            <Button
              mode={isInternal ? 'default' : 'ghost'}
              tone={isInternal ? 'primary' : 'default'}
              text="Internal Page"
              onClick={() => !isInternal && handleToggleLinkType()}
              fontSize={1}
              padding={2}
              style={{ boxShadow: 'none' }}
            />
            <Button
              mode={!isInternal ? 'default' : 'ghost'}
              tone={!isInternal ? 'primary' : 'default'}
              text="External URL"
              onClick={() => isInternal && handleToggleLinkType()}
              fontSize={1}
              padding={2}
              style={{ boxShadow: 'none' }}
            />

            <Box flex={1} marginLeft={2}>
              {isInternal ? (
                <Box paddingY={2}>
                  {!internalMember ? (
                    <Text size={1} muted>
                      Loading...
                    </Text>
                  ) : (
                    <Text size={1} muted>
                      Select page below
                    </Text>
                  )}
                </Box>
              ) : (
                <TextInput
                  value={value?.external || ''}
                  onChange={(e) => handleFieldChange('external', e.currentTarget.value)}
                  placeholder="https://example.com"
                  border={false}
                />
              )}
            </Box>
          </Flex>

          {isInternal && internalMember && (
            <Box marginTop={3}>
              <Box>
                <MemberField
                  member={internalMember}
                  renderInput={renderInput}
                  renderItem={renderItem}
                  renderPreview={renderPreview}
                  renderField={renderField}
                />
              </Box>
            </Box>
          )}
        </Box>
      </Stack>
    </Card>
  );
}
