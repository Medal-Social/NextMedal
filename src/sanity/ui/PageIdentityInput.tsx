'use client';

import { ClipboardIcon, EyeOpenIcon, LaunchIcon } from '@sanity/icons';
import { Box, Button, Card, Flex, Stack, Text, TextInput, useToast } from '@sanity/ui';
import { useCallback, useMemo, useState } from 'react';
import { type ObjectInputProps, set, useFormValue } from 'sanity';
import { COLLECTION_TYPES, type CollectionType } from '@/lib/collections/types';
import { BASE_URL } from '@/lib/core/env.client';

/**
 * Default collection slugs for URL preview in Sanity Studio.
 * Note: These are fallback values. The actual slugs may vary per locale
 * and are defined in the generated collections.generated.ts file.
 */
const DEFAULT_COLLECTION_SLUGS: Record<CollectionType, string> = {
  'collection.article': 'articles',
  'collection.documentation': 'docs',
  'collection.changelog': 'changelog',
  'collection.newsletter': 'newsletter',
  'collection.events': 'events',
};

/**
 * Custom input component for Page/Post Identity (title + slug)
 * Renders both fields with minimal spacing and integrated preview buttons
 */
export default function PageIdentityInput(props: ObjectInputProps) {
  const { value, onChange, members } = props;
  const [isGenerating, setIsGenerating] = useState(false);

  // Get validation markers for slug field
  // biome-ignore lint/suspicious/noExplicitAny: Safely searching through mixed field/fieldset members
  const slugMember = members.find((member: any) => member.name === 'slug') as any;
  // Access validation markers (not validation rules) - these are the actual errors/warnings
  const slugValidation = Array.isArray(slugMember?.field?.validation)
    ? slugMember.field.validation
    : [];

  // Get document type for URL construction
  const documentType = useFormValue(['_type']) as string | undefined;
  const language = useFormValue(['language']) as string | undefined;
  const toast = useToast();

  // Derived state
  const isCollectionDocument = documentType
    ? COLLECTION_TYPES.includes(documentType as CollectionType)
    : false;

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

  // Build collection segment (for collection documents only)
  const collectionSegment = useMemo(() => {
    if (!isCollectionDocument || !documentType) return '';

    const slug = DEFAULT_COLLECTION_SLUGS[documentType as CollectionType];
    return slug ? `/${slug}` : '';
  }, [isCollectionDocument, documentType]);

  // Build full preview URL
  const previewUrl = useMemo(() => {
    if (!currentSlug) return null;

    const langPrefix = language && language !== 'en' ? `/${language}` : '';
    const slugPath = currentSlug === 'index' ? '' : `${collectionSegment}/${currentSlug}`;

    return `${BASE_URL}${langPrefix}${slugPath}` || `${BASE_URL}/`;
  }, [currentSlug, language, collectionSegment]);

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

  // Copy preview URL to clipboard
  const copyUrl = useCallback(async () => {
    if (!previewUrl) return;

    try {
      await navigator.clipboard.writeText(previewUrl);
      toast.push({
        status: 'success',
        title: 'URL copied to clipboard',
      });
    } catch (_error) {
      toast.push({
        status: 'error',
        title: 'Failed to copy URL',
      });
    }
  }, [previewUrl, toast]);

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
  const isCollectionItem = documentType?.startsWith('collection.');
  const titleLabel = isCollectionItem ? 'Title' : 'Page Title';
  const titleDescription = isCollectionItem
    ? 'The main title of this item'
    : 'The main title of the page';
  const slugDescription = isCollectionItem
    ? `The URL path for this item. Will be appended to the collection URL (e.g., ${collectionSegment || '/collection'}/my-slug)`
    : 'The URL path for this page (e.g., about-us)';

  return (
    <Stack space={4}>
      {/* Title field */}
      <Stack space={3}>
        <Text size={1} weight="medium">
          {titleLabel}
        </Text>
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

        {/* Inline validation display - matches Sanity's native style */}
        {slugValidation.length > 0 && (
          <Card
            tone={slugValidation[0].level === 'error' ? 'critical' : 'caution'}
            padding={2}
            radius={2}
            border
          >
            <Text size={1}>{slugValidation[0].message}</Text>
          </Card>
        )}

        {/* Preview box - only shown when slug is valid */}
        {previewUrl && slugValidation.length === 0 && (
          <Card padding={4} radius={2} tone="primary" border>
            <Stack space={3}>
              <Text size={1} muted>
                Preview URL
              </Text>
              <Card padding={3} radius={2} shadow={1} tone="transparent">
                <Text size={1} style={{ wordBreak: 'break-all', fontFamily: 'monospace' }}>
                  {previewUrl}
                </Text>
              </Card>
              <Flex gap={2}>
                <Button
                  icon={ClipboardIcon}
                  text="Copy URL"
                  mode="ghost"
                  tone="default"
                  onClick={copyUrl}
                  fontSize={1}
                  style={{ border: '1px solid var(--card-border-color)' }}
                />
                <Button
                  icon={EyeOpenIcon}
                  text="Visual Editor"
                  mode="ghost"
                  tone="default"
                  onClick={openInVisualEditor}
                  fontSize={1}
                  style={{ border: '1px solid var(--card-border-color)' }}
                />
                <Button
                  icon={LaunchIcon}
                  text="Open in New Tab"
                  mode="ghost"
                  tone="default"
                  onClick={openPreview}
                  fontSize={1}
                  style={{ border: '1px solid var(--card-border-color)' }}
                />
              </Flex>
            </Stack>
          </Card>
        )}
      </Stack>
    </Stack>
  );
}
