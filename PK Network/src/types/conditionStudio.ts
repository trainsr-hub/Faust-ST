export interface HairCondition {
  id: string;
  naturalName: string;
  description: string;
  category: 'Front' | 'Coiffure' | 'Length' | 'Texture' | 'Framing' | 'Chromatics' | 'Foundation' | 'Crown' | 'Accoutrements' | string;
  defaultState: boolean;
}

export interface ConditionRule {
  conditionId: string;
  expectedValue: boolean;
}

export interface ConditionMutation {
  conditionId: string;
  setValue: boolean;
}

export interface PromptGroup {
  id: string;
  name: string;
  category: string;
  description: string;
  selectionMode: 'single' | 'multiple';
  dependsOnConditions: ConditionRule[];
  bringsAboutConditions: ConditionMutation[];
}

export interface ConditionPrompt {
  id: string;
  tag: string;
  name: string;
  groupId: string;
  imageUrl?: string;
  wikiUrl?: string;
  description: string;
  extraTokens?: string[];
  specificBringsAbout?: ConditionMutation[];
  length?: string[];
  dependOn?: string[];
}

export interface ConditionEvaluationResult {
  groupId: string;
  isUnlocked: boolean;
  unmetConditions: ConditionRule[];
}
