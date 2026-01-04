import { EarthGlobeIcon, LinkIcon } from '@sanity/icons';
import { Box, Button, Flex, Grid, Label, Select, Stack, Switch, Text, TextInput } from '@sanity/ui';
import { useCallback } from 'react';
import {
  type FieldMember,
  type FieldSetMember,
  MemberField,
  type ObjectInputProps,
  set,
  unset,
} from 'sanity';
import { usePageAnchors } from '../hooks/usePageAnchors';

export function MenuItemInput(props: ObjectInputProps) {
  const { value, onChange, members, renderInput, renderItem, renderPreview, renderField } = props;

  const isInternal = value?.type === 'internal' || !value?.type;
  const internalRef = value?.internal?._ref;

  const { anchors } = usePageAnchors(internalRef);

  const handleFieldChange = useCallback(
    (field: string, nextValue: string | boolean) => {
      onChange(nextValue ? set(nextValue, [field]) : unset([field]));
    },
    [onChange]
  );

  const handleToggleLinkType = useCallback(
    (type: 'internal' | 'external') => {
      if (type === 'internal') {
        onChange([set('internal', ['type']), unset(['external'])]);
      } else {
        onChange([set('external', ['type']), unset(['internal']), unset(['params'])]);
      }
    },
    [onChange]
  );

  const findMember = (memberName: string) => {
    // ROBUST SAFETY CHECK
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

  const internalMember = findMember('internal');

  return (
    <Stack space={4}>
      {/* ROW 1: Labels & Text */}
      <Grid columns={[1, 1, 2]} gap={4}>
        <Box>
          <Label size={1} style={{ marginBottom: '8px' }}>
            Link Text
          </Label>
          <TextInput
            value={value?.label || ''}
            onChange={(e) => handleFieldChange('label', e.currentTarget.value)}
            placeholder="e.g. Services"
            fontSize={2}
            padding={3}
          />
        </Box>
        <Box>
          <Label size={1} style={{ marginBottom: '8px' }}>
            Type
          </Label>
          <Flex
            style={{
              background: 'var(--card-bg-color)',
              border: '1px solid var(--card-border-color)',
              borderRadius: '3px',
              padding: '2px',
            }}
          >
            <Box flex={1}>
              <Button
                mode={isInternal ? 'default' : 'bleed'}
                tone={isInternal ? 'primary' : 'default'}
                icon={LinkIcon}
                text="Internal"
                fontSize={1}
                padding={2}
                onClick={() => handleToggleLinkType('internal')}
                style={{ borderRadius: '2px', width: '100%' }}
              />
            </Box>
            <Box
              style={{ width: '1px', background: 'var(--card-border-color)', margin: '4px 0' }}
            />
            <Box flex={1}>
              <Button
                mode={!isInternal ? 'default' : 'bleed'}
                tone={!isInternal ? 'primary' : 'default'}
                icon={EarthGlobeIcon}
                text="External"
                fontSize={1}
                padding={2}
                onClick={() => handleToggleLinkType('external')}
                style={{ borderRadius: '2px', width: '100%' }}
              />
            </Box>
          </Flex>
        </Box>
      </Grid>

      {/* ROW 2: Destination */}
      <Box>
        <Label size={1} style={{ marginBottom: '8px' }}>
          Destination
        </Label>
        {isInternal ? (
          <Box>
            {internalMember ? (
              <MemberField
                member={internalMember}
                renderInput={renderInput}
                renderItem={renderItem}
                renderPreview={renderPreview}
                // Reverting to standard renderField to avoid any internal Sanity errors,
                // but dealing with the label being present.
                renderField={renderField}
              />
            ) : (
              <Text size={1} muted>
                Loading selector...
              </Text>
            )}
          </Box>
        ) : (
          <TextInput
            value={value?.external || ''}
            onChange={(e) => handleFieldChange('external', e.currentTarget.value)}
            placeholder="https://example.com"
            fontSize={2}
            padding={3}
          />
        )}
      </Box>

      {/* ROW 3: Options */}
      <Grid columns={[1, 1, 2]} gap={5}>
        {' '}
        {/* Increased gap here */}
        <Box>
          <Label size={1} style={{ marginBottom: '8px' }}>
            Section (Optional)
          </Label>
          {isInternal && anchors.length > 0 ? (
            <Select
              fontSize={2}
              padding={3}
              value={value?.params || ''}
              onChange={(e) => handleFieldChange('params', e.currentTarget.value)}
            >
              <option value="">Top of page</option>
              {anchors.map((a) => (
                <option key={a.anchor} value={`#${a.anchor}`}>
                  {a.type
                    ? a.type.charAt(0).toUpperCase() + a.type.slice(1).replace('-', ' ')
                    : 'Section'}
                  {a.isExplicit ? ` (#${a.anchor})` : ''}
                </option>
              ))}
            </Select>
          ) : (
            <TextInput
              placeholder="#section-id"
              value={value?.params || ''}
              onChange={(e) => handleFieldChange('params', e.currentTarget.value)}
              fontSize={2}
              padding={3}
            />
          )}
        </Box>
        <Box paddingBottom={2}>
          <Flex align="center" gap={4}>
            {' '}
            {/* Increased gap here */}
            <Switch
              checked={value?.newTab || false}
              onChange={(e) => handleFieldChange('newTab', e.currentTarget.checked)}
              id="menuNewTab"
              style={{ transform: 'scale(1.2)' }}
            />
            <Box>
              <Label
                htmlFor="menuNewTab"
                size={2}
                style={{ cursor: 'pointer', display: 'block', marginBottom: '4px' }}
              >
                Open in new tab
              </Label>
              <Text size={1} muted>
                Opens link in a new window
              </Text>
            </Box>
          </Flex>
        </Box>
      </Grid>
    </Stack>
  );
}
