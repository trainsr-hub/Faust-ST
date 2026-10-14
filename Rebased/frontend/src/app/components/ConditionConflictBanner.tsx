import React from 'react';
import { useTriggerStore } from '../../store/useTriggerStore';
import {
  AlertTriangle,
  ShieldAlert,
  X,
  RotateCcw,
  CheckCircle2,
  EyeOff,
  Flame,
} from 'lucide-react';

export const ConditionConflictBanner: React.FC = () => {
  const {
    conditionConflicts,
    ignoredConditionIds,
    conditions,
    ignoreCondition,
    unignoreCondition,
    clearIgnoredConditions,
  } = useTriggerStore();

  const activeConflicts = conditionConflicts.filter(
    (c) =>
      !ignoredConditionIds.includes(c.conditionAId) &&
      !ignoredConditionIds.includes(c.conditionBId)
  );

  const hasIgnored = ignoredConditionIds.length > 0;
  if (activeConflicts.length === 0 && !hasIgnored) return null;

  return (
    <div className="flex flex-col gap-3 p-4 rounded-2xl bg-gradient-to-r from-rose-950/70 via-hazard-card to-amber-950/60 border-2 border-rose-500/60 shadow-crimson-glow animate-fadeIn">
      {/* Active Collisions Notice */}
      {activeConflicts.map((conflict, idx) => (
        <div
          key={idx}
          className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-rose-500/30 last:border-0 last:pb-0"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/50">
              <Flame className="w-5 h-5 animate-pulse" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-rose-300 font-mono">
                  Condition Conflict Detected
                </span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-rose-500/20 text-rose-200 border border-rose-500/40 font-mono">
                  Collision
                </span>
              </div>
              <p className="text-xs text-hazard-textBright font-mono mt-0.5">
                <strong className="text-rose-400">{conflict.conditionAName}</strong> conflicts with{' '}
                <strong className="text-amber-400">{conflict.conditionBName}</strong>.
              </p>
            </div>
          </div>

          {/* Ignore Buttons */}
          <div className="flex items-center gap-2 font-mono text-xs">
            <span className="text-[11px] text-hazard-textMuted mr-1">Choose condition to ignore:</span>
            <button
              type="button"
              onClick={() => ignoreCondition(conflict.conditionAId)}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-hazard-void border border-rose-500/60 text-rose-300 hover:bg-rose-500 hover:text-black font-bold transition active:scale-95"
            >
              <EyeOff className="w-3.5 h-3.5" />
              <span>Ignore {conflict.conditionAName}</span>
            </button>
            <button
              type="button"
              onClick={() => ignoreCondition(conflict.conditionBId)}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-hazard-void border border-amber-500/60 text-amber-300 hover:bg-amber-500 hover:text-black font-bold transition active:scale-95"
            >
              <EyeOff className="w-3.5 h-3.5" />
              <span>Ignore {conflict.conditionBName}</span>
            </button>
          </div>
        </div>
      ))}

      {/* Ignored / Suppressed Conditions Bar */}
      {hasIgnored && (
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-hazard-border/60 text-xs font-mono">
          <div className="flex items-center gap-2">
            <EyeOff className="w-3.5 h-3.5 text-hazard-textMuted" />
            <span className="text-hazard-textMuted">Ignored Conditions (Effects Bypassed):</span>
            <div className="flex flex-wrap gap-1.5">
              {ignoredConditionIds.map((id) => {
                const cond = conditions[id];
                return (
                  <span
                    key={id}
                    className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-hazard-void border border-hazard-border text-hazard-textMuted text-[10px]"
                  >
                    <span>{cond?.display_name || id}</span>
                    <button
                      type="button"
                      onClick={() => unignoreCondition(id)}
                      title="Restore / Unignore this condition"
                      className="hover:text-emerald-400"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                );
              })}
            </div>
          </div>

          <button
            type="button"
            onClick={clearIgnoredConditions}
            className="flex items-center gap-1 text-[11px] text-hazard-cyan hover:underline"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Restore All</span>
          </button>
        </div>
      )}
    </div>
  );
};
