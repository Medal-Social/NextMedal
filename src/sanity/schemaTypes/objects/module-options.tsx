/**
 * Module Options Schema
 * @version 1.0.1
 * @lastUpdated 2025-12-23
 * @description Common options for modules, such as custom anchors/IDs.
 * @changelog
 * - 1.0.1: Updated header documentation
 * - 1.0.0: Initial version
 */

'use client';

import { CheckmarkIcon, CopyIcon } from '@sanity/icons';
import { Box, Button, Flex, Text, TextInput } from '@sanity/ui';
import { useState } from 'react';
import { defineField, defineType } from 'sanity';

export default defineType({
  name: 'module-options',
  title: 'Module Options',
  type: 'object',
  fields: [
    defineField({
      name: 'uid',
      title: 'Unique identifier',
      description: 'Used for anchor/jump links (HTML `id` attribute).',
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
                onClick={() => {
                  navigator.clipboard.writeText(`#${elementProps.value || moduleKey}`);

                  setChecked(true);
                  setTimeout(() => setChecked(false), 1000);
                }}
              />
            </Flex>
          );
        },
      },
    }),
  ],
});
