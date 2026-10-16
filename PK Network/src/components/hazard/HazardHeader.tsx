import React, { useState, useEffect } from 'react';
import { Zap, Play, RotateCcw, Database, Sun, Moon, Plus, Edit2, Check, Shuffle, Sparkles, Scissors } from 'lucide-react';
import { TournamentSummary } from '../../types/hazard';

interface HazardHeaderProps {
  currentTournamentId: string;
  currentTitle: string;
  tournamentsList: TournamentSummary[];
  onSelectTournament: (id: string) => void;
  onUpdateTitle: (newTitle: string) => void;
  onCreateTournament: () => void;
  onSimulateNext: () => void;
  onSimulateAll: () => void;
  onReset: () => void;
  onSwitchToPk: () => void;
  onSwitchToPrompt?: () => void;
  onSwitchToHair?: () => void;
  isCompleted: boolean;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
  avatarTheme?: string;
  availableAvatarThemes?: string[];
  onSelectAvatarTheme?: (theme: string) => void;
  onRerollAvatars?: () => void;
}

export const HazardHeader: React.FC<HazardHeaderProps> = ({
  currentTournamentId,
  currentTitle,
  tournamentsList = [],
  onSelectTournament,
  onUpdateTitle,
  onCreateTournament,
  onSimulateNext,
  onSimulateAll,
  onReset,
  onSwitchToPk,
  onSwitchToPrompt,
  onSwitchToHair,
  isCompleted,
  theme,
  onToggleTheme,
  avatarTheme = 'default',
  availableAvatarThemes = [],
  onSelectAvatarTheme,
  onRerollAvatars
}) => {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editedTitle, setEditedTitle] = useState(currentTitle);

  useEffect(() => {
    setEditedTitle(currentTitle);
  }, [currentTitle]);

  const handleSaveTitle = () => {
    if (editedTitle.trim() && editedTitle.trim() !== currentTitle) {
      onUpdateTitle(editedTitle.trim());
    }
    setIsEditingTitle(false);
  };

  return (
    <header className="hazard-top-bar">
      <div className="hazard-brand-stack">
        <div className="hazard-brand-badge">
          <Zap size={14} className="text-amber-400" />
          <span>HAZARD TRIGGER</span>
        </div>

        {/* Title & Tournament Dropdown Stack */}
        <div className="hazard-title-container">
          {isEditingTitle ? (
            <div className="hazard-title-edit-row">
              <input
                type="text"
                className="hazard-title-input"
                value={editedTitle}
                onChange={(e) => setEditedTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSaveTitle();
                  if (e.key === 'Escape') {
                    setEditedTitle(currentTitle);
                    setIsEditingTitle(false);
                  }
                }}
                autoFocus
              />
              <button
                className="hazard-btn hazard-btn-primary p-1.5"
                onClick={handleSaveTitle}
                title="Save Title"
              >
                <Check size={14} />
              </button>
            </div>
          ) : (
            <div className="hazard-title-row">
              <h1 className="cursor-pointer" onClick={() => setIsEditingTitle(true)} title="Click to rename tournament">
                {currentTitle}
              </h1>
              <button
                className="hazard-btn-icon-subtle"
                onClick={() => setIsEditingTitle(true)}
                title="Rename tournament"
              >
                <Edit2 size={13} />
              </button>
            </div>
          )}

          {/* Tournament Row Selector & New Tournament Button */}
          <div className="hazard-selector-row">
            <select
              className="hazard-dropdown-select"
              value={currentTournamentId}
              onChange={(e) => onSelectTournament(e.target.value)}
              title="Switch active tournament row"
            >
              {tournamentsList.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.title} ({t.id}) • {t.status}
                </option>
              ))}
            </select>

            <button
              className="hazard-btn hazard-btn-secondary text-xs"
              onClick={onCreateTournament}
              title="Create a new tournament row in Turso SQLite"
            >
              <Plus size={13} />
              <span>New</span>
            </button>

            {/* Avatar Theme Key Selector */}
            {Array.isArray(availableAvatarThemes) && availableAvatarThemes.length > 0 && (
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                  marginLeft: '4px',
                  paddingLeft: '8px',
                  borderLeft: '1px solid rgba(255, 255, 255, 0.12)',
                }}
              >
                <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 600 }}>Avatar:</span>
                <select
                  className="hazard-dropdown-select"
                  value={avatarTheme}
                  onChange={(e) => onSelectAvatarTheme?.(e.target.value)}
                  title="Select Avatar Theme Key from character_images"
                  style={{ maxWidth: '110px', padding: '3px 6px', fontSize: '11px' }}
                >
                  {availableAvatarThemes.map((key) => (
                    <option key={key} value={key}>
                      {key}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  className="hazard-btn-icon-subtle"
                  onClick={onRerollAvatars}
                  title="Reroll random avatars from candidate list"
                  style={{ padding: '4px' }}
                >
                  <Shuffle size={12} />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="hazard-actions">
        <button
          className="hazard-btn hazard-btn-secondary"
          onClick={onSimulateNext}
          disabled={isCompleted}
          title="Deterministically simulate next playable match"
        >
          <Zap size={15} />
          <span>Next Match</span>
        </button>

        <button
          className="hazard-btn hazard-btn-primary"
          onClick={onSimulateAll}
          disabled={isCompleted}
          title="Auto-simulate tournament to completion"
        >
          <Play size={15} />
          <span>Auto-Simulate</span>
        </button>

        <button
          className="hazard-btn hazard-btn-secondary"
          onClick={onReset}
          title="Reset tournament bracket"
        >
          <RotateCcw size={15} />
          <span>Reset</span>
        </button>

        <button
          className="hazard-btn hazard-btn-switch"
          onClick={onSwitchToPk}
          title="Switch to PK Network Data Grid"
        >
          <Database size={15} />
          <span>PK Network (Data Grid)</span>
        </button>

        {onSwitchToPrompt && (
          <button
            className="hazard-btn hazard-btn-switch"
            onClick={onSwitchToPrompt}
            title="Switch to Prompt Studio Subdomain"
            style={{
              borderColor: 'rgba(168, 85, 247, 0.4)',
              background: 'rgba(168, 85, 247, 0.15)',
              color: '#c084fc',
            }}
          >
            <Sparkles size={15} />
            <span>Prompt Studio</span>
          </button>
        )}

        {onSwitchToHair && (
          <button
            className="hazard-btn hazard-btn-switch"
            onClick={onSwitchToHair}
            title="Switch to Hair Visual Codex Subdomain"
            style={{
              borderColor: 'rgba(244, 63, 94, 0.4)',
              background: 'rgba(244, 63, 94, 0.15)',
              color: '#fb7185',
            }}
          >
            <Scissors size={15} />
            <span>Hair Codex</span>
          </button>
        )}

        <button
          className="hazard-btn hazard-btn-secondary"
          onClick={onToggleTheme}
          title="Toggle Dark / Light Theme"
          style={{ width: '44px', padding: '0' }}
        >
          {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
        </button>
      </div>
    </header>
  );
};
