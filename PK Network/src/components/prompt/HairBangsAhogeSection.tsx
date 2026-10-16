import React from 'react';
import {
  HairBangs,
  HairFraming,
  HairAhoge,
  HAIR_BANGS_ITEMS,
  HAIR_FRAMING_ITEMS,
  HAIR_AHOGE_ITEMS,
} from '../../types/hair';

interface HairBangsAhogeSectionProps {
  bangs?: HairBangs;
  framing?: HairFraming;
  ahoge?: HairAhoge;
  onChangeBangs: (bangs: HairBangs) => void;
  onChangeFraming: (framing: HairFraming) => void;
  onChangeAhoge: (ahoge: HairAhoge) => void;
}

export const HairBangsAhogeSection: React.FC<HairBangsAhogeSectionProps> = ({
  bangs = 'none',
  framing = 'none',
  ahoge = 'none',
  onChangeBangs,
  onChangeFraming,
  onChangeAhoge,
}) => {
  const activeBangsDef = HAIR_BANGS_ITEMS.find((b) => b.id === bangs) || HAIR_BANGS_ITEMS[0];
  const activeFramingDef = HAIR_FRAMING_ITEMS.find((f) => f.id === framing) || HAIR_FRAMING_ITEMS[0];
  const activeAhogeDef = HAIR_AHOGE_ITEMS.find((a) => a.id === ahoge) || HAIR_AHOGE_ITEMS[0];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
      {/* 1. Bangs / Fringe Selector */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '11px', color: '#f43f5e', fontWeight: 600 }}>
            1. Front Bangs / Fringe Style:
          </span>
          <span style={{ fontSize: '10.5px', color: 'var(--text-dim)' }}>
            Active:{' '}
            <strong style={{ color: bangs === 'none' ? 'var(--text-dim)' : '#f43f5e' }}>
              {activeBangsDef.name} {activeBangsDef.promptToken && `(${activeBangsDef.promptToken})`}
            </strong>
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.35rem' }}>
          {HAIR_BANGS_ITEMS.map((item) => {
            const isActive = bangs === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onChangeBangs(item.id)}
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
                  background: isActive ? 'rgba(244, 63, 94, 0.18)' : 'var(--bg-surface)',
                  borderColor: isActive ? '#f43f5e' : 'var(--border-light)',
                  color: isActive ? '#f43f5e' : 'var(--text-primary)',
                  fontWeight: isActive ? 600 : 400,
                }}
              >
                <span style={{ fontSize: '11px', lineHeight: 1.2 }}>{item.name}</span>
                <span
                  style={{
                    fontSize: '9px',
                    color: isActive ? '#fda4af' : 'var(--text-dim)',
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

      {/* 2. Center & Facial Framing Strands */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '11px', color: '#fb923c', fontWeight: 600 }}>
            2. Center & Facial Framing Strands:
          </span>
          <span style={{ fontSize: '10.5px', color: 'var(--text-dim)' }}>
            Active:{' '}
            <strong style={{ color: framing === 'none' ? 'var(--text-dim)' : '#fb923c' }}>
              {activeFramingDef.name} {activeFramingDef.promptToken && `(${activeFramingDef.promptToken})`}
            </strong>
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.35rem' }}>
          {HAIR_FRAMING_ITEMS.map((item) => {
            const isActive = framing === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onChangeFraming(item.id)}
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
                  background: isActive ? 'rgba(251, 146, 60, 0.18)' : 'var(--bg-surface)',
                  borderColor: isActive ? '#fb923c' : 'var(--border-light)',
                  color: isActive ? '#fb923c' : 'var(--text-primary)',
                  fontWeight: isActive ? 600 : 400,
                }}
              >
                <span style={{ fontSize: '11px', lineHeight: 1.2 }}>{item.name}</span>
                <span
                  style={{
                    fontSize: '9px',
                    color: isActive ? '#fed7aa' : 'var(--text-dim)',
                    lineHeight: 1.1,
                    textAlign: 'center',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    maxWidth: '100%',
                  }}
                >
                  {item.promptToken || 'None'}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Crown Ahoge & Antenna */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '11px', color: '#a855f7', fontWeight: 600 }}>
            3. Crown Ahoge & Antenna Hair:
          </span>
          <span style={{ fontSize: '10.5px', color: 'var(--text-dim)' }}>
            Active:{' '}
            <strong style={{ color: ahoge === 'none' ? 'var(--text-dim)' : '#a855f7' }}>
              {activeAhogeDef.name} {activeAhogeDef.promptToken && `(${activeAhogeDef.promptToken})`}
            </strong>
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.35rem' }}>
          {HAIR_AHOGE_ITEMS.map((item) => {
            const isActive = ahoge === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onChangeAhoge(item.id)}
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
                  background: isActive ? 'rgba(168, 85, 247, 0.18)' : 'var(--bg-surface)',
                  borderColor: isActive ? '#a855f7' : 'var(--border-light)',
                  color: isActive ? '#a855f7' : 'var(--text-primary)',
                  fontWeight: isActive ? 600 : 400,
                }}
              >
                <span style={{ fontSize: '11px', lineHeight: 1.2 }}>{item.name}</span>
                <span
                  style={{
                    fontSize: '9px',
                    color: isActive ? '#e9d5ff' : 'var(--text-dim)',
                    lineHeight: 1.1,
                    textAlign: 'center',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    maxWidth: '100%',
                  }}
                >
                  {item.promptToken || 'None'}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
