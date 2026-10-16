import React, { useState } from 'react';
import { Eye, Sparkles, ToggleLeft, ToggleRight, Layers } from 'lucide-react';
import { OcularState, EyeColorModeRecord, PupilShapeRecord } from '../../types/ocular';
import { HairState, HairColorModeRecord, HairColorRecord } from '../../types/hair';
import { compileDynamicOcularPrompt, FALLBACK_MODES } from '../../services/ocularLiveService';
import { compileDynamicHairPrompt, FALLBACK_HAIR_MODES } from '../../services/hairLiveService';
import { OcularTabContent } from './OcularTabContent';
import { HairTabContent } from './HairTabContent';

export type AppearanceTab = 'eyes' | 'hair';

interface AppearanceTraitCardProps {
  ocularState: OcularState;
  onChangeOcular: (newState: OcularState) => void;
  hairState: HairState;
  onChangeHair: (newState: HairState) => void;
  scanText?: string;
  modes?: EyeColorModeRecord[];
  shapes?: PupilShapeRecord[];
  hairModes?: HairColorModeRecord[];
  hairColors?: HairColorRecord[];
}

export const AppearanceTraitCard: React.FC<AppearanceTraitCardProps> = ({
  ocularState,
  onChangeOcular,
  hairState,
  onChangeHair,
  scanText = '',
  modes,
  shapes,
  hairModes,
  hairColors,
}) => {
  const [activeTab, setActiveTab] = useState<AppearanceTab>('eyes');

  const ocularPrompt = compileDynamicOcularPrompt(
    ocularState,
    modes && modes.length > 0 ? modes : FALLBACK_MODES,
    shapes || []
  );
  const hairPrompt = compileDynamicHairPrompt(hairState, hairModes || FALLBACK_HAIR_MODES);

  const isCurrentActive = activeTab === 'eyes' ? ocularState.isEnabled : hairState.isEnabled;

  const toggleCurrentActive = () => {
    if (activeTab === 'eyes') {
      onChangeOcular({ ...ocularState, isEnabled: !ocularState.isEnabled });
    } else {
      onChangeHair({ ...hairState, isEnabled: !hairState.isEnabled });
    }
  };

  const combinedAppearancePrompt = [ocularPrompt, hairPrompt].filter(Boolean).join(', ');

  return (
    <div className="prompt-card">
      {/* Step 3 Header with Active Tab Switch */}
      <div className="prompt-card-header">
        <div className="prompt-card-title">
          <Layers size={16} color="#38bdf8" />
          <span>3 ~ Appearance Matrix (Physical Traits)</span>
        </div>
        <button
          onClick={toggleCurrentActive}
          className="btn icon-only"
          title={isCurrentActive ? `Disable ${activeTab === 'eyes' ? 'Eyes' : 'Hair'}` : `Enable ${activeTab === 'eyes' ? 'Eyes' : 'Hair'}`}
          style={{ width: 'auto', padding: '0 0.5rem', display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '11.5px' }}
        >
          {isCurrentActive ? (
            <ToggleRight size={18} color={activeTab === 'eyes' ? '#38bdf8' : '#ec4899'} />
          ) : (
            <ToggleLeft size={18} color="var(--text-dim)" />
          )}
          <span style={{ color: isCurrentActive ? (activeTab === 'eyes' ? '#38bdf8' : '#ec4899') : 'var(--text-dim)' }}>
            {activeTab.toUpperCase()}: {isCurrentActive ? 'ACTIVE' : 'OFF'}
          </span>
        </button>
      </div>

      {/* Tab Switcher Bar - High Hitbox Full Surface Targets */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '0.35rem' }}>
        <button
          onClick={() => setActiveTab('eyes')}
          className="prompt-action-btn secondary"
          style={{
            minHeight: '44px',
            background: activeTab === 'eyes' ? 'rgba(56, 189, 248, 0.15)' : 'var(--bg-surface)',
            borderColor: activeTab === 'eyes' ? '#38bdf8' : 'var(--border-light)',
            color: activeTab === 'eyes' ? '#38bdf8' : 'var(--text-secondary)',
            fontWeight: activeTab === 'eyes' ? 600 : 400,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            position: 'relative',
          }}
        >
          <Eye size={16} />
          <span>Eyes (Ocular)</span>
          <span
            style={{
              fontSize: '10px',
              padding: '2px 6px',
              borderRadius: '999px',
              background: ocularState.isEnabled ? 'rgba(56, 189, 248, 0.25)' : 'rgba(255,255,255,0.06)',
              color: ocularState.isEnabled ? '#38bdf8' : 'var(--text-dim)',
            }}
          >
            {ocularState.isEnabled ? 'ON' : 'OFF'}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('hair')}
          className="prompt-action-btn secondary"
          style={{
            minHeight: '44px',
            background: activeTab === 'hair' ? 'rgba(236, 72, 153, 0.15)' : 'var(--bg-surface)',
            borderColor: activeTab === 'hair' ? '#ec4899' : 'var(--border-light)',
            color: activeTab === 'hair' ? '#ec4899' : 'var(--text-secondary)',
            fontWeight: activeTab === 'hair' ? 600 : 400,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            position: 'relative',
          }}
        >
          <Sparkles size={16} />
          <span>Hair Matrix</span>
          <span
            style={{
              fontSize: '10px',
              padding: '2px 6px',
              borderRadius: '999px',
              background: hairState.isEnabled ? 'rgba(236, 72, 153, 0.25)' : 'rgba(255,255,255,0.06)',
              color: hairState.isEnabled ? '#ec4899' : 'var(--text-dim)',
            }}
          >
            {hairState.isEnabled ? 'ON' : 'OFF'}
          </span>
        </button>
      </div>

      {/* Tab View Content */}
      <div style={{ marginTop: '0.5rem' }}>
        {activeTab === 'eyes' && (
          ocularState.isEnabled ? (
            <OcularTabContent
              state={ocularState}
              onChange={onChangeOcular}
              scanText={scanText}
              modes={modes}
              shapes={shapes}
            />
          ) : (
            <div style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--text-dim)', fontSize: '12px' }}>
              Ocular module is currently disabled. Click ACTIVE in header to re-enable.
            </div>
          )
        )}

        {activeTab === 'hair' && (
          hairState.isEnabled ? (
            <HairTabContent
              state={hairState}
              onChange={onChangeHair}
              scanText={scanText}
              modes={hairModes}
              colors={hairColors}
            />
          ) : (
            <div style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--text-dim)', fontSize: '12px' }}>
              Hair module is currently disabled. Click ACTIVE in header to re-enable.
            </div>
          )
        )}
      </div>

      {/* Unified Step 3 Output Preview */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', marginTop: '1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '11px', color: '#38bdf8', fontWeight: 600 }}>
            Appearance Tokens (Step 3 Output):
          </span>
          <span style={{ fontSize: '10.5px', color: 'var(--text-dim)' }}>
            Active Tab: <strong style={{ color: activeTab === 'eyes' ? '#38bdf8' : '#ec4899' }}>{activeTab === 'eyes' ? ocularPrompt || 'None' : hairPrompt || 'None'}</strong>
          </span>
        </div>
        <div
          className="prompt-origin-box"
          style={{
            borderColor: 'rgba(56, 189, 248, 0.3)',
            color: '#7dd3fc',
            background: 'rgba(56, 189, 248, 0.05)',
            fontSize: '11.5px',
          }}
        >
          {combinedAppearancePrompt || 'None'}
        </div>
      </div>
    </div>
  );
};
