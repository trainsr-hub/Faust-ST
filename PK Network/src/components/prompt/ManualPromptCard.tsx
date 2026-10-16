import React from 'react';
import { Type, Sparkles, Trash2, Plus } from 'lucide-react';

interface ManualPromptCardProps {
  manualPrompt: string;
  onChangeManualPrompt: (text: string) => void;
  evaTournamentName?: string;
  onCleanOverlaps?: () => void;
  overlapCount?: number;
}

const QUICK_TAGS = [
  'solo',
  'high quality',
  'masterpiece',
  'cinematic lighting',
  'detailed eyes',
  'dynamic pose',
  '8k wallpaper',
  'soft shadows',
  'depth of field',
];

export const ManualPromptCard: React.FC<ManualPromptCardProps> = ({
  manualPrompt,
  onChangeManualPrompt,
  evaTournamentName,
  onCleanOverlaps,
  overlapCount = 0,
}) => {
  const handleAddTag = (tag: string) => {
    const trimmed = manualPrompt.trim();
    if (!trimmed) {
      onChangeManualPrompt(tag);
      return;
    }
    if (trimmed.toLowerCase().includes(tag.toLowerCase())) return;
    onChangeManualPrompt(`${trimmed}, ${tag}`);
  };

  const handleClear = () => {
    onChangeManualPrompt('');
  };

  return (
    <div className="prompt-card">
      <div className="prompt-card-header">
        <div className="prompt-card-title">
          <Type size={16} color="#a855f7" />
          <span>1 ~ Manual Character Prompt</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          {overlapCount > 0 && onCleanOverlaps && (
            <button
              onClick={onCleanOverlaps}
              className="prompt-tag-chip"
              style={{
                background: 'rgba(239, 68, 68, 0.15)',
                color: '#f87171',
                borderColor: 'rgba(239, 68, 68, 0.3)',
                padding: '0.15rem 0.5rem',
                fontSize: '11px',
              }}
              title="Click to strip tags that already belong to the World Tree"
            >
              Separate {overlapCount} World Tag{overlapCount > 1 ? 's' : ''}
            </button>
          )}
          {manualPrompt && (
            <button
              onClick={handleClear}
              className="btn icon-only"
              title="Clear manual prompt"
              style={{ width: '28px', height: '28px', padding: 0 }}
            >
              <Trash2 size={13} color="var(--text-dim)" />
            </button>
          )}
          <span style={{ fontSize: '11px', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>
            {manualPrompt ? `${manualPrompt.length} chars` : '0 chars'}
          </span>
        </div>
      </div>

      {/* Monolithic Textarea (Min-h 120px) */}
      <textarea
        className="prompt-manual-textarea"
        placeholder={`Type manual character prompts for ${evaTournamentName || 'Eva'} (e.g. hair style, combat outfit, expression, angle)...`}
        value={manualPrompt}
        onChange={(e) => onChangeManualPrompt(e.target.value)}
      />

      {/* Quick Token Palette Chips */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '11.5px', color: 'var(--text-secondary)' }}>
          <Sparkles size={12} color="#c084fc" />
          <span>Quick Preset Modifiers:</span>
        </div>
        <div className="prompt-chips-row">
          {QUICK_TAGS.map((tag) => (
            <button
              key={tag}
              onClick={() => handleAddTag(tag)}
              className="prompt-tag-chip"
              title={`Append "${tag}"`}
            >
              <Plus size={10} style={{ display: 'inline', marginRight: '3px' }} />
              {tag}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
