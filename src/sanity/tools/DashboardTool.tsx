'use client';

import {
  AddUserIcon,
  BookIcon,
  ControlsIcon,
  DatabaseIcon,
  DocumentsIcon,
  EditIcon,
  EyeOpenIcon,
  HelpCircleIcon,
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
  description: 'Manage content data and structure',
  path: '/studio/structure',
  icon: <DatabaseIcon />,
  tone: 'default',
};

const QUICK_NAVIGATION: NavigationCard[] = [
  {
    title: 'Pages',
    description: 'Manage website pages',
    path: '/studio/structure/page',
    icon: <DocumentsIcon />,
  },
  {
    title: 'Blog',
    description: 'Write and publish posts',
    path: '/studio/structure/blog.post',
    icon: <EditIcon />,
  },
  {
    title: 'Settings',
    description: 'Configure site options',
    path: '/studio/structure/site',
    icon: <ControlsIcon />,
  },
];

const LEARNING_RESOURCES: ResourceLink[] = [
  {
    title: 'Documentation',
    description: 'Comprehensive guides and references.',
    href: 'https://docs.medalsocial.com/nextmedal',
    icon: <BookIcon />,
  },
  {
    title: 'Video Tutorials',
    description: 'Step-by-step video guides.',
    href: 'https://docs.medalsocial.com/nextmedal/videos',
    icon: <PlayIcon />,
  },
  {
    title: 'Get Support',
    description: 'Get help from our team.',
    href: 'https://medalsocial.com/support',
    icon: <HelpCircleIcon />,
  },
];

// ============================================================================
// Sub-components
// ============================================================================

