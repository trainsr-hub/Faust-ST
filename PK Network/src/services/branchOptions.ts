import { HierarchicalRecord } from './headingSort';
import { ColumnDefinition } from '../types';
import { parseMultiValue } from '../components/NotionMultiSelect';

export type BranchOptionsMap = Record<string, Record<string, string[]>>;

/**
 * Builds a fast lookup map of selected options per direct branch parent and column slug.
 * Key: branchParentId (or '__root__') -> colSlug -> array of unique option values.
 */
export function buildBranchOptionsMap(
  items: HierarchicalRecord[],
  columns: ColumnDefinition[]
): BranchOptionsMap {
  const map: Record<string, Record<string, Set<string>>> = {};
  const relevantCols = columns.filter((c) =>
    ['enum_single', 'enum_multi', 'relation_single', 'relation_multi'].includes(c.type)
  );

  if (relevantCols.length === 0) return {};

  for (const item of items) {
    if (item.isHeaderNode) continue;
    const branchKey = item.parentId ?? '__root__';
    if (!map[branchKey]) map[branchKey] = {};

    for (const col of relevantCols) {
      const val = item.record[col.slug];
      if (val === null || val === undefined || val === '') continue;

      if (!map[branchKey][col.slug]) {
        map[branchKey][col.slug] = new Set<string>();
      }
      const set = map[branchKey][col.slug];

      if (Array.isArray(val)) {
        val.forEach((v) => {
          if (v) set.add(String(v).trim());
        });
      } else if (typeof val === 'string') {
        parseMultiValue(val).forEach((v) => {
          if (v) set.add(v.trim());
        });
      } else {
        set.add(String(val).trim());
      }
    }
  }

  const result: BranchOptionsMap = {};
  for (const [branchKey, cols] of Object.entries(map)) {
    result[branchKey] = {};
    for (const [colSlug, set] of Object.entries(cols)) {
      result[branchKey][colSlug] = Array.from(set);
    }
  }
  return result;
}

/**
 * Helper to partition options into pinned (branch siblings used) and others.
 */
export function partitionBranchOptions<T>(
  options: T[],
  isPinned: (item: T) => boolean
): { pinned: T[]; rest: T[] } {
  const pinned: T[] = [];
  const rest: T[] = [];
  for (const item of options) {
    if (isPinned(item)) pinned.push(item);
    else rest.push(item);
  }
  return { pinned, rest };
}
