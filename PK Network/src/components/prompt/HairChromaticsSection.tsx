import React from 'react';
import { Info } from 'lucide-react';
import { HairState, HairColorMode, HairColorModeRecord, HairColorRecord } from '../../types/hair';
import { MOCK_HAIR_COLORS } from '../../services/hairMockData';
import { FALLBACK_HAIR_MODES } from '../../services/hairLiveService';
import { ColorPromptRecognizer } from './ColorPromptRecognizer';

interface HairChromaticsSectionProps {
  state: HairState;
  onChange: (newState: HairState) => void;
  scanText?: string;
  modes?: HairColorModeRecord[];
  colors?: HairColorRecord[];
}

export const HairChromaticsSection: React.FC<HairChromaticsSectionProps> = ({
  state,
  onChange,
  scanText = '',
  modes,
  colors,
}) => {
  const activeModes = modes && modes.length > 0 ? modes : FALLBACK_HAIR_MODES;
  const activeModeDef = activeModes.find((m) => m.code === state.mode) || activeModes[0];

  const dbColor = colors?.find((c) => c.code === state.color1);
  const activeColorDef = dbColor
    ? { name: dbColor.name, overlapNotes: dbColor.overlap_notes }
    : MOCK_HAIR_COLORS.find((c) => c.id === state.color1) || MOCK_HAIR_COLORS[0];

  const setMode = (mode: HairColorMode) => onChange({ ...state, mode });
  const setColor1 = (color1: string) => onChange({ ...state, color1 });
  const setColor2 = (color2: string) => onChange({ ...state, color2 });
  const setBlendStyle = (blendStyle: 'sharp' | 'gradient') => onChange({ ...state, blendStyle });

  const twoToneModes = activeModes.filter((m) => m.category === 'two_tone');
  const gradientModes = activeModes.filter((m) => m.category === 'gradient');
  const locationModes = activeModes.filter((m) => m.category === 'location');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
      {/* 1. Categorized Distribution Pattern Grid */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 600 }}>
            1. Hair Color Distribution Pattern:
          </span>
          <button
            onClick={() => setMode('single')}
            className="prompt-tag-chip"
            style={{
              fontSize: '10.5px',
              padding: '2px 8px',
              background: state.mode === 'single' ? 'rgba(236, 72, 153, 0.2)' : 'var(--bg-canvas)',
              borderColor: state.mode === 'single' ? '#ec4899' : 'var(--border-light)',
              color: state.mode === 'single' ? '#ec4899' : 'var(--text-dim)',
            }}
          >
            Solid (One Color)
          </button>
        </div>

        {/* Group A: Two-Tone (Non-Merging / Discrete) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          <span style={{ fontSize: '10px', color: '#ec4899', fontWeight: 700, letterSpacing: '0.03em' }}>
            TWO-TONE (NON-MERGING / DISTINCT)
          </span>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '0.3rem' }}>
            {twoToneModes.map((m) => {
              const isActive = state.mode === m.code;
              return (
                <button
                  key={m.code}
                  onClick={() => setMode(m.code)}
                  className="prompt-action-btn secondary"
                  title={m.description}
                  style={{
                    minHeight: '34px',
                    fontSize: '11px',
                    background: isActive ? 'rgba(236, 72, 153, 0.18)' : 'var(--bg-surface)',
                    borderColor: isActive ? '#ec4899' : 'var(--border-light)',
                    color: isActive ? '#ec4899' : 'var(--text-primary)',
                    fontWeight: isActive ? 600 : 400,
                    padding: '0.15rem 0.3rem',
                  }}
                >
                  {m.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* Group B: Gradient (Merging / Continuous Blend) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          <span style={{ fontSize: '10px', color: '#c084fc', fontWeight: 700, letterSpacing: '0.03em' }}>
            GRADIENT (MERGING / CONTINUOUS BLEND)
          </span>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.35rem' }}>
            {gradientModes.map((m) => {
              const isActive = state.mode === m.code;
              return (
                <button
                  key={m.code}
                  onClick={() => setMode(m.code)}
                  className="prompt-action-btn secondary"
                  title={m.description}
                  style={{
                    minHeight: '34px',
                    fontSize: '11px',
                    background: isActive ? 'rgba(192, 132, 252, 0.18)' : 'var(--bg-surface)',
                    borderColor: isActive ? '#c084fc' : 'var(--border-light)',
                    color: isActive ? '#c084fc' : 'var(--text-primary)',
                    fontWeight: isActive ? 600 : 400,
                    padding: '0.15rem 0.3rem',
                  }}
                >
                  {m.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* Group C: Locations (Zonal Accents: Tips & Roots) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '10px', color: '#38bdf8', fontWeight: 700, letterSpacing: '0.03em' }}>
              LOCATIONS (ZONAL PLACEMENT)
            </span>
            {(state.mode === 'tips' || state.mode === 'roots') && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '10px' }}>
                <span style={{ color: 'var(--text-dim)' }}>Blend:</span>
                <button
                  onClick={() => setBlendStyle('sharp')}
                  style={{
                    padding: '1px 5px',
                    borderRadius: '4px',
                    fontSize: '10px',
                    background: state.blendStyle === 'sharp' ? 'rgba(236, 72, 153, 0.2)' : 'transparent',
                    color: state.blendStyle === 'sharp' ? '#ec4899' : 'var(--text-dim)',
                    border: '1px solid',
                    borderColor: state.blendStyle === 'sharp' ? '#ec4899' : 'var(--border-light)',
                    cursor: 'pointer',
                  }}
                >
                  Sharp (Two-Tone)
                </button>
                <button
                  onClick={() => setBlendStyle('gradient')}
                  style={{
                    padding: '1px 5px',
                    borderRadius: '4px',
                    fontSize: '10px',
                    background: (state.blendStyle || 'gradient') === 'gradient' ? 'rgba(56, 189, 248, 0.2)' : 'transparent',
                    color: (state.blendStyle || 'gradient') === 'gradient' ? '#38bdf8' : 'var(--text-dim)',
                    border: '1px solid',
                    borderColor: (state.blendStyle || 'gradient') === 'gradient' ? '#38bdf8' : 'var(--border-light)',
                    cursor: 'pointer',
                  }}
                >
                  Soft (Gradient)
                </button>
              </div>
            )}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.35rem' }}>
            {locationModes.map((m) => {
              const isActive = state.mode === m.code;
              return (
                <button
                  key={m.code}
                  onClick={() => setMode(m.code)}
                  className="prompt-action-btn secondary"
                  title={m.description}
                  style={{
                    minHeight: '34px',
                    fontSize: '11px',
                    background: isActive ? 'rgba(56, 189, 248, 0.18)' : 'var(--bg-surface)',
                    borderColor: isActive ? '#38bdf8' : 'var(--border-light)',
                    color: isActive ? '#38bdf8' : 'var(--text-primary)',
                    fontWeight: isActive ? 600 : 400,
                    padding: '0.15rem 0.3rem',
                  }}
                >
                  {m.name}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 2. Primary Hair Color */}
      {state.mode !== 'rainbow' && (
        <ColorPromptRecognizer
          label={state.mode === 'roots' ? '2. Base Hair Color (Body & Ends):' : '2. Primary Base Hair Color:'}
          selectedColorId={state.color1}
          onSelectColor={setColor1}
          scanText={scanText}
          contextTarget="hair"
        />
      )}

      {/* 3. Secondary / Accent Hair Color */}
      {activeModeDef.color_inputs === 2 && (
        <ColorPromptRecognizer
          label={
            state.mode === 'roots'
              ? '3. Root Color (Top of the head / Scalp):'
              : state.mode === 'tips'
              ? '3. Tip Color (Dip-dyed ends):'
              : state.mode === 'striped'
              ? '3. Stripe Band Color:'
              : `3. Accent / ${activeModeDef.name} Color:`
          }
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
    </div>
  );
};
