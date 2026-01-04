/**
 * ContentOverview Component
 *
 * Displays content statistics (drafts, published pages, SEO issues)
 */

'use client';

import { CheckmarkCircleIcon, EditIcon, SearchIcon } from '@sanity/icons';
import { Box, Card, Flex, Grid, Label, Stack, Text } from '@sanity/ui';
import { memo, useEffect, useState } from 'react';
import { useClient } from 'sanity';
import { useRouter } from 'sanity/router';
import type { ContentStats } from './types';

export const ContentOverview = memo(function ContentOverview() {
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
          // Count pages missing SEO metadata (excluding noindex pages)
          client.fetch<number>(
            'count(*[_type == "page" && !(_id in path("drafts.**")) && metadata.noIndex != true && (!defined(metadata.metaDescription) || !defined(metadata.openGraphImage))])'
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
      path: '/studio/structure/contentHealth;seo-issues',
    },
    {
      title: 'Drafts Pending',
      count: stats.draftsCount,
      icon: <EditIcon />,
      tone: stats.draftsCount > 0 ? ('caution' as const) : ('positive' as const),
      subtitle: stats.draftsCount === 1 ? 'draft to review' : 'drafts to review',
      path: '/studio/structure/contentHealth;all-drafts',
    },
    {
      title: 'Published Documents',
      count: stats.publishedCount,
      icon: <CheckmarkCircleIcon />,
      tone: 'positive' as const,
      subtitle: 'documents live',
      path: '/studio/structure/contentHealth;published-documents',
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
