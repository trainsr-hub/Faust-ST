import React from 'react';

export const PRESET_ZONES = [
  'eyes',
  'head',
  'face',
  'chest',
  'navel',
  'hip',
  'thighs',
  'feet',
  'arms',
  'hands',
  'legs',
  'back',
  'body',
  'general',
] as const;

export function getZoneBadgeStyle(zone: string): { bg: string; text: string; border: string } {
  const z = (zone || '').toLowerCase().trim();
  switch (z) {
    case 'eyes':
      return { bg: 'bg-cyan-500/10', text: 'text-cyan-400', border: 'border-cyan-500/30' };
    case 'head':
    case 'face':
      return { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/30' };
    case 'chest':
    case 'breasts':
      return { bg: 'bg-rose-500/10', text: 'text-rose-400', border: 'border-rose-500/30' };
    case 'navel':
    case 'belly':
    case 'stomach':
      return { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/30' };
    case 'hip':
    case 'hips':
    case 'pelvis':
      return { bg: 'bg-orange-500/10', text: 'text-orange-400', border: 'border-orange-500/30' };
    case 'thighs':
    case 'legs':
      return { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/30' };
    case 'feet':
    case 'shoes':
    case 'boots':
      return { bg: 'bg-purple-500/10', text: 'text-purple-400', border: 'border-purple-500/30' };
    case 'arms':
    case 'hands':
      return { bg: 'bg-indigo-500/10', text: 'text-indigo-400', border: 'border-indigo-500/30' };
    case 'back':
      return { bg: 'bg-teal-500/10', text: 'text-teal-400', border: 'border-teal-500/30' };
    default:
      return { bg: 'bg-hazard-gold/10', text: 'text-hazard-gold', border: 'border-hazard-gold/30' };
  }
}

interface TopologyZoneBadgeProps {
  zone: string;
  size?: 'sm' | 'md';
}

export const TopologyZoneBadge: React.FC<TopologyZoneBadgeProps> = ({ zone, size = 'sm' }) => {
  const style = getZoneBadgeStyle(zone);
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs';

  return (
    <span
      className={`inline-flex items-center gap-1 font-mono uppercase font-semibold rounded-lg border ${style.bg} ${style.text} ${style.border} ${sizeClasses}`}
    >
      {zone || 'general'}
    </span>
  );
};
