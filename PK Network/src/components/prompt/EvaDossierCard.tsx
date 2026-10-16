import React from 'react';
import { PromptEva } from '../../types/prompt';

interface EvaDossierCardProps {
  activeEva: PromptEva | null;
}

export const EvaDossierCard: React.FC<EvaDossierCardProps> = ({ activeEva }) => {
  if (!activeEva) return null;

  return (
    <div className="prompt-card">
      <div className="prompt-card-header">
        <div className="prompt-card-title">
          <span>Eva Codex Dossier</span>
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem', fontSize: '12px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ color: 'var(--text-secondary)' }}>Full Name:</span>
          <span style={{ fontWeight: 600 }}>{activeEva.fullName}</span>
        </div>
        {activeEva.evaCodex && (
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Codex ID:</span>
            <span style={{ fontFamily: 'var(--font-mono)' }}>{activeEva.evaCodex}</span>
          </div>
        )}
        {activeEva.notes && (
          <div style={{ marginTop: '0.25rem', color: 'var(--text-dim)', fontStyle: 'italic', fontSize: '11.5px' }}>
            "{activeEva.notes}"
          </div>
        )}
      </div>
    </div>
  );
};
