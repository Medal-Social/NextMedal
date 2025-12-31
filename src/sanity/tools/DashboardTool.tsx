'use client';

import {
  AddUserIcon,
  BookIcon,
  CheckmarkCircleIcon,
  CogIcon,
  DatabaseIcon,
  DocumentsIcon,
  EditIcon,
  EyeOpenIcon,
  InfoOutlineIcon,
  MasterDetailIcon,
  PlayIcon,
  SearchIcon,
  StackCompactIcon,
} from '@sanity/icons';
import { Box, Button, Card, Container, Flex, Grid, Heading, Label, Stack, Text } from '@sanity/ui';
import { type KeyboardEvent, memo, useCallback, useEffect, useMemo, useState } from 'react';
import { type Tool, useClient, useCurrentUser, useProjectId } from 'sanity';
import { useRouter } from 'sanity/router';
import { IconGithub, IconLinkedinIn, IconTwitterX } from '@/components/icons/social-icons';
import dashboardImage from '@/sanity/assets/dashboard.png';
import { STUDIO_TIPS } from './studio-tips';

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
  const projectId = useProjectId();
  const manageUrl = useMemo(
    () => `https://www.sanity.io/manage/project/${projectId}/members`,
    [projectId]
  );

  const handleNavigate = useCallback(
    (path: string) => {
      router.navigateUrl({ path });
    },
    [router]
  );

  const allActions = [
    {
      title: 'Pages',
      description: 'Manage pages',
      path: '/studio/structure/page',
      icon: <DocumentsIcon />,
      type: 'internal' as const,
    },
    {
      title: 'Collections',
      description: 'Blog, docs & more',
      path: '/studio/structure/collections',
      icon: <StackCompactIcon />,
      type: 'internal' as const,
    },
    {
      title: 'Settings',
      description: 'Site config',
      path: '/studio/structure/site',
      icon: <CogIcon />,
      type: 'internal' as const,
    },
    {
      title: 'Collaborate',
      description: 'Invite your team',
      href: manageUrl,
      icon: <AddUserIcon />,
      type: 'external' as const,
    },
    {
      title: 'Docs',
      description: 'Guides & Refs',
      href: 'https://www.nextmedal.com',
      icon: <BookIcon />,
      type: 'external' as const,
    },
    {
      title: 'Videos',
      description: 'Tutorials',
      href: 'https://youtube.com/@medalsocial',
      icon: <PlayIcon />,
      type: 'external' as const,
    },
  ];

  return (
    <Stack space={4}>
      <Label size={1} muted>
        Quick Access
      </Label>
      <Grid columns={[1, 2, 3]} gap={4}>
        {allActions.map((item) => {
          if (item.type === 'internal') {
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

interface ContentStats {
  draftsCount: number;
  publishedCount: number;
  seoIssuesCount: number;
}

const ContentOverview = memo(function ContentOverview() {
  const client = useClient({ apiVersion: '2024-01-01' });
  const router = useRouter();
  const [stats, setStats] = useState<ContentStats>({
    draftsCount: 0,
    publishedCount: 0,
    seoIssuesCount: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [drafts, published, seoIssues] = await Promise.all([
          // Count all draft documents
          client.fetch<number>('count(*[_id in path("drafts.**")])'),
          // Count published pages
          client.fetch<number>('count(*[_type == "page" && !(_id in path("drafts.**"))])'),
          // Count pages missing SEO metadata
          client.fetch<number>(
            'count(*[_type == "page" && !(_id in path("drafts.**")) && (!defined(metadata.metaDescription) || !defined(metadata.openGraphImage))])'
          ),
        ]);

        setStats({
          draftsCount: drafts,
          publishedCount: published,
          seoIssuesCount: seoIssues,
        });
      } catch {
        // Silently fail - stats will remain at 0
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [client]);

  const statCards = [
    {
      title: 'SEO Health',
      count: stats.seoIssuesCount,
      icon: <SearchIcon />,
      tone: stats.seoIssuesCount > 0 ? ('critical' as const) : ('positive' as const),
      subtitle:
        stats.seoIssuesCount === 0
          ? 'All pages optimized!'
          : stats.seoIssuesCount === 1
            ? 'missing SEO metadata'
            : 'missing SEO metadata',
      path: '/studio/structure/page',
    },
    {
      title: 'Drafts Pending',
      count: stats.draftsCount,
      icon: <EditIcon />,
      tone: stats.draftsCount > 0 ? ('caution' as const) : ('positive' as const),
      subtitle: stats.draftsCount === 1 ? 'draft to review' : 'drafts to review',
      path: '/studio/structure',
    },
    {
      title: 'Published Pages',
      count: stats.publishedCount,
      icon: <CheckmarkCircleIcon />,
      tone: 'positive' as const,
      subtitle: 'pages live',
      path: '/studio/structure/page',
    },
  ];

  return (
    <Stack space={4}>
      <Label size={1} muted>
        Content Overview
      </Label>
      <Grid columns={[1, 2, 3]} gap={4}>
        {statCards.map((stat) => (
          <Card
            key={stat.title}
            padding={4}
            radius={3}
            tone={stat.tone}
            style={{ cursor: 'pointer' }}
            onClick={() => router.navigateUrl({ path: stat.path })}
            tabIndex={0}
            role="button"
            aria-label={`${stat.title}: ${stat.count} ${stat.subtitle}`}
          >
            <Stack space={3}>
              <Flex align="center" justify="space-between">
                <Text size={1} weight="medium" muted>
                  {stat.title}
                </Text>
                <Text size={2}>{stat.icon}</Text>
              </Flex>
              <Box>
                <Text size={4} weight="bold">
                  {loading ? '—' : stat.count}
                </Text>
              </Box>
              <Text size={1} muted>
                {stat.subtitle}
              </Text>
            </Stack>
          </Card>
        ))}
      </Grid>
    </Stack>
  );
});

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

const ModuleReference = memo(function ModuleReference() {
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
            <ContentOverview />
            <SecondaryActions />
            <ModuleReference />
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
