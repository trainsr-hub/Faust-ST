import React from 'react';
import {
  User,
  Users,
  Eye,
  Crosshair,
  Sparkles,
  Layers,
  Camera,
  Target,
  Shield,
  Tag,
  Compass,
  Zap,
  Flame,
  Sliders,
  Palette,
  Grid,
  CircleDot,
  Box,
  Smile,
  Shirt,
  Wand2,
} from 'lucide-react';

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  user: User,
  users: Users,
  eye: Eye,
  crosshair: Crosshair,
  sparkles: Sparkles,
  layers: Layers,
  camera: Camera,
  target: Target,
  shield: Shield,
  tag: Tag,
  compass: Compass,
  zap: Zap,
  flame: Flame,
  sliders: Sliders,
  palette: Palette,
  grid: Grid,
  circledot: CircleDot,
  box: Box,
  smile: Smile,
  shirt: Shirt,
  wand2: Wand2,
};

/**
 * Resolves a Lucide icon component dynamically from a string name.
 * Safe fallback to Sparkles if icon name is unknown or undefined.
 */
export function renderComponentIcon(
  iconName?: string,
  className = 'w-4 h-4',
  fallback?: React.ReactNode
): React.ReactNode {
  if (!iconName) {
    return fallback ?? <Sparkles className={className} />;
  }

  const cleanKey = iconName.toLowerCase().replace(/[-_\s]/g, '');
  const IconComponent = ICON_MAP[cleanKey];

  if (IconComponent) {
    return <IconComponent className={className} />;
  }

  return fallback ?? <Sparkles className={className} />;
}
