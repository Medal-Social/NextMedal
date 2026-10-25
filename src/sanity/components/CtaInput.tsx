import { EarthGlobeIcon } from '@sanity/icons/EarthGlobe';
import { LinkIcon } from '@sanity/icons/Link';
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

// Helper to find member even if nested in Fieldset
const findMember = (members: ObjectInputProps['members'], memberName: string) => {
  // PROTECTION against undefined members
  if (!members) return undefined;

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

// Helper component for anchor selector
const AnchorSelector = ({
  anchors,
  value,
  onChange,
}: {
  anchors: Array<{ anchor: string; label: string }>;
  value: string;
  onChange: (value: string) => void;
}) => {
  if (anchors.length === 0) {
    return (
      <TextInput
        placeholder="e.g. features"
        value={value}
        onChange={(e) => onChange(e.currentTarget.value)}
        fontSize={2}
        padding={3}
      />
    );
  }

  return (
    <Select
      fontSize={2}
      padding={3}
      value={value}
      onChange={(e) => onChange(e.currentTarget.value)}
    >
      <option value="">Top of page</option>
      {anchors.map((anchor) => (
        <option key={anchor.anchor} value={`#${anchor.anchor}`}>
          {anchor.label}
        </option>
      ))}
    </Select>
  );
};

export function CtaInput(props: ObjectInputProps) {
  const { value, onChange, members, renderInput, renderItem, renderPreview } = props;

  const linkValue = value?.link || {};

  const isInternal = linkValue?.type === 'internal';
  const internalRef = linkValue?.internal?._ref;

  const { anchors } = usePageAnchors(internalRef);

  const handleLinkFieldChange = useCallback(
    (field: string, nextValue: string | boolean) => {
      onChange(nextValue ? set(nextValue, ['link', field]) : unset(['link', field]));
    },
    [onChange]
  );

  const handleToggleLinkType = useCallback(
    (type: 'internal' | 'external') => {
      if (type === 'internal') {
        onChange([set('internal', ['link', 'type']), unset(['link', 'external'])]);
      } else {
        onChange([
          set('external', ['link', 'type']),
          unset(['link', 'internal']),
          unset(['link', 'params']),
        ]);
      }
    },
    [onChange]
  );

  const linkMember = findMember(members, 'link');

  return (
    <Stack gap={4}>
      {/* ROW 1: Button text. How the button looks is decided by the block (blockDesign). */}
      <Box>
        <Label size={1} style={{ marginBottom: '6px' }}>
          Button text
        </Label>
        <TextInput
          value={linkValue?.label || ''}
          onChange={(e) => handleLinkFieldChange('label', e.currentTarget.value)}
          placeholder="e.g. Learn more"
          fontSize={2}
          padding={3}
        />
      </Box>

      {/* ROW 2: Destination Type Toggle */}
      <Box>
        <Label size={1} style={{ marginBottom: '6px' }}>
          Goes to
        </Label>
        <Flex
          style={{
            background: 'var(--card-bg-color)',
            border: '1px solid var(--card-border-color)',
            borderRadius: '3px',
            padding: '2px',
            maxWidth: '300px',
          }}
        >
          <Box flex={1}>
            <Button
              mode={isInternal ? 'default' : 'bleed'}
              tone={isInternal ? 'primary' : 'default'}
              icon={LinkIcon}
              text="This site"
              fontSize={1}
              padding={2}
              onClick={() => handleToggleLinkType('internal')}
              style={{ borderRadius: '2px', width: '100%' }}
            />
          </Box>
          <Box style={{ width: '1px', background: 'var(--card-border-color)', margin: '4px 0' }} />
          <Box flex={1}>
            <Button
              mode={!isInternal ? 'default' : 'bleed'}
              tone={!isInternal ? 'primary' : 'default'}
              icon={EarthGlobeIcon}
              text="Other website"
              fontSize={1}
              padding={2}
              onClick={() => handleToggleLinkType('external')}
              style={{ borderRadius: '2px', width: '100%' }}
            />
          </Box>
        </Flex>
      </Box>

      {/* ROW 3: The Actual Destination Input */}
      <Box>
        <Label size={1} style={{ marginBottom: '6px' }}>
          {isInternal ? 'Page' : 'Web address'}
        </Label>
        {isInternal ? (
          <Box>
            {linkMember ? (
              <MemberField
                member={linkMember}
                renderInput={renderInput}
                renderItem={renderItem}
                renderPreview={renderPreview}
                // Use renderInput as renderField to strip wrapper
                // biome-ignore lint/suspicious/noExplicitAny: Safely casting for Sanity UI compatibility
                renderField={renderInput as any}
              />
            ) : (
              <Text size={1} muted>
                Loading selector...
              </Text>
            )}
          </Box>
        ) : (
          <TextInput
            value={linkValue?.external || ''}
            onChange={(e) => handleLinkFieldChange('external', e.currentTarget.value)}
            placeholder="https://example.com"
            fontSize={2}
            padding={3}
          />
        )}
      </Box>

      {/* ROW 4: Options */}
      <Grid gridTemplateColumns={[1, 1, 2]} gap={4}>
        <Box>
          <Label size={1} style={{ marginBottom: '6px' }}>
            Section (optional)
          </Label>
          {isInternal ? (
            <AnchorSelector
              anchors={anchors}
              value={linkValue?.params || ''}
              onChange={(value) => handleLinkFieldChange('params', value)}
            />
          ) : (
            <TextInput
              placeholder="e.g. features"
              value={linkValue?.params || ''}
              onChange={(e) => handleLinkFieldChange('params', e.currentTarget.value)}
              fontSize={2}
              padding={3}
            />
          )}
        </Box>

        <Flex align="flex-end" paddingBottom={2}>
          <Flex align="center" gap={3}>
            <Switch
              checked={linkValue?.newTab || false}
              onChange={(e) => handleLinkFieldChange('newTab', e.currentTarget.checked)}
              id="ctaNewTab"
            />
            <Box>
              <Label as="label" htmlFor="ctaNewTab" size={1} style={{ cursor: 'pointer' }}>
                Open in new tab
              </Label>
              <Text size={1} muted>
                Opens the link in a new browser window
              </Text>
            </Box>
          </Flex>
        </Flex>
      </Grid>
    </Stack>
  );
}
