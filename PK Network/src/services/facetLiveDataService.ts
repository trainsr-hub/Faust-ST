import { ConditionPrompt, PromptGroup } from '../types/conditionStudio';
import { HairRelationNode, HairCodexItem } from '../types/hairCodex';
import { LinkageNodeData } from './linkageLayout';
import { temptConditionLiveApi } from './temptConditionLiveApi';

export const FACET_CACHE_KEY = 'faust_facet_live_cache_v2';

export interface FacetNodeData extends LinkageNodeData {
  length: string[];
  dependOn: string[];
  groupId: string;
  name: string;
}

export interface FacetLiveState {
  nodes: Record<string, FacetNodeData>;
  groups: PromptGroup[];
  categories: string[];
  subcategories: string[];
}

export function buildFacetNodeDatabase(
  prompts: ConditionPrompt[],
  groups: PromptGroup[],
  discardedIds: Set<string> = new Set()
): Record<string, FacetNodeData> {
  const groupMap = new Map<string, PromptGroup>();
  groups.forEach((g) => groupMap.set(g.id, g));

  const db: Record<string, FacetNodeData> = {};

  // 1. Initialize node dictionary
  prompts.forEach((p) => {
    const grp = groupMap.get(p.groupId);
    const category = grp?.category || 'Uncategorized';
    const subcategory = grp?.name || p.groupId || 'General';

    db[p.id] = {
      id: p.id,
      tag: p.tag || p.id,
      name: p.name || p.tag || p.id,
      customLabel: p.name || p.tag || p.id,
      image: p.imageUrl || null,
      wikiUrl: p.wikiUrl,
      category,
      subcategory,
      groupId: p.groupId,
      length: Array.isArray(p.length) ? p.length : [],
      dependOn: Array.isArray(p.dependOn) ? p.dependOn : [],
      isDiscarded: discardedIds.has(p.id),
      links_to: {},
    };
  });

  // 2. Invert dependOn: If child B depends on parent A, add A => B to A's links_to
  prompts.forEach((p) => {
    const childId = p.id;
    const deps = Array.isArray(p.dependOn) ? p.dependOn : [];
    deps.forEach((parentId) => {
      if (db[parentId]) {
        if (!db[parentId].links_to) db[parentId].links_to = {};
        db[parentId].links_to![childId] = true;
      }
    });
  });

  return db;
}

export function loadCachedFacetState(): FacetLiveState | null {
  try {
    const raw = localStorage.getItem(FACET_CACHE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function saveCachedFacetState(state: FacetLiveState): void {
  try {
    localStorage.setItem(FACET_CACHE_KEY, JSON.stringify(state));
  } catch {}
}

export async function fetchLiveFacetState(discardedIds: Set<string> = new Set()): Promise<FacetLiveState> {
  const payload = await temptConditionLiveApi.fetchAll();
  const nodes = buildFacetNodeDatabase(payload.prompts, payload.groups, discardedIds);

  const categories = Array.from(new Set(payload.groups.map((g) => g.category))).filter(Boolean).sort();
  const subcategories = Array.from(new Set(payload.groups.map((g) => g.name))).filter(Boolean).sort();

  const state: FacetLiveState = { nodes, groups: payload.groups, categories, subcategories };
  saveCachedFacetState(state);
  return state;
}

export function hasCycle(db: Record<string, FacetNodeData>, startId: string, targetId: string): boolean {
  if (startId === targetId) return true;
  const visited = new Set<string>();
  const stack = [targetId];

  while (stack.length > 0) {
    const curr = stack.pop()!;
    if (curr === startId) return true;
    if (visited.has(curr)) continue;
    visited.add(curr);

    const children = Object.keys(db[curr]?.links_to || {});
    for (const child of children) {
      if (!visited.has(child)) stack.push(child);
    }
  }
  return false;
}

export function connectFacetNodes(
  db: Record<string, FacetNodeData>,
  sourceId: string,
  targetId: string
): { nextDb: Record<string, FacetNodeData>; isCycle: boolean; updatedTarget?: FacetNodeData } {
  if (!db[sourceId] || !db[targetId] || sourceId === targetId) {
    return { nextDb: db, isCycle: false };
  }
  if (hasCycle(db, sourceId, targetId)) {
    return { nextDb: db, isCycle: true };
  }

  const nextDb = { ...db };
  const sourceNode = { ...nextDb[sourceId], links_to: { ...nextDb[sourceId].links_to, [targetId]: true } };
  const targetDeps = Array.from(new Set([...(nextDb[targetId].dependOn || []), sourceId]));
  const targetNode = { ...nextDb[targetId], dependOn: targetDeps };

  nextDb[sourceId] = sourceNode;
  nextDb[targetId] = targetNode;

  // Persist updated dependOn to Turso SQLite
  temptConditionLiveApi.updatePromptDependOn(targetId, targetDeps).catch(console.error);

  return { nextDb, isCycle: false, updatedTarget: targetNode };
}

export function disconnectFacetNodes(
  db: Record<string, FacetNodeData>,
  sourceId: string,
  targetId: string
): { nextDb: Record<string, FacetNodeData>; updatedTarget?: FacetNodeData } {
  if (!db[sourceId] || !db[targetId]) return { nextDb: db };

  const nextDb = { ...db };
  const nextLinks = { ...(nextDb[sourceId].links_to || {}) };
  delete nextLinks[targetId];

  const targetDeps = (nextDb[targetId].dependOn || []).filter((id) => id !== sourceId);
  const sourceNode = { ...nextDb[sourceId], links_to: nextLinks };
  const targetNode = { ...nextDb[targetId], dependOn: targetDeps };

  nextDb[sourceId] = sourceNode;
  nextDb[targetId] = targetNode;

  // Persist updated dependOn to Turso SQLite
  temptConditionLiveApi.updatePromptDependOn(targetId, targetDeps).catch(console.error);

  return { nextDb, updatedTarget: targetNode };
}

export function buildFacetTreeRoots(db: Record<string, FacetNodeData>): HairRelationNode[] {
  const nodes = Object.values(db).filter((n) => !n.isDiscarded);
  const roots = nodes.filter((n) => (n.dependOn || []).length === 0 && Object.keys(n.links_to || {}).length > 0);

  return roots.map((root) => {
    const childrenIds = Object.keys(root.links_to || {});
    const children: HairRelationNode[] = childrenIds
      .filter((cid) => db[cid] && !db[cid].isDiscarded)
      .map((cid) => {
        const cNode = db[cid];
        const item: HairCodexItem = {
          id: cNode.id,
          category: cNode.category,
          subcategory: cNode.subcategory,
          tag: cNode.tag,
          danbooruTag: cNode.tag.replace(/ /g, '_'),
          wikiUrl: cNode.wikiUrl || `https://danbooru.donmai.us/wiki_pages/${encodeURIComponent(cNode.tag.replace(/ /g, '_'))}`,
          imageUrl: cNode.image,
          parentTag: root.tag,
        };
        return { tag: cNode.tag, item, children: [] };
      });

    const rootItem: HairCodexItem = {
      id: root.id,
      category: root.category,
      subcategory: root.subcategory,
      tag: root.tag,
      danbooruTag: root.tag.replace(/ /g, '_'),
      wikiUrl: root.wikiUrl || `https://danbooru.donmai.us/wiki_pages/${encodeURIComponent(root.tag.replace(/ /g, '_'))}`,
      imageUrl: root.image,
    };

    return { tag: root.tag, item: rootItem, children };
  });
}

