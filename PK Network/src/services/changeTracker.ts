import { ColumnDefinition } from '../types';

export interface SchemaDiff {
  isDirty: boolean;
  added: string[];
  removed: string[];
  modified: string[];
  reordered: boolean;
  summaryList: string[];
}

/**
 * Calculates a clean human-readable diff between current in-memory columns
 * and the persisted schema definition from Turso Cloud.
 */
export function computeSchemaDiff(
  currentCols: ColumnDefinition[] = [],
  savedCols: ColumnDefinition[] = []
): SchemaDiff {
  const savedMap = new Map<string, ColumnDefinition>();
  savedCols.forEach((c) => savedMap.set(c.slug, c));

  const currentMap = new Map<string, ColumnDefinition>();
  currentCols.forEach((c) => currentMap.set(c.slug, c));

  const added: string[] = [];
  const modified: string[] = [];
  const removed: string[] = [];
  const summaryList: string[] = [];

  // Check for additions and modifications
  for (const col of currentCols) {
    const orig = savedMap.get(col.slug);
    if (!orig) {
      added.push(col.name);
      summaryList.push(`Added column "${col.name}" (${col.type})`);
    } else {
      const typeChanged = orig.type !== col.type;
      const nameChanged = orig.name !== col.name;
      const metaChanged = JSON.stringify(orig.metadata || {}) !== JSON.stringify(col.metadata || {});
      if (typeChanged || nameChanged || metaChanged) {
        modified.push(col.name);
        const changeDesc = typeChanged
          ? `type changed to ${col.type}`
          : nameChanged
          ? `renamed to "${col.name}"`
          : `settings updated`;
        summaryList.push(`Modified "${col.name}" (${changeDesc})`);
      }
    }
  }

  // Check for removals
  for (const orig of savedCols) {
    if (!currentMap.has(orig.slug)) {
      removed.push(orig.name);
      summaryList.push(`Removed column "${orig.name}"`);
    }
  }

  // Check for reordering
  let reordered = false;
  if (added.length === 0 && removed.length === 0 && currentCols.length === savedCols.length) {
    for (let i = 0; i < currentCols.length; i++) {
      if (currentCols[i].slug !== savedCols[i].slug) {
        reordered = true;
        summaryList.push('Reordered column sequence');
        break;
      }
    }
  }

  const isDirty = added.length > 0 || removed.length > 0 || modified.length > 0 || reordered;

  return {
    isDirty,
    added,
    removed,
    modified,
    reordered,
    summaryList,
  };
}

/**
 * Formats a clean timestamp string for the last Turso sync.
 */
export function formatSyncTime(date: Date | null): string {
  if (!date) return 'Never';
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}
