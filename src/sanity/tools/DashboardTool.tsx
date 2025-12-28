'use client';

import {
  AddUserIcon,
  BookIcon,
  ClockIcon,
  ControlsIcon,
  DatabaseIcon,
  DocumentsIcon,
  EditIcon,
  EyeOpenIcon,
  LaunchIcon,
  MasterDetailIcon,
  PlayIcon,
} from '@sanity/icons';
import { Box, Button, Card, Container, Flex, Grid, Heading, Label, Stack, Text } from '@sanity/ui';
import { FaGithub, FaLinkedin, FaXTwitter } from 'react-icons/fa6';
import { type Tool, useCurrentUser, useProjectId } from 'sanity';
import { useRouter } from 'sanity/router';

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
  title: 'Content Desk',
  description: 'Manage your content',
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
    title: 'Blog',
    description: 'Manage posts',
    path: '/studio/structure/blog.post',
    icon: <EditIcon />,
  },
  {
    title: 'Settings',
    description: 'Site config',
    path: '/studio/structure/site',
    icon: <ControlsIcon />,
  },
];

const LEARNING_RESOURCES: ResourceLink[] = [
  {
    title: 'Docs',
    description: 'Guides & Refs',
    href: 'https://docs.medalsocial.com/nextmedal',
    icon: <BookIcon />,
  },
  {
    title: 'Videos',
    description: 'Tutorials',
    href: 'https://docs.medalsocial.com/nextmedal/videos',
    icon: <PlayIcon />,
  },
  {
    title: 'Updates',
    description: 'Changelog',
    href: 'https://github.com/medalsocial/nextmedal/releases',
    icon: <ClockIcon />,
  },
];

// ============================================================================
// Components
// ============================================================================

function WelcomeSection() {
  const currentUser = useCurrentUser();
  const firstName = currentUser?.name?.split(' ')[0];
  const hour = new Date().getHours();

  let greeting = 'Hello';
  if (hour < 12) greeting = 'Good morning';
  else if (hour < 18) greeting = 'Good afternoon';
  else greeting = 'Good evening';

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
}

function PrimaryActions() {
  const router = useRouter();

  return (
    <Grid columns={[1, 1, 2]} gap={[4, 5]}>
      {/* Visual Editor Card - The "Star" */}
      <Card
        padding={[4, 5]}
        radius={4}
        shadow={2}
        tone="primary"
        style={{ cursor: 'pointer', position: 'relative', overflow: 'hidden' }}
        onClick={() => router.navigateUrl({ path: VISUAL_EDITOR_CARD.path })}
      >
        <Flex direction="column" align="flex-start" gap={4} style={{ height: '100%' }}>
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
            <Heading size={2} style={{ color: 'inherit' }}>
              {VISUAL_EDITOR_CARD.title}
            </Heading>
          </Flex>

          <Box flex={1}>
            <Text size={2} style={{ color: 'inherit', opacity: 0.9 }}>
              {VISUAL_EDITOR_CARD.description}
            </Text>
          </Box>

          <Button text="Launch Editor" mode="bleed" />
        </Flex>
      </Card>

      {/* Structure Tool Card */}
      <Card
        padding={[4, 5]}
        radius={4}
        border
        style={{ cursor: 'pointer' }}
        onClick={() => router.navigateUrl({ path: STRUCTURE_CARD.path })}
        __unstable_focusRing
      >
        <Flex direction="column" align="flex-start" gap={4} style={{ height: '100%' }}>
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
            <Heading size={2}>{STRUCTURE_CARD.title}</Heading>
          </Flex>

          <Box flex={1}>
            <Text size={2} muted>
              {STRUCTURE_CARD.description}
            </Text>
          </Box>

          <Button text="Open Content Desk" mode="bleed" />
        </Flex>
      </Card>
    </Grid>
  );
}

