import { TableSchema, TableRecord, ColumnDefinition } from '../types';

export interface HierarchicalRecord {
  record: TableRecord;
  level: number;
  isParent: boolean;
  childCount: number;
  parentId: string | null;
  treePath: string;
  isHeaderNode?: boolean;
  headerTitle?: string;
  headerTargetTable?: string;
  ancestorIds?: string[];
}

export interface HeadingSortCandidate {
  column: ColumnDefinition;
  isSelf: boolean;
  targetTable: string;
  targetSelfRelColSlug?: string;
}

/**
 * Checks if the given table schema contains a single self-relation column.
 */
export function getSelfRelationColumn(schema: TableSchema): ColumnDefinition | null {
  if (!schema?.columns || !schema?.table_name) return null;
  const selfRelCols = schema.columns.filter((c) =>
    c.type === 'relation_single' && (c.metadata?.target === schema.table_name || c.metadata?.secondary_target === schema.table_name)
  );
  return selfRelCols.length >= 1 ? selfRelCols[0] : null;
}

/**
 * Discovers all eligible columns in a schema that can be used for Heading Sort.
 */
export function getHeadingSortCandidates(
  schema: TableSchema,
  allSchemas: Record<string, TableSchema>
): HeadingSortCandidate[] {
  if (!schema?.columns) return [];
  const list: HeadingSortCandidate[] = [];

  for (const col of schema.columns) {
    const targets = [col.metadata?.target, col.metadata?.secondary_target].filter(Boolean) as string[];
    if (targets.includes(schema.table_name) && col.type === 'relation_single') {
      list.push({ column: col, isSelf: true, targetTable: schema.table_name, targetSelfRelColSlug: col.slug });
    } else {
      for (const t of targets) {
        const targetSchema = allSchemas[t];
        const targetSelfCol = targetSchema ? getSelfRelationColumn(targetSchema) : null;
        if (targetSelfCol) {
          list.push({ column: col, isSelf: false, targetTable: t, targetSelfRelColSlug: targetSelfCol.slug });
          break;
        }
      }
    }
  }
  return list;
}

/**
 * Extracts the first foreign key ID from a relation value (if multi, takes first option).
 */
export function extractFirstRelationId(value: any): string | null {
  if (!value) return null;
  if (Array.isArray(value)) {
    const first = value[0];
    return first && typeof first === 'string' && first.trim() ? first.trim() : null;
  }
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed) return null;
    if (trimmed.startsWith('[')) {
      try {
        const parsed = JSON.parse(trimmed);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const first = parsed[0];
          return first && typeof first === 'string' && first.trim() ? first.trim() : null;
        }
      } catch {}
    }
    const first = trimmed.split(',')[0]?.trim();
    return first || null;
  }
  return null;
}

/**
 * Deterministic comparison helper for table records.
 */
export function compareRecords(a: TableRecord, b: TableRecord, sortCol: string | null, sortAsc: boolean): number {
  if (!sortCol) return 0;
  const va = a[sortCol];
  const vb = b[sortCol];
  if (va === vb) return 0;
  if (va === null || va === undefined || va === '') return 1;
  if (vb === null || vb === undefined || vb === '') return -1;
  const cmp = typeof va === 'number' && typeof vb === 'number'
    ? va - vb
    : String(va).localeCompare(String(vb), undefined, { numeric: true, sensitivity: 'base' });
  return sortAsc ? cmp : -cmp;
}

/**
 * Builds a hierarchical list of records for direct self-relations.
 */
export function buildHeadingSortedRecords(
  records: TableRecord[],
  parentColSlug: string,
  sortCol: string | null = null,
  sortAsc: boolean = true
): HierarchicalRecord[] {
  if (!records || records.length === 0) return [];
  const recordMap = new Map<string, TableRecord>();
  const childrenMap = new Map<string, TableRecord[]>();

  for (const r of records) {
    recordMap.set(r.id, r);
    childrenMap.set(r.id, []);
  }

  const roots: TableRecord[] = [];
  for (const r of records) {
    const rawParent = r[parentColSlug];
    const parentId = typeof rawParent === 'string' && rawParent.trim() ? rawParent.trim() : null;
    if (parentId && parentId !== r.id && recordMap.has(parentId)) {
      childrenMap.get(parentId)!.push(r);
    } else {
      roots.push(r);
    }
  }

  if (sortCol) {
    roots.sort((a, b) => compareRecords(a, b, sortCol, sortAsc));
    for (const children of childrenMap.values()) {
      children.sort((a, b) => compareRecords(a, b, sortCol, sortAsc));
    }
  }

  const result: HierarchicalRecord[] = [];
  const visited = new Set<string>();

  function traverse(rec: TableRecord, level: number, pathPrefix: string, ancestorIds: string[] = []) {
    if (visited.has(rec.id)) return;
    visited.add(rec.id);
    const children = childrenMap.get(rec.id) || [];
    const rawParent = rec[parentColSlug];
    const parentId = typeof rawParent === 'string' && rawParent.trim() ? rawParent.trim() : null;

    result.push({
      record: rec,
      level,
      isParent: children.length > 0,
      childCount: children.length,
      parentId: parentId && parentId !== rec.id ? parentId : null,
      treePath: pathPrefix,
      isHeaderNode: false,
      ancestorIds,
    });

    const nextAncestors = [...ancestorIds, rec.id];
    children.forEach((child, idx) => {
      traverse(child, level + 1, `${pathPrefix}.${idx + 1}`, nextAncestors);
    });
  }

  roots.forEach((root, idx) => traverse(root, 0, `${idx + 1}`, []));
  for (const r of records) {
    if (!visited.has(r.id)) traverse(r, 0, `${result.length + 1}`, []);
  }
  return result;
}

