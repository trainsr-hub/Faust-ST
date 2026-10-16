import React from 'react';
import { HairCondition } from '../../../types/conditionStudio';
import { CheckCircle2, Circle, AlertCircle } from 'lucide-react';

interface ConditionListTableProps {
  conditions: HairCondition[];
  activeState: Record<string, boolean>;
  onToggleCondition: (id: string) => void;
}

export const ConditionListTable: React.FC<ConditionListTableProps> = ({
  conditions,
  activeState,
  onToggleCondition,
}) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, height: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: 6, borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: '#38bdf8', letterSpacing: '0.04em' }}>
            TABLE 1: CONDITIONS
          </span>
          <span style={{ fontSize: 10, padding: '2px 6px', borderRadius: 4, background: 'rgba(56,189,248,0.15)', color: '#7dd3fc' }}>
            {conditions.length} Rules
          </span>
        </div>
        <span style={{ fontSize: 10, color: '#94a3b8' }}>
          Click to manually flip condition state
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, overflowY: 'auto', paddingRight: 4, flex: 1 }}>
        {conditions.map((cond) => {
          const isTrue = Boolean(activeState[cond.id]);
          return (
            <div
              key={cond.id}
              onClick={() => onToggleCondition(cond.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 12px',
                borderRadius: 8,
                background: isTrue ? 'rgba(16, 185, 129, 0.12)' : 'rgba(255, 255, 255, 0.03)',
                border: isTrue ? '1px solid rgba(16, 185, 129, 0.4)' : '1px solid rgba(255, 255, 255, 0.06)',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2, flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: isTrue ? '#34d399' : '#e2e8f0' }}>
                    {cond.naturalName}
                  </span>
                  <span style={{ fontSize: 9, padding: '1px 5px', borderRadius: 3, background: 'rgba(255,255,255,0.06)', color: '#94a3b8' }}>
                    {cond.category}
                  </span>
                </div>
                <span style={{ fontSize: 10, color: '#64748b', lineHeight: 1.3 }}>
                  {cond.description}
                </span>
                <span style={{ fontSize: 9, fontFamily: 'monospace', color: '#475569' }}>
                  key: {cond.id}
                </span>
              </div>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                  padding: '4px 10px',
                  borderRadius: 6,
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: '0.04em',
                  background: isTrue ? '#10b981' : 'rgba(255,255,255,0.08)',
                  color: isTrue ? '#ffffff' : '#94a3b8',
                  boxShadow: isTrue ? '0 0 12px rgba(16, 185, 129, 0.35)' : 'none',
                }}
              >
                {isTrue ? <CheckCircle2 size={12} /> : <Circle size={12} />}
                {isTrue ? 'TRUE' : 'FALSE'}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
