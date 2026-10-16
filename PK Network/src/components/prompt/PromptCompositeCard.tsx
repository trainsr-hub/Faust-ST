import React, { useState } from 'react';
import { Layers, Copy, Check, Save, Sparkles } from 'lucide-react';

interface PromptCompositeCardProps {
  assembledPrompt: string;
  onSaveToEva: () => void;
  isSavingToEva: boolean;
  evaTournamentName?: string;
}

export const PromptCompositeCard: React.FC<PromptCompositeCardProps> = ({
  assembledPrompt,
  onSaveToEva,
  isSavingToEva,
  evaTournamentName,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!assembledPrompt) return;
    try {
      await navigator.clipboard.writeText(assembledPrompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  const tagCount = assembledPrompt
    ? assembledPrompt.split(',').filter((t) => t.trim().length > 0).length
    : 0;

  return (
    <div className="prompt-card" style={{ height: '100%' }}>
      <div className="prompt-card-header">
        <div className="prompt-card-title">
          <Layers size={16} color="#38bdf8" />
          <span>Assembled Prompt Matrix</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <span style={{ fontSize: '11px', color: '#38bdf8', fontFamily: 'var(--font-mono)' }}>
            {tagCount} Tags
          </span>
        </div>
      </div>

      {/* Composite Preview Box */}
      <div className="prompt-composite-view" style={{ flex: 1, minHeight: '180px' }}>
        {assembledPrompt || (
          <span style={{ color: 'var(--text-dim)', fontStyle: 'italic' }}>
            Assembled prompt will materialize here once Origin Prompt or Manual Prompt is provided.
          </span>
        )}
      </div>

      {/* Monolithic Action Hitboxes */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
        <button
          className="prompt-action-btn primary"
          onClick={handleCopy}
          disabled={!assembledPrompt}
          title="Copy assembled prompt to clipboard"
        >
          {copied ? <Check size={16} /> : <Copy size={16} />}
          <span>{copied ? 'Copied to Clipboard!' : 'Copy Assembled Prompt'}</span>
        </button>

        <button
          className="prompt-action-btn secondary"
          onClick={onSaveToEva}
          disabled={!assembledPrompt || isSavingToEva}
          title={`Save assembled prompt directly to ${evaTournamentName || 'Eva'} codex`}
        >
          <Save size={15} color="#c084fc" />
          <span>
            {isSavingToEva ? 'Saving to Turso...' : `Save to ${evaTournamentName || 'Eva'} Record`}
          </span>
        </button>
      </div>
    </div>
  );
};
