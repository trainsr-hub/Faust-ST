import { TableSchema, ColumnDefinition, TableRecord } from '../types';
import { parseMultiValue } from '../components/NotionMultiSelect';

/**
 * Computes all active suggestions for enum columns by aggregating defined schema options
 * and any values present in existing records.
 */
export function computeColumnSuggestions(
  columns: ColumnDefinition[],
  records: TableRecord[]
): Record<string, string[]> {
  const map: Record<string, string[]> = {};
  for (const col of columns) {
    if (col.type === 'enum_single' || col.type === 'enum_multi') {
      const set = new Set<string>(col.metadata?.options || []);
      for (const r of records) {
        const raw = r[col.slug];
        if (Array.isArray(raw)) raw.forEach((v) => v && set.add(String(v).trim()));
        else if (typeof raw === 'string') parseMultiValue(raw).forEach((v) => v && set.add(v.trim()));
      }
      map[col.slug] = Array.from(set).filter(Boolean);
    }
  }
  return map;
}

/**
 * Adds a new option to a column's metadata in the schema.
 */
export function addOptionToSchema(
  schema: TableSchema,
  colSlug: string,
  newOption: string
): TableSchema | null {
  const col = schema.columns.find((c) => c.slug === colSlug);
  if (!col || (col.metadata?.options || []).includes(newOption)) return null;

  const nextCols = schema.columns.map((c) =>
    c.slug === colSlug
      ? { ...c, metadata: { ...c.metadata, options: [...(c.metadata?.options || []), newOption] } }
      : c
  );
  return { ...schema, columns: nextCols };
}

/**
 * Removes an option from a column's metadata in the schema.
 */
export function removeOptionFromSchema(
  schema: TableSchema,
  colSlug: string,
  optionToDelete: string
): TableSchema | null {
  const col = schema.columns.find((c) => c.slug === colSlug);
  if (!col) return null;

  const currentOpts = col.metadata?.options || [];
  const nextOpts = currentOpts.filter((o) => o !== optionToDelete);
  const nextCols = schema.columns.map((c) =>
    c.slug === colSlug
      ? { ...c, metadata: { ...c.metadata, options: nextOpts } }
      : c
  );
  return { ...schema, columns: nextCols };
}

/**
 * Identifies any records that contain the deleted option and returns updates to strip it.
 */
export function getRecordOptionCleanupUpdates(
  records: TableRecord[],
  col: ColumnDefinition,
  optionToDelete: string
): { id: string; field: string; value: any }[] {
  const updates: { id: string; field: string; value: any }[] = [];

  for (const r of records) {
    const val = r[col.slug];
    if (col.type === 'enum_single' && String(val) === optionToDelete) {
      updates.push({ id: r.id, field: col.slug, value: '' });
    } else if (col.type === 'enum_multi') {
      const parsed = parseMultiValue(val);
      if (parsed.includes(optionToDelete)) {
        const nextVal = parsed.filter((v) => v !== optionToDelete);
        updates.push({ id: r.id, field: col.slug, value: nextVal });
      }
    }
  }
  return updates;
}
