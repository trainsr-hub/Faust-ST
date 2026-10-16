import { api } from './api';
import { PromptEva, WorldNode } from '../types/prompt';
import { parseEvaRecord } from './promptHierarchy';

/**
 * Prompt Live API Bridge (Tier 2: Data Persistence & Mapping)
 * Non-blocking Turso SQLite background queries & mutations.
 */

export interface PromptBootData {
  evasList: PromptEva[];
  evasMap: Record<string, PromptEva>;
  worldsMap: Record<string, WorldNode>;
  worldsList: WorldNode[];
}

export async function fetchPromptBootData(): Promise<PromptBootData> {
  const [evasRes, worldsRes, imagesRes] = await Promise.all([
    api.getRecords('evas').catch(() => ({ records: [], count: 0 })),
    api.getRecords('worlds').catch(() => ({ records: [], count: 0 })),
    api.getRecords('character_images').catch(() => ({ records: [], count: 0 })),
  ]);

  const imagesByEva: Record<string, any> = {};
  (imagesRes.records || []).forEach((img: any) => {
    if (img.eva) imagesByEva[img.eva] = img;
    if (img.code) imagesByEva[img.code] = img;
  });

  const evasMap: Record<string, PromptEva> = {};
  const evasList: PromptEva[] = (evasRes.records || []).map((raw: any) => {
    const imgRec = imagesByEva[raw.id] || imagesByEva[raw.eva_codex];
    const eva = parseEvaRecord(raw, imgRec);
    evasMap[eva.id] = eva;
    return eva;
  });

  const worldsMap: Record<string, WorldNode> = {};
  const worldsList: WorldNode[] = (worldsRes.records || []).map((raw: any) => {
    const node: WorldNode = {
      id: raw.id,
      name: raw.name || raw.id,
      child_of: raw.child_of || null,
      prompt: raw.prompt || '',
      notes: raw.notes || '',
    };
    worldsMap[node.id] = node;
    return node;
  });

  return { evasList, evasMap, worldsMap, worldsList };
}

export async function persistEvaPrompt(evaId: string, promptText: string): Promise<boolean> {
  try {
    await api.updateRecord('evas', evaId, { prompt: promptText });
    return true;
  } catch (err) {
    console.warn(`[PromptStudio] Failed to persist eva prompt for ${evaId}:`, err);
    return false;
  }
}

export async function persistWorldPrompt(worldId: string, promptText: string): Promise<boolean> {
  try {
    await api.updateRecord('worlds', worldId, { prompt: promptText });
    return true;
  } catch (err) {
    console.warn(`[PromptStudio] Failed to persist world prompt for ${worldId}:`, err);
    return false;
  }
}
