import React from 'react';
import { PromptGroup, ConditionEvaluationResult, HairCondition } from '../../../types/conditionStudio';
import { Lock, Unlock, ArrowRight, Zap, Check, X } from 'lucide-react';

interface GroupListTableProps {
  groups: PromptGroup[];
  conditions: HairCondition[];
  evaluationMap: Record<string, ConditionEvaluationResult>;
  selectedGroupId: string | null;
  onSelectGroup: (groupId: string) => void;
}

export const GroupListTable: React.FC<GroupListTableProps> = ({
  groups,
  conditions,
  evaluationMap,
  selectedGroupId,
  onSelectGroup,
}) => {
  const condNameMap = React.useMemo(() => {
    const map: Record<string, string> = {};
    for (const c of conditions) {
      map[c.id] = c.naturalName;
    }
    return map;
  }, [conditions]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, height: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: 6, borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: '#a855f7', letterSpacing: '0.04em' }}>
            TABLE 2: PROMPT GROUPS
          </span>
          <span style={{ fontSize: 10, padding: '2px 6px', borderRadius: 4, background: 'rgba(168,85,247,0.15)', color: '#d8b4fe' }}>
            {groups.length} Groups
          </span>
        </div>
        <span style={{ fontSize: 10, color: '#94a3b8' }}>
          Select group to inspect prompts
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, overflowY: 'auto', paddingRight: 4, flex: 1 }}>
        {groups.map((group) => {
          const evalResult = evaluationMap[group.id];
          const isUnlocked = evalResult?.isUnlocked ?? true;
          const isSelected = selectedGroupId === group.id;

          return (
            <div
              key={group.id}
              onClick={() => onSelectGroup(group.id)}
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 8,
                padding: '12px 14px',
                borderRadius: 8,
                background: isSelected
                  ? 'rgba(168, 85, 247, 0.16)'
                  : isUnlocked
                  ? 'rgba(255, 255, 255, 0.04)'
                  : 'rgba(239, 68, 68, 0.06)',
                border: isSelected
                  ? '1.5px solid #a855f7'
                  : isUnlocked
                  ? '1px solid rgba(255, 255, 255, 0.08)'
                  : '1px solid rgba(239, 68, 68, 0.3)',
                cursor: 'pointer',
                opacity: isUnlocked ? 1 : 0.65,
                transition: 'all 0.15s ease',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: isUnlocked ? '#f1f5f9' : '#f87171' }}>
                    {group.name}
                  </span>
                  <span style={{ fontSize: 9, padding: '1px 5px', borderRadius: 3, background: 'rgba(255,255,255,0.06)', color: '#94a3b8' }}>
                    {group.category}
                  </span>
                </div>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                    fontSize: 10,
                    fontWeight: 700,
                    padding: '3px 8px',
                    borderRadius: 4,
                    background: isUnlocked ? 'rgba(56, 189, 248, 0.15)' : 'rgba(239, 68, 68, 0.2)',
                    color: isUnlocked ? '#38bdf8' : '#fca5a5',
                  }}
                >
                  {isUnlocked ? <Unlock size={11} /> : <Lock size={11} />}
                  {isUnlocked ? 'AVAILABLE' : 'LOCKED'}
                </div>
              </div>

              <span style={{ fontSize: 11, color: '#94a3b8', lineHeight: 1.3 }}>
                {group.description}
              </span>

              {/* Preconditions (Depends On) */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4, paddingTop: 4, borderTop: '1px dashed rgba(255,255,255,0.06)' }}>
                <span style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: '#cbd5e1' }}>
                  Depends On (Preconditions):
                </span>
                {group.dependsOnConditions.length === 0 ? (
                  <span style={{ fontSize: 10, color: '#64748b', fontStyle: 'italic' }}>
                    None (Always accessible)
                  </span>
                ) : (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                    {group.dependsOnConditions.map((rule) => {
                      const unmet = evalResult?.unmetConditions.some((u) => u.conditionId === rule.conditionId);
                      return (
                        <span
                          key={rule.conditionId}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 3,
                            fontSize: 10,
                            padding: '2px 6px',
                            borderRadius: 4,
                            background: unmet ? 'rgba(239, 68, 68, 0.2)' : 'rgba(16, 185, 129, 0.15)',
                            color: unmet ? '#f87171' : '#34d399',
                            border: unmet ? '1px solid rgba(239, 68, 68, 0.4)' : '1px solid rgba(16, 185, 129, 0.3)',
                          }}
                        >
                          {unmet ? <X size={10} /> : <Check size={10} />}
                          {condNameMap[rule.conditionId] || rule.conditionId} == {String(rule.expectedValue)}
                        </span>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Postconditions (Brings About) */}
              {group.bringsAboutConditions.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <span style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: '#cbd5e1' }}>
                    Brings About (Effects):
                  </span>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                    {group.bringsAboutConditions.map((mutation) => (
                      <span
                        key={mutation.conditionId}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 3,
                          fontSize: 10,
                          padding: '2px 6px',
                          borderRadius: 4,
                          background: 'rgba(168, 85, 247, 0.12)',
                          color: '#d8b4fe',
                          border: '1px solid rgba(168, 85, 247, 0.25)',
                        }}
                      >
                        <Zap size={10} />
                        Sets {condNameMap[mutation.conditionId] || mutation.conditionId} ➔ {String(mutation.setValue)}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
