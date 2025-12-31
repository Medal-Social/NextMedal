'use client';

import { EyeOpenIcon, LaunchIcon } from '@sanity/icons';
import { Box, Button, Card, Flex, Stack, Text, TextInput } from '@sanity/ui';
import { useCallback, useMemo, useState } from 'react';
import { type SlugInputProps, set, useFormValue } from 'sanity';
import { BASE_URL } from '@/lib/core/env.client';

export default function SlugWithPreview(props: SlugInputProps) {
  const { value, onChange } = props;

  const [isGenerating, setIsGenerating] = useState(false);

  // Get document values for URL generation
  const language = useFormValue(['language']) as string | undefined;
  const title = useFormValue(['title']) as string | undefined;
  const metadataTitle = useFormValue(['metadata', 'title']) as string | undefined;

  // Generate slug from title
  const generateSlug = useCallback(() => {
    const sourceTitle = title || metadataTitle;
    if (!sourceTitle) return;

    setIsGenerating(true);
    const slug = sourceTitle
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove accents
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    onChange(set({ current: slug, _type: 'slug' }));
    setIsGenerating(false);
  }, [title, metadataTitle, onChange]);

  // Build preview URL based on document type
  const previewUrl = useMemo(() => {
    if (!value?.current) return null;

    const langPrefix = language && language !== 'en' ? `/${language}` : '';
    const slugPath = value.current === 'index' ? '' : `/${value.current}`;

    return `${BASE_URL}${langPrefix}${slugPath}` || `${BASE_URL}/`;
  }, [value?.current, language]);

  // Open preview in new tab (published content)
  const openPreview = useCallback(() => {
    if (!previewUrl) return;
    window.open(previewUrl, '_blank');
  }, [previewUrl]);

  // Open in Visual Editor
  const openInVisualEditor = useCallback(() => {
    if (!previewUrl) return;
    const path = previewUrl.replace(BASE_URL, '') || '/';
    const editorPath = `/studio/editor${path}`;
    window.location.href = editorPath;
  }, [previewUrl]);

  const handleSlugChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = event.currentTarget.value
        .toLowerCase()
        .replace(/[^a-z0-9-]/g, '-')
        .replace(/--+/g, '-')
        .replace(/^-+|-+$/g, '');

      onChange(set({ current: newValue, _type: 'slug' }));
    },
    [onChange]
  );

  return (
    <Stack space={3}>
      {/* Slug input with generate button */}
      <Flex gap={2} align="center">
        <Box flex={1}>
          <TextInput
            value={value?.current || ''}
            onChange={handleSlugChange}
            placeholder="enter-url-slug"
          />
        </Box>
        <Button
          text="Generate"
          mode="ghost"
          onClick={generateSlug}
          disabled={isGenerating || (!title && !metadataTitle)}
          title="Generate slug from title"
        />
      </Flex>

      {/* Preview URL display */}
      {previewUrl && (
        <Card padding={3} radius={2} tone="transparent" border>
          <Flex align="center" justify="space-between" gap={3}>
            <Text size={1} muted style={{ wordBreak: 'break-all' }}>
              {previewUrl}
            </Text>
            <Flex gap={2} style={{ flexShrink: 0 }}>
              <Button
                icon={EyeOpenIcon}
                text="Visual Editor"
                mode="ghost"
                tone="primary"
                onClick={openInVisualEditor}
                title="Open in Visual Editor"
                fontSize={1}
              />
              <Button
                icon={LaunchIcon}
                mode="ghost"
                onClick={openPreview}
                title="Preview in new tab"
              />
            </Flex>
          </Flex>
        </Card>
      )}

      {/* Validation message */}
      {!value?.current && (
        <Text size={1} muted>
          Enter a URL slug or click &quot;Generate&quot; to create one from the title
        </Text>
      )}
    </Stack>
  );
}
