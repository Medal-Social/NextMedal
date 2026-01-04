/**
 * Dashboard Tool for Sanity Studio
 *
 * Custom dashboard with personalized greetings, content statistics,
 * quick access navigation, and module reference.
 */

'use client';

import { MasterDetailIcon } from '@sanity/icons';
import { Box, Container, Flex, Stack } from '@sanity/ui';
import { memo } from 'react';
import type { Tool } from 'sanity';
import {
  ContentOverview,
  DashboardFooter,
  ModuleReference,
  QuickAccessGrid,
  WelcomeSection,
} from '@/components/dashboard';

// ============================================================================
// Exports for Testing (maintain compatibility with existing tests)
// ============================================================================

// Re-export types and utilities for existing tests
export { ContentOverview, handleCardKeyDown } from '@/components/dashboard';
// Re-export greeting utilities for existing tests
export {
  getDailySeed,
  getDayOfWeek,
  getGreeting,
  getSeason,
  getTimeOfDay,
  seededRandom,
} from '@/lib/dashboard/greeting-utils';

// ============================================================================
// Main Dashboard Component
// ============================================================================

const DashboardComponent = memo(function DashboardComponent() {
  return (
    <Flex direction="column" style={{ minHeight: '100%', backgroundColor: 'var(--card-bg-color)' }}>
      <Box paddingX={[4, 5, 6]} paddingTop={[5, 6]} paddingBottom={6} flex={1}>
        <Container width={4}>
          <Stack space={[5, 6]}>
            <WelcomeSection />
            <ContentOverview />
            <QuickAccessGrid />
            <ModuleReference />
          </Stack>
        </Container>
      </Box>
      <DashboardFooter />
    </Flex>
  );
});

// ============================================================================
// Tool Definition
// ============================================================================

export interface DashboardToolOptions {
  /** Custom title for the dashboard tab */
  title?: string;
}

export function dashboardTool(options?: DashboardToolOptions): Tool {
  return {
    name: 'dashboard',
    title: options?.title ?? 'Dashboard',
    icon: MasterDetailIcon,
    component: DashboardComponent,
  };
}
