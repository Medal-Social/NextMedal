/**
 * UidInputComponent
 * @version 1.0.1
 * @lastUpdated 2025-12-23
 * @description A custom Sanity Studio input component for unique identifiers (anchor links).
 * @changelog
 * - 1.0.1: Added header documentation
 * - 1.0.0: Initial version
 */

'use client';

import { Box, Button, Flex, Text, TextInput, useToast } from '@sanity/ui';
import { VscCopy } from 'react-icons/vsc';
import { logger } from '@/lib/logger';

export const UidInputComponent = ({ elementProps, path }: any) => {
  const toast = useToast();
  const indexOfModule = path.indexOf('modules');
  const moduleKey = (path[indexOfModule + 1] as any)?._key;

  return (
    <Flex align="center" gap={1}>
      <Text muted>#</Text>
      <Box flex={1}>
        <TextInput {...elementProps} placeholder={moduleKey} />
      </Box>
      <Button
        title="Click to copy"
        mode="ghost"
        icon={VscCopy}
        onClick={() => {
          const valueToCopy = `#${elementProps.value || moduleKey}`;

          if (!navigator?.clipboard) {
            toast.push({
              status: 'error',
              title: 'Clipboard not available',
            });
            return;
          }

          navigator.clipboard
            .writeText(valueToCopy)
            .then(() => {
              toast.push({
                status: 'success',
                title: 'Copied to clipboard',
              });
            })
            .catch((err) => {
              logger.error({ err }, 'Failed to copy:');
              toast.push({
                status: 'error',
                title: 'Failed to copy',
              });
            });
        }}
      />
    </Flex>
  );
};
