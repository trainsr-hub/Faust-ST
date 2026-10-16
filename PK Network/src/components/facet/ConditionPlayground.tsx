import React, { useState, useMemo, useCallback } from 'react';
import {
  HairCondition,
  PromptGroup,
  ConditionPrompt,
  ConditionEvaluationResult,
} from '../../types/conditionStudio';
import {
  evaluateGroup,
  applySelectionMutations,
  buildInitialConditions,
} from '../../services/conditionEngine';
import { PlaygroundGroupsView } from './PlaygroundGroupsView';
import { Sparkles, RotateCcw } from 'lucide-react';

interface ConditionPlaygroundProps {
  conditions: HairCondition[];
  groups: PromptGroup[];
  prompts: ConditionPrompt[];
  selectedPromptIds: Set<string>;
  setSelectedPromptIds: React.Dispatch<React.SetStateAction<Set<string>>>;
  activeConditions: Record<string, boolean>;
  setActiveConditions: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
}

export const ConditionPlayground: React.FC<ConditionPlaygroundProps> = ({
  conditions,
  groups,
  prompts,
  selectedPromptIds,
  setSelectedPromptIds,
  activeConditions,
  setActiveConditions,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [filterGroupCat, setFilterGroupCat] = useState<string>('All');

  const categories = useMemo(() => {
    const cats = new Set(conditions.map((c) => c.category));
    return ['All', ...Array.from(cats)];
  }, [conditions]);

  // Evaluate groups against current reality predicates
  const evaluationMap = useMemo(() => {
    const map: Record<string, ConditionEvaluationResult> = {};
    for (const g of groups) {
      map[g.id] = evaluateGroup(g, activeConditions);
    }
    return map;
  }, [groups, activeConditions]);

  // Recalculate conditions when a prompt is toggled
  const handleTogglePrompt = useCallback(
    (promptId: string) => {
      setSelectedPromptIds((prev) => {
        const next = new Set(prev);
        if (next.has(promptId)) {
          next.delete(promptId);
        } else {
          next.add(promptId);
        }

        let nextConds = buildInitialConditions(conditions);
        const promptMap = new Map(prompts.map((p) => [p.id, p]));
        const groupMap = new Map(groups.map((g) => [g.id, g]));

        for (const id of next) {
          const p = promptMap.get(id);
          if (!p) continue;
          const g = groupMap.get(p.groupId);
          if (!g) continue;
          nextConds = applySelectionMutations(nextConds, g, p);
        }

        setActiveConditions(nextConds);
        return next;
      });
    },
    [conditions, prompts, groups, setActiveConditions, setSelectedPromptIds]
  );

  const handleToggleCondition = useCallback(
    (condId: string) => {
      setActiveConditions((prev) => ({
        ...prev,
        [condId]: !prev[condId],
      }));
    },
    [setActiveConditions]
  );

  // 1-Click Miyu Edelfelt benchmark deconstruction preset
  const handleApplyMiyuPreset = useCallback(() => {
    const miyuTags = ['black hair', 'medium hair', 'double-parted bangs', 'hair between eyes', 'sidelocks', 'hair ornament', 'hairclip'];
    const matchingIds = prompts.filter((p) => miyuTags.includes(p.tag)).map((p) => p.id);
    const nextSet = new Set(matchingIds);
    setSelectedPromptIds(nextSet);

    let nextConds = buildInitialConditions(conditions);
    const promptMap = new Map(prompts.map((p) => [p.id, p]));
    const groupMap = new Map(groups.map((g) => [g.id, g]));

    for (const id of nextSet) {
      const p = promptMap.get(id);
      if (!p) continue;
      const g = groupMap.get(p.groupId);
      if (!g) continue;
      nextConds = applySelectionMutations(nextConds, g, p);
    }
    setActiveConditions(nextConds);
  }, [prompts, conditions, groups, setSelectedPromptIds, setActiveConditions]);

  const filteredConditions = useMemo(() => {
    if (selectedCategory === 'All') return conditions;
    return conditions.filter((c) => c.category === selectedCategory);
  }, [conditions, selectedCategory]);

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '360px 1fr', gap: '16px', height: '100%', overflow: 'hidden' }}>
      {/* ─── LEFT: CONDITIONS REALITY DECK ─── */}
      <section style={deckStyle}>
        <div style={deckHeaderStyle}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '13px', fontWeight: 800, color: '#38bdf8', letterSpacing: '0.5px' }}>
              1. REALITY PREDICATES
            </span>
            <div style={{ display: 'flex', gap: '6px' }}>
              <button onClick={handleApplyMiyuPreset} style={presetBtnStyle} title="Load Miyu Edelfelt Benchmark">
                <Sparkles size={11} /> Miyu
              </button>
              <span style={{ fontSize: '10px', background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8', padding: '2px 8px', borderRadius: '4px', fontWeight: 700 }}>
                {Object.values(activeConditions).filter(Boolean).length} / {conditions.length} Active
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                style={{
                  fontSize: '10px',
                  fontWeight: 600,
                  padding: '2px 7px',
                  borderRadius: '4px',
                  border: '1px solid',
                  borderColor: selectedCategory === cat ? '#38bdf8' : 'rgba(255, 255, 255, 0.1)',
                  backgroundColor: selectedCategory === cat ? 'rgba(56, 189, 248, 0.2)' : 'transparent',
                  color: selectedCategory === cat ? '#38bdf8' : 'rgba(255, 255, 255, 0.6)',
                  cursor: 'pointer',
                }}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {filteredConditions.map((cond) => {
            const isActive = Boolean(activeConditions[cond.id]);
            return (
              <div
                key={cond.id}
                onClick={() => handleToggleCondition(cond.id)}
                style={{
                  minHeight: '48px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  border: '1px solid',
                  borderColor: isActive ? 'rgba(56, 189, 248, 0.5)' : 'rgba(255, 255, 255, 0.06)',
                  backgroundColor: isActive ? 'rgba(56, 189, 248, 0.08)' : 'rgba(15, 23, 42, 0.4)',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  userSelect: 'none',
                }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', flex: 1, marginRight: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontSize: '11.5px', fontWeight: 700, color: isActive ? '#f8fafc' : '#94a3b8' }}>
                      {cond.naturalName}
                    </span>
                    <span style={{ fontSize: '8.5px', padding: '1px 4px', borderRadius: '3px', background: 'rgba(255,255,255,0.08)', color: '#94a3b8' }}>
                      {cond.category}
                    </span>
                  </div>
                  <span style={{ fontSize: '9.5px', color: '#64748b', lineHeight: 1.2 }}>{cond.description}</span>
                </div>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '3px 8px',
                    borderRadius: '16px',
                    fontSize: '9.5px',
                    fontWeight: 800,
                    backgroundColor: isActive ? '#38bdf8' : 'rgba(255, 255, 255, 0.08)',
                    color: isActive ? '#030712' : '#64748b',
                    boxShadow: isActive ? '0 0 10px rgba(56, 189, 248, 0.4)' : 'none',
                    flexShrink: 0,
                  }}
                >
                  {isActive ? 'TRUE' : 'FALSE'}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ─── RIGHT: PROMPT GROUPS & TOKENS VIEW ─── */}
      <PlaygroundGroupsView
        groups={groups}
        prompts={prompts}
        evaluationMap={evaluationMap}
        selectedPromptIds={selectedPromptIds}
        onTogglePrompt={handleTogglePrompt}
        filterGroupCat={filterGroupCat}
        setFilterGroupCat={setFilterGroupCat}
      />
    </div>
  );
};

const deckStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  backgroundColor: '#0a0f1d',
  borderRadius: '12px',
  border: '1px solid rgba(56, 189, 248, 0.2)',
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.4)',
  overflow: 'hidden',
  minHeight: 0,
};

const deckHeaderStyle: React.CSSProperties = {
  padding: '12px 14px',
  borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
  background: '#0e162a',
};

const presetBtnStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '4px',
  fontSize: '9.5px',
  fontWeight: 700,
  background: 'rgba(192, 132, 252, 0.2)',
  color: '#c084fc',
  border: '1px solid rgba(192, 132, 252, 0.35)',
  padding: '2px 7px',
  borderRadius: '4px',
  cursor: 'pointer',
};
