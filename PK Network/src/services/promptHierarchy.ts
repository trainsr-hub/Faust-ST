import { WorldNode, PromptEva, WorldRouteStep } from '../types/prompt';

/**
 * Pure Deterministic Hierarchy & Prompt Assembly Engine (Tier 3)
 * Hard constraint: No UI imports, maximum 40 lines per function, max 3 indent levels.
 */

export function parseStringOrArray(raw: any): string[] {
  if (!raw) return [];
  if (Array.isArray(raw)) {
    return raw.map((item) => String(item).trim()).filter(Boolean);
  }
  if (typeof raw === 'string') {
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed.map((item) => String(item).trim()).filter(Boolean);
      }
    } catch {}
    return [raw.trim()];
  }
  return [];
}

export function parseEvaRecord(raw: any, imageRecord?: any): PromptEva {
  const names = parseStringOrArray(raw.name);
  const fullName = names.join(' / ') || raw.tournament_name || raw.id;
  const primaryName = raw.tournament_name || names[0] || raw.id;
  const affiliateIds = parseStringOrArray(raw.affiliate);

  let avatarUrl: string | undefined;
  if (imageRecord && imageRecord.avatars) {
    try {
      const av = typeof imageRecord.avatars === 'string' ? JSON.parse(imageRecord.avatars) : imageRecord.avatars;
      const list = av?.default || Object.values(av || {})[0];
      if (Array.isArray(list) && list.length > 0) avatarUrl = list[0];
    } catch {}
  }

  return {
    id: raw.id,
    name: primaryName,
    fullName,
    tournamentName: raw.tournament_name || primaryName,
    evaCodex: raw.eva_codex ? String(raw.eva_codex).trim() : undefined,
    affiliateIds,
    currentEvaPrompt: raw.prompt ? String(raw.prompt).trim() : '',
    avatarUrl,
    hairColor: raw.hair_color,
    hazardRank: raw.hazard_rank,
    hazardLevel: raw.hazard_level,
    personalityTropes: raw.personality_tropes,
    defaultCostume: raw.default_custome,
    notes: raw.notes,
  };
}

export function buildWorldAncestryRoute(
  worldId: string,
  worldsMap: Record<string, WorldNode>
): WorldRouteStep[] {
  const visited = new Set<string>();
  const rawNodes: WorldNode[] = [];
  let curr: WorldNode | undefined = worldsMap[worldId];

  while (curr && !visited.has(curr.id)) {
    visited.add(curr.id);
    rawNodes.unshift(curr); // Add to beginning so root comes first
    curr = curr.child_of ? worldsMap[curr.child_of] : undefined;
  }

  const total = rawNodes.length;
  return rawNodes.map((node, idx) => ({
    node,
    depth: idx,
    isRoot: idx === 0,
    isLeaf: idx === total - 1,
    contributedPrompt: node.prompt ? String(node.prompt).trim() : '',
  }));
}

export function splitPromptTokens(str: string): string[] {
  if (!str) return [];
  return str
    .split(',')
    .map((t) => t.trim())
    .filter((t) => t.length > 0);
}

export function normalizeToken(t: string): string {
  return t.toLowerCase().trim();
}

export function accumulateOriginPrompt(route: WorldRouteStep[]): string {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const step of route) {
    for (const token of splitPromptTokens(step.contributedPrompt)) {
      const norm = normalizeToken(token);
      if (!seen.has(norm)) {
        seen.add(norm);
        result.push(token);
      }
    }
  }
  return result.join(', ');
}

/**
 * Subtracts prompt tokens found in excluded prompts from the source prompt.
 * Keeps only tokens that are unique to the source (residual).
 */
export function subtractPromptTokens(sourcePrompt: string, ...promptsToExclude: string[]): string {
  if (!sourcePrompt) return '';
  const excludedSet = new Set<string>();
  for (const p of promptsToExclude) {
    for (const t of splitPromptTokens(p)) {
      excludedSet.add(normalizeToken(t));
    }
  }

  const result: string[] = [];
  for (const t of splitPromptTokens(sourcePrompt)) {
    if (!excludedSet.has(normalizeToken(t))) {
      result.push(t);
    }
  }
  return result.join(', ');
}

export function assembleFinalPrompt(
  manualPrompt: string,
  originPrompt: string,
  ...automatedPrompts: string[]
): string {
  const seen = new Set<string>();
  const result: string[] = [];

  for (const part of [manualPrompt, originPrompt, ...automatedPrompts]) {
    for (const token of splitPromptTokens(part)) {
      const norm = normalizeToken(token);
      if (!seen.has(norm)) {
        seen.add(norm);
        result.push(token);
      }
    }
  }

  return result.join(', ');
}
