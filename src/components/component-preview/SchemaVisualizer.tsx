import { Badge } from '@/components/ui/badge';

interface SchemaField {
  name: string;
  type: string;
  title?: string;
  description?: string;
  fields?: SchemaField[];
  of?: { type: string; title?: string; fields?: SchemaField[] }[];
  validation?: (rule: any) => any;
  options?: {
    list?: Array<{ title: string; value: string } | string>;
    layout?: string;
  };
}

interface SchemaObject {
  name: string;
  title?: string;
  type: string;
  fields?: SchemaField[];
}

export function SchemaVisualizer({ schema }: { schema: SchemaObject }) {
  if (!schema?.fields) return <div className="p-4 text-muted-foreground">No fields defined</div>;

  return (
    <div className="border rounded-md overflow-hidden text-sm">
      <table className="w-full text-left border-collapse">
        <thead className="bg-muted/50 text-muted-foreground font-medium">
          <tr>
            <th className="p-3 border-b w-1/4">Field Name</th>
            <th className="p-3 border-b w-1/6">Type</th>
            <th className="p-3 border-b">Description & Options</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {schema.fields.map((field) => (
            <SchemaFieldRow key={field.name} field={field} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

function SchemaFieldRow({ field, depth = 0 }: { field: SchemaField; depth?: number }) {
  const isArray = field.type === 'array';
  const isObject = field.type === 'object';
  const _hasNestedFields =
    (isObject && field.fields) || (isArray && field.of?.some((item) => item.fields));

  return (
    <>
      <tr className="group hover:bg-muted/30 transition-colors">
        <td className="p-3 align-top">
          <div className="flex flex-col" style={{ paddingLeft: `${depth * 16}px` }}>
            <span className="font-semibold text-foreground">{field.title || field.name}</span>
            <span className="text-xs text-muted-foreground font-mono mt-0.5">{field.name}</span>
          </div>
        </td>
        <td className="p-3 align-top">
          <Badge variant="outline" className="font-mono text-xs">
            {field.type}
          </Badge>
        </td>
        <td className="p-3 align-top">
          {field.description && <p className="text-muted-foreground mb-2">{field.description}</p>}

          {field.options?.list && (
            <div className="flex flex-wrap gap-1 mt-1">
              {field.options.list.map((opt: any) => {
                const label = typeof opt === 'string' ? opt : opt.title;
                const val = typeof opt === 'string' ? opt : opt.value;
                return (
                  <span
                    key={val}
                    className="inline-flex px-1.5 py-0.5 rounded border bg-background text-xs text-muted-foreground"
                  >
                    {label}
                  </span>
                );
              })}
            </div>
          )}

          {isArray && field.of && (
            <div className="mt-1 text-xs text-muted-foreground">
              Array of: {field.of.map((i) => i.title || i.type).join(', ')}
            </div>
          )}
        </td>
      </tr>

      {/* Nested Fields for Objects */}
      {isObject &&
        field.fields &&
        field.fields.map((nestedField) => (
          <SchemaFieldRow key={nestedField.name} field={nestedField} depth={depth + 1} />
        ))}

      {/* Nested Fields for Arrays of Objects (Simplified) */}
      {isArray &&
        field.of &&
        field.of.map((item, idx) =>
          item.fields?.map((nestedField) => (
            <SchemaFieldRow
              key={`${item.type}-${idx}-${nestedField.name}`}
              field={nestedField}
              depth={depth + 1}
            />
          ))
        )}
    </>
  );
}
