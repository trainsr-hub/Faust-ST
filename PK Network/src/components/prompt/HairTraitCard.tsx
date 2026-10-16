import React from 'react';
import { Sparkles, ToggleLeft, ToggleRight, Info } from 'lucide-react';
import { HairState, HairColorMode } from '../../types/hair';
import {
  MOCK_HAIR_MODES,
  MOCK_HAIR_COLORS,
  compileHairPrompt,
} from '../../services/hairMockData';
import { RealisticHairSilhouette } from './RealisticHairSilhouette';
import { ColorPromptRecognizer } from './ColorPromptRecognizer';

interface HairTraitCardProps {
  state: HairState;
  onChange: (newState: HairState) => void;
  scanText?: string;
}

export const HairTraitCard: React.FC<HairTraitCardProps> = ({
  state,
  onChange,
  scanText = '',
}) => {
  const compiledPrompt = compileHairPrompt(state);
  const activeModeDef = MOCK_HAIR_MODES.find((m) => m.id === state.mode) || MOCK_HAIR_MODES[0];
  const activeColorDef = MOCK_HAIR_COLORS.find((c) => c.id === state.color1) || MOCK_HAIR_COLORS[0];

  const setMode = (mode: HairColorMode) => onChange({ ...state, mode });
  const setColor1 = (color1: string) => onChange({ ...state, color1 });
  const setColor2 = (color2: string) => onChange({ ...state, color2 });
  const toggleEnabled = () => onChange({ ...state, isEnabled: !state.isEnabled });

  return (
    <div className="prompt-card" style={{ opacity: state.isEnabled ? 1 : 0.7 }}>
      {/* Header with Enable Switch */}
      <div className="prompt-card-header">
        <div className="prompt-card-title">
          <Sparkles size={16} color="#ec4899" />
          <span>4 ~ Hair Matrix (Chromatics)</span>
        </div>
        <button
          onClick={toggleEnabled}
          className="btn icon-only"
          title={state.isEnabled ? 'Disable Hair Module' : 'Enable Hair Module'}
          style={{ width: 'auto', padding: '0 0.5rem', display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '11.5px' }}
        >
          {state.isEnabled ? <ToggleRight size={18} color="#ec4899" /> : <ToggleLeft size={18} color="var(--text-dim)" />}
          <span style={{ color: state.isEnabled ? '#ec4899' : 'var(--text-dim)' }}>
            {state.isEnabled ? 'ACTIVE' : 'OFF'}
          </span>
        </button>
      </div>

      {state.isEnabled && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* 1. Distribution Pattern Selector */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
            <span style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 600 }}>
              1. Hair Color Distribution Pattern:
            </span>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.35rem' }}>
              {MOCK_HAIR_MODES.map((m) => {
                const isActive = state.mode === m.id;
                return (
                  <button
                    key={m.id}
                    onClick={() => setMode(m.id)}
                    className="prompt-action-btn secondary"
                    title={m.description}
                    style={{
                      minHeight: '36px',
                      fontSize: '11.5px',
                      background: isActive ? 'rgba(236, 72, 153, 0.15)' : 'var(--bg-surface)',
                      borderColor: isActive ? '#ec4899' : 'var(--border-light)',
                      color: isActive ? '#ec4899' : 'var(--text-primary)',
                      fontWeight: isActive ? 600 : 400,
                      padding: '0.2rem 0.4rem',
                    }}
                  >
                    {m.name}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Live Stylized Hair Silhouette Preview */}
          <RealisticHairSilhouette
            mode={state.mode}
            color1={state.color1}
            color2={state.color2}
          />

          {/* 2. Primary Hair Color */}
          {state.mode !== 'rainbow' && (
            <ColorPromptRecognizer
              label="2. Primary Hair Color:"
              selectedColorId={state.color1}
              onSelectColor={setColor1}
              scanText={scanText}
              contextTarget="hair"
            />
          )}

          {/* 3. Secondary / Accent Hair Color (for multi-tone patterns) */}
          {activeModeDef.colorInputs === 2 && (
            <ColorPromptRecognizer
              label={`3. Accent / ${activeModeDef.name} Color:`}
              selectedColorId={state.color2}
              onSelectColor={setColor2}
              scanText={scanText}
              contextTarget="hair"
            />
          )}

          {/* Semantic Overlap Guidance */}
          {activeColorDef.overlapNotes && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.45rem',
                padding: '0.4rem 0.6rem',
                background: 'rgba(236, 72, 153, 0.06)',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid rgba(236, 72, 153, 0.2)',
                fontSize: '11px',
                color: '#f472b6',
              }}
            >
              <Info size={13} style={{ flexShrink: 0 }} />
              <span>
                <strong>{activeColorDef.name} Hair</strong>: {activeColorDef.overlapNotes}.
              </span>
            </div>
          )}

          {/* Compiled Output Preview */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            <span style={{ fontSize: '11px', color: '#ec4899', fontWeight: 600 }}>
              Hair Tokens (Step 4 Output):
            </span>
            <div
              className="prompt-origin-box"
              style={{
                borderColor: 'rgba(236, 72, 153, 0.3)',
                color: '#f472b6',
                background: 'rgba(236, 72, 153, 0.05)',
              }}
            >
              {compiledPrompt || 'None'}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
