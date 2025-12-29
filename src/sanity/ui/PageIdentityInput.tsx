'use client';

import { EyeOpenIcon, LaunchIcon } from '@sanity/icons';
import { Box, Button, Flex, Stack, Text, TextInput } from '@sanity/ui';
import { useCallback, useMemo, useState } from 'react';
import { type ObjectInputProps, set, useFormValue } from 'sanity';
import { BASE_URL } from '@/lib/env.client';

/**
 * Custom input component for Page/Post Identity (title + slug)
 * Renders both fields with minimal spacing and integrated preview buttons
 */
export default function PageIdentityInput(props: ObjectInputProps) {
  const { value, onChange } = props;
  const [isGenerating, setIsGenerating] = useState(false);

  // Get document type for URL construction
  const documentType = useFormValue(['_type']) as string | undefined;
  const language = useFormValue(['language']) as string | undefined;

  // Current values
  const currentTitle = (value as { title?: string })?.title || '';
  const currentSlug = (value as { slug?: { current?: string } })?.slug?.current || '';

  // Generate slug from title
  const generateSlug = useCallback(() => {
    if (!currentTitle) return;

    setIsGenerating(true);
    const slug = currentTitle
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    onChange(
      set({
        ...(value || {}),
        slug: { current: slug, _type: 'slug' },
      })
    );
    setIsGenerating(false);
  }, [currentTitle, value, onChange]);

  // Build preview URL
  const previewUrl = useMemo(() => {
    if (!currentSlug) return null;

    const langPrefix = language && language !== 'en' ? `/${language}` : '';
    let pathPrefix = '';
    if (documentType === 'blog.post') {
      pathPrefix = '/blog';
    }
    const slugPath = currentSlug === 'index' ? '' : `/${currentSlug}`;

    return `${BASE_URL}${langPrefix}${pathPrefix}${slugPath}` || `${BASE_URL}/`;
  }, [currentSlug, language, documentType]);

  // Open preview in new tab
  const openPreview = useCallback(() => {
    if (!previewUrl) return;
    window.open(previewUrl, '_blank');
  }, [previewUrl]);

  // Open in Visual Editor
  const openInVisualEditor = useCallback(() => {
    if (!previewUrl) return;
    const path = previewUrl.replace(BASE_URL, '') || '/';
    // Presentation tool uses ?preview= query param to navigate to a specific page
    const editorPath = `/studio/editor?preview=${encodeURIComponent(path)}`;
    window.location.href = editorPath;
  }, [previewUrl]);

  // Handle title change
  const handleTitleChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      onChange(
        set({
          ...(value || {}),
          title: event.currentTarget.value,
        })
      );
    },
    [value, onChange]
  );

  // Handle slug change
  const handleSlugChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = event.currentTarget.value
        .toLowerCase()
        .replace(/[^a-z0-9-]/g, '-')
        .replace(/--+/g, '-')
        .replace(/^-+|-+$/g, '');

      onChange(
        set({
          ...(value || {}),
          slug: { current: newValue, _type: 'slug' },
        })
      );
    },
    [value, onChange]
  );

  // Get labels based on document type
  const isBlogPost = documentType === 'blog.post';
  const titleLabel = isBlogPost ? 'Post Title' : 'Page Title';
  const titleDescription = isBlogPost
    ? 'The main title of the blog post'
    : 'The main title of the page';
  const slugDescription = isBlogPost
    ? 'The URL path for this blog post (e.g., my-post-title)'
    : 'The URL path for this page (e.g., about-us)';

  return (
    <Stack space={4}>
      {/* Title field */}
      <Stack space={3}>
        <Flex align="center" justify="space-between">
          <Text size={1} weight="medium">
            {titleLabel}
          </Text>
          {previewUrl && (
            <Flex gap={2} align="center">
              <Button
                icon={EyeOpenIcon}
                text="Preview"
                mode="bleed"
                tone="primary"
                onClick={openInVisualEditor}
                title="Open in Visual Editor"
                fontSize={1}
                padding={2}
              />
              <Button
                icon={LaunchIcon}
                mode="bleed"
                onClick={openPreview}
                title="Open in new tab"
                padding={2}
              />
            </Flex>
          )}
        </Flex>
        <Text size={1} muted>
          {titleDescription}
        </Text>
        <TextInput
          value={currentTitle}
          onChange={handleTitleChange}
          placeholder={`Enter ${titleLabel.toLowerCase()}`}
        />
      </Stack>

      {/* Slug field with generate button */}
      <Stack space={3}>
        <Text size={1} weight="medium">
          URL Slug
        </Text>
        <Text size={1} muted>
          {slugDescription}
        </Text>
        <Flex gap={2} align="center">
          <Box flex={1}>
            <TextInput
              value={currentSlug}
              onChange={handleSlugChange}
              placeholder="enter-url-slug"
            />
          </Box>
          <Button
            text="Generate"
            mode="ghost"
            onClick={generateSlug}
            disabled={isGenerating || !currentTitle}
            title="Generate slug from title"
          />
        </Flex>
      </Stack>
    </Stack>
  );
}