/**
 * Builds a unified hierarchical tree when the active table relates to an external self-referencing table.
 */
export function buildForeignHeadingSortedRecords(
  records: TableRecord[],
  relCol: ColumnDefinition,
  targetSchema: TableSchema,
  targetRecords: TableRecord[],
  targetSelfColSlug: string,
  sortCol: string | null = null,
  sortAsc: boolean = true
): HierarchicalRecord[] {
  if (!records) return [];

  // 1. Build the related table's complete tree hierarchy
  const targetHierarchy = buildHeadingSortedRecords(targetRecords, targetSelfColSlug, null, true);
  const targetMap = new Map<string, HierarchicalRecord>();
  const targetChildren = new Map<string, string[]>();

  for (const th of targetHierarchy) {
    targetMap.set(th.record.id, th);
    targetChildren.set(th.record.id, []);
  }
  for (const th of targetHierarchy) {
    if (th.parentId && targetChildren.has(th.parentId)) {
      targetChildren.get(th.parentId)!.push(th.record.id);
    }
  }

  // 2. Partition active table's records by their target ID
  const recordsByTarget = new Map<string, TableRecord[]>();
  const unassigned: TableRecord[] = [];

  for (const r of records) {
    const targetId = extractFirstRelationId(r[relCol.slug]);
    if (targetId && targetMap.has(targetId)) {
      if (!recordsByTarget.has(targetId)) recordsByTarget.set(targetId, []);
      recordsByTarget.get(targetId)!.push(r);
    } else {
      unassigned.push(r);
    }
  }

  // 3. Sort active table records within each group
  if (sortCol) {
    for (const list of recordsByTarget.values()) {
      list.sort((a, b) => compareRecords(a, b, sortCol, sortAsc));
    }
    unassigned.sort((a, b) => compareRecords(a, b, sortCol, sortAsc));
  }

  // 4. Construct unified tree with related table nodes as headers & active records as children
  const result: HierarchicalRecord[] = [];
  const visitedTargets = new Set<string>();

  function traverseTarget(th: HierarchicalRecord, ancestorIds: string[] = []) {
    if (visitedTargets.has(th.record.id)) return;
    visitedTargets.add(th.record.id);

    const tId = th.record.id;
    const headerId = `__header_${tId}`;
    const directRecs = recordsByTarget.get(tId) || [];
    const targetLabel = th.record.name || th.record.title || th.record.headline || th.record.id;

    // A. Add the Related table's node as a Header Row
    result.push({
      record: { ...th.record, id: headerId },
      level: th.level,
      isParent: true,
      childCount: directRecs.length,
      parentId: th.parentId ? `__header_${th.parentId}` : null,
      treePath: th.treePath,
      isHeaderNode: true,
      headerTitle: String(targetLabel),
      headerTargetTable: targetSchema.table_name,
      ancestorIds,
    });

    const childAncestors = [...ancestorIds, headerId];

    // B. Add the relating table's rows as direct children under this header
    directRecs.forEach((r, idx) => {
      result.push({
        record: r,
        level: th.level + 1,
        isParent: false,
        childCount: 0,
        parentId: headerId,
        treePath: `${th.treePath}.${idx + 1}`,
        isHeaderNode: false,
        ancestorIds: childAncestors,
      });
    });

    // C. Recurse to child nodes of the related table
    const childIds = targetChildren.get(tId) || [];
    for (const childId of childIds) {
      const childTh = targetMap.get(childId);
      if (childTh) traverseTarget(childTh, childAncestors);
    }
  }

  // Traverse all root nodes of the target hierarchy
  targetHierarchy.filter((th) => th.level === 0).forEach((root) => traverseTarget(root, []));

  // 5. Append unassigned records at the end
  unassigned.forEach((r) => {
    result.push({
      record: r, level: 0, isParent: false, childCount: 0,
      parentId: null, treePath: String(result.length + 1),
      isHeaderNode: false, ancestorIds: [],
    });
  });

  return result;
}
