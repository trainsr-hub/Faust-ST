import React from 'react';
import { EyeMode, IrisShape, PupilShapeRecord } from '../../types/ocular';
import { resolveColor } from '../../services/colorExtractor';

interface RealisticEyePairProps {
  mode: EyeMode;
  color1: string; // Left eye (or primary)
  color2: string; // Right eye (or secondary)
  shape: IrisShape;
  pupilColor?: string;
  shapes?: PupilShapeRecord[];
  accent?: string;
}

export const RealisticEyePair: React.FC<RealisticEyePairProps> = ({
  mode,
  color1,
  color2,
  shape,
  pupilColor = 'black',
  shapes,
  accent = 'none',
}) => {
  const c1Def = resolveColor(color1);
  const c2Def = resolveColor(color2);
  const pupilDef = resolveColor(pupilColor);
  const pFill = pupilColor === 'black' ? '#090d16' : pupilDef.hex;

  // Left & Right eye color assignments based on mode
  const leftIris = {
    primary: c1Def.hex,
    highlight: c1Def.highlightHex,
    dark: c1Def.darkHex,
    secondary: mode === 'multi' ? c2Def.hex : c1Def.hex,
  };

  const rightIris = {
    primary: mode === 'heterochromia' ? c2Def.hex : c1Def.hex,
    highlight: mode === 'heterochromia' ? c2Def.highlightHex : c1Def.highlightHex,
    dark: mode === 'heterochromia' ? c2Def.darkHex : c1Def.darkHex,
    secondary: mode === 'multi' ? c2Def.hex : mode === 'heterochromia' ? c2Def.hex : c1Def.hex,
  };

  const renderPupilFallback = (pupilShape: IrisShape, cx: number, cy: number) => {
    switch (pupilShape) {
      case 'slit':
        return <polygon points={`${cx},${cy - 14} ${cx + 4},${cy} ${cx},${cy + 14} ${cx - 4},${cy}`} fill={pFill} />;
      case 'heart':
        return (
          <path
            d={`M${cx},${cy + 5} A4,4 0 0,1 ${cx - 7},${cy - 2} A4,4 0 0,1 ${cx},${cy - 6} A4,4 0 0,1 ${cx + 7},${cy - 2} A4,4 0 0,1 ${cx},${cy + 5} Z`}
            fill={pFill}
          />
        );
      case 'star':
        return (
          <polygon
            points={`${cx},${cy - 9} ${cx + 3},${cy - 3} ${cx + 9},${cy} ${cx + 3},${cy + 3} ${cx},${cy + 9} ${cx - 3},${cy + 3} ${cx - 9},${cy} ${cx - 3},${cy - 3}`}
            fill={pFill}
          />
        );
      case 'diamond':
        return <polygon points={`${cx},${cy - 10} ${cx + 7},${cy} ${cx},${cy + 10} ${cx - 7},${cy}`} fill={pFill} />;
      case 'cross':
        return (
          <path
            d={`M${cx - 2},${cy - 9} h4 v7 h7 v4 h-7 v7 h-4 v-7 h-7 v-4 h7 z`}
            fill={pFill}
          />
        );
      case 'glowing':
        return (
          <g>
            <circle cx={cx} cy={cy} r="9" fill="none" stroke={pFill} strokeWidth="2" opacity="0.95" />
            <circle cx={cx} cy={cy} r="4.5" fill={pFill} />
          </g>
        );
      case 'empty':
        return <circle cx={cx} cy={cy} r="8" fill="none" stroke={pFill} strokeWidth="2.5" />;
      case 'round':
      default:
        return <circle cx={cx} cy={cy} r="7.5" fill={pFill} />;
    }
  };

  const renderSingleEye = (
    iris: typeof leftIris,
    isLeft: boolean,
    eyeId: string
  ) => {
    // Sclera and lash geometry with mirroring
    const scleraPath = isLeft
      ? 'M15,48 C28,26 62,23 88,40 C95,45 88,60 70,63 C40,66 22,58 15,48 Z'
      : 'M85,48 C72,26 38,23 12,40 C5,45 12,60 30,63 C60,66 78,58 85,48 Z';

    const lashPath = isLeft
      ? 'M12,48 C26,22 64,19 92,38 C94,40 93,42 90,41 C64,24 28,26 14,50 Z'
      : 'M88,48 C74,22 36,19 8,38 C6,40 7,42 10,41 C36,24 72,26 86,50 Z';

    const cx = 50;
    const cy = 46;
    const r = 21;

    // Check if database has dynamic vector path
    const dbShape = shapes?.find((s) => s.code === shape);

    return (
      <svg
        viewBox="0 0 100 80"
        style={{ width: '130px', height: '104px', filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.35))' }}
      >
        <defs>
          {/* Sclera clip path */}
          <clipPath id={`clip-${eyeId}`}>
            <path d={scleraPath} />
          </clipPath>

          {/* Iris radial gradient */}
          <radialGradient id={`iris-grad-${eyeId}`} cx="50%" cy="40%" r="55%">
            <stop offset="0%" stopColor={iris.highlight} />
            <stop offset="60%" stopColor={iris.primary} />
            <stop offset="90%" stopColor={iris.secondary} />
            <stop offset="100%" stopColor={iris.dark} />
          </radialGradient>

          {/* Eyelid shadow gradient on sclera */}
          <linearGradient id={`lid-shadow-${eyeId}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgba(15, 23, 42, 0.45)" />
            <stop offset="45%" stopColor="rgba(15, 23, 42, 0.15)" />
            <stop offset="100%" stopColor="rgba(15, 23, 42, 0)" />
          </linearGradient>
        </defs>

        {/* Double eyelid crease line */}
        <path
          d={isLeft ? 'M25,22 C42,14 68,16 82,26' : 'M75,22 C58,14 32,16 18,26'}
          fill="none"
          stroke="rgba(255,255,255,0.25)"
          strokeWidth="1.2"
          strokeLinecap="round"
        />

        {/* Sclera (White of the eye) */}
        <path d={scleraPath} fill="#f8fafc" />

        {/* Sclera content (Iris & Shading) clipped to eye socket */}
        <g clipPath={`url(#clip-${eyeId})`}>
          {/* Upper eyelid cast shadow */}
          <rect x="0" y="20" width="100" height="35" fill={`url(#lid-shadow-${eyeId})`} />

          {/* Limbal ring (Dark outer iris border) */}
          <circle cx={cx} cy={cy} r={r + 1.5} fill="#090d16" />

          {/* Iris body */}
          <circle cx={cx} cy={cy} r={r} fill={`url(#iris-grad-${eyeId})`} />

          {/* Lower iris crescent light reflection */}
          <path
            d={`M${cx - 15},${cy + 10} C${cx - 8},${cy + 18} ${cx + 8},${cy + 18} ${cx + 15},${cy + 10} C${cx + 8},${cy + 14} ${cx - 8},${cy + 14} ${cx - 15},${cy + 10} Z`}
            fill={iris.highlight}
            opacity="0.6"
          />

          {/* Optional Accent ring */}
          {accent === 'gold_highlight' && (
            <circle cx={cx} cy={cy + 7} r="4" fill="#fbbf24" opacity="0.8" />
          )}

          {/* Subtle pupil chromatic aura if not standard black */}
          {pupilColor !== 'black' && (
            <circle cx={cx} cy={cy} r="10" fill={pFill} opacity="0.25" />
          )}

          {/* Central Pupil from Database Vector Geometry or Fallback */}
          {dbShape?.svg_path ? (
            <g transform={`translate(${cx}, ${cy})`}>
              <path d={dbShape.svg_path} fill={pFill} />
            </g>
          ) : (
            renderPupilFallback(shape, cx, cy)
          )}

          {/* Specular Catchlights (Anime Highlights) */}
          {/* 1. Main sharp oval highlight (upper-left) */}
          <ellipse
            cx={isLeft ? cx - 7 : cx - 5}
            cy={cy - 7}
            rx="4.5"
            ry="6"
            transform={`rotate(-25 ${isLeft ? cx - 7 : cx - 5} ${cy - 7})`}
            fill="#ffffff"
          />
          {/* 2. Secondary soft circular highlight (bottom-right) */}
          <circle cx={isLeft ? cx + 7 : cx + 8} cy={cy + 7} r="2.5" fill="#ffffff" opacity="0.85" />
          {/* 3. Micro dot highlight */}
          <circle cx={isLeft ? cx - 3 : cx - 1} cy={cy + 10} r="1.2" fill="#ffffff" opacity="0.7" />
        </g>

        {/* Upper Eyelash / Wing Line */}
        <path d={lashPath} fill="#090d16" />

        {/* Lower lash line */}
        <path
          d={isLeft ? 'M30,62 C50,64 70,61 78,57' : 'M70,62 C50,64 30,61 22,57'}
          fill="none"
          stroke="#090d16"
          strokeWidth="1.8"
          strokeLinecap="round"
          opacity="0.75"
        />
      </svg>
    );
  };

  const pupilBadge = pupilColor !== 'black' ? ` • PUPIL: ${pupilDef.name}` : '';

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '2.5rem',
        padding: '1.25rem',
        background: 'radial-gradient(ellipse at center, rgba(30, 41, 59, 0.7) 0%, rgba(15, 23, 42, 0.95) 100%)',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--border-light)',
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.35rem' }}>
        {renderSingleEye(leftIris, true, 'left-eye')}
        <span style={{ fontSize: '11px', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
          {mode === 'heterochromia' ? `LEFT: ${c1Def.name}${pupilBadge}` : `IRIS: ${c1Def.name}${pupilBadge}`}
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.35rem' }}>
        {renderSingleEye(rightIris, false, 'right-eye')}
        <span style={{ fontSize: '11px', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
          {mode === 'heterochromia'
            ? `RIGHT: ${c2Def.name}${pupilBadge}`
            : mode === 'multi'
            ? `BLEND: ${c2Def.name}${pupilBadge}`
            : `IRIS: ${c1Def.name}${pupilBadge}`}
        </span>
      </div>
    </div>
  );
};
