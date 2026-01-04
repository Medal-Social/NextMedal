'use client';

import { EyeOpenIcon } from '@sanity/icons';
import { Box, Button, Card, Dialog, Flex, Spinner, Stack, Text } from '@sanity/ui';
import { useState } from 'react';
import { BASE_URL } from '@/lib/core/env.client';

export default function PreviewOG({ title }: { title?: string }) {
  const [showPreview, setShowPreview] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const url = `${BASE_URL}/api/og?title=${encodeURIComponent(title ?? '')}`;

  const handlePreview = () => {
    setShowPreview(true);
    setIsLoading(true);
    setHasError(false);
  };

  return (
    <>
      <Button
        mode="bleed"
        padding={2}
        style={{ marginTop: -4 }}
        icon={EyeOpenIcon}
        title="Preview social sharing image"
        onClick={handlePreview}
        disabled={!title}
      />

      {showPreview && (
        <Dialog
          header="Social Sharing Image Preview"
          id="og-image-preview"
          onClose={() => setShowPreview(false)}
          width={2}
        >
          <Card padding={4}>
            <Stack space={4}>
              <Stack space={2}>
                <Text size={1} weight="semibold">
                  What is this?
                </Text>
                <Text size={1} muted>
                  This image will appear when your page is shared on social media platforms like
                  Facebook, Twitter/X, LinkedIn, and Slack. It's automatically generated from your
                  SEO title.
                </Text>
              </Stack>

              <Stack space={2}>
                <Text size={1} weight="semibold">
                  Preview
                </Text>
                <Box
                  style={{
                    width: '100%',
                    aspectRatio: '1200/630',
                    border: '1px solid var(--card-border-color)',
                    borderRadius: '4px',
                    overflow: 'hidden',
                    position: 'relative',
                    backgroundColor: 'var(--card-bg-color)',
                  }}
                >
                  {isLoading && (
                    <Flex
                      align="center"
                      justify="center"
                      style={{
                        position: 'absolute',
                        inset: 0,
                      }}
                    >
                      <Spinner muted />
                    </Flex>
                  )}

                  {hasError && (
                    <Flex
                      align="center"
                      justify="center"
                      style={{
                        position: 'absolute',
                        inset: 0,
                        padding: '1rem',
                      }}
                    >
                      <Text size={1} style={{ color: 'var(--card-error-fg-color)' }}>
                        Failed to load preview image
                      </Text>
                    </Flex>
                  )}

                  {/* biome-ignore lint/performance/noImgElement: Sanity admin preview */}
                  <img
                    src={url}
                    alt={`Social sharing preview for ${title || 'untitled page'}`}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      opacity: isLoading || hasError ? 0 : 1,
                      transition: 'opacity 0.2s ease-in-out',
                    }}
                    onLoad={() => {
                      setIsLoading(false);
                      setHasError(false);
                    }}
                    onError={() => {
                      setIsLoading(false);
                      setHasError(true);
                    }}
                  />
                </Box>
              </Stack>

              <Stack space={2}>
                <Text size={1} weight="semibold">
                  Need a custom image?
                </Text>
                <Text size={1} muted>
                  You can upload a custom "Social Sharing Image" below if you prefer. Recommended
                  size: 1200×630px.
                </Text>
              </Stack>
            </Stack>
          </Card>
        </Dialog>
      )}
    </>
  );
}
