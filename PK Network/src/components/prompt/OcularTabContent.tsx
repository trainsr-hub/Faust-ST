import React from 'react';
import {
  OcularState,
  EyeMode,
  IrisShape,
  EyeColorModeRecord,
  PupilShapeRecord,
} from '../../types/ocular';
import { FALLBACK_MODES } from '../../services/ocularLiveService';
import { MOCK_IRIS_SHAPES } from '../../services/ocularMockData';
import { RealisticEyePair } from './RealisticEyePair';
import { ColorPromptRecognizer } from './ColorPromptRecognizer';

interface OcularTabContentProps {
  state: OcularState;
  onChange: (newState: OcularState) => void;
  scanText?: string;
  modes?: EyeColorModeRecord[];
  shapes?: PupilShapeRecord[];
}

export const OcularTabContent: React.FC<OcularTabContentProps> = ({
  state,
  onChange,
  scanText = '',
  modes,
  shapes,
}) => {
  const activeModes = modes && modes.length > 0 ? modes : FALLBACK_MODES;
  const activeShapes: PupilShapeRecord[] =
    shapes && shapes.length > 0
      ? shapes
      : MOCK_IRIS_SHAPES.map((s) => ({
          id: s.id,
          code: s.id,
          name: s.name,
          icon_symbol: s.iconSymbol,
          prompt_token: s.promptToken,
          svg_path: '',
          sort_order: 0,
          is_active: 1,
        }));

  const setMode = (mode: EyeMode) => onChange({ ...state, mode });
  const setColor1 = (color1: string) => onChange({ ...state, color1 });
  const setColor2 = (color2: string) => onChange({ ...state, color2 });
  const setIrisShape = (irisShape: IrisShape) => onChange({ ...state, irisShape });
  const setPupilColor = (pupilColor: string) => onChange({ ...state, pupilColor });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {/* 1. Mode Selector from Turso Table */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
        <span style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 600 }}>
          1. Color Distribution Mode:
        </span>
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${activeModes.length}, 1fr)`, gap: '0.4rem' }}>
          {activeModes.map((m) => {
            const isActive = state.mode === m.code;
            return (
              <button
                key={m.code}
                onClick={() => setMode(m.code)}
                className="prompt-action-btn secondary"
                title={m.notes || m.name}
                style={{
                  minHeight: '40px',
                  fontSize: '12px',
                  background: isActive ? 'rgba(56, 189, 248, 0.15)' : 'var(--bg-surface)',
                  borderColor: isActive ? '#38bdf8' : 'var(--border-light)',
                  color: isActive ? '#38bdf8' : 'var(--text-primary)',
                  fontWeight: isActive ? 600 : 400,
                }}
              >
                {m.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Live Realistic Anime Eye Pair Rendering */}
      <RealisticEyePair
        mode={state.mode}
        color1={state.color1}
        color2={state.color2}
        shape={state.irisShape}
        pupilColor={state.pupilColor || 'black'}
        shapes={activeShapes}
      />

      {/* 2. Iris Color Selectors with Prompt Recognition Engine */}
      {state.mode === 'single' && (
        <ColorPromptRecognizer
          label="2. Iris Color:"
          selectedColorId={state.color1}
          onSelectColor={setColor1}
          scanText={scanText}
          contextTarget="eyes"
        />
      )}

      {state.mode === 'heterochromia' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <ColorPromptRecognizer
            label="2. Left Iris Color:"
            selectedColorId={state.color1}
            onSelectColor={setColor1}
            scanText={scanText}
            contextTarget="eyes"
          />
          <ColorPromptRecognizer
            label="Right Iris Color:"
            selectedColorId={state.color2}
            onSelectColor={setColor2}
            scanText={scanText}
            contextTarget="eyes"
          />
        </div>
      )}

      {state.mode === 'multi' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <ColorPromptRecognizer
            label="2. Primary Iris Color (Base):"
            selectedColorId={state.color1}
            onSelectColor={setColor1}
            scanText={scanText}
            contextTarget="eyes"
          />
          <ColorPromptRecognizer
            label="Secondary Iris Color (Gradient/Accent):"
            selectedColorId={state.color2}
            onSelectColor={setColor2}
            scanText={scanText}
            contextTarget="eyes"
          />
        </div>
      )}

      {/* 3. Iris / Pupil Shape Selector from Turso Table */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
        <span style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 600 }}>
          3. Iris / Pupil Shape:
        </span>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
          {activeShapes.map((shape) => {
            const isActive = state.irisShape === shape.code;
            return (
              <button
                key={shape.code}
                onClick={() => setIrisShape(shape.code)}
                className="prompt-tag-chip"
                title={shape.prompt_token ? `Prompt: ${shape.prompt_token}` : shape.name}
                style={{
                  background: isActive ? 'rgba(56, 189, 248, 0.2)' : 'var(--bg-canvas)',
                  borderColor: isActive ? '#38bdf8' : 'var(--border-light)',
                  color: isActive ? '#38bdf8' : 'var(--text-secondary)',
                  fontWeight: isActive ? 600 : 400,
                }}
              >
                <span style={{ marginRight: '4px' }}>{shape.icon_symbol}</span>
                <span>{shape.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. Pupil Color Selector */}
      <ColorPromptRecognizer
        label="4. Pupil Color:"
        selectedColorId={state.pupilColor || 'black'}
        onSelectColor={setPupilColor}
        scanText={scanText}
        contextTarget="pupils"
      />
    </div>
  );
};
