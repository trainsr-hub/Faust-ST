import { TableRecord } from '../types';
import { evaluateFormula } from './formula';

export interface RelationFilterPreset {
  id: string;
  name: string;
  rule: string;
  description: string;
  icon: string;
}

export const RELATION_FILTER_PRESETS: RelationFilterPreset[] = [
  {
    id: 'none',
    name: 'All Records',
    rule: '',
    description: 'No filter applied. All target records are available as options.',
    icon: '🌐',
  },
  {
    id: 'only_leaf',
    name: 'Only Take End Point (Leaves Only)',
    rule: 'only_leaf',
    description: 'In self-related / hierarchical tables, only show leaf nodes (end points). All parent folders and categories are hidden.',
    icon: '🍃',
  },
  {
    id: 'only_root',
    name: 'Root Nodes Only',
    rule: 'only_root',
    description: 'Only show top-level records that have no parent assigned.',
    icon: '🌳',
  },
];

/**
 * Discovers any parent IDs in a set of self-referencing records.
 * Scans all string fields whose values match another record's ID.
 */
export function findParentIds(records: TableRecord[]): Set<string> {
  const allIds = new Set(records.map((r) => r.id));
  const parentIds = new Set<string>();

  for (const r of records) {
    for (const [key, val] of Object.entries(r)) {
      if (key === 'id' || !val || typeof val !== 'string') continue;
      const cleanVal = val.trim();
      if (cleanVal !== r.id && allIds.has(cleanVal)) {
        parentIds.add(cleanVal);
      }
    }
  }

  return parentIds;
}

/**
 * Filter for hierarchical tables: only returns leaf nodes (end points).
 * Nodes referenced as a parent by another row are excluded.
 */
export function getLeafRecords(records: TableRecord[]): TableRecord[] {
  if (records.length <= 1) return records;
  const parentIds = findParentIds(records);
  if (parentIds.size === 0) return records;
  return records.filter((r) => !parentIds.has(r.id));
}

/**
 * Filter for hierarchical tables: only returns root nodes (items with no parent).
 */
export function getRootRecords(records: TableRecord[]): TableRecord[] {
  if (records.length <= 1) return records;
  const allIds = new Set(records.map((r) => r.id));
  const parentCols = new Set<string>();

  for (const r of records) {
    for (const [key, val] of Object.entries(r)) {
      if (key === 'id' || !val || typeof val !== 'string') continue;
      const cleanVal = val.trim();
      if (cleanVal !== r.id && allIds.has(cleanVal)) {
        parentCols.add(key);
      }
    }
  }

  if (parentCols.size === 0) return records;

  return records.filter((r) => {
    for (const col of parentCols) {
      const val = r[col];
      if (val && typeof val === 'string' && allIds.has(val.trim())) {
        return false;
      }
    }
    return true;
  });
}

/**
 * Applies the specified filter rule or formula to relation candidate records.
 */
export function filterRelationRecords(records: TableRecord[], filterRule?: string): TableRecord[] {
  const rule = String(filterRule || '').trim();
  if (!rule || rule === 'none') return records;

  if (rule === 'only_leaf') {
    return getLeafRecords(records);
  }

  if (rule === 'only_root') {
    return getRootRecords(records);
  }

  if (rule.startsWith('=')) {
    return records.filter((r) => {
      const res = evaluateFormula(rule, records, r);
      return Boolean(res) && res !== 0 && res !== '0' && res !== false && !String(res).startsWith('#ERR');
    });
  }

  return records;
}

export interface RelationOptionItem {
  id: string;
  label: string;
  table?: string;
  isSelf?: boolean;
}

/**
 * Returns all target tables configured for a relation column.
 */
export function getRelationTargetTables(metadata?: { target?: string; secondary_target?: string; targets?: string[] }): string[] {
  if (!metadata) return [];
  const list: string[] = [];
  if (Array.isArray(metadata.targets) && metadata.targets.length > 0) {
    metadata.targets.forEach((t) => t && !list.includes(t) && list.push(t));
  } else {
    if (metadata.target && !list.includes(metadata.target)) list.push(metadata.target);
    if (metadata.secondary_target && !list.includes(metadata.secondary_target)) list.push(metadata.secondary_target);
  }
  return list;
}

