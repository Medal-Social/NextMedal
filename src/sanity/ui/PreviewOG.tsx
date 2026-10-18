'use client';

import { EyeOpenIcon } from '@sanity/icons/EyeOpen';
import { Box, Button, Card, Dialog, Flex, Spinner, Stack, Text } from '@sanity/ui';
import { useState } from 'react';
import { useFormValue } from 'sanity';
import { BASE_URL } from '@/lib/core/env.client';
import { resolveShareImage } from '@/lib/seo/share-images';

export default function PreviewOG({ title }: { title?: string }) {
  const [showPreview, setShowPreview] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const documentType = useFormValue(['_type']) as string | undefined;
  const slug = useFormValue(['metadata', 'slug', 'current']) as string | undefined;
  const modules = useFormValue(['modules']) as Array<{ _type?: string } | null> | null;
  const url = resolveShareImage(
    {
      _type: documentType,
      metadata: { slug: slug ? { current: slug } : undefined, title },
      modules,
    },
    BASE_URL,
    title || 'NextMedal'
  ).url;

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
      />

      {showPreview && (
        <Dialog
          header="Social Sharing Image Preview"
          id="og-image-preview"
          onClose={() => setShowPreview(false)}
          width={2}
        >
          <Card padding={4}>
            <Stack gap={4}>
              <Stack gap={2}>
                <Text size={1} weight="semibold">
                  What is this?
                </Text>
                <Text size={1} muted>
                  This image will appear when your page is shared on social media platforms like
                  Facebook, Twitter/X, LinkedIn, and Slack. It is the designed card for this
                  document's route, collection, or leading module.
                </Text>
              </Stack>

              <Stack gap={2}>
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

              <Stack gap={2}>
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
