import React from 'react';
import { useTriggerStore } from '../../store/useTriggerStore';
import { MatrixDomainNode } from '../../types/schema';
import { Layers, Sparkles, X, CheckSquare, Dices, Star } from 'lucide-react';

interface DynamicMatrixBarProps {
  domain: MatrixDomainNode;
}

export const DynamicMatrixBar: React.FC<DynamicMatrixBarProps> = ({ domain }) => {
  const {
    matrixBaseStates,
    matrixUnlockedPools,
    toggleMatrixBaseState,
    selectAllMatrixBaseStates,
    clearMatrixBaseStates,
    toggleMatrixUnlockedPool,
    selectAllMatrixUnlockedPools,
    clearMatrixUnlockedPools,
    clearMatrixDomain,
    randomPools,
  } = useTriggerStore();

  const activeBase = matrixBaseStates[domain.domainId] || [];
  const activePools = matrixUnlockedPools[domain.domainId] || [];
  const isBaseActive = activeBase.length > 0;
  const isPoolsActive = activePools.length > 0;
  const isAnyActive = isBaseActive || isPoolsActive;

  // Active base state objects
  const activeBaseDefs = activeBase
    .map((id) => domain.states.find((s) => s.id === id))
    .filter(Boolean);

  // Calculate total unlocked options across this domain's files
  let unlockedCount = 0;
  for (const file of domain.files) {
    const pool = randomPools[file.relPath] ?? Object.keys(file.entries);
    unlockedCount += pool.length;
  }

  if (!domain.states || domain.states.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-col gap-4 p-5 rounded-3xl bg-gradient-to-br from-hazard-card via-hazard-card/95 to-hazard-void border border-hazard-gold/40 shadow-lg backdrop-blur-md">
      {/* Top Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-hazard-border/80">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-9 h-9 rounded-2xl bg-hazard-gold/10 border border-hazard-gold/30 text-hazard-gold">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-hazard-textBright">
                {domain.displayName} Matrix
              </h3>
              {isBaseActive && (
                <span className="px-2 py-0.5 rounded-full bg-hazard-gold/20 border border-hazard-gold/50 text-hazard-gold text-[10px] font-mono font-bold flex items-center gap-1">
                  <Star className="w-2.5 h-2.5 fill-hazard-gold" />
                  {activeBase.length} Base Anchor{activeBase.length === 1 ? '' : 's'} (Constant)
                </span>
              )}
              {isPoolsActive && (
                <span className="px-2 py-0.5 rounded-full bg-hazard-purple/20 border border-hazard-purple/50 text-hazard-purple text-[10px] font-mono font-bold flex items-center gap-1">
                  <Dices className="w-2.5 h-2.5" />
                  {activePools.length} Pool{activePools.length === 1 ? '' : 's'} Unlocked
                </span>
              )}
            </div>
            <p className="text-[11px] text-hazard-textMuted font-mono mt-0.5">
              Two-tier rule: Base Anchors (Level 1 Constant) + Dynamic Candidate Pools (Level 2 Variations)
            </p>
          </div>
        </div>

        {/* Domain Reset */}
        {isAnyActive && (
          <button
            type="button"
            onClick={() => clearMatrixDomain(domain.domainId)}
            title="Reset base anchors and unlocked pools for this domain"
            className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-hazard-crimson hover:text-white bg-hazard-crimson/10 hover:bg-hazard-crimson border border-hazard-crimson/30 rounded-xl transition active:scale-95"
          >
            <X className="w-3.5 h-3.5" />
            <span>Reset {domain.displayName}</span>
          </button>
        )}
      </div>

      {/* LEVEL 1: Multi-Select Constant Base Anchors */}
      <div className="flex flex-col gap-2 p-3.5 rounded-2xl bg-hazard-void/60 border border-hazard-gold/30">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Star className="w-4 h-4 text-hazard-gold fill-hazard-gold" />
            <span className="text-xs font-bold uppercase tracking-wider text-hazard-gold">
              Level 1: Base Anchors (Multi-Select Constant)
            </span>
            <span className="text-[10px] text-hazard-textMuted font-mono">
              (Constant ground state • Injected into prompt)
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => selectAllMatrixBaseStates(domain.domainId)}
              className="text-[10px] font-mono text-hazard-gold hover:text-white underline cursor-pointer"
            >
              Select All
            </button>
            {isBaseActive && (
              <button
                type="button"
                onClick={() => clearMatrixBaseStates(domain.domainId)}
                className="text-[10px] font-mono text-hazard-crimson hover:text-white underline cursor-pointer"
              >
                Clear Base
              </button>
            )}
          </div>
        </div>

        {/* Base State Chips */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          {domain.states.map((state) => {
            const isSelected = activeBase.includes(state.id);

            return (
              <button
                key={`base_${domain.domainId}_${state.id}`}
                type="button"
                onClick={() => toggleMatrixBaseState(domain.domainId, state.id)}
                title={`Toggle '${state.label}' as a constant base anchor: ${state.description || state.basePrompt}`}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold transition-all duration-150 select-none cursor-pointer active:scale-95 border ${
                  isSelected
                    ? 'bg-hazard-gold text-black border-hazard-gold shadow-hazard-glow font-extrabold scale-105'
                    : 'bg-hazard-void/80 text-hazard-textMuted border-hazard-border hover:text-white hover:border-hazard-gold/50'
                }`}
              >
                <span>{state.emoji}</span>
                <span>{state.label.split(' / ')[0]}</span>
                {isSelected && <Star className="w-3 h-3 fill-black text-black ml-0.5" />}
              </button>
            );
          })}
        </div>

        {activeBaseDefs.length > 0 && (
          <div className="mt-1 px-3 py-1.5 rounded-lg bg-hazard-gold/10 border border-hazard-gold/20 text-[11px] font-mono flex flex-wrap items-center justify-between gap-2 text-hazard-gold">
            <span>
              Constant Prompts:{' '}
              <strong className="text-hazard-textBright">
                {activeBaseDefs.map((b) => `"${b?.basePrompt}"`).join(', ')}
              </strong>
            </span>
            <span className="text-[10px] opacity-80">Always Injected into Prompt</span>
          </div>
        )}
      </div>

      {/* LEVEL 2: Unlocked Candidate Pools */}
      <div className="flex flex-col gap-2 p-3.5 rounded-2xl bg-hazard-void/60 border border-hazard-purple/30">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Dices className="w-4 h-4 text-hazard-purple" />
            <span className="text-xs font-bold uppercase tracking-wider text-hazard-purple">
              Level 2: Unlocked Expression / Action Pools
            </span>
            <span className="text-[10px] text-hazard-textMuted font-mono">
              (Multi-select spectrums unlocking candidate variations for random rolls)
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => selectAllMatrixUnlockedPools(domain.domainId)}
              title="Unlock all pools in this domain"
              className="text-[10px] font-mono text-hazard-purple hover:text-white underline cursor-pointer"
            >
              Unlock All
            </button>
            {isPoolsActive && (
              <button
                type="button"
                onClick={() => clearMatrixUnlockedPools(domain.domainId)}
                title="Clear all unlocked pools"
                className="text-[10px] font-mono text-hazard-crimson hover:text-white underline cursor-pointer"
              >
                Clear Pools
              </button>
            )}
          </div>
        </div>

        {/* Unlocked Pool Toggle Chips */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          {domain.states.map((state) => {
            const isUnlocked = activePools.includes(state.id);

            return (
              <button
                key={`pool_${domain.domainId}_${state.id}`}
                type="button"
                onClick={() => toggleMatrixUnlockedPool(domain.domainId, state.id)}
                title={`Toggle '${state.label}' options in the random pool`}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold transition-all duration-150 select-none cursor-pointer active:scale-95 border ${
                  isUnlocked
                    ? `${state.activeBadgeClass || 'bg-hazard-purple/20 text-hazard-purple border-hazard-purple/60'} shadow-sm ring-1 ring-white/20 scale-105`
                    : 'bg-hazard-void/80 text-hazard-textMuted border-hazard-border hover:text-white hover:border-hazard-purple/50'
                }`}
              >
                <span>{state.emoji}</span>
                <span>{state.label.split(' / ')[0]}</span>
                {isUnlocked && <Dices className="w-2.5 h-2.5 opacity-90" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Summary Footer Telemetry */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-1 text-[11px] font-mono text-hazard-textMuted">
        <div className="flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-hazard-cyan" />
          <span>
            {isBaseActive ? (
              <>
                Base Anchors:{' '}
                <strong className="text-hazard-gold">
                  {activeBase
                    .map((id) => domain.states.find((s) => s.id === id)?.label.split(' / ')[0] || id)
                    .join(' + ')}
                </strong>
              </>
            ) : (
              <span>No Constant Base Anchor</span>
            )}
            {' • '}
            {isPoolsActive ? (
              <>
                Unlocked Pools:{' '}
                <strong className="text-hazard-purple">
                  {activePools
                    .map((id) => domain.states.find((s) => s.id === id)?.label.split(' / ')[0] || id)
                    .join(' + ')}
                </strong>
              </>
            ) : (
              <span>All Options Active</span>
            )}
          </span>
        </div>

        <div className="flex items-center gap-1.5 text-hazard-cyan font-bold">
          <Layers className="w-3.5 h-3.5" />
          <span>{unlockedCount} candidate options ready in Random Pool</span>
        </div>
      </div>
    </div>
  );
};
