export interface GraphNode {
  id: string;
  tag: string;
  slug: string;
  category: string;
  subcategory: string;
  imageUrl?: string | null;
  description?: string | null;
  parentTag?: string | null;
  x: number;
  y: number;
  width?: number;
  height?: number;
  isSelected?: boolean;
}

export interface GraphEdge {
  id: string;
  sourceId: string;
  targetId: string;
  label?: string;
}

export interface GraphViewport {
  x: number;
  y: number;
  zoom: number;
}

export interface GraphState {
  nodes: Record<string, GraphNode>;
  edges: GraphEdge[];
  viewport: GraphViewport;
}

export type GraphLayoutPreset = 'tree' | 'cluster' | 'radial' | 'reset';
