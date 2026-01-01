/**
 * UidInputComponent
 * @version 1.0.2
 * @lastUpdated 2025-12-27
 * @description A custom Sanity Studio input component for unique identifiers (anchor links).
 * @changelog
 * - 1.0.2: Fixed type to use StringInputProps from Sanity
 * - 1.0.1: Added header documentation
 * - 1.0.0: Initial version
 */

'use client';

import { CopyIcon } from '@sanity/icons';
import { Box, Button, Flex, Text, TextInput, useToast } from '@sanity/ui';
import type { StringInputProps } from 'sanity';
import { logger } from '@/lib/core/logger';
import { copyToClipboard } from '@/lib/utils/clipboard';

export const UidInputComponent = (props: StringInputProps) => {
  const { elementProps, path } = props;
  const toast = useToast();
  const indexOfModule = (path as unknown[]).indexOf('modules');
  const moduleItem = path[indexOfModule + 1];
  const moduleKey =
    moduleItem && typeof moduleItem === 'object' && '_key' in moduleItem
      ? moduleItem._key
      : undefined;

  return (
    <Flex align="center" gap={1}>
      <Text muted>#</Text>
      <Box flex={1}>
        <TextInput {...elementProps} placeholder={moduleKey} />
      </Box>
      <Button
        title="Click to copy"
        mode="ghost"
        icon={CopyIcon}
        onClick={async () => {
          const valueToCopy = `#${elementProps.value || moduleKey}`;

          const success = await copyToClipboard(valueToCopy);

          if (success) {
            toast.push({
              status: 'success',
              title: 'Copied to clipboard',
            });
          } else {
            logger.error('Failed to copy to clipboard');
            toast.push({
              status: 'error',
              title: 'Failed to copy',
            });
          }
        }}
      />
    </Flex>
  );
};
