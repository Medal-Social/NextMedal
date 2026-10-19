/**
 * Return the text of a block type as a single string. Use in schema previews.
 * Filters out non-text blocks (images, videos, etc.) and only processes text blocks.
 *
 * @param block - Portable Text content (accepts any array-like structure, filters internally)
 * @param lineBreakChar - Character to use for line breaks between blocks
 */
// biome-ignore lint/suspicious/noExplicitAny: Accepts flexible input types from Sanity validation context
export function getBlockText(block?: any, lineBreakChar = '↵ ') {
  if (!block || !Array.isArray(block)) return '';

  // Filter to only PortableTextBlock items that have children
  const textBlocks = block.filter(
    // biome-ignore lint/suspicious/noExplicitAny: Type guard needs to accept flexible input from Sanity validation context
    (item: any): item is Sanity.PortableTextBlock =>
      item?._type === 'block' && 'children' in item && Array.isArray(item.children)
  );

  return textBlocks.reduce((acc, blockItem, index) => {
    const text = blockItem.children?.flatMap((child) => child.text).join('') || '';
    return acc + text + (index !== textBlocks.length - 1 ? lineBreakChar : '');
  }, '');
}
