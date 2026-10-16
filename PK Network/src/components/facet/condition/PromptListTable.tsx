import React from 'react';
import { ConditionPrompt, PromptGroup, ConditionEvaluationResult } from '../../../types/conditionStudio';
import { ExternalLink, Check, Plus, Lock, Sparkles } from 'lucide-react';

interface PromptListTableProps {
  prompts: ConditionPrompt[];
  groups: PromptGroup[];
  evaluationMap: Record<string, ConditionEvaluationResult>;
  selectedPromptIds: Set<string>;
  onTogglePrompt: (promptId: string) => void;
  filterGroupId: string | null;
  onClearGroupFilter: () => void;
}

export const PromptListTable: React.FC<PromptListTableProps> = ({
  prompts,
  groups,
  evaluationMap,
  selectedPromptIds,
  onTogglePrompt,
  filterGroupId,
  onClearGroupFilter,
}) => {
  const groupMap = React.useMemo(() => {
    const map: Record<string, PromptGroup> = {};
    for (const g of groups) map[g.id] = g;
    return map;
  }, [groups]);

  const displayedPrompts = React.useMemo(() => {
    if (!filterGroupId) return prompts;
    return prompts.filter((p) => p.groupId === filterGroupId);
  }, [prompts, filterGroupId]);

  const activeGroup = filterGroupId ? groupMap[filterGroupId] : null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, height: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: 6, borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: '#ec4899', letterSpacing: '0.04em' }}>
            TABLE 3: PROMPTS
          </span>
          <span style={{ fontSize: 10, padding: '2px 6px', borderRadius: 4, background: 'rgba(236,72,153,0.15)', color: '#f472b6' }}>
            {displayedPrompts.length} Prompts
          </span>
          {activeGroup && (
            <button
              onClick={onClearGroupFilter}
              style={{
                fontSize: 10,
                padding: '2px 8px',
                borderRadius: 4,
                background: 'rgba(255,255,255,0.06)',
                color: '#cbd5e1',
                border: '1px solid rgba(255,255,255,0.1)',
                cursor: 'pointer',
              }}
            >
              Filter: {activeGroup.name} ✕
            </button>
          )}
        </div>
        <span style={{ fontSize: 10, color: '#94a3b8' }}>
          Click to select & trigger group effects
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 10, overflowY: 'auto', paddingRight: 4, flex: 1, alignContent: 'start' }}>
        {displayedPrompts.map((prompt) => {
          const group = groupMap[prompt.groupId];
          const evalResult = group ? evaluationMap[group.id] : null;
          const isGroupUnlocked = evalResult?.isUnlocked ?? true;
          const isSelected = selectedPromptIds.has(prompt.id);

          return (
            <div
              key={prompt.id}
              onClick={() => {
                if (isGroupUnlocked) onTogglePrompt(prompt.id);
              }}
              style={{
                display: 'flex',
                flexDirection: 'column',
                borderRadius: 8,
                background: isSelected
                  ? 'rgba(236, 72, 153, 0.16)'
                  : isGroupUnlocked
                  ? 'rgba(255, 255, 255, 0.04)'
                  : 'rgba(0, 0, 0, 0.3)',
                border: isSelected
                  ? '1.5px solid #ec4899'
                  : isGroupUnlocked
                  ? '1px solid rgba(255, 255, 255, 0.08)'
                  : '1px solid rgba(239, 68, 68, 0.25)',
                overflow: 'hidden',
                cursor: isGroupUnlocked ? 'pointer' : 'not-allowed',
                opacity: isGroupUnlocked ? 1 : 0.45,
                transition: 'all 0.15s ease',
              }}
            >
              {/* Image banner */}
              <div style={{ position: 'relative', width: '100%', height: 110, background: '#0a0f1d' }}>
                {prompt.imageUrl ? (
                  <img
                    src={prompt.imageUrl}
                    alt={prompt.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    loading="lazy"
                  />
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#475569' }}>
                    No Image
                  </div>
                )}
                {/* Status chip */}
                <div style={{ position: 'absolute', top: 6, right: 6 }}>
                  {isSelected ? (
                    <span style={{ display: 'flex', alignItems: 'center', gap: 3, padding: '3px 7px', borderRadius: 4, background: '#ec4899', color: '#fff', fontSize: 10, fontWeight: 700 }}>
                      <Check size={11} /> SELECTED
                    </span>
                  ) : !isGroupUnlocked ? (
                    <span style={{ display: 'flex', alignItems: 'center', gap: 3, padding: '3px 7px', borderRadius: 4, background: 'rgba(239,68,68,0.85)', color: '#fff', fontSize: 10, fontWeight: 700 }}>
                      <Lock size={11} /> LOCKED
                    </span>
                  ) : null}
                </div>
              </div>

              {/* Body */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, padding: '10px 12px', flex: 1, justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: '#f8fafc' }}>
                    {prompt.name}
                  </span>
                  <span style={{ fontSize: 11, fontFamily: 'monospace', color: '#38bdf8' }}>
                    {prompt.tag}
                  </span>
                  <span style={{ fontSize: 10, color: '#94a3b8', lineHeight: 1.3 }}>
                    {prompt.description}
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 6, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                  <span style={{ fontSize: 9, color: '#64748b' }}>
                    Group: {group?.name || prompt.groupId}
                  </span>
                  {prompt.wikiUrl && (
                    <a
                      href={prompt.wikiUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      style={{ display: 'flex', alignItems: 'center', gap: 2, fontSize: 10, color: '#7dd3fc', textDecoration: 'none' }}
                    >
                      Wiki <ExternalLink size={10} />
                    </a>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
