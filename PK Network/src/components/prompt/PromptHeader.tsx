import React from 'react';
import { Sparkles, Database, Zap, Sun, Moon, RefreshCw, Scissors } from 'lucide-react';

interface PromptHeaderProps {
  onSwitchToPk: () => void;
  onSwitchToHazard: () => void;
  onSwitchToHair?: () => void;
  onSync: () => void;
  isSyncing: boolean;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
  evaCount: number;
}

export const PromptHeader: React.FC<PromptHeaderProps> = ({
  onSwitchToPk,
  onSwitchToHazard,
  onSwitchToHair,
  onSync,
  isSyncing,
  theme,
  onToggleTheme,
  evaCount,
}) => {
  return (
    <header className="prompt-top-bar">
      <div className="prompt-brand-group">
        <div className="prompt-brand-title">
          <Sparkles size={20} color="#c084fc" />
          <span style={{ color: '#c084fc' }}>Prompt</span>
          <span style={{ color: 'var(--text-primary)' }}>Studio</span>
          <span className="prompt-badge">Character Matrix</span>
        </div>
        <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
          {evaCount} Evas Available
        </span>
      </div>

      <div className="prompt-nav-actions">
        <button
          className="prompt-action-btn secondary"
          style={{ minHeight: '36px', padding: '0 0.85rem', width: 'auto', fontSize: '12.5px' }}
          onClick={onSwitchToHazard}
          title="Switch to Hazard Trigger Tournament Arena"
        >
          <Zap size={14} color="#38bdf8" />
          <span>Hazard Trigger</span>
        </button>

        <button
          className="prompt-action-btn secondary"
          style={{ minHeight: '36px', padding: '0 0.85rem', width: 'auto', fontSize: '12.5px' }}
          onClick={onSwitchToPk}
          title="Switch to PK Network Data Grid"
        >
          <Database size={14} color="#a855f7" />
          <span>PK Network</span>
        </button>

        {onSwitchToHair && (
          <button
            className="prompt-action-btn secondary"
            style={{
              minHeight: '36px',
              padding: '0 0.85rem',
              width: 'auto',
              fontSize: '12.5px',
              borderColor: 'rgba(244, 63, 94, 0.4)',
              background: 'rgba(244, 63, 94, 0.15)',
              color: '#fb7185',
            }}
            onClick={onSwitchToHair}
            title="Switch to Hair Visual Codex Subdomain"
          >
            <Scissors size={14} color="#fb7185" />
            <span>Hair Codex</span>
          </button>
        )}

        <button
          className="btn icon-only"
          onClick={onSync}
          disabled={isSyncing}
          title="Synchronize Database from Turso Cloud"
          style={{ minHeight: '36px', width: '36px' }}
        >
          <RefreshCw size={14} className={isSyncing ? 'spin' : ''} />
        </button>

        <button
          className="btn icon-only"
          onClick={onToggleTheme}
          title="Toggle Light / Dark Mode"
          style={{ minHeight: '36px', width: '36px' }}
        >
          {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
        </button>
      </div>
    </header>
  );
};
