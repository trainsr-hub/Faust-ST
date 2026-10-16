import rawSeed from './fullHairSeedData.json';
import { HairCondition, PromptGroup, ConditionPrompt } from '../types/conditionStudio';

export const SEED_CONDITIONS: HairCondition[] = (rawSeed.conditions as any[]).map((c) => ({
  id: c.id,
  naturalName: c.naturalQuestion || c.naturalName,
  description: c.description,
  category: c.category,
  defaultState: Boolean(c.defaultState),
}));

export const SEED_GROUPS: PromptGroup[] = rawSeed.groups as PromptGroup[];
export const SEED_PROMPTS: ConditionPrompt[] = rawSeed.prompts as ConditionPrompt[];
