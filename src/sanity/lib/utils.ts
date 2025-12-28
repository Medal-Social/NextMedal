import type { Divider, ListItem, ListItemBuilder, StructureBuilder } from 'sanity/structure';

export const singleton = (S: StructureBuilder, id: string, title?: string): ListItemBuilder =>
  S.listItem()
    .id(id)
    .title(
      title ||
        id
          .split(/(?=[A-Z])/)
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ')
    )
    .child(S.editor().id(id).schemaType(id).documentId(id));

export const group = (
  S: StructureBuilder,
  title: string,
  items: (ListItemBuilder | ListItem | Divider)[]
): ListItemBuilder => S.listItem().title(title).child(S.list().title(title).items(items));

/**
 * Return the text of a block type as a single string. Use in schema previews.
 */
export function getBlockText(
  block?: {
    children?: {
      text: string;
    }[];
  }[],
  lineBreakChar = '↵ '
) {
  return (
    block?.reduce((acc, blockItem, index) => {
      const text = blockItem.children?.flatMap((child) => child.text).join('') || '';
      return acc + text + (index !== block.length - 1 ? lineBreakChar : '');
    }, '') || ''
  );
}
