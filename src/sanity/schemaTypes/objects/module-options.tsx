/**
 * Module Options Schema
 * @version 1.1.0
 * @lastUpdated 2025-12-31
 * @description Advanced module options for anchor linking and deep navigation.
 * @changelog
 * - 1.1.0: Renamed uid → anchorId, improved descriptions, made collapsible by default
 * - 1.0.1: Updated header documentation
 * - 1.0.0: Initial version
 */

'use client';

import { CheckmarkIcon, CopyIcon } from '@sanity/icons';
import { Box, Button, Flex, Text, TextInput } from '@sanity/ui';
import { useState } from 'react';
import { defineField, defineType } from 'sanity';
import { copyToClipboard } from '@/lib/utils/clipboard';

export default defineType({
  name: 'module-options',
  title: 'Advanced Options',
  type: 'object',
  options: {
    collapsible: true,
    collapsed: true,
  },
  fields: [
    defineField({
      name: 'anchorId',
      title: 'Anchor ID',
      description:
        'Custom URL identifier (e.g., #pricing). If left empty, a system-generated ID will be used.',
      type: 'string',
      validation: (Rule) =>
        Rule.regex(/^[a-zA-Z0-9-]+$/g).error('Must not contain spaces or special characters'),
      components: {
        input: ({ elementProps, path }) => {
          const indexOfModule = path.indexOf('modules');
          const moduleItem = path[indexOfModule + 1];
          const moduleKey =
            typeof moduleItem === 'object' ? (moduleItem as { _key?: string })?._key : undefined;
          const [checked, setChecked] = useState(false);

          return (
            <Flex align="center" gap={1}>
              <Text muted>#</Text>

              <Box flex={1}>
                <TextInput {...elementProps} placeholder={moduleKey} />
              </Box>

              <Button
                title="Click to copy"
                mode="ghost"
                icon={checked ? CheckmarkIcon : CopyIcon}
                disabled={checked}
                onClick={async () => {
                  const textToCopy = `#${elementProps.value || moduleKey}`;
                  const success = await copyToClipboard(textToCopy);

                  if (success) {
                    setChecked(true);
                    setTimeout(() => setChecked(false), 1000);
                  } else {
                    // Still show the checkmark briefly to indicate the attempt
                    setChecked(true);
                    setTimeout(() => setChecked(false), 500);
                  }
                }}
              />
            </Flex>
          );
        },
      },
    }),
  ],
});
