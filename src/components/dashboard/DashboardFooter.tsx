/**
 * DashboardFooter Component
 *
 * Footer section with branding and social links
 */

'use client';

import { Box, Button, Card, Flex, Text } from '@sanity/ui';
import { memo } from 'react';
import { SOCIAL_LINKS } from '@/lib/dashboard/dashboard-data';

export const DashboardFooter = memo(function DashboardFooter() {
  return (
    <Box marginTop={6} paddingBottom={4}>
      <Flex justify="center">
        <Card
          radius={4}
          border
          padding={2}
          shadow={2}
          style={{ width: 'fit-content', maxWidth: '100%' }}
        >
          <Flex align="center" gap={[3, 4]} paddingX={[2, 3]} wrap="wrap" justify="center">
            <Flex align="center" gap={2}>
              <Text size={1} weight="bold">
                NextMedal
              </Text>
              <Text size={1} muted>
                by{' '}
                <a
                  href="https://www.medalsocial.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: 'inherit', textDecoration: 'none' }}
                >
                  Medal Social
                </a>
              </Text>
            </Flex>

            <Box
              aria-hidden="true"
              style={{
                width: 1,
                height: 16,
                backgroundColor: 'var(--card-border-color)',
              }}
            />

            <Flex gap={1}>
              {SOCIAL_LINKS.map((link) => (
                <Button
                  key={link.label}
                  as="a"
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  mode="bleed"
                  icon={link.icon}
                  aria-label={link.label}
                  title={link.label}
                />
              ))}
            </Flex>
          </Flex>
        </Card>
      </Flex>
    </Box>
  );
});
