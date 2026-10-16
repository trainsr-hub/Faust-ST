import React, { useMemo } from 'react';
import { PromptGroup, ConditionPrompt, ConditionEvaluationResult } from '../../types/conditionStudio';
import { Check, Lock, Unlock, ExternalLink, Image as ImageIcon } from 'lucide-react';

interface PlaygroundGroupsViewProps {
  groups: PromptGroup[];
  prompts: ConditionPrompt[];
  evaluationMap: Record<string, ConditionEvaluationResult>;
  selectedPromptIds: Set<string>;
  onTogglePrompt: (id: string) => void;
  filterGroupCat: string;
  setFilterGroupCat: (cat: string) => void;
}

export const PlaygroundGroupsView: React.FC<PlaygroundGroupsViewProps> = ({
  groups,
  prompts,
  evaluationMap,
  selectedPromptIds,
  onTogglePrompt,
  filterGroupCat,
  setFilterGroupCat,
}) => {
  const groupCategories = useMemo(() => {
    const cats = new Set(groups.map((g) => g.category));
    return ['All', ...Array.from(cats)];
  }, [groups]);

  const filteredGroups = useMemo(() => {
    if (filterGroupCat === 'All') return groups;
    return groups.filter((g) => g.category === filterGroupCat);
  }, [groups, filterGroupCat]);

  return (
    <section style={containerStyle}>
      <div style={headerStyle}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
          <span style={{ fontSize: '13px', fontWeight: 800, color: '#c084fc', letterSpacing: '0.5px' }}>
            2 & 3. PROMPT GROUPS & VISUAL TOKENS
          </span>
          <span style={{ fontSize: '10px', color: '#94a3b8' }}>
            Click any token card to select & assert reality postconditions
          </span>
        </div>

        <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
          {groupCategories.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilterGroupCat(cat)}
              style={{
                fontSize: '10.5px',
                fontWeight: 600,
                padding: '3px 8px',
                borderRadius: '4px',
                border: '1px solid',
                borderColor: filterGroupCat === cat ? '#c084fc' : 'rgba(255, 255, 255, 0.1)',
                backgroundColor: filterGroupCat === cat ? 'rgba(168, 85, 247, 0.2)' : 'transparent',
                color: filterGroupCat === cat ? '#c084fc' : 'rgba(255, 255, 255, 0.6)',
                cursor: 'pointer',
              }}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '14px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {filteredGroups.map((group) => {
          const evalResult = evaluationMap[group.id] || { isUnlocked: true, unmetConditions: [] };
          const isUnlocked = evalResult.isUnlocked;
          const promptsInGroup = prompts.filter((p) => p.groupId === group.id);

          return (
            <div
              key={group.id}
              style={{
                borderRadius: '10px',
                border: '1px solid',
                borderColor: isUnlocked ? 'rgba(168, 85, 247, 0.3)' : 'rgba(239, 68, 68, 0.25)',
                backgroundColor: isUnlocked ? 'rgba(15, 23, 42, 0.6)' : 'rgba(30, 15, 25, 0.35)',
                padding: '14px',
                opacity: isUnlocked ? 1 : 0.65,
                transition: 'all 0.2s ease',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {isUnlocked ? <Unlock size={14} color="#34d399" /> : <Lock size={14} color="#f87171" />}
                  <span style={{ fontSize: '13px', fontWeight: 800, color: isUnlocked ? '#f1f5f9' : '#f87171' }}>
                    {group.name}
                  </span>
                  <span style={{ fontSize: '9.5px', padding: '1px 6px', borderRadius: '4px', background: 'rgba(255, 255, 255, 0.08)', color: '#94a3b8' }}>
                    {group.category}
                  </span>
                </div>

                {!isUnlocked ? (
                  <span style={{ fontSize: '9.5px', background: 'rgba(239, 68, 68, 0.2)', color: '#fca5a5', padding: '2px 8px', borderRadius: '4px', fontWeight: 700 }}>
                    Locked: Requires {evalResult.unmetConditions.map((u) => u.conditionId).join(', ')}
                  </span>
                ) : (
                  <span style={{ fontSize: '9.5px', background: 'rgba(52, 211, 153, 0.15)', color: '#34d399', padding: '2px 8px', borderRadius: '4px', fontWeight: 700 }}>
                    Active
                  </span>
                )}
              </div>

              <div style={{ fontSize: '10.5px', color: '#64748b', marginBottom: '12px' }}>
                {group.description}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '10px' }}>
                {promptsInGroup.map((prompt) => {
                  const isSelected = selectedPromptIds.has(prompt.id);
                  return (
                    <div
                      key={prompt.id}
                      onClick={() => isUnlocked && onTogglePrompt(prompt.id)}
                      style={{
                        borderRadius: '8px',
                        border: '1px solid',
                        borderColor: isSelected ? '#38bdf8' : isUnlocked ? 'rgba(255, 255, 255, 0.08)' : 'rgba(255, 255, 255, 0.03)',
                        backgroundColor: isSelected ? 'rgba(56, 189, 248, 0.15)' : 'rgba(2, 6, 23, 0.5)',
                        padding: '8px',
                        cursor: isUnlocked ? 'pointer' : 'not-allowed',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '6px',
                        position: 'relative',
                        transition: 'all 0.15s ease',
                        boxShadow: isSelected ? '0 0 12px rgba(56, 189, 248, 0.3)' : 'none',
                      }}
                    >
                      <div style={{ width: '100%', height: '110px', borderRadius: '6px', overflow: 'hidden', background: '#020617', position: 'relative' }}>
                        {prompt.imageUrl ? (
                          <img
                            src={prompt.imageUrl}
                            alt={prompt.name}
                            loading="lazy"
                            referrerPolicy="no-referrer"
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
                          />
                        ) : (
                          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#475569', fontSize: '10px' }}>
                            <ImageIcon size={16} />
                          </div>
                        )}

                        {isSelected && (
                          <div style={{ position: 'absolute', top: '6px', right: '6px', background: '#38bdf8', color: '#030712', borderRadius: '50%', width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 6px rgba(0,0,0,0.5)' }}>
                            <Check size={13} strokeWidth={3} />
                          </div>
                        )}
                      </div>

                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <span style={{ fontSize: '11.5px', fontWeight: 700, color: isSelected ? '#38bdf8' : '#e2e8f0' }}>
                            {prompt.name}
                          </span>
                          {prompt.wikiUrl && (
                            <a href={prompt.wikiUrl} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()} style={{ color: '#64748b' }} title="View Danbooru Wiki">
                              <ExternalLink size={11} />
                            </a>
                          )}
                        </div>
                        <span style={{ fontSize: '10px', color: '#38bdf8', fontFamily: 'monospace' }}>
                          {prompt.tag}
                        </span>
                      </div>

                      <span style={{ fontSize: '9.5px', color: '#64748b', lineHeight: 1.2 }}>
                        {prompt.description}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

const containerStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  backgroundColor: '#0a0f1d',
  borderRadius: '12px',
  border: '1px solid rgba(168, 85, 247, 0.2)',
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.4)',
  overflow: 'hidden',
  minHeight: 0,
};

const headerStyle: React.CSSProperties = {
  padding: '14px 16px',
  borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
  background: '#0e162a',
};