function NavCard({ item }: { item: NavigationCard }) {
  const router = useRouter();

  return (
    <Card
      padding={4}
      radius={3}
      border
      tone={item.tone}
      style={{ cursor: 'pointer', transition: 'all 0.2s' }}
      onClick={() => router.navigateUrl({ path: item.path })}
      __unstable_focusRing
    >
      <Flex gap={3} align="center">
        <Box padding={2} style={{ background: 'var(--card-bg-color)', borderRadius: '50%' }}>
          <Text size={3}>{item.icon}</Text>
        </Box>
        <Stack space={2}>
          <Text size={2} weight="semibold">
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

function WelcomeSection() {
  const currentUser = useCurrentUser();
  const firstName = currentUser?.name?.split(' ')[0];
  const hour = new Date().getHours();

  let greeting = 'Hello';
  if (hour < 12) greeting = 'Good morning';
  else if (hour < 18) greeting = 'Good afternoon';
  else greeting = 'Good evening';

  return (
    <Box marginBottom={2}>
      <Stack space={4}>
        <Heading as="h1" size={4} weight="bold">
          {firstName ? `${greeting}, ${firstName}` : 'Welcome to Your Studio'}
        </Heading>
        <Text size={2} muted>
          Manage your content, configure your site, and collaborate with your team.
        </Text>
      </Stack>
    </Box>
  );
}

function HeroSection() {
  const router = useRouter();

  return (
    <Grid columns={[1, 2]} gap={4}>
      <Card
        padding={5}
        radius={4}
        shadow={2}
        tone="primary"
        style={{ cursor: 'pointer', position: 'relative', overflow: 'hidden' }}
        onClick={() => router.navigateUrl({ path: VISUAL_EDITOR_CARD.path })}
      >
        <Flex gap={5} align="center" style={{ position: 'relative', zIndex: 1, height: '100%' }}>
          <Stack space={4} flex={1}>
            <Box
              padding={3}
              style={{
                backgroundColor: 'rgba(255,255,255,0.2)',
                borderRadius: '8px',
                width: 'fit-content',
              }}
            >
              <Text size={4} style={{ color: 'inherit' }}>
                {VISUAL_EDITOR_CARD.icon}
              </Text>
            </Box>
            <Stack space={3}>
              <Heading size={3} style={{ color: 'inherit' }}>
                {VISUAL_EDITOR_CARD.title}
              </Heading>
              <Text size={2} style={{ color: 'inherit', opacity: 0.9 }}>
                {VISUAL_EDITOR_CARD.description}
              </Text>
            </Stack>
            <Box marginTop={2}>
              <Button text="Launch Visual Editor" mode="default" />
            </Box>
          </Stack>
        </Flex>
      </Card>

      <Card
        padding={5}
        radius={4}
        shadow={1}
        border
        style={{ cursor: 'pointer', position: 'relative', overflow: 'hidden' }}
        onClick={() => router.navigateUrl({ path: STRUCTURE_CARD.path })}
      >
        <Flex gap={5} align="center" style={{ position: 'relative', zIndex: 1, height: '100%' }}>
          <Stack space={4} flex={1}>
            <Box
              padding={3}
              style={{
                backgroundColor: 'var(--card-bg-color)',
                border: '1px solid var(--card-border-color)',
                borderRadius: '8px',
                width: 'fit-content',
              }}
            >
              <Text size={4}>{STRUCTURE_CARD.icon}</Text>
            </Box>
            <Stack space={3}>
              <Heading size={3}>{STRUCTURE_CARD.title}</Heading>
              <Text size={2} muted>
                {STRUCTURE_CARD.description}
              </Text>
            </Stack>
            <Box marginTop={2}>
              <Button text="Open Content Desk" mode="ghost" />
            </Box>
          </Stack>
        </Flex>
      </Card>
    </Grid>
  );
}

function LearningSection() {
  return (
    <Stack space={4}>
      <Label size={1} muted>
        Documentation & Learning
      </Label>
      <Grid columns={[1, 1, 3]} gap={4}>
        {LEARNING_RESOURCES.map((resource) => (
          <Card
            key={resource.title}
            as="a"
            href={resource.href}
            target="_blank"
            rel="noopener noreferrer"
            padding={4}
            radius={3}
            border
            style={{ textDecoration: 'none', color: 'inherit', transition: 'border-color 0.2s' }}
            __unstable_focusRing
          >
            <Stack space={3}>
              <Box
                padding={2}
                style={{
                  background: 'var(--card-bg-color)',
                  borderRadius: '50%',
                  width: 'fit-content',
                }}
              >
                <Text size={3}>{resource.icon}</Text>
              </Box>
              <Stack space={2}>
                <Text size={2} weight="semibold">
                  {resource.title}
                </Text>
                <Text size={1} muted>
                  {resource.description}
                </Text>
              </Stack>
            </Stack>
          </Card>
        ))}
      </Grid>
    </Stack>
  );
}

function MainLayout() {
  return (
    <Grid columns={[1, 1, 12]} gap={6}>
      <Box columnStart={[1, 1, 1]} columnEnd={[1, 1, 9]}>
        <Stack space={6}>
          <HeroSection />

          <Box>
            <Label size={1} muted style={{ marginBottom: '1rem', display: 'block' }}>
              Quick Actions
            </Label>
            <Grid columns={[1, 3]} gap={4}>
              {QUICK_NAVIGATION.map((item) => (
                <NavCard key={item.title} item={item} />
              ))}
            </Grid>
          </Box>

          <LearningSection />
        </Stack>
      </Box>

      <Box columnStart={[1, 1, 9]} columnEnd={[1, 1, 13]}>
        <Stack space={6}>
          <InviteCard />
        </Stack>
      </Box>
    </Grid>
  );
}

function InviteCard() {
  const projectId = useProjectId();
  const manageUrl = `https://www.sanity.io/manage/project/${projectId}/members`;

  return (
    <Card padding={4} radius={3} border tone="positive">
      <Stack space={4}>
        <Flex gap={3} align="center">
          <Box padding={2} style={{ background: 'var(--card-bg-color)', borderRadius: '50%' }}>
            <Text size={3}>
              <AddUserIcon />
            </Text>
          </Box>
          <Stack space={2}>
            <Text size={2} weight="semibold">
              Team Members
            </Text>
            <Text size={1} muted>
              Collaborate in real-time
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
        />
      </Stack>
    </Card>
  );
}

function FooterSection() {
  return (
    <Box marginTop={6} paddingBottom={4}>
      <Flex justify="center">
        <Card radius={4} border padding={2} shadow={2} style={{ width: 'fit-content' }}>
          <Flex align="center" gap={4} paddingX={3}>
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

            <Box style={{ width: 1, height: 16, backgroundColor: 'var(--card-border-color)' }} />

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
      <Box paddingX={[4, 5, 6]} paddingTop={[4, 5]} paddingBottom={6} flex={1}>
        <Container width={5}>
          <Stack space={6}>
            <WelcomeSection />
            <MainLayout />
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
