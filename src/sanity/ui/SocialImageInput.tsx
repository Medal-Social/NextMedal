'use client';

import { EyeOpenIcon } from '@sanity/icons';
import { Box, Button, Card, Dialog, Flex, Spinner, Stack, Text } from '@sanity/ui';
import { useState } from 'react';
import type { ObjectInputProps } from 'sanity';
import { useFormValue } from 'sanity';
import { BASE_URL } from '@/lib/core/env.client';

/**
 * Custom input for social sharing images with preview button for auto-generated fallback
 */
export default function SocialImageInput(props: ObjectInputProps) {
  const { renderDefault } = props;
  const [showPreview, setShowPreview] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  // Get the SEO title from the form
  const seoTitle = useFormValue(['seo', 'title']) as string | undefined;

  const handlePreview = () => {
    setShowPreview(true);
    setIsLoading(true);
    setHasError(false);
  };

  // Build the preview URL with the current SEO title
  const previewUrl = seoTitle
    ? `${BASE_URL}/api/og?title=${encodeURIComponent(seoTitle)}`
    : `${BASE_URL}/api/og`;

  return (
    <Stack space={3}>
      {renderDefault(props)}

      {!props.value && (
        <Card padding={3} radius={2} shadow={1} tone="primary">
          <Flex align="center" gap={3}>
            <EyeOpenIcon />
            <Box flex={1}>
              <Text size={1}>
                No image provided. An auto-generated image will be created from your SEO title and
                shown when this page is shared on social media.
              </Text>
            </Box>
            <Button
              fontSize={1}
              icon={EyeOpenIcon}
              mode="ghost"
              onClick={handlePreview}
              text="Preview"
              tone="primary"
              disabled={!seoTitle}
            />
          </Flex>
        </Card>
      )}

      {showPreview && (
        <Dialog
          header="Social Sharing Image Preview"
          id="social-image-preview"
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
                    src={previewUrl}
                    alt={`Social sharing preview for ${seoTitle || 'this page'}`}
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
                  Want to use your own image?
                </Text>
                <Text size={1} muted>
                  Upload a custom image above if you prefer. Recommended size: 1200×630px.
                </Text>
              </Stack>
            </Stack>
          </Card>
        </Dialog>
      )}
    </Stack>
  );
}
