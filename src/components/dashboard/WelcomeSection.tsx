/**
 * WelcomeSection Component
 *
 * Displays personalized greeting and rotating studio tips
 */

'use client';

import { InfoOutlineIcon } from '@sanity/icons';
import { Box, Card, Flex, Heading, Stack, Text } from '@sanity/ui';
import { memo, useEffect, useState } from 'react';
import { useCurrentUser } from 'sanity';
import { getGreeting } from '@/lib/dashboard/greeting-utils';
import { STUDIO_TIPS } from '@/sanity/tools/studio-tips';

const StudioTip = memo(function StudioTip() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  // Auto-rotate tips every 8 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setIsVisible(false);
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % STUDIO_TIPS.length);
        setIsVisible(true);
      }, 300);
    }, 8000);

    return () => clearInterval(interval);
  }, []);

  const tip = STUDIO_TIPS[currentIndex];

  return (
    <Box
      paddingY={3}
      paddingX={4}
      style={{
        borderLeft: '3px solid var(--card-focus-ring-color)',
        backgroundColor: 'var(--card-bg-color)',
        borderRadius: '4px',
        opacity: isVisible ? 1 : 0,
        transition: 'opacity 300ms ease-in-out',
      }}
    >
      <Flex align="center" gap={3} justify="space-between">
        <Flex align="center" gap={3} flex={1}>
          <Text size={1} muted>
            <InfoOutlineIcon />
          </Text>
          <Box flex={1}>
            <Flex align="baseline" gap={2} wrap="wrap">
              <Text size={1} muted style={{ textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Tip:
              </Text>
              <Text size={1} weight="medium">
                {tip.description}
              </Text>
              {tip.shortcut && (
                <Card
                  padding={1}
                  paddingX={2}
                  radius={2}
                  border
                  style={{ backgroundColor: 'var(--card-bg-color)' }}
                >
                  <Text size={0} muted style={{ fontFamily: 'monospace' }}>
                    {tip.shortcut}
                  </Text>
                </Card>
              )}
            </Flex>
          </Box>
        </Flex>
        <Text size={0} muted>
          {currentIndex + 1}/{STUDIO_TIPS.length}
        </Text>
      </Flex>
    </Box>
  );
});

export const WelcomeSection = memo(function WelcomeSection() {
  const currentUser = useCurrentUser();
  const firstName = currentUser?.name?.split(' ')[0];
  const greeting = getGreeting();

  return (
    <Stack space={4}>
      <Box>
        <Stack space={3}>
          <Heading as="h1" size={4} weight="bold">
            {firstName ? `${greeting}, ${firstName}` : 'Welcome to Your Studio'}
          </Heading>
          <Text size={2} muted>
            What would you like to work on today?
          </Text>
        </Stack>
      </Box>
      <StudioTip />
    </Stack>
  );
});
