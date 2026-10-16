/**
 * Linkage Layout Engine (Adapted from Project-Linkage with strict anti-overlap guarantees)
 */

export interface LinkageNodeData {
  id: string;
  tag: string;
  isTagless?: boolean;
  customLabel?: string;
  image?: string | null;
  category: string;
  subcategory: string;
  description?: string | null;
  wikiUrl?: string;
  isDiscarded?: boolean;
  links_to?: Record<string, boolean>; // A => B (B is dependent on A)
  x?: number;
  y?: number;
  level?: number;
  linkingCount?: number;
}

export interface LinkageEdge {
  id: string;
  sourceId: string;
  targetId: string;
  fromX: number;
  fromY: number;
  toX: number;
  toY: number;
}

export interface LinkageLayoutResult {
  nodes: LinkageNodeData[];
  edges: LinkageEdge[];
  canvasWidth: number;
  canvasHeight: number;
}

export const NODE_SIZE = {
  w: 170,
  h: 95,
  cx: 85,
  cy: 47.5,
};

/**
 * Counts all nodes that depend on nodeId (including all sub-nodes down to leaves),
 * excluding hidden (isDiscarded) nodes.
 */
export function countTransitiveDependents(
  db: Record<string, LinkageNodeData>,
  nodeId: string
): number {
  if (!db[nodeId]) return 0;
  const visited = new Set<string>();
  const stack = Object.keys(db[nodeId].links_to || {});

  while (stack.length > 0) {
    const curr = stack.pop()!;
    if (visited.has(curr)) continue;
    visited.add(curr);
    const children = Object.keys(db[curr]?.links_to || {});
    for (const child of children) {
      if (!visited.has(child)) stack.push(child);
    }
  }

  let count = 0;
  for (const id of visited) {
    if (db[id] && !db[id].isDiscarded) count++;
  }
  return count;
}

export function getAllTransitiveDependentCounts(
  db: Record<string, LinkageNodeData>
): Map<string, number> {
  const counts = new Map<string, number>();
  for (const id in db) counts.set(id, countTransitiveDependents(db, id));
  return counts;
}

