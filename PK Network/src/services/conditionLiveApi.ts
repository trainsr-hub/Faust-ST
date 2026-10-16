import { HairCondition, PromptGroup, ConditionPrompt } from '../types/conditionStudio';
import { getAuthKey } from './api';

const API_BASE = '';

function getHeaders(): HeadersInit {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  const key = getAuthKey() || 'toiyeufaust';
  if (key) {
    headers['X-App-Key'] = key;
  }
  return headers;
}

import { SEED_CONDITIONS, SEED_GROUPS, SEED_PROMPTS } from './conditionStudioData';

export interface ConditionStudioPayload {
  conditions: HairCondition[];
  groups: PromptGroup[];
  prompts: ConditionPrompt[];
}

export const conditionLiveApi = {
  // Fetch all live records from Turso Cloud SQLite with seed fallback
  fetchAll: async (): Promise<ConditionStudioPayload> => {
    try {
      const res = await fetch(`${API_BASE}/api/condition-studio/all`, {
        headers: getHeaders(),
      });
      const data = await res.json();
      if (res.ok && data.success && (data.conditions || []).length > 0) {
        return {
          conditions: (data.conditions || []).map((c: any) => ({
            id: c.id,
            naturalName: c.naturalQuestion || c.naturalName,
            description: c.description,
            category: c.category,
            defaultState: Boolean(c.defaultState),
          })),
          groups: data.groups || [],
          prompts: data.prompts || [],
        };
      }
    } catch (e) {
      console.warn('Live condition studio fetch failed, falling back to master seed:', e);
    }
    return {
      conditions: SEED_CONDITIONS,
      groups: SEED_GROUPS,
      prompts: SEED_PROMPTS,
    };
  },

  // Save / update condition
  saveCondition: async (condition: HairCondition): Promise<void> => {
    const payload = {
      id: condition.id,
      naturalQuestion: condition.naturalName,
      description: condition.description,
      category: condition.category,
      defaultState: condition.defaultState,
    };
    const res = await fetch(`${API_BASE}/api/condition-studio/condition`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || 'Failed to save condition');
    }
  },

  // Delete condition
  deleteCondition: async (id: string): Promise<void> => {
    const res = await fetch(`${API_BASE}/api/condition-studio/condition/${encodeURIComponent(id)}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || 'Failed to delete condition');
    }
  },

  // Save / update group
  saveGroup: async (group: PromptGroup): Promise<void> => {
    const res = await fetch(`${API_BASE}/api/condition-studio/group`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(group),
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || 'Failed to save group');
    }
  },

  // Delete group
  deleteGroup: async (id: string): Promise<void> => {
    const res = await fetch(`${API_BASE}/api/condition-studio/group/${encodeURIComponent(id)}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || 'Failed to delete group');
    }
  },

  // Save / update prompt
  savePrompt: async (prompt: ConditionPrompt): Promise<void> => {
    const res = await fetch(`${API_BASE}/api/condition-studio/prompt`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(prompt),
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || 'Failed to save prompt');
    }
  },

  // Delete prompt
  deletePrompt: async (id: string): Promise<void> => {
    const res = await fetch(`${API_BASE}/api/condition-studio/prompt/${encodeURIComponent(id)}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || 'Failed to delete prompt');
    }
  },

  // Trigger fresh seed if database was cleared
  seedInitialData: async (): Promise<void> => {
    const res = await fetch(`${API_BASE}/api/condition-studio/seed`, {
      method: 'POST',
      headers: getHeaders(),
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || 'Failed to seed condition data');
    }
  },
};
