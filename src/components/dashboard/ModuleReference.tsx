/**
 * ModuleReference Component
 *
 * Visual reference guide for available Sanity modules
 */

'use client';

import { Box, Card, Flex, Label, Stack, Text } from '@sanity/ui';
import { memo } from 'react';
import dashboardImage from '@/sanity/assets/dashboard.png';

export const ModuleReference = memo(function ModuleReference() {
  return (
    <Stack space={4}>
      <Label size={1} muted>
        Module Reference
      </Label>
      <Card padding={4} radius={3} border>
        <Stack space={3}>
          <Flex align="center" justify="space-between">
            <Text size={2} weight="semibold">
              Available Modules
            </Text>
            <Text size={1} muted>
              Quick visual guide
            </Text>
          </Flex>
          <Box
            style={{
              position: 'relative',
              width: '100%',
              borderRadius: '8px',
              overflow: 'hidden',
            }}
          >
            {/* biome-ignore lint/performance/noImgElement: Sanity Studio component, not Next.js */}
            <img
              src={dashboardImage.src}
              alt="Module reference showing all available modules organized by category"
              style={{
                width: '100%',
                height: 'auto',
                display: 'block',
              }}
            />
          </Box>
        </Stack>
      </Card>
    </Stack>
  );
});
