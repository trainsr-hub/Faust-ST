import React, { useState } from 'react';
import { Palette, Ruler, Sparkles } from 'lucide-react';
import { HairState, HairColorModeRecord, HairColorRecord } from '../../types/hair';
import { RealisticHairSilhouette } from './RealisticHairSilhouette';
import { HairChromaticsSection } from './HairChromaticsSection';
import { HairFoundationSection } from './HairFoundationSection';
import { HairBangsAhogeSection } from './HairBangsAhogeSection';

type HairSubTab = 'chromatics' | 'foundation' | 'bangs_ahoge';

interface HairTabContentProps {
  state: HairState;
  onChange: (newState: HairState) => void;
  scanText?: string;
  modes?: HairColorModeRecord[];
  colors?: HairColorRecord[];
}

export const HairTabContent: React.FC<HairTabContentProps> = ({
  state,
  onChange,
  scanText = '',
  modes,
  colors,
}) => {
  const [subTab, setSubTab] = useState<HairSubTab>('chromatics');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
      {/* Live Stylized Hair Silhouette Preview (Always visible across all tiers) */}
      <RealisticHairSilhouette
        mode={state.mode}
        color1={state.color1}
        color2={state.color2}
        blendStyle={state.blendStyle}
        length={state.length}
        texture={state.texture}
        bangs={state.bangs}
        framing={state.framing}
        ahoge={state.ahoge}
      />

      {/* Tier Sub-Navigation Bar - High Hitbox Full Surface Targets */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.35rem' }}>
        <button
          onClick={() => setSubTab('chromatics')}
          className="prompt-action-btn secondary"
          style={{
            minHeight: '40px',
            background: subTab === 'chromatics' ? 'rgba(236, 72, 153, 0.16)' : 'var(--bg-surface)',
            borderColor: subTab === 'chromatics' ? '#ec4899' : 'var(--border-light)',
            color: subTab === 'chromatics' ? '#ec4899' : 'var(--text-secondary)',
            fontWeight: subTab === 'chromatics' ? 600 : 400,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.35rem',
            fontSize: '11px',
            padding: '0.2rem 0.3rem',
          }}
        >
          <Palette size={13} />
          <span>1. Chromatics</span>
        </button>

        <button
          onClick={() => setSubTab('foundation')}
          className="prompt-action-btn secondary"
          style={{
            minHeight: '40px',
            background: subTab === 'foundation' ? 'rgba(56, 189, 248, 0.16)' : 'var(--bg-surface)',
            borderColor: subTab === 'foundation' ? '#38bdf8' : 'var(--border-light)',
            color: subTab === 'foundation' ? '#38bdf8' : 'var(--text-secondary)',
            fontWeight: subTab === 'foundation' ? 600 : 400,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.35rem',
            fontSize: '11px',
            padding: '0.2rem 0.3rem',
          }}
        >
          <Ruler size={13} />
          <span>2. Foundation</span>
        </button>

        <button
          onClick={() => setSubTab('bangs_ahoge')}
          className="prompt-action-btn secondary"
          style={{
            minHeight: '40px',
            background: subTab === 'bangs_ahoge' ? 'rgba(244, 63, 94, 0.16)' : 'var(--bg-surface)',
            borderColor: subTab === 'bangs_ahoge' ? '#f43f5e' : 'var(--border-light)',
            color: subTab === 'bangs_ahoge' ? '#f43f5e' : 'var(--text-secondary)',
            fontWeight: subTab === 'bangs_ahoge' ? 600 : 400,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.35rem',
            fontSize: '11px',
            padding: '0.2rem 0.3rem',
          }}
        >
          <Sparkles size={13} />
          <span>3. Bangs & Ahoge</span>
        </button>
      </div>

      {/* Sub-Tab Contents */}
      {subTab === 'chromatics' && (
        <HairChromaticsSection
          state={state}
          onChange={onChange}
          scanText={scanText}
          modes={modes}
          colors={colors}
        />
      )}

      {subTab === 'foundation' && (
        <HairFoundationSection
          length={state.length}
          texture={state.texture}
          onChangeLength={(length) => onChange({ ...state, length })}
          onChangeTexture={(texture) => onChange({ ...state, texture })}
        />
      )}

      {subTab === 'bangs_ahoge' && (
        <HairBangsAhogeSection
          bangs={state.bangs}
          framing={state.framing}
          ahoge={state.ahoge}
          onChangeBangs={(bangs) => onChange({ ...state, bangs })}
          onChangeFraming={(framing) => onChange({ ...state, framing })}
          onChangeAhoge={(ahoge) => onChange({ ...state, ahoge })}
        />
      )}
    </div>
  );
};
