import React from 'react';
import {
  HairColorMode,
  HairLength,
  HairTexture,
  HairBangs,
  HairFraming,
  HairAhoge,
  HAIR_LENGTH_ITEMS,
  HAIR_BANGS_ITEMS,
  HAIR_AHOGE_ITEMS,
} from '../../types/hair';
import { resolveColor } from '../../services/colorExtractor';

interface RealisticHairSilhouetteProps {
  mode: HairColorMode;
  color1: string;
  color2: string;
  blendStyle?: 'sharp' | 'gradient';
  length?: HairLength;
  texture?: HairTexture;
  bangs?: HairBangs;
  framing?: HairFraming;
  ahoge?: HairAhoge;
}

export const RealisticHairSilhouette: React.FC<RealisticHairSilhouetteProps> = ({
  mode,
  color1,
  color2,
  blendStyle = 'gradient',
  length = 'none',
  texture = 'none',
  bangs = 'none',
  framing = 'none',
  ahoge = 'none',
}) => {
  const c1Def = resolveColor(color1);
  const c2Def = resolveColor(color2);
  const c1 = c1Def.hex;
  const c2 = c2Def.hex;

  const lengthDef = HAIR_LENGTH_ITEMS.find((l) => l.id === length) || HAIR_LENGTH_ITEMS[0];
  const bangsDef = HAIR_BANGS_ITEMS.find((b) => b.id === bangs) || HAIR_BANGS_ITEMS[0];
  const ahogeDef = HAIR_AHOGE_ITEMS.find((a) => a.id === ahoge) || HAIR_AHOGE_ITEMS[0];

  const getHairFill = (isBack: boolean) => {
    if (mode === 'rainbow') return 'url(#hair-rainbow-grad)';
    if (mode === 'striped') return 'url(#hair-striped-grad)';
    if (mode === 'split' || mode === 'two_tone') return 'url(#hair-split-grad)';
    if (mode === 'gradient') return 'url(#hair-vert-grad)';
    if (mode === 'tips') return blendStyle === 'sharp' ? 'url(#hair-sharp-tips-grad)' : 'url(#hair-soft-tips-grad)';
    if (mode === 'roots') return blendStyle === 'sharp' ? 'url(#hair-sharp-roots-grad)' : 'url(#hair-soft-roots-grad)';
    if (mode === 'inner_hair' && isBack) return c2;
    return c1;
  };

  const getBackHairPath = () => {
    if (length === 'very_short') return 'M26,38 C20,44 22,54 28,56 C34,58 38,54 50,55 C62,54 66,58 72,56 C78,54 80,44 74,38 Z';
    if (length === 'short') return 'M22,38 C16,48 16,66 26,68 C32,66 38,58 50,60 C62,58 68,66 74,68 C84,66 84,48 78,38 Z';
    if (length === 'long') return 'M18,36 C12,58 10,88 20,102 C25,88 28,78 34,70 C42,88 58,88 66,70 C72,78 75,88 80,102 C90,88 88,58 82,36 Z';
    if (length === 'very_long') return 'M16,36 C10,60 8,96 18,110 C24,96 28,82 34,74 C42,92 58,92 66,74 C72,82 76,96 82,110 C92,96 90,60 84,36 Z';
    if (length === 'absurdly_long') return 'M14,36 C6,60 2,96 10,114 C20,98 26,84 34,74 C42,94 58,94 66,74 C74,84 80,98 90,114 C98,96 94,60 86,36 Z';
    return 'M20,38 C14,56 12,78 22,86 C25,75 28,68 32,60 C40,78 60,78 68,60 C72,68 75,75 78,86 C88,78 86,56 80,38 Z';
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '0.85rem 1rem',
        background: 'radial-gradient(ellipse at center, rgba(30, 41, 59, 0.7) 0%, rgba(15, 23, 42, 0.95) 100%)',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--border-light)',
        gap: '0.5rem',
      }}
    >
      <svg
        viewBox="0 -14 100 128"
        style={{ width: '130px', height: '166px', filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.4))' }}
      >
        <defs>
          <linearGradient id="hair-vert-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={c1} /><stop offset="100%" stopColor={c2} />
          </linearGradient>
          <linearGradient id="hair-soft-tips-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={c1} /><stop offset="60%" stopColor={c1} /><stop offset="100%" stopColor={c2} />
          </linearGradient>
          <linearGradient id="hair-sharp-tips-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={c1} /><stop offset="70%" stopColor={c1} /><stop offset="71%" stopColor={c2} /><stop offset="100%" stopColor={c2} />
          </linearGradient>
          <linearGradient id="hair-soft-roots-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={c2} /><stop offset="40%" stopColor={c1} /><stop offset="100%" stopColor={c1} />
          </linearGradient>
          <linearGradient id="hair-sharp-roots-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={c2} /><stop offset="26%" stopColor={c2} /><stop offset="27%" stopColor={c1} /><stop offset="100%" stopColor={c1} />
          </linearGradient>
          <linearGradient id="hair-striped-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={c1} /><stop offset="16%" stopColor={c1} /><stop offset="17%" stopColor={c2} /><stop offset="33%" stopColor={c2} /><stop offset="34%" stopColor={c1} /><stop offset="50%" stopColor={c1} /><stop offset="51%" stopColor={c2} /><stop offset="67%" stopColor={c2} /><stop offset="68%" stopColor={c1} /><stop offset="84%" stopColor={c1} /><stop offset="85%" stopColor={c2} /><stop offset="100%" stopColor={c2} />
          </linearGradient>
          <linearGradient id="hair-split-grad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="49%" stopColor={c1} /><stop offset="50%" stopColor="rgba(0,0,0,0.3)" /><stop offset="51%" stopColor={c2} />
          </linearGradient>
          <linearGradient id="hair-rainbow-grad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#ef4444" /><stop offset="25%" stopColor="#eab308" /><stop offset="50%" stopColor="#10b981" /><stop offset="75%" stopColor="#06b6d4" /><stop offset="100%" stopColor="#a855f7" />
          </linearGradient>
        </defs>

        {/* Crown Ahoge / Antenna (Behind Head & Rising Up) */}
        {ahoge === 'ahoge' && (
          <path d="M50,8 Q54,-8 64,-2 Q56,-4 50,8" fill={getHairFill(false)} stroke={c1} strokeWidth="0.8" />
        )}
        {ahoge === 'huge_ahoge' && (
          <path d="M50,8 Q58,-14 70,-4 Q58,-6 50,8" fill={getHairFill(false)} stroke={c1} strokeWidth="1" />
        )}
        {ahoge === 'heart_ahoge' && (
          <path d="M50,8 C46,-4 40,-8 46,-12 C50,-9 50,-5 50,-3 C50,-5 50,-9 54,-12 C60,-8 54,-4 50,8" fill={getHairFill(false)} />
        )}
        {ahoge === 'antenna' && (
          <g fill="none" stroke={c1} strokeWidth="2.2" strokeLinecap="round">
            <path d="M48,8 Q40,-6 34,-2" />
            <path d="M52,8 Q60,-6 66,-2" />
          </g>
        )}
        {ahoge === 'heart_antenna' && (
          <path d="M48,8 C42,-4 44,-10 50,-5 C56,-10 58,-4 52,8" fill="none" stroke={c1} strokeWidth="2.2" strokeLinecap="round" />
        )}

        {/* Back Hair Silhouette */}
        <path d={getBackHairPath()} fill={getHairFill(true)} />

        {/* Neck, Shoulders & Upper Body */}
        <path d="M42,54 L42,66 C32,68 22,74 18,84 L14,114 L86,114 L82,84 C78,74 68,68 58,66 L58,54 Z" fill="#ffe4e6" opacity="0.8" />

        {/* Anime Face Contour */}
        <path d="M30,34 C30,52 38,64 50,65 C62,64 70,52 70,34 C70,22 62,18 50,18 C38,18 30,22 30,34 Z" fill="#fff1f2" />

        {/* Inner hair accent strands */}
        {mode === 'inner_hair' && (
          <path d="M26,38 C25,52 28,65 34,74 C31,64 30,52 32,42 Z M74,38 C75,52 72,65 66,74 C69,64 70,52 68,42 Z" fill={c2} />
        )}

        {/* Front Hair & Bangs Silhouette */}
        <path
          d={
            bangs === 'blunt'
              ? 'M18,34 C18,12 36,8 50,8 C64,8 82,12 82,34 C82,50 78,72 74,78 C70,68 72,52 68,38 L68,35 L32,35 L32,38 C28,52 30,68 26,78 C22,72 18,50 18,34 Z'
              : bangs === 'double_parted'
              ? 'M18,34 C18,12 36,8 50,8 C64,8 82,12 82,34 C82,50 78,72 74,78 C70,68 72,52 68,38 C62,48 58,26 50,42 C42,26 38,48 32,38 C28,52 30,68 26,78 C22,72 18,50 18,34 Z'
              : bangs === 'parted'
              ? 'M18,34 C18,12 36,8 50,8 C64,8 82,12 82,34 C82,50 78,72 74,78 C70,68 72,52 68,38 C58,46 54,22 50,22 C46,22 42,46 32,38 C28,52 30,68 26,78 C22,72 18,50 18,34 Z'
              : bangs === 'swept'
              ? 'M18,34 C18,12 36,8 50,8 C64,8 82,12 82,34 C82,50 78,72 74,78 C70,68 72,52 68,38 C60,42 46,38 32,46 C28,52 30,68 26,78 C22,72 18,50 18,34 Z'
              : 'M18,34 C18,12 36,8 50,8 C64,8 82,12 82,34 C82,50 78,72 74,78 C70,68 72,52 68,38 C60,45 54,34 50,42 C46,34 40,45 32,38 C28,52 30,68 26,78 C22,72 18,50 18,34 Z'
          }
          fill={getHairFill(false)}
        />

        {/* Center / Facial Framing Strands */}
        {framing === 'between_eyes' && (
          <path d="M48,22 Q49,34 50,44 Q51,34 52,22 Z" fill={getHairFill(false)} />
        )}
        {framing === 'over_one_eye' && (
          <path d="M34,22 C32,32 34,44 40,48 C37,42 38,32 40,22 Z" fill={getHairFill(false)} />
        )}
        {framing === 'over_eyes' && (
          <path d="M30,34 C36,40 44,42 50,42 C56,42 64,40 70,34 L70,28 L30,28 Z" fill={getHairFill(false)} />
        )}

        {/* Texture Overlays */}
        {texture === 'wavy' && (
          <g fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="1.2" strokeLinecap="round">
            <path d="M22,48 Q16,62 24,76 Q28,84 22,96" />
            <path d="M78,48 Q84,62 76,76 Q72,84 78,96" />
          </g>
        )}
        {texture === 'curly' && (
          <g fill="none" stroke={getHairFill(false)} strokeWidth="2.2">
            <circle cx="24" cy="74" r="5" stroke="rgba(255,255,255,0.4)" strokeWidth="1.2" />
            <circle cx="76" cy="74" r="5" stroke="rgba(255,255,255,0.4)" strokeWidth="1.2" />
          </g>
        )}
        {texture === 'messy' && (
          <g fill="none" stroke={c1} strokeWidth="1.8" strokeLinecap="round">
            <path d="M18,28 Q10,22 14,16" /><path d="M82,28 Q90,22 86,16" />
          </g>
        )}
        {texture === 'spiky' && (
          <g fill={getHairFill(false)}>
            <polygon points="46,10 50,0 54,10" /><polygon points="18,26 8,20 20,34" /><polygon points="82,26 92,20 80,34" />
          </g>
        )}
        {texture === 'flipped' && (
          <g fill="none" stroke={getHairFill(true)} strokeWidth="3" strokeLinecap="round">
            <path d="M22,78 Q14,84 8,78" /><path d="M78,78 Q86,84 92,78" />
          </g>
        )}
        {(texture === 'drill' || texture === 'ringlets') && (
          <g fill="none" stroke="rgba(255,255,255,0.45)" strokeWidth="1.5" strokeLinecap="round">
            <path d="M24,52 C20,56 28,60 24,64 C20,68 28,72 24,76" /><path d="M76,52 C80,56 72,60 76,64 C80,68 72,72 76,76" />
          </g>
        )}

        {/* Streaks Accents */}
        {mode === 'streaks' && (
          <g fill="none" stroke={c2} strokeWidth="2.5" strokeLinecap="round">
            <path d="M36,18 C35,28 34,42 32,56" /><path d="M64,18 C65,28 66,42 68,56" />
          </g>
        )}

        {/* Anime Hair Gloss Ring */}
        <path d="M28,24 C36,20 44,20 50,21 C56,20 64,20 72,24 C64,22 56,22 50,23 C44,22 36,22 28,24 Z" fill="#ffffff" opacity="0.65" />
      </svg>

      {/* Dynamic Status Badges */}
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center', gap: '0.45rem', fontSize: '11px', fontFamily: 'var(--font-mono)' }}>
        <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>
          COLOR: <span style={{ color: c1Def.hex }}>{c1Def.name}</span>
        </span>
        {length !== 'none' && (
          <>
            <span style={{ color: 'var(--text-dim)' }}>•</span>
            <span style={{ color: '#38bdf8', fontWeight: 600 }}>LEN: {lengthDef.name}</span>
          </>
        )}
        {bangs !== 'none' && (
          <>
            <span style={{ color: 'var(--text-dim)' }}>•</span>
            <span style={{ color: '#f43f5e', fontWeight: 600 }}>BANGS: {bangsDef.name}</span>
          </>
        )}
        {ahoge !== 'none' && (
          <>
            <span style={{ color: 'var(--text-dim)' }}>•</span>
            <span style={{ color: '#a855f7', fontWeight: 600 }}>AHOGE: {ahogeDef.name}</span>
          </>
        )}
      </div>
    </div>
  );
};