/**
 * Formats filtered relation records into options with label, id, and optional table metadata.
 */
export function buildFilteredRelationOptions(
  records: TableRecord[],
  filterRule?: string,
  targetField?: string,
  tableName?: string,
  isSelf?: boolean
): RelationOptionItem[] {
  const filtered = filterRelationRecords(records, filterRule);
  return filtered.map((rec) => {
    const customVal = targetField ? rec[targetField] : undefined;
    const label = customVal ?? rec.name ?? rec.natural_question ?? rec.tag ?? rec.title ?? rec.headline ?? rec.main_content ?? rec.id;
    return {
      id: rec.id,
      label: String(label || rec.id),
      table: tableName,
      isSelf,
    };
  });
}

/**
 * Builds enlarged option pool combining primary and secondary target tables.
 */
export function buildDualTableRelationOptions(
  primaryRecords: TableRecord[],
  primaryTable?: string,
  primaryField?: string,
  primaryFilter?: string,
  secondaryRecords: TableRecord[] = [],
  secondaryTable?: string,
  secondaryField?: string,
  secondaryFilter?: string,
  currentTable?: string
): RelationOptionItem[] {
  const isPrimarySelf = Boolean(primaryTable && currentTable && primaryTable === currentTable);
  const isSecondarySelf = Boolean(secondaryTable && currentTable && secondaryTable === currentTable);

  const primaryOpts = primaryTable
    ? buildFilteredRelationOptions(primaryRecords, primaryFilter, primaryField, primaryTable, isPrimarySelf)
    : [];

  const secondaryOpts = (secondaryTable && secondaryRecords.length > 0)
    ? buildFilteredRelationOptions(secondaryRecords, secondaryFilter || primaryFilter, secondaryField, secondaryTable, isSecondarySelf)
    : [];

  const seen = new Set<string>();
  const combined: RelationOptionItem[] = [];

  for (const opt of primaryOpts) {
    seen.add(opt.id);
    combined.push(opt);
  }
  for (const opt of secondaryOpts) {
    if (!seen.has(opt.id)) {
      seen.add(opt.id);
      combined.push(opt);
    }
  }
  return combined;
}

/**
 * Returns statistics for filter preview in Column Editor Drawer.
 */
export function getRelationFilterStats(records: TableRecord[], filterRule?: string): {
  total: number;
  matched: number;
  hidden: number;
} {
  const total = records.length;
  const filtered = filterRelationRecords(records, filterRule);
  const matched = filtered.length;
  return {
    total,
    matched,
    hidden: total - matched,
  };
}

/**
 * Resolves a human-readable display label for a relation record ID across single or dual tables.
 */
export function resolveRelationLabel(
  relId: string,
  targetTable?: string,
  targetField?: string,
  relationStore?: Record<string, Record<string, TableRecord>>,
  fallbackOptions?: { id: string; label: string }[],
  secondaryTargetTable?: string,
  secondaryTargetField?: string
): string {
  if (!relId) return '';
  const tryResolve = (table?: string, field?: string): string | null => {
    if (table && relationStore && relationStore[table]) {
      const rec = relationStore[table][relId];
      if (rec) {
        const customVal = field ? rec[field] : undefined;
        const label = customVal ?? rec.name ?? rec.natural_question ?? rec.tag ?? rec.title ?? rec.main_content ?? rec.headline ?? relId;
        return String(label || relId);
      }
    }
    return null;
  };

  const fromPrimary = tryResolve(targetTable, targetField);
  if (fromPrimary) return fromPrimary;

  const fromSecondary = tryResolve(secondaryTargetTable, secondaryTargetField);
  if (fromSecondary) return fromSecondary;

  if (relationStore) {
    for (const [tblName, store] of Object.entries(relationStore)) {
      if (tblName === targetTable || tblName === secondaryTargetTable) continue;
      const rec = store[relId];
      if (rec) {
        const label = rec.name ?? rec.natural_question ?? rec.tag ?? rec.title ?? rec.main_content ?? rec.headline ?? relId;
        return String(label || relId);
      }
    }
  }

  const found = fallbackOptions?.find((o) => o.id === relId);
  if (found) return found.label;
  return relId;
}

