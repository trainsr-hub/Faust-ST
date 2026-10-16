import React from 'react';
import { Cpu, Lock } from 'lucide-react';

interface AutomatedRestSlotProps {
  isEnabled?: boolean;
}

export const AutomatedRestSlot: React.FC<AutomatedRestSlotProps> = () => {
  return (
    <div className="prompt-auto-slot">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
          <Cpu size={15} color="var(--text-dim)" />
          <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>
            3 ~ The Next Thinggy (Automated Rest)
          </span>
        </div>
        <span className="prompt-auto-badge">
          Phase 5 Pipeline
        </span>
      </div>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.65rem 0.85rem',
          borderRadius: 'var(--radius-sm)',
          background: 'rgba(255, 255, 255, 0.02)',
          border: '1px solid var(--border-light)',
          fontSize: '12px',
          color: 'var(--text-dim)',
          fontStyle: 'italic',
        }}
      >
        <Lock size={13} color="var(--text-dim)" />
        <span>
          Automated multi-layer generator (Persona Tropes, Hazard Core, Costume Matrices) queued. Skipped for initial deployment.
        </span>
      </div>
    </div>
  );
};
