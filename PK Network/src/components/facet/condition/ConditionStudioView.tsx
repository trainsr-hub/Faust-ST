import React, { useState, useMemo, useCallback } from 'react';
import {
  SEED_CONDITIONS,
  SEED_GROUPS,
  SEED_PROMPTS,
} from '../../../services/conditionStudioData';
import {
  evaluateGroup,
  applySelectionMutations,
  buildInitialConditions,
} from '../../../services/conditionEngine';
import { ConditionListTable } from './ConditionListTable';
import { GroupListTable } from './GroupListTable';
import { PromptListTable } from './PromptListTable';
import { Copy, RotateCcw, Sparkles, Check } from 'lucide-react';

export const ConditionStudioView: React.FC = () => {
  const [conditions] = useState(SEED_CONDITIONS);
  const [groups] = useState(SEED_GROUPS);
  const [prompts] = useState(SEED_PROMPTS);

  const [activeConditions, setActiveConditions] = useState<Record<string, boolean>>(() =>
    buildInitialConditions(SEED_CONDITIONS)
  );
  const [selectedPromptIds, setSelectedPromptIds] = useState<Set<string>>(new Set());
  const [filterGroupId, setFilterGroupId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Evaluate all groups against current active conditions
  const evaluationMap = useMemo(() => {
    const map: Record<string, ReturnType<typeof evaluateGroup>> = {};
    for (const g of groups) {
      map[g.id] = evaluateGroup(g, activeConditions);
    }
    return map;
  }, [groups, activeConditions]);

  // Recalculate condition states based on selected prompts
  const recalculateFromPrompts = useCallback(
    (nextSelectedIds: Set<string>) => {
      let nextConds = buildInitialConditions(conditions);
      const promptMap = new Map(prompts.map((p) => [p.id, p]));
      const groupMap = new Map(groups.map((g) => [g.id, g]));

      for (const pId of nextSelectedIds) {
        const p = promptMap.get(pId);
        if (!p) continue;
        const g = groupMap.get(p.groupId);
        if (!g) continue;
        nextConds = applySelectionMutations(nextConds, g, p);
      }
      setActiveConditions(nextConds);
    },
    [conditions, prompts, groups]
  );

  const handleTogglePrompt = useCallback(
    (promptId: string) => {
      setSelectedPromptIds((prev) => {
        const next = new Set(prev);
        if (next.has(promptId)) {
          next.delete(promptId);
        } else {
          next.add(promptId);
        }
        recalculateFromPrompts(next);
        return next;
      });
    },
    [recalculateFromPrompts]
  );

  const handleToggleCondition = useCallback((condId: string) => {
    setActiveConditions((prev) => ({
      ...prev,
      [condId]: !prev[condId],
    }));
  }, []);

  const handleReset = useCallback(() => {
    setSelectedPromptIds(new Set());
    setActiveConditions(buildInitialConditions(conditions));
    setFilterGroupId(null);
  }, [conditions]);

  const synthesizedPrompt = useMemo(() => {
    const promptMap = new Map(prompts.map((p) => [p.id, p]));
    const tags = Array.from(selectedPromptIds)
      .map((id) => promptMap.get(id)?.tag)
      .filter(Boolean);
    return tags.join(', ');
  }, [selectedPromptIds, prompts]);

  const handleCopyPrompt = () => {
    if (!synthesizedPrompt) return;
    navigator.clipboard.writeText(synthesizedPrompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 12, padding: '12px 16px', background: '#090d16' }}>
      {/* 3-Column Table Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '320px 380px 1fr', gap: 14, flex: 1, minHeight: 0 }}>
        {/* Column 1: Conditions */}
        <div style={{ background: '#0e1424', borderRadius: 10, padding: 12, border: '1px solid rgba(255,255,255,0.06)', minHeight: 0 }}>
          <ConditionListTable
            conditions={conditions}
            activeState={activeConditions}
            onToggleCondition={handleToggleCondition}
          />
        </div>

        {/* Column 2: Groups */}
        <div style={{ background: '#0e1424', borderRadius: 10, padding: 12, border: '1px solid rgba(255,255,255,0.06)', minHeight: 0 }}>
          <GroupListTable
            groups={groups}
            conditions={conditions}
            evaluationMap={evaluationMap}
            selectedGroupId={filterGroupId}
            onSelectGroup={(gId) => setFilterGroupId((prev) => (prev === gId ? null : gId))}
          />
        </div>

        {/* Column 3: Prompts */}
        <div style={{ background: '#0e1424', borderRadius: 10, padding: 12, border: '1px solid rgba(255,255,255,0.06)', minHeight: 0 }}>
          <PromptListTable
            prompts={prompts}
            groups={groups}
            evaluationMap={evaluationMap}
            selectedPromptIds={selectedPromptIds}
            onTogglePrompt={handleTogglePrompt}
            filterGroupId={filterGroupId}
            onClearGroupFilter={() => setFilterGroupId(null)}
          />
        </div>
      </div>

      {/* Bottom Live Prompt Synthesizer Dock */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
          padding: '10px 16px',
          borderRadius: 8,
          background: '#131b2e',
          border: '1px solid rgba(56, 189, 248, 0.25)',
          boxShadow: '0 -4px 16px rgba(0,0,0,0.4)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#38bdf8', fontSize: 11, fontWeight: 700, textTransform: 'uppercase' }}>
            <Sparkles size={14} /> Synthesized Prompt:
          </div>
          <div style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontFamily: 'monospace', fontSize: 12, color: synthesizedPrompt ? '#f1f5f9' : '#64748b' }}>
            {synthesizedPrompt || '(No prompts selected — click any unlocked prompt above)'}
          </div>
          {selectedPromptIds.size > 0 && (
            <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 12, background: 'rgba(56,189,248,0.15)', color: '#7dd3fc', fontWeight: 700 }}>
              {selectedPromptIds.size} tokens
            </span>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button
            onClick={handleReset}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              fontSize: 11,
              padding: '6px 12px',
              borderRadius: 6,
              background: 'rgba(255,255,255,0.06)',
              color: '#94a3b8',
              border: '1px solid rgba(255,255,255,0.1)',
              cursor: 'pointer',
            }}
          >
            <RotateCcw size={12} /> Reset
          </button>

          <button
            onClick={handleCopyPrompt}
            disabled={!synthesizedPrompt}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              fontSize: 11,
              fontWeight: 700,
              padding: '6px 14px',
              borderRadius: 6,
              background: copied ? '#10b981' : synthesizedPrompt ? '#ec4899' : 'rgba(255,255,255,0.05)',
              color: copied || synthesizedPrompt ? '#ffffff' : '#64748b',
              border: 'none',
              cursor: synthesizedPrompt ? 'pointer' : 'not-allowed',
            }}
          >
            {copied ? <Check size={12} /> : <Copy size={12} />}
            {copied ? 'Copied!' : 'Copy Prompt'}
          </button>
        </div>
      </div>
    </div>
  );
};
