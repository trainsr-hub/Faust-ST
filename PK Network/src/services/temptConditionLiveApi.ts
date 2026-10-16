import { HairCondition, PromptGroup, ConditionPrompt } from '../types/conditionStudio';
import { getAuthKey } from './api';
import { SEED_CONDITIONS, SEED_GROUPS, SEED_PROMPTS } from './conditionStudioData';

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

export interface ConditionStudioPayload {
  conditions: HairCondition[];
  groups: PromptGroup[];
  prompts: ConditionPrompt[];
}

export const temptConditionLiveApi = {
  // Fetch all live records from isolated tempt tables
  fetchAll: async (): Promise<ConditionStudioPayload> => {
    try {
      const res = await fetch(`${API_BASE}/api/condition-studio/tempt/all`, {
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
      console.warn('Tempt condition studio fetch failed, falling back to master seed:', e);
    }
    return {
      conditions: SEED_CONDITIONS,
      groups: SEED_GROUPS,
      prompts: SEED_PROMPTS,
    };
  },

  // Save / update condition in tempt_conditions
  saveCondition: async (condition: HairCondition): Promise<void> => {
    const payload = {
      id: condition.id,
      naturalQuestion: condition.naturalName,
      description: condition.description,
      category: condition.category,
      defaultState: condition.defaultState,
    };
    const res = await fetch(`${API_BASE}/api/condition-studio/tempt/condition`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || 'Failed to save condition');
    }
  },

  // Delete condition from tempt_conditions
  deleteCondition: async (id: string): Promise<void> => {
    const res = await fetch(`${API_BASE}/api/condition-studio/tempt/condition/${encodeURIComponent(id)}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || 'Failed to delete condition');
    }
  },

  // Save / update group in tempt_prompt_groups
  saveGroup: async (group: PromptGroup): Promise<void> => {
    const res = await fetch(`${API_BASE}/api/condition-studio/tempt/group`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(group),
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || 'Failed to save group');
    }
  },

  // Delete group from tempt_prompt_groups
  deleteGroup: async (id: string): Promise<void> => {
    const res = await fetch(`${API_BASE}/api/condition-studio/tempt/group/${encodeURIComponent(id)}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || 'Failed to delete group');
    }
  },

  // Save / update prompt in tempt_prompts
  savePrompt: async (prompt: ConditionPrompt): Promise<void> => {
    const res = await fetch(`${API_BASE}/api/condition-studio/tempt/prompt`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(prompt),
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || 'Failed to save prompt');
    }
  },

  // Delete prompt from tempt_prompts
  deletePrompt: async (id: string): Promise<void> => {
    const res = await fetch(`${API_BASE}/api/condition-studio/tempt/prompt/${encodeURIComponent(id)}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || 'Failed to delete prompt');
    }
  },

  // Update depend_on linkage for a prompt
  updatePromptDependOn: async (id: string, dependOn: string[]): Promise<void> => {
    const res = await fetch(`${API_BASE}/api/condition-studio/tempt/prompt/${encodeURIComponent(id)}/depend-on`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({ dependOn }),
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || 'Failed to update prompt dependencies');
    }
  },

  // Re-clone master tables into tempt tables
  cloneFromMaster: async (): Promise<void> => {
    const res = await fetch(`${API_BASE}/api/condition-studio/tempt/clone-from-master`, {
      method: 'POST',
      headers: getHeaders(),
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || 'Failed to re-clone from master');
    }
  },
};
