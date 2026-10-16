import { GraphNode, GraphEdge, GraphState, GraphLayoutPreset } from '../types/hairGraph';
import { getInitialGraphState, INITIAL_GRAPH_NODES, INITIAL_GRAPH_EDGES } from './hairGraphData';

const STORAGE_KEY = 'faust_hair_mindmap_state_v1';

export function loadSavedGraphState(): GraphState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.nodes && parsed.edges) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Failed to load saved graph state, using default:', e);
  }
  return getInitialGraphState();
}

export function saveGraphState(state: GraphState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.warn('Failed to save graph state:', e);
  }
}

export function createEdge(sourceId: string, targetId: string, label?: string): GraphEdge {
  return {
    id: `e_${sourceId}_${targetId}_${Date.now()}`,
    sourceId,
    targetId,
    label: label || 'connects',
  };
}

export function removeEdgeById(edges: GraphEdge[], edgeId: string): GraphEdge[] {
  return edges.filter((e) => e.id !== edgeId);
}

export function applyLayoutPreset(
  nodes: Record<string, GraphNode>,
  edges: GraphEdge[],
  preset: GraphLayoutPreset
): Record<string, GraphNode> {
  if (preset === 'reset') {
    return { ...INITIAL_GRAPH_NODES };
  }

  if (preset === 'cluster') {
    return layoutByCategory(nodes);
  }

  if (preset === 'tree') {
    return layoutAsHierarchicalTree(nodes, edges);
  }

  return nodes;
}

function layoutByCategory(nodes: Record<string, GraphNode>): Record<string, GraphNode> {
  const categories: Record<string, GraphNode[]> = {};
  Object.values(nodes).forEach((node) => {
    const cat = node.subcategory || node.category || 'General';
    if (!categories[cat]) categories[cat] = [];
    categories[cat].push(node);
  });

  const next: Record<string, GraphNode> = {};
  const catNames = Object.keys(categories);
  const islandCols = Math.ceil(Math.sqrt(catNames.length));

  catNames.forEach((cat, cIdx) => {
    const islandRow = Math.floor(cIdx / islandCols);
    const islandCol = cIdx % islandCols;
    const originX = (islandCol - islandCols / 2) * 1100;
    const originY = (islandRow - islandCols / 2) * 1100;

    const list = categories[cat];
    const itemCols = Math.ceil(Math.sqrt(list.length));
    list.forEach((node, nIdx) => {
      const r = Math.floor(nIdx / itemCols);
      const c = nIdx % itemCols;
      next[node.id] = {
        ...node,
        x: Math.round(originX + (c - itemCols / 2) * 210),
        y: Math.round(originY + (r - list.length / (itemCols * 2)) * 250),
      };
    });
  });

  return next;
}

function layoutAsHierarchicalTree(
  nodes: Record<string, GraphNode>,
  edges: GraphEdge[]
): Record<string, GraphNode> {
  const outgoing: Record<string, string[]> = {};
  const incomingCount: Record<string, number> = {};

  Object.keys(nodes).forEach((id) => {
    outgoing[id] = [];
    incomingCount[id] = 0;
  });

  edges.forEach((edge) => {
    if (outgoing[edge.sourceId] && incomingCount[edge.targetId] !== undefined) {
      outgoing[edge.sourceId].push(edge.targetId);
      incomingCount[edge.targetId] = (incomingCount[edge.targetId] || 0) + 1;
    }
  });

  const roots = Object.keys(nodes).filter((id) => (incomingCount[id] || 0) === 0);
  const next: Record<string, GraphNode> = { ...nodes };
  const visited = new Set<string>();

  let rootX = -(roots.length * 400) / 2;

  function placeSubtree(id: string, x: number, y: number, depth: number): number {
    visited.add(id);
    const children = (outgoing[id] || []).filter((cid) => !visited.has(cid));

    if (children.length === 0) {
      next[id] = { ...next[id], x: Math.round(x), y: Math.round(y) };
      return x + 230;
    }

    let childX = x;
    const childWidths: number[] = [];
    children.forEach((cid) => {
      const nextX = placeSubtree(cid, childX, y + 260, depth + 1);
      childWidths.push(nextX - childX);
      childX = nextX;
    });

    const totalChildSpan = childX - x;
    const centeredX = x + totalChildSpan / 2 - 110;
    next[id] = { ...next[id], x: Math.round(centeredX), y: Math.round(y) };
    return Math.max(x + 230, childX);
  }

  roots.forEach((rootId) => {
    if (!visited.has(rootId)) {
      rootX = placeSubtree(rootId, rootX, 0, 0) + 150;
    }
  });

  return next;
}
