import { LinkageNodeData } from './linkageLayout';
import { buildCanonicalLinkageDatabase, CANONICAL_HAIR_LINKS } from './danbooruCanonicalLinks';

const DEFAULT_STORAGE_KEY = 'faust_hair_linkage_db_v2';
export const FACET_STORAGE_KEY = 'faust_facet_linkage_db_v1';

export { CANONICAL_HAIR_LINKS };

export function getInitialLinkageDatabase(): Record<string, LinkageNodeData> {
  return buildCanonicalLinkageDatabase();
}

export function loadLinkageDatabase(storageKey = DEFAULT_STORAGE_KEY): Record<string, LinkageNodeData> {
  try {
    const raw = localStorage.getItem(storageKey);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object' && Object.keys(parsed).length > 0) {
        return parsed;
      }
    }
    // If loading a custom key (e.g. facet) and not yet populated, seed by cloning active hair db
    if (storageKey !== DEFAULT_STORAGE_KEY) {
      const parentRaw = localStorage.getItem(DEFAULT_STORAGE_KEY);
      if (parentRaw) {
        const parsed = JSON.parse(parentRaw);
        if (parsed && typeof parsed === 'object' && Object.keys(parsed).length > 0) {
          return parsed;
        }
      }
    }
  } catch (e) {
    console.warn('Failed to load linkage database, resetting to canonical:', e);
  }
  return getInitialLinkageDatabase();
}

export function saveLinkageDatabase(db: Record<string, LinkageNodeData>, storageKey = DEFAULT_STORAGE_KEY): void {
  try {
    localStorage.setItem(storageKey, JSON.stringify(db));
  } catch (e) {
    console.warn('Failed to save linkage database:', e);
  }
}

export function addLinkage(
  db: Record<string, LinkageNodeData>,
  sourceId: string,
  targetId: string
): { nextDb: Record<string, LinkageNodeData>; isCycle: boolean } {
  if (sourceId === targetId || !db[sourceId] || !db[targetId]) {
    return { nextDb: db, isCycle: false };
  }

  // Cycle check: does targetId already reach sourceId?
  const hasPath = (start: string, end: string, visited = new Set<string>()): boolean => {
    if (start === end) return true;
    if (visited.has(start)) return false;
    visited.add(start);
    const children = Object.keys(db[start]?.links_to || {});
    return children.some((child) => hasPath(child, end, visited));
  };

  if (hasPath(targetId, sourceId)) {
    return { nextDb: db, isCycle: true };
  }

  const nextDb = {
    ...db,
    [sourceId]: {
      ...db[sourceId],
      links_to: {
        ...(db[sourceId].links_to || {}),
        [targetId]: true,
      },
    },
  };

  return { nextDb, isCycle: false };
}

export function removeLinkage(
  db: Record<string, LinkageNodeData>,
  sourceId: string,
  targetId: string
): Record<string, LinkageNodeData> {
  if (!db[sourceId] || !db[sourceId].links_to) return db;

  const nextLinks = { ...db[sourceId].links_to };
  delete nextLinks[targetId];

  return {
    ...db,
    [sourceId]: {
      ...db[sourceId],
      links_to: nextLinks,
    },
  };
}

export function setNodeDiscarded(
  db: Record<string, LinkageNodeData>,
  nodeId: string,
  isDiscarded: boolean
): Record<string, LinkageNodeData> {
  return db[nodeId] ? { ...db, [nodeId]: { ...db[nodeId], isDiscarded } } : db;
}

export function restoreAllNodes(db: Record<string, LinkageNodeData>): Record<string, LinkageNodeData> {
  const nextDb: Record<string, LinkageNodeData> = {};
  for (const [id, node] of Object.entries(db)) nextDb[id] = { ...node, isDiscarded: false };
  return nextDb;
}

export function createTaglessNode(
  db: Record<string, LinkageNodeData>,
  label: string,
  subcategory = 'Concept Hub'
): { nextDb: Record<string, LinkageNodeData>; newId: string } {
  const cleanLabel = label.trim() || 'Concept Group';
  const newId = `tagless_${Date.now()}`;
  const newNode: LinkageNodeData = {
    id: newId,
    tag: cleanLabel,
    customLabel: cleanLabel,
    isTagless: true,
    category: 'Concept Hub',
    subcategory: subcategory.trim() || 'Concept Hub',
    description: 'Structural tagless concept node for grouping and organizing hierarchy',
    links_to: {},
    isDiscarded: false,
  };
  return { nextDb: { ...db, [newId]: newNode }, newId };
}

export function updateNodeLabel(
  db: Record<string, LinkageNodeData>,
  nodeId: string,
  newLabel: string
): Record<string, LinkageNodeData> {
  const clean = newLabel.trim();
  return db[nodeId] ? { ...db, [nodeId]: { ...db[nodeId], tag: clean, customLabel: clean } } : db;
}

export function deleteNode(
  db: Record<string, LinkageNodeData>,
  nodeId: string
): Record<string, LinkageNodeData> {
  const nextDb: Record<string, LinkageNodeData> = {};
  for (const [id, node] of Object.entries(db)) {
    if (id === nodeId) continue;
    if (node.links_to?.[nodeId]) {
      const nextLinks = { ...node.links_to };
      delete nextLinks[nodeId];
      nextDb[id] = { ...node, links_to: nextLinks };
    } else {
      nextDb[id] = node;
    }
  }
  return nextDb;
}

/**
 * Traverse upstream to find all root ancestors of nodeId, then downstream
 * to collect every node in that complete tree branch.
 */
export function getEntireBranchNodeIds(
  db: Record<string, LinkageNodeData>,
  nodeId: string
): string[] {
  if (!db[nodeId]) return [];
  const parentMap = new Map<string, string[]>();
  for (const [pId, pNode] of Object.entries(db)) {
    for (const cId of Object.keys(pNode.links_to || {})) {
      const arr = parentMap.get(cId) || [];
      arr.push(pId);
      parentMap.set(cId, arr);
    }
  }
  const roots = new Set<string>();
  const visitedUp = new Set<string>();
  const queueUp = [nodeId];
  while (queueUp.length > 0) {
    const cur = queueUp.shift()!;
    if (visitedUp.has(cur)) continue;
    visitedUp.add(cur);
    const parents = parentMap.get(cur);
    if (!parents?.length) roots.add(cur);
    else parents.forEach((p) => !visitedUp.has(p) && queueUp.push(p));
  }
  const branchIds = new Set<string>();
  const queueDown = Array.from(roots);
  while (queueDown.length > 0) {
    const cur = queueDown.shift()!;
    if (branchIds.has(cur)) continue;
    branchIds.add(cur);
    Object.keys(db[cur]?.links_to || {}).forEach((c) => db[c] && !branchIds.has(c) && queueDown.push(c));
  }
  return Array.from(branchIds);
}

export { countTransitiveDependents, getAllTransitiveDependentCounts } from './linkageLayout';

