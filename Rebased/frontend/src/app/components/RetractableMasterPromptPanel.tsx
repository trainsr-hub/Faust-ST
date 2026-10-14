import React, { useState, useRef, useEffect } from 'react';
import { useTriggerStore } from '../../store/useTriggerStore';
import { PromptRatingBar } from './PromptRatingBar';
import {
  Terminal,
  Dices,
  Copy,
  Check,
  ChevronUp,
  ChevronDown,
  Maximize2,
  Minimize2,
} from 'lucide-react';

interface RetractableMasterPromptPanelProps {
  onOpenAnalytics: () => void;
}

export const RetractableMasterPromptPanel: React.FC<RetractableMasterPromptPanelProps> = ({
  onOpenAnalytics,
}) => {
  const {
    compiledPrompt,
    tokenCount,
    randomCount,
    activeKeywords,
    activeExclusions,
    rerollRandoms,
  } = useTriggerStore();

  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isRolling, setIsRolling] = useState(false);

  const panelRef = useRef<HTMLDivElement>(null);

  // Close on Outside Click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const handleCopy = () => {
    if (!compiledPrompt) return;
    navigator.clipboard.writeText(compiledPrompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  const handleReroll = () => {
    setIsRolling(true);
    rerollRandoms();
    setTimeout(() => setIsRolling(false), 300);
  };

  // Format a clean 1-line preview string when collapsed
  const singleLinePreview = compiledPrompt
    ? compiledPrompt.replace(/\nBREAK,\s*\n/g, ' ⏵ ').replace(/\n/g, ' ')
    : 'No prompt components active. Select options or choose Random (🎲) to assemble prompt...';

  return (
    <div
      ref={panelRef}
      className="sticky bottom-4 z-40 w-full transition-all duration-300 ease-out"
    >
      <div
        onClick={() => {
          if (!isOpen) setIsOpen(true);
        }}
        className={`w-full rounded-2xl bg-hazard-card/95 border transition-all duration-300 backdrop-blur-xl shadow-2xl flex flex-col overflow-hidden ${
          isOpen
            ? 'p-5 border-hazard-gold/50 shadow-hazard-glow'
            : 'p-3 px-4 border-hazard-border hover:border-hazard-gold/50 shadow-md cursor-pointer hover:bg-hazard-card'
        }`}
      >
        {/* Top Action & Status Bar */}
        <div className="flex items-center justify-between gap-3 shrink-0">
          {/* Left: Terminal Icon + Title + Tokens + Dynamic Count */}
          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-hazard-gold shrink-0">
              <Terminal className="w-4 h-4 text-hazard-gold" />
              <span>Compiled Master Prompt</span>
            </div>

            <div className="flex items-center gap-2 font-mono text-xs shrink-0">
              <span className="px-2 py-0.5 rounded-lg bg-hazard-void border border-hazard-border text-hazard-textMuted text-[11px]">
                Tokens: <strong className="text-hazard-gold">{tokenCount}</strong>
              </span>

              {randomCount > 0 && (
                <span className="px-2 py-0.5 rounded-lg bg-hazard-purple/20 border border-hazard-purple/40 text-hazard-purple text-[10px] lowercase flex items-center gap-1">
                  <Dices className="w-3 h-3" />
                  {randomCount} dynamic
                </span>
              )}
            </div>

            {/* Collapsed 1-Line Preview */}
            {!isOpen && (
              <span className="text-xs font-mono text-hazard-textMuted/70 truncate hidden md:inline ml-2 max-w-[480px]">
                {singleLinePreview}
              </span>
            )}
          </div>

          {/* Right: Actions (Reroll, Copy, Toggle Open/Close) */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Re-Roll Prompt Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleReroll();
              }}
              title="Roll new choices for all Random components"
              className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-hazard-purple/90 to-hazard-gold text-black font-bold text-xs rounded-xl shadow-sm hover:brightness-110 active:scale-95 transition"
            >
              <Dices className={`w-3.5 h-3.5 ${isRolling ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Re-Roll</span>
            </button>

            {/* Copy Prompt Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleCopy();
              }}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-hazard-gold text-black font-bold text-xs rounded-xl shadow-hazard-glow hover:brightness-110 active:scale-95 transition"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied!' : 'Copy Prompt'}</span>
            </button>

            {/* Toggle Expand / Collapse Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsOpen(!isOpen);
              }}
              title={isOpen ? 'Collapse Panel (Click outside to close)' : 'Expand Panel (Click to open)'}
              className="p-1.5 rounded-xl bg-hazard-void border border-hazard-border text-hazard-textMuted hover:text-white hover:border-hazard-gold/50 transition active:scale-95"
            >
              {isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Expanded Content Area (Visible on Click) */}
        {isOpen && (
          <div className="flex flex-col gap-3 pt-3 mt-3 border-t border-hazard-border/60 animate-fadeIn">
            {/* Multiline Prompt Box with BREAK Separation */}
            <div className="p-3.5 bg-hazard-void rounded-xl border border-hazard-border text-xs font-mono text-hazard-textBright select-all whitespace-pre-wrap leading-relaxed max-h-[220px] overflow-y-auto">
              {compiledPrompt || (
                <span className="text-hazard-textMuted/60">
                  No prompt components active. Select options or choose Random (🎲) to assemble prompt...
                </span>
              )}
            </div>

            {/* Active Keywords & Exclusions Footer */}
            <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono">
              <div className="flex items-center gap-1 overflow-x-auto">
                <span className="text-hazard-textMuted">Keywords:</span>
                {activeKeywords.map((kw) => (
                  <span
                    key={kw}
                    className="px-1.5 py-0.2 rounded bg-hazard-void border border-hazard-border text-hazard-cyan"
                  >
                    #{kw}
                  </span>
                ))}
              </div>

              {activeExclusions.length > 0 && (
                <div className="flex items-center gap-1 overflow-x-auto text-hazard-crimson">
                  <span>Excluding:</span>
                  {activeExclusions.map((ex) => (
                    <span
                      key={ex}
                      className="px-1.5 py-0.2 rounded bg-hazard-void border border-hazard-crimson/30"
                    >
                      -{ex}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Prompt Generation Batch Rating Bar (JSONL Telemetry) */}
            <PromptRatingBar onOpenAnalytics={onOpenAnalytics} />
          </div>
        )}
      </div>
    </div>
  );
};
