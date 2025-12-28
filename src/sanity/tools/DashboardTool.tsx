'use client';

import {
  AddUserIcon,
  BookIcon,
  ControlsIcon,
  DocumentsIcon,
  EarthGlobeIcon,
  EditIcon,
  HelpCircleIcon,
  LaunchIcon,
  MasterDetailIcon,
  PlayIcon,
} from '@sanity/icons';
import { Box, Card, Container, Flex, Grid, Heading, Stack, Text } from '@sanity/ui';
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
  href: string;
  icon: React.ReactNode;
}

// ============================================================================
// Constants
// ============================================================================

const EDITOR_CARD: NavigationCard = {
  title: 'Content Editor',
  description: 'Browse and edit all your content in one place',
  path: '/studio/structure',
  icon: <MasterDetailIcon />,
  tone: 'primary',
};

const QUICK_NAVIGATION: NavigationCard[] = [
  {
    title: 'Pages',
    description: 'Create and manage your website pages',
    path: '/studio/structure/page',
    icon: <DocumentsIcon />,
  },
  {
    title: 'Blog',
    description: 'Write and publish blog posts',
    path: '/studio/structure/blog.post',
    icon: <EditIcon />,
  },
  {
    title: 'Site Settings',
    description: 'Configure logo, navigation, and SEO',
    path: '/studio/structure/site',
    icon: <ControlsIcon />,
  },
];

const RESOURCES: ResourceLink[] = [
  {
    title: 'Documentation',
    href: 'https://docs.medalsocial.com/nextmedal',
    icon: <BookIcon />,
  },
  {
    title: 'Video Tutorials',
    href: 'https://docs.medalsocial.com/nextmedal/videos',
    icon: <PlayIcon />,
  },
  {
    title: 'Get Support',
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
      style={{ cursor: 'pointer' }}
      onClick={() => router.navigateUrl({ path: item.path })}
    >
      <Stack space={3}>
        <Text size={3}>{item.icon}</Text>
        <Stack space={2}>
          <Text size={2} weight="semibold">
            {item.title}
          </Text>
          <Text size={1} muted>
            {item.description}
          </Text>
        </Stack>
      </Stack>
    </Card>
  );
}

function WelcomeSection() {
  const currentUser = useCurrentUser();
  const firstName = currentUser?.name?.split(' ')[0];

  return (
    <Stack space={4}>
      <Heading as="h1" size={4}>
        {firstName ? `Welcome back, ${firstName}` : 'Welcome to Your Studio'}
      </Heading>
      <Text size={2} muted style={{ maxWidth: 500 }}>
        This is your content management hub. Edit pages, write blog posts, and configure your
        website.
      </Text>
    </Stack>
  );
}

function EditorHighlight() {
  const router = useRouter();

  return (
    <Card
      padding={5}
      radius={3}
      border
      tone="primary"
      style={{ cursor: 'pointer' }}
      onClick={() => router.navigateUrl({ path: EDITOR_CARD.path })}
    >
      <Flex gap={4} align="center">
        <Text size={4}>{EDITOR_CARD.icon}</Text>
        <Stack space={3}>
          <Text size={3} weight="semibold">
            {EDITOR_CARD.title}
          </Text>
          <Text size={2} muted>
            {EDITOR_CARD.description}
          </Text>
        </Stack>
      </Flex>
    </Card>
  );
}

function NavigationSection() {
  return (
    <Stack space={4}>
      <EditorHighlight />
      <Grid columns={[1, 3]} gap={4}>
        {QUICK_NAVIGATION.map((item) => (
          <NavCard key={item.title} item={item} />
        ))}
      </Grid>
    </Stack>
  );
}

function QuickLinksSection() {
  const projectId = useProjectId();
  const manageUrl = `https://www.sanity.io/manage/project/${projectId}/members`;

  return (
    <Grid columns={[1, 2]} gap={4}>
      <Card
        as="a"
        href={manageUrl}
        target="_blank"
        rel="noopener noreferrer"
        padding={4}
        radius={3}
        border
        style={{ textDecoration: 'none', cursor: 'pointer' }}
      >
        <Flex gap={3} align="center" justify="space-between">
          <Flex gap={3} align="center">
            <Text size={2}>
              <AddUserIcon />
            </Text>
            <Stack space={2}>
              <Text size={1} weight="semibold">
                Invite Team Members
              </Text>
              <Text size={1} muted>
                Add collaborators to your Studio
              </Text>
            </Stack>
          </Flex>
          <Text muted>
            <LaunchIcon />
          </Text>
        </Flex>
      </Card>

      <Card padding={4} radius={3} border>
        <Stack space={4}>
          <Text size={1} weight="semibold">
            Help & Resources
          </Text>
          <Flex gap={5} wrap="wrap">
            {RESOURCES.map((resource) => (
              <Text
                key={resource.title}
                size={1}
                as="a"
                href={resource.href}
                target="_blank"
                rel="noopener noreferrer"
                style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 6 }}
              >
                {resource.icon}
                {resource.title}
              </Text>
            ))}
          </Flex>
        </Stack>
      </Card>
    </Grid>
  );
}

function FooterSection() {
  return (
    <Box paddingTop={5} marginTop={4} style={{ borderTop: '1px solid var(--card-border-color)' }}>
      <Flex justify="center" align="center" gap={2} paddingY={3}>
        <Text size={1} muted>
          Created by
        </Text>
        <Text
          size={1}
          as="a"
          href="https://www.medalsocial.com"
          target="_blank"
          rel="noopener noreferrer"
          style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 6 }}
        >
          Medal Social
          <EarthGlobeIcon />
        </Text>
      </Flex>
    </Box>
  );
}

// ============================================================================
// Main Component
// ============================================================================

function DashboardComponent() {
  return (
    <Box padding={5} style={{ minHeight: '100%', overflow: 'auto' }}>
      <Container width={4}>
        <Stack space={6} paddingY={5}>
          <WelcomeSection />
          <NavigationSection />
          <QuickLinksSection />
          <FooterSection />
        </Stack>
      </Container>
    </Box>
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
