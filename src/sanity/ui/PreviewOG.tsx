'use client';

import { BASE_URL } from '@/lib/env';
import { Box, Button, Flex, Popover, Spinner, Text } from '@sanity/ui';
import { useState } from 'react';
import { VscEye, VscEyeClosed } from 'react-icons/vsc';

export default function PreviewOG({ title }: { title?: string }) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const url = `${BASE_URL}/api/og?title=${encodeURIComponent(title ?? '')}`;

  return (
    <Popover
      style={{ overflow: 'hidden' }}
      constrainSize
      animate
      placement="right-start"
      open={open}
      content={
        <Box style={{ display: 'grid', placeItems: 'center' }}>
          {isLoading && (
            <Flex style={{ gridArea: '1 / 1 / -1 / -1' }}>
              <Spinner muted />
            </Flex>
          )}

          {hasError && (
            <Flex 
              style={{ 
                gridArea: '1 / 1 / -1 / -1', 
                padding: '1rem',
                backgroundColor: 'var(--card-error-bg)',
              }}
            >
              <Text size={1}>Failed to load preview image</Text>
            </Flex>
          )}

          <img
            style={{
              gridArea: '1 / 1 / -1 / -1',
              position: 'relative',
              display: 'block',
              width: 300,
              height: 'auto',
              opacity: isLoading || hasError ? 0 : 1,
              transition: 'opacity 0.2s ease-in-out',
            }}
            src={url}
            width={1200}
            height={630}
            alt={`Open Graph preview for ${title || 'untitled page'}`}
            onLoad={() => {
              setIsLoading(false);
              setHasError(false);
            }}
            onError={() => {
              setIsLoading(false);
              setHasError(true);
            }}
          />
        </Box>
      }
    >
      <Button
        mode="bleed"
        padding={2}
        style={{ marginTop: -4 }}
        icon={open ? VscEyeClosed : VscEye}
        title="Preview Open Graph image"
        onClick={() => setOpen((o) => !o)}
      />
    </Popover>
  );
}
