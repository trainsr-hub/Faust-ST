import React from 'react';
import { HairLength, HairTexture, HAIR_LENGTH_ITEMS, HAIR_TEXTURE_ITEMS } from '../../types/hair';

interface HairFoundationSectionProps {
  length?: HairLength;
  texture?: HairTexture;
  onChangeLength: (length: HairLength) => void;
  onChangeTexture: (texture: HairTexture) => void;
}

export const HairFoundationSection: React.FC<HairFoundationSectionProps> = ({
  length = 'none',
  texture = 'none',
  onChangeLength,
  onChangeTexture,
}) => {
  const activeLengthDef = HAIR_LENGTH_ITEMS.find((l) => l.id === length) || HAIR_LENGTH_ITEMS[0];
  const activeTextureDef = HAIR_TEXTURE_ITEMS.find((t) => t.id === texture) || HAIR_TEXTURE_ITEMS[0];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
      {/* 1. Hair Length Selector */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '11px', color: '#38bdf8', fontWeight: 600 }}>
            1. Hair Length (Silhouette Foundation):
          </span>
          <span style={{ fontSize: '10.5px', color: 'var(--text-dim)' }}>
            Active:{' '}
            <strong style={{ color: length === 'none' ? 'var(--text-dim)' : '#38bdf8' }}>
              {activeLengthDef.name} {activeLengthDef.promptToken && `(${activeLengthDef.promptToken})`}
            </strong>
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.35rem' }}>
          {HAIR_LENGTH_ITEMS.map((item) => {
            const isActive = length === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onChangeLength(item.id)}
                className="prompt-action-btn secondary"
                title={item.description}
                style={{
                  minHeight: '44px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '0.25rem 0.4rem',
                  gap: '2px',
                  background: isActive ? 'rgba(56, 189, 248, 0.18)' : 'var(--bg-surface)',
                  borderColor: isActive ? '#38bdf8' : 'var(--border-light)',
                  color: isActive ? '#38bdf8' : 'var(--text-primary)',
                  fontWeight: isActive ? 600 : 400,
                }}
              >
                <span style={{ fontSize: '11.5px', lineHeight: 1.2 }}>{item.name}</span>
                <span
                  style={{
                    fontSize: '9.5px',
                    color: isActive ? '#7dd3fc' : 'var(--text-dim)',
                    lineHeight: 1.1,
                    textAlign: 'center',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    maxWidth: '100%',
                  }}
                >
                  {item.promptToken || 'Unspecified'}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Hair Texture & Body Selector */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '11px', color: '#c084fc', fontWeight: 600 }}>
            2. Hair Texture & Physical Flow:
          </span>
          <span style={{ fontSize: '10.5px', color: 'var(--text-dim)' }}>
            Active:{' '}
            <strong style={{ color: texture === 'none' ? 'var(--text-dim)' : '#c084fc' }}>
              {activeTextureDef.name} {activeTextureDef.promptToken && `(${activeTextureDef.promptToken})`}
            </strong>
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '0.35rem' }}>
          {HAIR_TEXTURE_ITEMS.map((item) => {
            const isActive = texture === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onChangeTexture(item.id)}
                className="prompt-action-btn secondary"
                title={item.description}
                style={{
                  minHeight: '44px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '0.25rem 0.35rem',
                  gap: '2px',
                  background: isActive ? 'rgba(192, 132, 252, 0.18)' : 'var(--bg-surface)',
                  borderColor: isActive ? '#c084fc' : 'var(--border-light)',
                  color: isActive ? '#c084fc' : 'var(--text-primary)',
                  fontWeight: isActive ? 600 : 400,
                }}
              >
                <span style={{ fontSize: '11px', lineHeight: 1.2 }}>{item.name}</span>
                <span
                  style={{
                    fontSize: '9px',
                    color: isActive ? '#d8b4fe' : 'var(--text-dim)',
                    lineHeight: 1.1,
                    textAlign: 'center',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    maxWidth: '100%',
                  }}
                >
                  {item.promptToken || 'Unspecified'}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
