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

// Helper to format anchor label
const formatAnchorLabel = (anchor: { anchor: string; type?: string; isExplicit?: boolean }) => {
  const typeLabel = anchor.type
    ? anchor.type.charAt(0).toUpperCase() + anchor.type.slice(1).replace('-', ' ')
    : 'Section';
  return anchor.isExplicit ? `${typeLabel} (#${anchor.anchor})` : typeLabel;
};

// Helper component for anchor selector
const AnchorSelector = ({
  anchors,
  value,
  onChange,
}: {
  anchors: Array<{ anchor: string; type?: string; isExplicit?: boolean }>;
  value: string;
  onChange: (value: string) => void;
}) => {
  if (anchors.length === 0) {
    return (
      <TextInput
        placeholder="#section-id"
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
          {formatAnchorLabel(anchor)}
        </option>
      ))}
    </Select>
  );
};

export function CtaInput(props: ObjectInputProps) {
  const { value, onChange, members, renderInput, renderItem, renderPreview } = props;

  const linkValue = value?.link || {};
  const styleValue = value?.style || 'primary';

  const isInternal = linkValue?.type === 'internal';
  const internalRef = linkValue?.internal?._ref;

  const { anchors } = usePageAnchors(internalRef);

  const handleCtaFieldChange = useCallback(
    (field: string, nextValue: string | boolean) => {
      onChange(nextValue ? set(nextValue, [field]) : unset([field]));
    },
    [onChange]
  );

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
    <Stack space={4}>
      {/* ROW 1: Labels & Text */}
      <Grid columns={[1, 1, 2]} gap={4}>
        <Box>
          <Label size={1} style={{ marginBottom: '6px' }}>
            Button Text
          </Label>
          <TextInput
            value={linkValue?.label || ''}
            onChange={(e) => handleLinkFieldChange('label', e.currentTarget.value)}
            placeholder="e.g. Learn More"
            fontSize={2}
            padding={3}
          />
        </Box>
        <Box>
          <Label size={1} style={{ marginBottom: '6px' }}>
            Variant
          </Label>
          <Select
            value={styleValue}
            onChange={(e) => handleCtaFieldChange('style', e.currentTarget.value)}
            fontSize={2}
            padding={3}
          >
            <option value="primary">Primary (Filled)</option>
            <option value="ghost">Secondary (Ghost)</option>
            <option value="link">Link Only</option>
          </Select>
        </Box>
      </Grid>

      {/* ROW 2: Destination Type Toggle */}
      <Box>
        <Label size={1} style={{ marginBottom: '6px' }}>
          Destination Type
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
              text="Internal"
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
              text="External"
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
          Destination
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
      <Grid columns={[1, 1, 2]} gap={4}>
        <Box>
          <Label size={1} style={{ marginBottom: '6px' }}>
            Section (Optional)
          </Label>
          {isInternal ? (
            <AnchorSelector
              anchors={anchors}
              value={linkValue?.params || ''}
              onChange={(value) => handleLinkFieldChange('params', value)}
            />
          ) : (
            <TextInput
              placeholder="#section-id"
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
              <Label htmlFor="ctaNewTab" size={1} style={{ cursor: 'pointer' }}>
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
