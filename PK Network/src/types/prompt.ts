/**
 * Prompt Studio Domain Types & Data Contracts
 * Tier 1: Pure typed models (Zero UI / DB dependencies)
 */

export interface WorldNode {
  id: string;
  name: string;
  child_of?: string | null;
  prompt?: string;
  notes?: string;
}

export interface PromptEva {
  id: string;
  name: string;
  fullName: string;
  tournamentName: string;
  evaCodex?: string;
  affiliateIds: string[];
  currentEvaPrompt: string;
  avatarUrl?: string;
  hairColor?: string;
  hazardRank?: string;
  hazardLevel?: number | string;
  personalityTropes?: string;
  defaultCostume?: string;
  notes?: string;
}

export interface WorldRouteStep {
  node: WorldNode;
  depth: number;
  isRoot: boolean;
  isLeaf: boolean;
  contributedPrompt: string;
}

export interface PromptStudioState {
  selectedEvaId: string | null;
  selectedWorldId: string | null;
  manualPrompt: string;
  automatedPrompt: string;
  isAutoRestEnabled: boolean;
}
