import { PromptGroup, ConditionPrompt, ConditionEvaluationResult, ConditionRule } from '../types/conditionStudio';

/**
 * Deterministic condition evaluator: pure if/else checking.
 * Zero LLM overhead.
 */
export function evaluateGroup(
  group: PromptGroup,
  conditions: Record<string, boolean>
): ConditionEvaluationResult {
  const unmet: ConditionRule[] = [];

  for (const rule of group.dependsOnConditions) {
    const currentValue = Boolean(conditions[rule.conditionId]);
    if (currentValue !== rule.expectedValue) {
      unmet.push(rule);
    }
  }

  return {
    groupId: group.id,
    isUnlocked: unmet.length === 0,
    unmetConditions: unmet,
  };
}

/**
 * Returns a new conditions state after applying a group's postconditions
 * and any prompt-level specific mutations.
 */
export function applySelectionMutations(
  prevConditions: Record<string, boolean>,
  group: PromptGroup,
  prompt?: ConditionPrompt
): Record<string, boolean> {
  const next = { ...prevConditions };

  // Apply group level brings_about
  for (const mutation of group.bringsAboutConditions) {
    next[mutation.conditionId] = mutation.setValue;
  }

  // Apply prompt level specific brings_about if present
  if (prompt?.specificBringsAbout) {
    for (const mutation of prompt.specificBringsAbout) {
      next[mutation.conditionId] = mutation.setValue;
    }
  }

  return next;
}

/**
 * Generates initial conditions map from defaults
 */
export function buildInitialConditions(
  seedConditions: { id: string; defaultState: boolean }[]
): Record<string, boolean> {
  const out: Record<string, boolean> = {};
  for (const c of seedConditions) {
    out[c.id] = c.defaultState;
  }
  return out;
}
