import React, { useMemo } from 'react';
import { Check, Sparkles } from 'lucide-react';
import {
  COLOR_PALETTE,
  resolveColor,
  extractTargetedColors,
  ColorDefinition,
} from '../../services/colorExtractor';

interface ColorPromptRecognizerProps {
  label: string;
  selectedColorId: string;
  onSelectColor: (colorId: string) => void;
  scanText?: string;
  contextTarget?: 'eyes' | 'pupils' | 'hair' | 'general';
}

export const ColorPromptRecognizer: React.FC<ColorPromptRecognizerProps> = ({
  label,
  selectedColorId,
  onSelectColor,
  scanText = '',
  contextTarget = 'eyes',
}) => {
  const activeColor = resolveColor(selectedColorId);

  // Extract detected color keywords from prompt context
  const detectedColors = useMemo(() => {
    if (!scanText) return [];
    return extractTargetedColors(scanText, contextTarget);
  }, [scanText, contextTarget]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
      {/* Label and Active Color Display */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 600 }}>
          {label}
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '11px' }}>
          <span
            style={{
              width: '10px',
              height: '10px',
              borderRadius: '50%',
              backgroundColor: activeColor.hex,
              display: 'inline-block',
              boxShadow: `0 0 6px ${activeColor.hex}`,
            }}
          />
          <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{activeColor.name}</span>
          <span style={{ color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>
            ({activeColor.hex})
          </span>
        </div>
      </div>

      {/* Auto-detected color badges from prompt text */}
      {detectedColors.length > 0 && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            padding: '0.3rem 0.5rem',
            background: 'rgba(56, 189, 248, 0.08)',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid rgba(56, 189, 248, 0.25)',
            fontSize: '11px',
          }}
        >
          <Sparkles size={13} color="#38bdf8" />
          <span style={{ color: 'var(--text-secondary)' }}>Detected in prompt:</span>
          <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap' }}>
            {detectedColors.map((det) => {
              const isCurrent = det.color.id === selectedColorId;
              return (
                <button
                  key={`${det.color.id}-${det.matchedPhrase}`}
                  onClick={() => onSelectColor(det.color.id)}
                  title={`Click to set Iris color to ${det.color.name}`}
                  style={{
                    background: isCurrent ? det.color.hex : 'rgba(255, 255, 255, 0.1)',
                    color: isCurrent && det.color.id === 'white' ? '#000' : '#fff',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '4px',
                    padding: '2px 7px',
                    fontSize: '10.5px',
                    cursor: 'pointer',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  <span
                    style={{
                      width: '6px',
                      height: '6px',
                      borderRadius: '50%',
                      background: det.color.hex,
                    }}
                  />
                  <span>"{det.matchedPhrase}"</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* 12-Color Chromatic Palette Swatches */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '0.35rem' }}>
        {COLOR_PALETTE.map((col) => {
          const isSelected = selectedColorId === col.id;
          return (
            <button
              key={col.id}
              onClick={() => onSelectColor(col.id)}
              title={`${col.name} (${col.aliases.slice(0, 3).join(', ')})`}
              style={{
                height: '32px',
                borderRadius: 'var(--radius-sm)',
                background: col.hex,
                border: isSelected ? '2px solid #ffffff' : '1px solid rgba(255, 255, 255, 0.15)',
                boxShadow: isSelected ? `0 0 10px ${col.hex}, inset 0 0 4px rgba(0,0,0,0.4)` : 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.15s ease',
              }}
            >
              {isSelected && <Check size={14} color={col.id === 'white' ? '#000' : '#fff'} />}
            </button>
          );
        })}
      </div>
    </div>
  );
};
