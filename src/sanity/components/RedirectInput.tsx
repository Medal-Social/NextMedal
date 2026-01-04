import { Box, Button, Card, Flex, Label, Stack, Text, TextInput } from '@sanity/ui';
import { useCallback } from 'react';
import { type FieldMember, MemberField, type ObjectInputProps, set, unset } from 'sanity';

export function RedirectInput(props: ObjectInputProps) {
  const { value, onChange, members, renderInput, renderItem, renderPreview } = props;

  const isInternal = value?.type === 'internal';

  const handleToggleLinkType = useCallback(() => {
    const nextType = isInternal ? 'external' : 'internal';
    const fieldToClear = isInternal ? 'internal' : 'external';

    onChange([set(nextType, ['type']), unset([fieldToClear])]);
  }, [isInternal, onChange]);

  const handleFieldChange = useCallback(
    (field: string, nextValue: string) => {
      onChange(nextValue ? set(nextValue, [field]) : unset([field]));
    },
    [onChange]
  );

  // We need to find the members for 'internal' and 'external' to render them properly
  // or render them manually if we want the custom design.
  // The 'internal' member is a Reference field.
  const internalMember = members.find((m) => m.kind === 'field' && m.name === 'internal') as
    | FieldMember
    | undefined;

  return (
    <Card padding={3} border radius={3} tone="default">
      <Stack space={3}>
        <Label size={0} muted>
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
                <Text size={1} muted>
                  Select page below
                </Text>
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
          <Box style={{ opacity: 0.8 }}>
            {/* Render the internal reference picker */}
            <MemberField
              member={internalMember}
              renderInput={renderInput}
              renderItem={renderItem}
              renderPreview={renderPreview}
              renderField={props.renderField}
            />
          </Box>
        )}
      </Stack>
    </Card>
  );
}
