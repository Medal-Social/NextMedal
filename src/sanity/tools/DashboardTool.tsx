'use client';

import {
  AddUserIcon,
  BookIcon,
  ClockIcon,
  CogIcon,
  DatabaseIcon,
  DocumentsIcon,
  EyeOpenIcon,
  LaunchIcon,
  MasterDetailIcon,
  PlayIcon,
  StackCompactIcon,
} from '@sanity/icons';
import { Box, Button, Card, Container, Flex, Grid, Heading, Label, Stack, Text } from '@sanity/ui';
import { type KeyboardEvent, memo, useCallback, useMemo } from 'react';
import { type Tool, useCurrentUser, useProjectId } from 'sanity';
import { useRouter } from 'sanity/router';
import { IconGithub, IconLinkedinIn, IconTwitterX } from '@/components/icons/social-icons';

// ============================================================================
// Types
// ============================================================================

interface NavigationCard {
  title: string;
  description: string;
  path: string;
  icon: React.ReactNode;
  tone?: 'primary' | 'positive' | 'caution' | 'critical' | 'default';
}

interface ResourceLink {
  title: string;
  description: string;
  href: string;
  icon: React.ReactNode;
}

// ============================================================================
// Constants
// ============================================================================

const VISUAL_EDITOR_CARD: NavigationCard = {
  title: 'Visual Editor',
  description: 'Edit content visually with live preview',
  path: '/studio/editor',
  icon: <EyeOpenIcon />,
  tone: 'primary',
};

const STRUCTURE_CARD: NavigationCard = {
  title: 'Content Library',
  description: 'Browse and organize all your documents',
  path: '/studio/structure',
  icon: <DatabaseIcon />,
  tone: 'default',
};

const QUICK_NAVIGATION: NavigationCard[] = [
  {
    title: 'Pages',
    description: 'Manage pages',
    path: '/studio/structure/page',
    icon: <DocumentsIcon />,
  },
  {
    title: 'Collections',
    description: 'Blog, docs & more',
    path: '/studio/structure/collections',
    icon: <StackCompactIcon />,
  },
  {
    title: 'Settings',
    description: 'Site config',
    path: '/studio/structure/site',
    icon: <CogIcon />,
  },
];

const LEARNING_RESOURCES: ResourceLink[] = [
  {
    title: 'Docs',
    description: 'Guides & Refs',
    href: 'https://www.nextmedal.com',
    icon: <BookIcon />,
  },
  {
    title: 'Videos',
    description: 'Tutorials',
    href: 'https://youtube.com/@medalsocial',
    icon: <PlayIcon />,
  },
  {
    title: 'Updates',
    description: 'Changelog',
    href: 'https://github.com/Medal-Social/NextMedal/releases',
    icon: <ClockIcon />,
  },
];

// ============================================================================
// Utilities
// ============================================================================

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

function handleCardKeyDown(event: KeyboardEvent<HTMLDivElement>, onClick: () => void): void {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault();
    onClick();
  }
}

// ============================================================================
// Components
// ============================================================================

const WelcomeSection = memo(function WelcomeSection() {
  const currentUser = useCurrentUser();
  const firstName = currentUser?.name?.split(' ')[0];
  const greeting = getGreeting();

  return (
    <Box>
      <Stack space={5}>
        <Heading as="h1" size={4} weight="bold">
          {firstName ? `${greeting}, ${firstName}` : 'Welcome to Your Studio'}
        </Heading>
        <Text size={2} muted>
          What would you like to work on today?
        </Text>
      </Stack>
    </Box>
  );
});

