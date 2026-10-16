import { HairCondition, PromptGroup, ConditionPrompt } from '../types/conditionStudio';

export interface MindmapNode {
  id: string;
  type: 'condition' | 'group' | 'prompt';
  title: string;
  subtitle?: string;
  category: string;
  imageUrl?: string;
  wikiUrl?: string;
  tag?: string;
  x: number;
  y: number;
  w: number;
  h: number;
  data: any;
}

export interface MindmapEdge {
  id: string;
  sourceId: string;
  targetId: string;
  sourceType: 'condition' | 'group' | 'prompt';
  targetType: 'condition' | 'group' | 'prompt';
  edgeType: 'belongs_to' | 'depends_on' | 'brings_about';
  color: string;
  label?: string;
  isDashed?: boolean;
  fromX: number;
  fromY: number;
  toX: number;
  toY: number;
}

export interface MindmapLayoutResult {
  nodes: MindmapNode[];
  edges: MindmapEdge[];
  canvasWidth: number;
  canvasHeight: number;
}

export const MINDMAP_CARD_SIZE = {
  group: { w: 220, h: 90 },
  prompt: { w: 180, h: 100 },
  condition: { w: 230, h: 80 },
};

/**
 * Mindmap 1: Prompts ➔ Groups Layout
 * Left Column: Groups. Right Branches: Prompts belonging to each group.
 */
export function layoutPromptGroupMindmap(
  groups: PromptGroup[],
  prompts: ConditionPrompt[],
  searchQuery: string = ''
): MindmapLayoutResult {
  const nodes: MindmapNode[] = [];
  const edges: MindmapEdge[] = [];

  const startX = 60;
  let currentY = 50;
  const groupSpacingY = 40;
  const promptColumnGap = 260;
  const promptSpacingY = 115;

  const query = searchQuery.trim().toLowerCase();

  const colsPerGroup = 2;
  const colWidth = MINDMAP_CARD_SIZE.prompt.w + 24;

  groups.forEach((group) => {
    const groupPrompts = prompts.filter((p) => p.groupId === group.id && (!query || p.name.toLowerCase().includes(query) || p.tag.toLowerCase().includes(query)));
    
    // Calculate vertical span required for prompts in 2 columns
    const rowCount = Math.max(Math.ceil(groupPrompts.length / colsPerGroup), 1);
    const totalPromptsHeight = rowCount * promptSpacingY;
    const groupCardHeight = MINDMAP_CARD_SIZE.group.h;
    const blockHeight = Math.max(totalPromptsHeight, groupCardHeight);

    const groupY = currentY + (blockHeight - groupCardHeight) / 2;

    const groupNode: MindmapNode = {
      id: group.id,
      type: 'group',
      title: group.name,
      subtitle: `${group.category} • ${group.selectionMode} choice`,
      category: group.category,
      x: startX,
      y: groupY,
      w: MINDMAP_CARD_SIZE.group.w,
      h: MINDMAP_CARD_SIZE.group.h,
      data: group,
    };
    nodes.push(groupNode);

    // Place prompt nodes in 2 columns to the right of the group
    groupPrompts.forEach((prompt, idx) => {
      const colIdx = idx % colsPerGroup;
      const rowIdx = Math.floor(idx / colsPerGroup);
      const promptX = startX + promptColumnGap + colIdx * colWidth;
      const promptY = currentY + rowIdx * promptSpacingY;

      const promptNode: MindmapNode = {
        id: prompt.id,
        type: 'prompt',
        title: prompt.name,
        tag: prompt.tag,
        imageUrl: prompt.imageUrl,
        wikiUrl: prompt.wikiUrl,
        category: group.category,
        x: promptX,
        y: promptY,
        w: MINDMAP_CARD_SIZE.prompt.w,
        h: MINDMAP_CARD_SIZE.prompt.h,
        data: prompt,
      };
      nodes.push(promptNode);

      // Edge from Group to Prompt
      edges.push({
        id: `${group.id}->${prompt.id}`,
        sourceId: group.id,
        targetId: prompt.id,
        sourceType: 'group',
        targetType: 'prompt',
        edgeType: 'belongs_to',
        color: '#c084fc',
        fromX: groupNode.x + groupNode.w,
        fromY: groupNode.y + groupNode.h / 2,
        toX: promptNode.x,
        toY: promptNode.y + promptNode.h / 2,
      });
    });

    currentY += blockHeight + groupSpacingY;
  });

  return {
    nodes,
    edges,
    canvasWidth: startX + promptColumnGap + colsPerGroup * colWidth + 80,
    canvasHeight: Math.max(currentY + 100, 600),
  };
}