export function calculateLinkageLayout(
  db: Record<string, LinkageNodeData>,
  orientation: 'horizontal' | 'vertical' = 'horizontal',
  searchQuery = '',
  subcategoryFilter: string | null = null
): LinkageLayoutResult {
  let allIds = Object.keys(db).filter((id) => !db[id]?.isDiscarded);
  if (allIds.length === 0) {
    return { nodes: [], edges: [], canvasWidth: 2000, canvasHeight: 2000 };
  }

  // Precompute transitive dependent counts
  const countMap = getAllTransitiveDependentCounts(db);
  const getSortName = (id: string) => (db[id]?.customLabel || db[id]?.tag || '').toLowerCase();

  // Two-tier comparator: 1. Transitive dependent count descending, 2. Alphabetical ascending
  const nodeComparator = (a: string, b: string) => {
    const countA = countMap.get(a) || 0;
    const countB = countMap.get(b) || 0;
    if (countB !== countA) return countB - countA;
    return getSortName(a).localeCompare(getSortName(b), undefined, { sensitivity: 'base' });
  };

  // Optional subcategory focus filter (includes matched nodes + their direct connections)
  if (subcategoryFilter && subcategoryFilter !== 'all') {
    const focusSet = new Set<string>();
    allIds.forEach((id) => {
      if (db[id]?.subcategory === subcategoryFilter) {
        focusSet.add(id);
        Object.keys(db[id]?.links_to || {}).forEach((cid) => focusSet.add(cid));
      }
    });
    allIds.forEach((id) => {
      Object.keys(db[id]?.links_to || {}).forEach((cid) => {
        if (focusSet.has(cid)) focusSet.add(id);
      });
    });
    if (focusSet.size > 0) allIds = allIds.filter((id) => focusSet.has(id));
  }

  const W = NODE_SIZE.w;
  const H = NODE_SIZE.h;
  const GAP_X = orientation === 'horizontal' ? 140 : 50;
  const GAP_Y = orientation === 'horizontal' ? 40 : 120;

  const inDegree: Record<string, number> = {};
  allIds.forEach((id) => (inDegree[id] = 0));
  allIds.forEach((id) => {
    Object.keys(db[id]?.links_to || {}).forEach((targetId) => {
      if (inDegree[targetId] !== undefined) inDegree[targetId]++;
    });
  });

  // Separate connected tree roots from isolated candidate nodes
  const connectedRoots: string[] = [];
  const isolatedNodes: string[] = [];

  allIds.forEach((id) => {
    const hasOutgoing = Object.keys(db[id]?.links_to || {}).some(
      (cid) => db[cid] && !db[cid].isDiscarded
    );
    const hasIncoming = inDegree[id] > 0;

    if (inDegree[id] === 0 && hasOutgoing) {
      connectedRoots.push(id);
    } else if (!hasIncoming && !hasOutgoing) {
      isolatedNodes.push(id);
    }
  });

  // Sort roots and candidates strictly by transitive linking count, then A-Z
  connectedRoots.sort(nodeComparator);
  isolatedNodes.sort(nodeComparator);

  const nodeCoords: Record<string, { x: number; y: number; level: number }> = {};
  const occupiedSlots: Record<number, Set<number>> = {};

  const isSlotOccupied = (lvl: number, row: number) => occupiedSlots[lvl]?.has(row);
  const bookSlot = (lvl: number, row: number) => {
    if (!occupiedSlots[lvl]) occupiedSlots[lvl] = new Set();
    occupiedSlots[lvl].add(row);
  };

  const slotSize = orientation === 'vertical' ? W + GAP_X : H + GAP_Y;
  const offset = orientation === 'vertical' ? GAP_X : GAP_Y;

  const layoutBranch = (nodeId: string, level: number, startRow: number, visited = new Set<string>()): number => {
    if (nodeCoords[nodeId] || visited.has(nodeId)) return 0;
    visited.add(nodeId);

    const children = Object.keys(db[nodeId]?.links_to || {})
      .filter((cid) => db[cid] && !db[cid].isDiscarded)
      .sort(nodeComparator);

    let totalSlotsUsed = 0;
    let childrenPosSum = 0;

    children.forEach((childId) => {
      const slots = layoutBranch(childId, level + 1, startRow + totalSlotsUsed, new Set(visited));
      totalSlotsUsed += slots;
      if (nodeCoords[childId]) {
        childrenPosSum += orientation === 'vertical' ? nodeCoords[childId].x : nodeCoords[childId].y;
      }
    });

    const idealPos = children.length > 0 ? childrenPosSum / children.length : startRow * slotSize + offset;
    let targetRow = Math.round((idealPos - offset) / slotSize);
    while (isSlotOccupied(level, targetRow)) targetRow++;
    bookSlot(level, targetRow);

    const finalRowPos = targetRow * slotSize + offset;
    nodeCoords[nodeId] = orientation === 'vertical'
      ? { x: finalRowPos, y: level * (H + GAP_Y) + GAP_Y, level }
      : { x: level * (W + GAP_X) + GAP_X, y: finalRowPos, level };

    return Math.max(totalSlotsUsed, 1);
  };

  // 1. Layout connected trees in DAG hierarchy
  let globalRowCounter = 0;
  connectedRoots.forEach((rootId) => {
    globalRowCounter += layoutBranch(rootId, 0, globalRowCounter);
  });

  allIds.forEach((id) => {
    if (!nodeCoords[id] && (inDegree[id] > 0 || Object.keys(db[id]?.links_to || {}).length > 0)) {
      globalRowCounter += layoutBranch(id, 0, globalRowCounter);
    }
  });

  // 2. Compact Candidate Shelf: Arrange isolated nodes in a multi-column grid
  const COL_COUNT = orientation === 'horizontal' ? 4 : 5;
  const startRowForIsolated = globalRowCounter > 0 ? globalRowCounter + 1 : 0;

  isolatedNodes.forEach((id, idx) => {
    if (nodeCoords[id]) return;
    const col = idx % COL_COUNT;
    const row = Math.floor(idx / COL_COUNT);

    if (orientation === 'vertical') {
      nodeCoords[id] = {
        x: (startRowForIsolated + row) * (W + GAP_X) + GAP_X,
        y: col * (H + GAP_Y) + GAP_Y,
        level: col,
      };
    } else {
      nodeCoords[id] = {
        x: col * (W + GAP_X) + GAP_X,
        y: (startRowForIsolated + row) * slotSize + offset,
        level: col,
      };
    }
  });

  const q = searchQuery.trim().toLowerCase();

  const finalNodes: LinkageNodeData[] = allIds.map((id) => {
    const coords = nodeCoords[id] || { x: 50, y: 50, level: 0 };
    return {
      ...db[id],
      x: coords.x,
      y: coords.y,
      level: coords.level,
      linkingCount: countMap.get(id) || 0,
    };
  });

  const nodeMap = new Map(finalNodes.map((n) => [n.id, n]));

  const edges: LinkageEdge[] = finalNodes.flatMap((source) =>
    Object.keys(source.links_to || {})
      .filter((tid) => nodeMap.has(tid))
      .map((tid) => {
        const target = nodeMap.get(tid)!;
        return {
          id: `e_${source.id}_${tid}`,
          sourceId: source.id,
          targetId: tid,
          fromX: (source.x || 0) + (orientation === 'horizontal' ? W : NODE_SIZE.cx),
          fromY: (source.y || 0) + (orientation === 'horizontal' ? NODE_SIZE.cy : H),
          toX: (target.x || 0) + (orientation === 'horizontal' ? 0 : NODE_SIZE.cx),
          toY: (target.y || 0) + (orientation === 'horizontal' ? NODE_SIZE.cy : 0),
        };
      })
  );

  const maxX = Math.max(...finalNodes.map((n) => n.x || 0), 2000) + W + 300;
  const maxY = Math.max(...finalNodes.map((n) => n.y || 0), 1500) + H + 300;

  return {
    nodes: q ? finalNodes.filter((n) => n.tag.toLowerCase().includes(q)) : finalNodes,
    edges,
    canvasWidth: maxX,
    canvasHeight: maxY,
  };
}

export function checkIntersection(
  p1: { x: number; y: number },
  p2: { x: number; y: number },
  p3: { x: number; y: number },
  p4: { x: number; y: number }
): boolean {
  const ccw = (a: { x: number; y: number }, b: { x: number; y: number }, c: { x: number; y: number }) =>
    (c.y - a.y) * (b.x - a.x) > (b.y - a.y) * (c.x - a.x);
  return ccw(p1, p3, p4) !== ccw(p2, p3, p4) && ccw(p1, p2, p3) !== ccw(p1, p2, p4);
}