function SecondaryActions() {
  const router = useRouter();

  return (
    <Box>
      <Label size={1} muted style={{ marginBottom: '1rem', display: 'block' }}>
        Quick Access
      </Label>
      <Grid columns={[1, 2, 3]} gap={[3, 4]}>
        {QUICK_NAVIGATION.map((item) => (
          <Card
            key={item.title}
            padding={3}
            radius={3}
            border
            style={{ cursor: 'pointer', transition: 'border-color 0.2s' }}
            onClick={() => router.navigateUrl({ path: item.path })}
            __unstable_focusRing
          >
            <Flex align="center" gap={3}>
              <Text size={2}>{item.icon}</Text>
              <Stack space={2} flex={1} style={{ minWidth: 0 }}>
                <Text size={2} weight="medium" textOverflow="ellipsis">
                  {item.title}
                </Text>
                <Text size={1} muted textOverflow="ellipsis">
                  {item.description}
                </Text>
              </Stack>
            </Flex>
          </Card>
        ))}
      </Grid>
    </Box>
  );
}

function TeamAndLearning() {
  const projectId = useProjectId();
  const manageUrl = `https://www.sanity.io/manage/project/${projectId}/members`;

  return (
    <Grid columns={[1, 1, 2]} gap={[5, 6]}>
      {/* Team Section */}
      <Stack space={4}>
        <Label size={1} muted>
          Team
        </Label>
        <Card padding={4} radius={3} border tone="positive">
          <Flex align="center" justify="space-between" gap={4} wrap="wrap">
            <Flex align="center" gap={3}>
              <Box padding={2} style={{ background: 'var(--card-bg-color)', borderRadius: '50%' }}>
                <Text size={2}>
                  <AddUserIcon />
                </Text>
              </Box>
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
              tone="positive"
              icon={LaunchIcon}
              fontSize={1}
            />
          </Flex>
        </Card>
      </Stack>

      {/* Learning Section */}
      <Stack space={4}>
        <Label size={1} muted>
          Resources
        </Label>
        <Grid columns={[1, 3]} gap={3}>
          {LEARNING_RESOURCES.map((resource) => (
            <Card
              key={resource.title}
              as="a"
              href={resource.href}
              target="_blank"
              rel="noopener noreferrer"
              padding={3}
              radius={2}
              border
              style={{ textDecoration: 'none', color: 'inherit', textAlign: 'center' }}
              __unstable_focusRing
            >
              <Stack space={2} flex={1}>
                <Flex justify="center">
                  <Text size={2}>{resource.icon}</Text>
                </Flex>
                <Text size={1} weight="medium" textOverflow="ellipsis">
                  {resource.title}
                </Text>
              </Stack>
            </Card>
          ))}
        </Grid>
      </Stack>
    </Grid>
  );
}

function FooterSection() {
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
                  href="https://medalsocial.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: 'inherit', textDecoration: 'none' }}
                >
                  Medal Social
                </a>
              </Text>
            </Flex>

            <Box
              style={{
                width: 1,
                height: 16,
                backgroundColor: 'var(--card-border-color)',
                display: 'none', // Hide separator on very small screens if needed via media query, but JS style hard
              }}
            />

            <Flex gap={1}>
              <Button
                as="a"
                href="https://github.com/medalsocial"
                target="_blank"
                rel="noopener noreferrer"
                mode="bleed"
                icon={FaGithub}
                aria-label="GitHub"
                title="GitHub"
              />
              <Button
                as="a"
                href="https://x.com/medalsocial"
                target="_blank"
                rel="noopener noreferrer"
                mode="bleed"
                icon={FaXTwitter}
                aria-label="X (Twitter)"
                title="X (Twitter)"
              />
              <Button
                as="a"
                href="https://linkedin.com/company/medalsocial"
                target="_blank"
                rel="noopener noreferrer"
                mode="bleed"
                icon={FaLinkedin}
                aria-label="LinkedIn"
                title="LinkedIn"
              />
            </Flex>
          </Flex>
        </Card>
      </Flex>
    </Box>
  );
}

// ============================================================================
// Main Component
// ============================================================================

function DashboardComponent() {
  return (
    <Flex direction="column" style={{ minHeight: '100%', backgroundColor: 'var(--card-bg-color)' }}>
      <Box paddingX={[4, 5, 6]} paddingTop={[5, 6]} paddingBottom={6} flex={1}>
        <Container width={4}>
          {' '}
          {/* Width 4 is better for readability and scaling than 5 */}
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
}

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