const PrimaryActions = memo(function PrimaryActions() {
  const router = useRouter();

  const navigateToVisualEditor = useCallback(() => {
    router.navigateUrl({ path: VISUAL_EDITOR_CARD.path });
  }, [router]);

  const navigateToStructure = useCallback(() => {
    router.navigateUrl({ path: STRUCTURE_CARD.path });
  }, [router]);

  return (
    <Grid columns={[1, 1, 2]} gap={[4, 5]}>
      <Card
        padding={[4, 5]}
        radius={4}
        shadow={2}
        tone="primary"
        style={{ cursor: 'pointer' }}
        onClick={navigateToVisualEditor}
        onKeyDown={(event) => handleCardKeyDown(event, navigateToVisualEditor)}
        tabIndex={0}
        role="button"
        aria-label={`${VISUAL_EDITOR_CARD.title}: ${VISUAL_EDITOR_CARD.description}`}
      >
        <Flex align="center" gap={3}>
          <Box
            padding={2}
            style={{
              backgroundColor: 'rgba(255,255,255,0.25)',
              borderRadius: '8px',
              color: 'inherit',
            }}
          >
            <Text size={3} weight="bold" style={{ color: 'inherit' }}>
              {VISUAL_EDITOR_CARD.icon}
            </Text>
          </Box>
          <Stack space={2}>
            <Heading size={2} style={{ color: 'inherit' }}>
              {VISUAL_EDITOR_CARD.title}
            </Heading>
            <Text size={2} style={{ color: 'inherit', opacity: 0.9 }}>
              {VISUAL_EDITOR_CARD.description}
            </Text>
          </Stack>
        </Flex>
      </Card>

      <Card
        padding={[4, 5]}
        radius={4}
        border
        style={{ cursor: 'pointer' }}
        onClick={navigateToStructure}
        onKeyDown={(event) => handleCardKeyDown(event, navigateToStructure)}
        tabIndex={0}
        role="button"
        aria-label={`${STRUCTURE_CARD.title}: ${STRUCTURE_CARD.description}`}
      >
        <Flex align="center" gap={3}>
          <Box
            padding={2}
            style={{
              backgroundColor: 'var(--card-bg-color)',
              border: '1px solid var(--card-border-color)',
              borderRadius: '8px',
            }}
          >
            <Text size={3}>{STRUCTURE_CARD.icon}</Text>
          </Box>
          <Stack space={2}>
            <Heading size={2}>{STRUCTURE_CARD.title}</Heading>
            <Text size={2} muted>
              {STRUCTURE_CARD.description}
            </Text>
          </Stack>
        </Flex>
      </Card>
    </Grid>
  );
});

const SecondaryActions = memo(function SecondaryActions() {
  const router = useRouter();

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
      <Grid columns={[1, 2, 3]} gap={4}>
        {QUICK_NAVIGATION.map((item) => {
          const navigate = () => handleNavigate(item.path);
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
                <Text size={2}>{item.icon}</Text>
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

const TeamAndLearning = memo(function TeamAndLearning() {
  const projectId = useProjectId();
  const manageUrl = useMemo(
    () => `https://www.sanity.io/manage/project/${projectId}/members`,
    [projectId]
  );

  return (
    <Grid columns={[1, 1, 2]} gap={5}>
      <Stack space={4}>
        <Label size={1} muted>
          Team
        </Label>
        <Card padding={4} radius={3} border style={{ height: '100%', boxSizing: 'border-box' }}>
          <Flex align="center" justify="space-between" gap={4}>
            <Flex align="center" gap={3}>
              <Text size={2}>
                <AddUserIcon />
              </Text>
              <Stack space={2}>
                <Text size={2} weight="semibold">
                  Collaborate
                </Text>
                <Text size={1} muted>
                  Invite your team
                </Text>
              </Stack>
            </Flex>
            <Button
              as="a"
              href={manageUrl}
              target="_blank"
              rel="noopener noreferrer"
              text="Manage Team"
              mode="ghost"
              icon={LaunchIcon}
              fontSize={1}
            />
          </Flex>
        </Card>
      </Stack>

      <Stack space={4}>
        <Label size={1} muted>
          Resources
        </Label>
        <Card padding={4} radius={3} border style={{ height: '100%', boxSizing: 'border-box' }}>
          <Flex gap={4} justify="space-between">
            {LEARNING_RESOURCES.map((resource) => (
              <Flex
                key={resource.title}
                as="a"
                href={resource.href}
                target="_blank"
                rel="noopener noreferrer"
                direction="column"
                align="center"
                gap={2}
                style={{ textDecoration: 'none', color: 'inherit', flex: 1 }}
              >
                <Text size={2}>{resource.icon}</Text>
                <Text size={1} weight="medium">
                  {resource.title}
                </Text>
              </Flex>
            ))}
          </Flex>
        </Card>
      </Stack>
    </Grid>
  );
});

const SOCIAL_LINKS = [
  { href: 'https://github.com/Medal-Social', icon: IconGithub, label: 'GitHub' },
  { href: 'https://x.com/medalsocial', icon: IconTwitterX, label: 'X (Twitter)' },
  { href: 'https://linkedin.com/company/medalsocial', icon: IconLinkedinIn, label: 'LinkedIn' },
] as const;

const FooterSection = memo(function FooterSection() {
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

// ============================================================================
// Main Component
// ============================================================================

const DashboardComponent = memo(function DashboardComponent() {
  return (
    <Flex direction="column" style={{ minHeight: '100%', backgroundColor: 'var(--card-bg-color)' }}>
      <Box paddingX={[4, 5, 6]} paddingTop={[5, 6]} paddingBottom={6} flex={1}>
        <Container width={4}>
          <Stack space={[5, 6]}>
            <WelcomeSection />
            <PrimaryActions />
            <SecondaryActions />
            <TeamAndLearning />
          </Stack>
        </Container>
      </Box>
      <FooterSection />
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
