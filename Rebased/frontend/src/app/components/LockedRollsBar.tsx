/**
 * LockedRollsBar.tsx
 * Horizontal dock showing all currently locked random rolls.
 * Each chip can be unlocked to free the component back to re-rolling.
 */
import React from 'react';
import { Lock, X, Unlock } from 'lucide-react';
import { useTriggerStore } from '../../store/useTriggerStore';
import { renderComponentIcon } from '../../utils/iconResolver';

export const LockedRollsBar: React.FC = () => {
  const {
    lockedRandomSelections,
    folders,
    matrixDomains,
    unlockRandomOption,
    unlockAllRandomOptions,
    selections,
  } = useTriggerStore();

  const lockedEntries = Object.entries(lockedRandomSelections || {});
  if (lockedEntries.length === 0) return null;

  // Build a flat lookup: relPath -> { displayName, entry }
  const allFiles = [
    ...folders.flatMap((f) => f.files),
    ...matrixDomains.flatMap((d) => d.files),
  ];

  return (
    <div className="flex flex-col gap-2 px-6 py-3 bg-hazard-card/70 border border-hazard-gold/40 rounded-2xl shadow-hazard-glow backdrop-blur-sm">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Lock className="w-4 h-4 text-hazard-gold" />
          <span className="text-xs font-bold uppercase tracking-wider text-hazard-gold">
            Locked Rolls
          </span>
          <span className="px-1.5 py-0.5 rounded-md bg-hazard-gold/15 border border-hazard-gold/40 text-hazard-gold text-[10px] font-mono font-bold">
            {lockedEntries.length}
          </span>
        </div>
        <button
          type="button"
          onClick={unlockAllRandomOptions}
          title="Unlock all locked rolls"
          className="flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-bold text-hazard-crimson bg-hazard-crimson/10 border border-hazard-crimson/30 hover:bg-hazard-crimson/20 hover:border-hazard-crimson/60 rounded-lg transition active:scale-95"
        >
          <Unlock className="w-3 h-3" />
          Unlock All
        </button>
      </div>

      {/* Locked Chips Row */}
      <div className="flex flex-wrap gap-2">
        {lockedEntries.map(([relPath, lockedKey]) => {
          const file = allFiles.find((f) => f.relPath === relPath);
          if (!file) return null;

          const entry = file.entries[lockedKey];
          const currentSelection = selections[relPath];
          const isCurrentlyRandom = currentSelection === '__RANDOM__';

          return (
            <div
              key={relPath}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl border-2 border-hazard-gold/60 bg-gradient-to-r from-hazard-card to-hazard-gold/5 shadow-hazard-glow group select-none"
            >
              {/* Icon */}
              <Lock className="w-3 h-3 text-hazard-gold/80 flex-shrink-0" />

              {/* File Display Name */}
              <div className="flex flex-col leading-tight min-w-0">
                <span className="text-[9px] font-mono text-hazard-textMuted uppercase tracking-wider truncate max-w-[80px]">
                  {file.displayName}
                </span>
                <span className="text-xs font-bold text-hazard-gold truncate max-w-[100px]">
                  {entry?.display_name || lockedKey}
                </span>
              </div>

              {/* Prompt snippet */}
              {entry?.prompt && (
                <span
                  className="hidden sm:inline text-[9px] font-mono text-hazard-textMuted/70 truncate max-w-[120px]"
                  title={entry.prompt}
                >
                  {entry.prompt.split(',').slice(0, 2).join(', ')}…
                </span>
              )}

              {/* Unlock Button */}
              <button
                type="button"
                onClick={() => unlockRandomOption(relPath)}
                title={`Unlock ${file.displayName} — allow it to roll freely again`}
                className="ml-1 p-1 rounded-md text-hazard-textMuted hover:text-hazard-crimson hover:bg-hazard-crimson/20 border border-transparent hover:border-hazard-crimson/40 transition active:scale-90 flex-shrink-0"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
