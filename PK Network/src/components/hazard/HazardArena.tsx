import React, { useRef, useEffect, useState, useCallback } from 'react';
import { HazardContender, HazardTournamentState } from '../../types/hazard';
import { ALL_SLOTS } from '../../services/hazardMockData';
import {
  ROUND_PAIRS,
  getSlotCenter,
  computeOrthogonalPath,
  SvgLineConfig
} from '../../services/hazardSvgRouting';

interface HazardArenaProps {
  tournament: HazardTournamentState;
  activeRound: string;
  onSelectContender: (contender: HazardContender) => void;
  onSlotClick?: (slotId: string) => void;
}

export const HazardArena: React.FC<HazardArenaProps> = ({
  tournament,
  activeRound,
  onSelectContender,
  onSlotClick
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [svgLines, setSvgLines] = useState<SvgLineConfig[]>([]);

  const calculateSvgLines = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;

    const lines: SvgLineConfig[] = [];

    ROUND_PAIRS.forEach(([src1, src2, target]) => {
      const pSrc1 = getSlotCenter(src1, container);
      const pSrc2 = getSlotCenter(src2, container);
      const pTarget = getSlotCenter(target, container);

      const targetOccupied = !!tournament.slots[target];

      if (pSrc1 && pTarget) {
        lines.push({
          d: computeOrthogonalPath(pSrc1, pTarget),
          isActive: targetOccupied,
          sourceSlot: src1,
          targetSlot: target
        });
      }
      if (pSrc2 && pTarget) {
        lines.push({
          d: computeOrthogonalPath(pSrc2, pTarget),
          isActive: targetOccupied,
          sourceSlot: src2,
          targetSlot: target
        });
      }
    });

    setSvgLines(lines);
  }, [tournament.slots]);

  useEffect(() => {
    let animId1: number;
    let animId2: number;

    animId1 = requestAnimationFrame(() => {
      animId2 = requestAnimationFrame(() => {
        calculateSvgLines();
      });
    });

    const handleResize = () => {
      calculateSvgLines();
    };

    window.addEventListener('resize', handleResize);
    return () => {
      cancelAnimationFrame(animId1);
      cancelAnimationFrame(animId2);
      window.removeEventListener('resize', handleResize);
    };
  }, [calculateSvgLines]);

  function getSlotRound(slotId: string): number {
    if (['l1','l2','l3','l4','l5','l6','l7','l8','r1','r2','r3','r4','r5','r6','r7','r8'].includes(slotId)) return 1;
    if (['l9','l10','l11','l12','r9','r10','r11','r12'].includes(slotId)) return 2;
    if (['l13','l14','r13','r14'].includes(slotId)) return 3;
    return 4;
  }

  return (
    <main className="hazard-arena-stage">
      <div ref={containerRef} className="hazard-bracket" id="bracket-stage">
        {/* SVG Orthogonal Lines Layer */}
        <svg
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            zIndex: 1,
            pointerEvents: 'none'
          }}
        >
          {svgLines.map((line, idx) => (
            <path
              key={`line-${idx}`}
              d={line.d}
              fill="none"
              stroke={line.isActive ? '#e2e8f0' : '#64748b'}
              strokeWidth={line.isActive ? 2.5 : 2}
              strokeOpacity={line.isActive ? 1 : 0.35}
              strokeLinecap="round"
            />
          ))}
        </svg>

        {/* 31 Avatar Slots */}
        {ALL_SLOTS.map((slotId) => {
          const contender = tournament.slots[slotId];
          const isChampion = tournament.champion && contender && tournament.champion.id === contender.id && (slotId === 'l15' || slotId === 'r15');
          const slotRound = getSlotRound(slotId);
          const isFaded = activeRound !== 'all' && parseInt(activeRound, 10) !== slotRound;

          return (
            <div
              key={slotId}
              data-slot={slotId}
              className={`hz-avatar hz-${slotId} ${!contender ? 'is-empty' : ''} ${isChampion ? 'is-champion' : ''}`}
              style={{
                opacity: isFaded ? 0.2 : undefined,
                cursor: 'pointer'
              }}
              title={contender ? `${contender.name} (Click to change option)` : `Slot ${slotId.toUpperCase()} (Click to select Eva)`}
              onClick={() => {
                if (onSlotClick) {
                  onSlotClick(slotId);
                }
              }}
            >
              {isChampion && (
                <div className="hz-crown-badge" title="Tournament Champion">
                  👑
                </div>
              )}

              {contender ? (
                <>
                  <img
                    src={contender.avatarUrl}
                    alt={contender.name}
                    className="hz-avatar-img"
                  />
                  <div className="hz-seed-pill">#{contender.seed}</div>
                </>
              ) : null}
            </div>
          );
        })}
      </div>
    </main>
  );
};
