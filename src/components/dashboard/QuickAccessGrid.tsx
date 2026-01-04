/**
 * QuickAccessGrid Component
 *
 * Grid of quick access cards for navigation and external resources
 */

'use client';

import { Card, Flex, Grid, Label, Stack, Text } from '@sanity/ui';
import { memo, useCallback, useMemo } from 'react';
import { useProjectId } from 'sanity';
import { useRouter } from 'sanity/router';
import { getQuickActions } from '@/lib/dashboard/dashboard-data';
import { handleCardKeyDown } from './types';

export const QuickAccessGrid = memo(function QuickAccessGrid() {
  const router = useRouter();
  const projectId = useProjectId();
  const allActions = useMemo(() => getQuickActions(projectId), [projectId]);

  const handleNavigate = useCallback(
    (path: string) => {
      router.navigateUrl({ path });
    },
    [router]
  );

  return (
    <Stack space={4}>
      <Label size={1} muted>
        Quick Access
      </Label>
      <Grid columns={[1, 2, 4]} gap={4}>
        {allActions.map((item) => {
          if (item.type === 'internal') {
            const navigate = () => handleNavigate(item.path || '');
            return (
              <Card
                key={item.title}
                padding={4}
                radius={3}
                border
                style={{ cursor: 'pointer' }}
                onClick={navigate}
                onKeyDown={(event) => handleCardKeyDown(event, navigate)}
                tabIndex={0}
                role="button"
                aria-label={`${item.title}: ${item.description}`}
              >
                <Flex align="center" gap={4}>
                  <Text size={2}>
                    <item.icon />
                  </Text>
                  <Stack space={2}>
                    <Text size={2} weight="medium">
                      {item.title}
                    </Text>
                    <Text size={1} muted>
                      {item.description}
                    </Text>
                  </Stack>
                </Flex>
              </Card>
            );
          }

          // External link
          return (
            <Card
              key={item.title}
              as="a"
              href={item.href}
              target="_blank"
              rel="noopener noreferrer"
              padding={4}
              radius={3}
              border
              style={{ cursor: 'pointer', textDecoration: 'none' }}
              tabIndex={0}
              aria-label={`${item.title}: ${item.description}`}
            >
              <Flex align="center" gap={4}>
                <Text size={2}>
                  <item.icon />
                </Text>
                <Stack space={2}>
                  <Text size={2} weight="medium">
                    {item.title}
                  </Text>
                  <Text size={1} muted>
                    {item.description}
                  </Text>
                </Stack>
              </Flex>
            </Card>
          );
        })}
      </Grid>
    </Stack>
  );
});
