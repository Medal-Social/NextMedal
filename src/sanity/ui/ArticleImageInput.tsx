'use client';

import { EyeOpenIcon } from '@sanity/icons';
import { Box, Button, Card, Dialog, Flex, Stack, Text } from '@sanity/ui';
import { useState } from 'react';
import type { ObjectInputProps } from 'sanity';
import { useFormValue } from 'sanity';

/**
 * Custom input for article hero images with preview button for auto-generated fallback
 */
export default function ArticleImageInput(props: ObjectInputProps) {
  const { renderDefault } = props;
  const [showPreview, setShowPreview] = useState(false);

  // Get the article title from the form
  const articleTitle = useFormValue(['metadata', 'title']) as string | undefined;

  const handlePreview = () => {
    setShowPreview(true);
  };

  // Build the preview URL with the current article title
  const previewUrl = articleTitle
    ? `/api/og/article-fallback?title=${encodeURIComponent(articleTitle)}`
    : '/api/og/article-fallback';

  return (
    <Stack space={3}>
      {renderDefault(props)}

      {!props.value && (
        <Card padding={3} radius={2} shadow={1} tone="primary">
          <Flex align="center" gap={3}>
            <EyeOpenIcon />
            <Box flex={1}>
              <Text size={1}>
                No image provided. An auto-generated image will be created from the article title.
              </Text>
            </Box>
            <Button
              fontSize={1}
              icon={EyeOpenIcon}
              mode="ghost"
              onClick={handlePreview}
              text="Preview"
              tone="primary"
              disabled={!articleTitle}
            />
          </Flex>
        </Card>
      )}

      {showPreview && (
        <Dialog
          header="Auto-Generated Image Preview"
          id="article-image-preview"
          onClose={() => setShowPreview(false)}
          width={2}
        >
          <Card padding={4}>
            <Stack space={3}>
              <Text size={1} muted>
                This is what the auto-generated image will look like based on your article title.
              </Text>
              <Box
                style={{
                  width: '100%',
                  aspectRatio: '1200/630',
                  border: '1px solid var(--card-border-color)',
                  borderRadius: '4px',
                  overflow: 'hidden',
                }}
              >
                {/* biome-ignore lint/performance/noImgElement: Sanity admin preview */}
                <img
                  src={previewUrl}
                  alt="Auto-generated article preview"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                  }}
                />
              </Box>
            </Stack>
          </Card>
        </Dialog>
      )}
    </Stack>
  );
}
