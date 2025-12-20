'use client';

import { Box, Button, Flex, Text, TextInput } from '@sanity/ui';
import { useState } from 'react';
import { VscCheck, VscCopy } from 'react-icons/vsc';

export const UidInputComponent = ({ elementProps, path }: any) => {
  const [checked, setChecked] = useState(false);
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
        icon={checked ? VscCheck : VscCopy}
        disabled={checked}
        onClick={() => {
          navigator.clipboard.writeText(`#${elementProps.value || moduleKey}`);
          setChecked(true);
          setTimeout(() => setChecked(false), 1000);
        }}
      />
    </Flex>
  );
};






