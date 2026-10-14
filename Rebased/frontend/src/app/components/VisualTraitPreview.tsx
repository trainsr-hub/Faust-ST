import React, { useState, useEffect } from 'react';
import { VisualAssetManager, VisualTraitDefinition } from '../../utils/visualAssetManager';

interface VisualTraitPreviewProps {
  option: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const VisualTraitPreview: React.FC<VisualTraitPreviewProps> = ({
  option,
  className = '',
  size = 'md',
}) => {
  const [, setTick] = useState(0);

  // Subscribe to VisualAssetManager updates so component re-renders when packages load
  useEffect(() => {
    return VisualAssetManager.subscribe(() => {
      setTick((t) => t + 1);
    });
  }, []);

  const norm = option.toLowerCase().trim();
  const traitDef: VisualTraitDefinition | undefined = VisualAssetManager.getTrait(norm);

  const sizeClasses = {
    sm: 'w-7 h-7 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
  }[size];

  // 1. Image Asset (User custom asset override or default package asset)
  if (traitDef?.resolvedImageUrl) {
    return (
      <div
        className={`relative ${sizeClasses} rounded-xl shrink-0 flex items-center justify-center overflow-hidden shadow-md border-2 border-hazard-border/80 bg-hazard-void ${className}`}
        title={traitDef.label || option}
      >
        <img
          src={traitDef.resolvedImageUrl}
          alt={traitDef.label || option}
          className="w-full h-full object-cover rounded-lg"
          loading="lazy"
          onError={(e) => {
            // If image fails, hide image element and allow fallback
            (e.target as HTMLElement).style.display = 'none';
          }}
        />
      </div>
    );
  }

  // 2. Color Gradient / Swatch Display
  if (traitDef?.gradient) {
    const isEye = traitDef.isIris || norm.includes('eyes') || norm.includes('pupil') || norm.includes('heterochromia');
    const isHair = norm.includes('hair');
    const isSkin = norm.includes('skin');

    return (
      <div
        className={`relative ${sizeClasses} rounded-xl shrink-0 flex items-center justify-center overflow-hidden shadow-md border-2 ${className}`}
        style={{
          background: traitDef.gradient,
          borderColor: traitDef.borderColor || traitDef.color || 'rgba(255,255,255,0.3)',
        }}
        title={traitDef.label || option}
      >
        {/* Eye Iris Graphic Overlay */}
        {isEye && !norm.includes('gradient') && !norm.includes('heterochromia') && (
          <div className="w-4 h-4 rounded-full bg-black/60 border border-white/40 flex items-center justify-center shadow-inner">
            <div className="w-1.5 h-1.5 rounded-full bg-white shadow-sm" />
          </div>
        )}

        {/* Hair Strands Graphic Overlay */}
        {isHair && (
          <div className="absolute inset-0 opacity-25 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:4px_4px]" />
        )}

        {/* Skin Soft Glow Overlay */}
        {isSkin && (
          <div className="absolute inset-0 bg-gradient-to-tr from-black/20 to-transparent" />
        )}
      </div>
    );
  }

  // 3. Flat Color Swatch
  if (traitDef?.color && !traitDef?.svg) {
    return (
      <div
        className={`relative ${sizeClasses} rounded-xl shrink-0 flex items-center justify-center overflow-hidden shadow-md border-2 ${className}`}
        style={{
          backgroundColor: traitDef.color,
          borderColor: traitDef.borderColor || 'rgba(255,255,255,0.3)',
        }}
        title={traitDef.label || option}
      />
    );
  }

  // 4. Soft-Coded SVG Vector Diagram
  if (traitDef?.svg) {
    return (
      <div
        className={`relative ${sizeClasses} rounded-xl shrink-0 flex items-center justify-center bg-hazard-void border-2 border-hazard-border/80 shadow-sm overflow-hidden p-1.5 ${className}`}
        style={{
          color: traitDef.color || '#38bdf8',
        }}
        title={traitDef.label || option}
        dangerouslySetInnerHTML={{ __html: traitDef.svg }}
      />
    );
  }

  // 5. Generic Fallback Icon when no definition exists
  return (
    <div
      className={`relative ${sizeClasses} rounded-xl shrink-0 flex items-center justify-center bg-hazard-void border-2 border-hazard-border/80 shadow-sm overflow-hidden text-hazard-textMuted ${className}`}
      title={option}
    >
      <svg
        viewBox="0 0 24 24"
        className="w-5 h-5 stroke-current fill-none stroke-[1.5]"
      >
        <circle cx="12" cy="12" r="8" />
        <line x1="12" y1="8" x2="12" y2="16" />
        <line x1="8" y1="12" x2="16" y2="12" />
      </svg>
    </div>
  );
};