/**
 * Mindmap 2: Groups ➔ Conditions Layout
 * Left Column: Conditions. Right Column: Groups.
 * Interconnected with Precondition (Depends On) and Postcondition (Brings About) bezier curves.
 */
export function layoutGroupConditionMindmap(
  conditions: HairCondition[],
  groups: PromptGroup[]
): MindmapLayoutResult {
  const nodes: MindmapNode[] = [];
  const edges: MindmapEdge[] = [];

  const condStartX = 60;
  const groupStartX = 480;
  const startY = 50;
  const condSpacingY = 110;
  const groupSpacingY = 130;

  // 1. Layout Conditions on the Left
  const conditionNodeMap = new Map<string, MindmapNode>();
  conditions.forEach((cond, idx) => {
    const node: MindmapNode = {
      id: cond.id,
      type: 'condition',
      title: cond.naturalName,
      subtitle: `${cond.category} • Default: ${cond.defaultState ? 'TRUE' : 'FALSE'}`,
      category: cond.category,
      x: condStartX,
      y: startY + idx * condSpacingY,
      w: MINDMAP_CARD_SIZE.condition.w,
      h: MINDMAP_CARD_SIZE.condition.h,
      data: cond,
    };
    nodes.push(node);
    conditionNodeMap.set(cond.id, node);
  });

  // 2. Layout Groups on the Right
  const groupNodeMap = new Map<string, MindmapNode>();
  groups.forEach((group, idx) => {
    const node: MindmapNode = {
      id: group.id,
      type: 'group',
      title: group.name,
      subtitle: `${group.category} • ${group.selectionMode}`,
      category: group.category,
      x: groupStartX,
      y: startY + idx * groupSpacingY,
      w: MINDMAP_CARD_SIZE.group.w,
      h: MINDMAP_CARD_SIZE.group.h,
      data: group,
    };
    nodes.push(node);
    groupNodeMap.set(group.id, node);
  });

  // 3. Connect Preconditions (Depends On: Condition ➔ Group, Cyan)
  groups.forEach((group) => {
    const gNode = groupNodeMap.get(group.id);
    if (!gNode) return;

    (group.dependsOnConditions || []).forEach((rule) => {
      const cNode = conditionNodeMap.get(rule.conditionId);
      if (!cNode) return;

      edges.push({
        id: `dep:${cNode.id}->${gNode.id}`,
        sourceId: cNode.id,
        targetId: gNode.id,
        sourceType: 'condition',
        targetType: 'group',
        edgeType: 'depends_on',
        label: `Requires: ${rule.expectedValue ? 'TRUE' : 'FALSE'}`,
        color: '#38bdf8',
        isDashed: false,
        fromX: cNode.x + cNode.w,
        fromY: cNode.y + cNode.h / 2,
        toX: gNode.x,
        toY: gNode.y + gNode.h / 2 - 12,
      });
    });

    // 4. Connect Postconditions (Brings About: Group ➔ Condition, Purple Dashed)
    (group.bringsAboutConditions || []).forEach((mutation) => {
      const cNode = conditionNodeMap.get(mutation.conditionId);
      if (!cNode) return;

      edges.push({
        id: `brg:${gNode.id}->${cNode.id}`,
        sourceId: gNode.id,
        targetId: cNode.id,
        sourceType: 'group',
        targetType: 'condition',
        edgeType: 'brings_about',
        label: `Asserts: ${mutation.setValue ? 'TRUE' : 'FALSE'}`,
        color: '#c084fc',
        isDashed: true,
        fromX: gNode.x,
        fromY: gNode.y + gNode.h / 2 + 12,
        toX: cNode.x + cNode.w,
        toY: cNode.y + cNode.h / 2 + 12,
      });
    });
  });

  const totalHeight = Math.max(
    startY + conditions.length * condSpacingY,
    startY + groups.length * groupSpacingY,
    600
  );

  return {
    nodes,
    edges,
    canvasWidth: 850,
    canvasHeight: totalHeight + 100,
  };
}

/**
 * Slicing line intersection detector (reused from Project-Linkage)
 */
export function checkEdgeIntersection(
  p1: { x: number; y: number },
  p2: { x: number; y: number },
  p3: { x: number; y: number },
  p4: { x: number; y: number }
): boolean {
  const ccw = (A: { x: number; y: number }, B: { x: number; y: number }, C: { x: number; y: number }) => {
    return (C.y - A.y) * (B.x - A.x) > (B.y - A.y) * (C.x - A.x);
  };
  return ccw(p1, p3, p4) !== ccw(p2, p3, p4) && ccw(p1, p2, p3) !== ccw(p1, p2, p4);
}
