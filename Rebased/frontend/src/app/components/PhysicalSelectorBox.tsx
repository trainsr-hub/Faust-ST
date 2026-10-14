import React, { useState, useRef, useEffect, useMemo } from 'react';
import { ChevronDown, X, Check, Search } from 'lucide-react';
import { VisualTraitPreview } from './VisualTraitPreview';

export interface PhysicalSelectorBoxProps {
  label: string;
  prefix?: string; // e.g. "##" or "###"
  options: string[];
  selected: string[];
  onChange: (selected: string[]) => void;
  max?: number;
  colorTheme?: 'cyan' | 'gold' | 'purple' | 'emerald';
  placeholder?: string;
  isSingleSelect?: boolean;
}

export const PhysicalSelectorBox: React.FC<PhysicalSelectorBoxProps> = ({
  label,
  prefix = '##',
  options = [],
  selected = [],
  onChange,
  max,
  colorTheme = 'gold',
  placeholder = 'Select options...',
  isSingleSelect = false,
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Close modal on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  // Focus search input when modal opens
  useEffect(() => {
    if (isOpen && options.length > 5) {
      const timer = setTimeout(() => {
        searchInputRef.current?.focus();
      }, 60);
      return () => clearTimeout(timer);
    }
  }, [isOpen, options.length]);

  const themeConfig = useMemo(() => {
    switch (colorTheme) {
      case 'cyan':
        return {
          primaryText: 'text-hazard-cyan',
          primaryBorder: 'border-hazard-cyan',
          primaryBg: 'bg-hazard-cyan',
          activeRing: 'ring-2 ring-hazard-cyan/40',
          activeCardBg: 'bg-hazard-cyan/15 border-hazard-cyan shadow-lg shadow-hazard-cyan/10',
          activeCheckbox: 'bg-hazard-cyan border-hazard-cyan text-black',
          activeBadge: 'bg-hazard-cyan/20 border-hazard-cyan/60 text-hazard-cyan',
          compactChip: 'bg-hazard-cyan/15 border-hazard-cyan/40 text-hazard-cyan hover:bg-hazard-cyan/25',
          btnDone: 'bg-hazard-cyan text-black hover:bg-hazard-cyan/90',
        };
      case 'purple':
        return {
          primaryText: 'text-hazard-purple',
          primaryBorder: 'border-hazard-purple',
          primaryBg: 'bg-hazard-purple',
          activeRing: 'ring-2 ring-hazard-purple/40',
          activeCardBg: 'bg-hazard-purple/15 border-hazard-purple shadow-lg shadow-hazard-purple/10',
          activeCheckbox: 'bg-hazard-purple border-hazard-purple text-black',
          activeBadge: 'bg-hazard-purple/20 border-hazard-purple/60 text-hazard-purple',
          compactChip: 'bg-hazard-purple/15 border-hazard-purple/40 text-hazard-purple hover:bg-hazard-purple/25',
          btnDone: 'bg-hazard-purple text-black hover:bg-hazard-purple/90',
        };
      case 'emerald':
        return {
          primaryText: 'text-emerald-400',
          primaryBorder: 'border-emerald-400',
          primaryBg: 'bg-emerald-400',
          activeRing: 'ring-2 ring-emerald-400/40',
          activeCardBg: 'bg-emerald-500/15 border-emerald-400 shadow-lg shadow-emerald-400/10',
          activeCheckbox: 'bg-emerald-400 border-emerald-400 text-black',
          activeBadge: 'bg-emerald-500/20 border-emerald-400/60 text-emerald-400',
          compactChip: 'bg-emerald-500/15 border-emerald-400/40 text-emerald-400 hover:bg-emerald-500/25',
          btnDone: 'bg-emerald-400 text-black hover:bg-emerald-300',
        };
      case 'gold':
      default:
        return {
          primaryText: 'text-hazard-gold',
          primaryBorder: 'border-hazard-gold',
          primaryBg: 'bg-hazard-gold',
          activeRing: 'ring-2 ring-hazard-gold/40',
          activeCardBg: 'bg-hazard-gold/15 border-hazard-gold shadow-lg shadow-hazard-gold/10',
          activeCheckbox: 'bg-hazard-gold border-hazard-gold text-black',
          activeBadge: 'bg-hazard-gold/20 border-hazard-gold/60 text-hazard-gold',
          compactChip: 'bg-hazard-gold/15 border-hazard-gold/40 text-hazard-gold hover:bg-hazard-gold/25',
          btnDone: 'bg-hazard-gold text-black hover:bg-hazard-gold/90',
        };
    }
  }, [colorTheme]);

  const filteredOptions = useMemo(() => {
    if (!searchQuery.trim()) return options;
    const q = searchQuery.toLowerCase().trim();
    return options.filter((opt) => opt.toLowerCase().includes(q));
  }, [options, searchQuery]);

  const handleToggleOption = (option: string) => {
    if (isSingleSelect) {
      if (selected.includes(option)) {
        onChange([]);
      } else {
        onChange([option]);
        setIsOpen(false);
      }
      return;
    }

    if (selected.includes(option)) {
      onChange(selected.filter((item) => item !== option));
    } else {
      if (max && selected.length >= max) {
        // FIFO replacement cycle
        const shifted = [...selected.slice(1), option];
        onChange(shifted);
      } else {
        onChange([...selected, option]);
      }
    }
  };

  const handleRemoveChip = (e: React.MouseEvent, option: string) => {
    e.stopPropagation();
    onChange(selected.filter((item) => item !== option));
  };

  return (
    <div className="flex flex-col gap-1 w-full font-mono">
      {/* Box Header: Clean, Minimal Label Row (Zero extraneous clear buttons) */}
      <div className="flex items-center justify-between gap-2 px-1">
        <div className="flex items-center gap-1.5">
          <span className={`text-xs md:text-sm font-black ${themeConfig.primaryText}`}>{prefix}</span>
          <span className="text-xs md:text-sm font-extrabold text-hazard-textBright">{label}</span>
          {max !== undefined && (
            <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded border ${themeConfig.activeBadge}`}>
              {selected.length}/{max}
            </span>
          )}
          {isSingleSelect && (
            <span className="text-[9px] uppercase font-bold px-1.5 py-0.2 rounded bg-hazard-void border border-hazard-border text-hazard-textMuted">
              Single
            </span>
          )}
        </div>
      </div>

      {/* Trigger Box: Compact, Clean, Sleek Indicator (No Edit label) */}
      <div
        onClick={(e) => {
          e.stopPropagation();
          setSearchQuery('');
          setIsOpen(true);
        }}
        className="min-h-[42px] px-3 py-2 rounded-xl bg-hazard-void border border-hazard-border hover:border-hazard-border/90 hover:bg-hazard-card/40 transition-all flex items-center justify-between gap-2 cursor-pointer select-none group"
      >
        {/* Compact Selected Pills / Tags */}
        <div className="flex flex-wrap items-center gap-1 flex-1 min-w-0">
          {selected.length === 0 ? (
            <span className="text-xs text-hazard-textMuted/50 italic select-none">
              {placeholder}
            </span>
          ) : (
            selected.map((item) => (
              <span
                key={item}
                className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-bold border transition ${themeConfig.compactChip}`}
              >
                <VisualTraitPreview option={item} size="sm" className="w-3.5 h-3.5 border-0 shadow-none" />
                <span className="truncate max-w-[140px]">{item}</span>
                <button
                  type="button"
                  onClick={(e) => handleRemoveChip(e, item)}
                  className="p-0.5 rounded hover:bg-black/30 text-current/80 hover:text-current transition"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))
          )}
        </div>

        {/* Dropdown Chevron Action Indicator */}
        <div className="flex items-center shrink-0 pl-1 text-hazard-textMuted group-hover:text-hazard-textBright transition">
          <ChevronDown className="w-4 h-4 group-hover:translate-y-0.5 transition-transform" />
        </div>
      </div>

      {/*
        DATA ENTRY SELECTION MODAL / EXPANSIVE PANEL
        Each option is housed in its own isolated visual container with dedicated image/preview & tactile click area.
      */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-100 font-mono"
          onClick={() => setIsOpen(false)}
        >
          <div
            className="w-full max-w-4xl max-h-[90vh] bg-hazard-card border-2 border-hazard-border rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-100"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between gap-4 p-5 sm:p-6 border-b border-hazard-border/80 bg-hazard-void/60">
              <div className="flex items-center gap-3">
                <span className={`text-xl sm:text-2xl font-black ${themeConfig.primaryText}`}>
                  {prefix}
                </span>
                <div>
                  <div className="flex items-center gap-2.5">
                    <h2 className="text-base sm:text-xl font-extrabold text-hazard-textBright">
                      {label}
                    </h2>
                    {max !== undefined && (
                      <span className={`text-xs font-bold px-2.5 py-0.5 rounded-lg border ${themeConfig.activeBadge}`}>
                        {selected.length} / {max} max
                      </span>
                    )}
                    {isSingleSelect && (
                      <span className="text-[11px] uppercase font-bold px-2 py-0.5 rounded bg-hazard-void border border-hazard-border text-hazard-textMuted">
                        Single Choice
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-hazard-textMuted mt-0.5">
                    Click any option card below to select or toggle.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="p-2.5 rounded-xl bg-hazard-void hover:bg-hazard-cardHover text-hazard-textMuted hover:text-white border border-hazard-border transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Search Bar */}
            {options.length > 5 && (
              <div className="px-5 sm:px-6 pt-4">
                <div
                  onClick={() => searchInputRef.current?.focus()}
                  className="search-bar-monolith bg-hazard-void border-2 border-hazard-border focus-within:border-hazard-gold focus-within:ring-4 focus-within:ring-hazard-gold/15 rounded-2xl transition cursor-text gap-3.5 shadow-sm"
                >
                  <Search className="w-6 h-6 text-hazard-gold shrink-0 pointer-events-none" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={`Search ${label.toLowerCase()} (${options.length} total options)...`}
                    className="search-input-command bg-transparent text-base text-hazard-textBright placeholder-hazard-textMuted/50 focus:outline-none font-mono"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSearchQuery('');
                      }}
                      className="p-2 rounded-xl text-hazard-textMuted hover:text-white hover:bg-white/10 shrink-0 cursor-pointer transition"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Modal Body: HIGH-TACTILE, DISTINCT OPTION CONTAINERS WITH VISUAL PREVIEWS */}
            <div className="flex-1 overflow-y-auto p-5 sm:p-6 scrollbar-thin">
              {filteredOptions.length === 0 ? (
                <div className="p-12 text-center text-sm text-hazard-textMuted/60 italic">
                  No matching options found for &quot;{searchQuery}&quot;.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                  {filteredOptions.map((option) => {
                    const isSelected = selected.includes(option);

                    return (
                      <div
                        key={option}
                        onClick={() => handleToggleOption(option)}
                        className={`min-h-[64px] p-3 rounded-2xl border-2 transition-all flex items-center justify-between gap-3 cursor-pointer select-none group ${
                          isSelected
                            ? `${themeConfig.activeCardBg} ${themeConfig.activeRing}`
                            : 'bg-hazard-void/90 hover:bg-hazard-void border-hazard-border/90 hover:border-hazard-border text-hazard-textBright hover:text-white hover:scale-[1.01] shadow-sm'
                        }`}
                      >
                        {/* Option Visual Presentation & Label */}
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          {/* Dedicated Visual Trait Preview / Image Swatch */}
                          <VisualTraitPreview
                            option={option}
                            size="md"
                            className={isSelected ? 'ring-2 ring-white/40' : ''}
                          />

                          {/* Trait Text Label */}
                          <div className="flex flex-col min-w-0 flex-1">
                            <span className="text-sm font-extrabold tracking-wide truncate">
                              {option}
                            </span>
                            {isSelected && (
                              <span className="text-[10px] font-bold text-hazard-textMuted uppercase">
                                Selected
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Checkbox Indicator */}
                        <div
                          className={`w-6 h-6 rounded-xl border-2 flex items-center justify-center transition-colors shrink-0 ${
                            isSelected
                              ? themeConfig.activeCheckbox
                              : 'border-hazard-border bg-hazard-card/60 group-hover:border-hazard-textMuted'
                          }`}
                        >
                          {isSelected && <Check className="w-4 h-4 stroke-[3]" />}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Modal Footer: Selection Counter + Large Done Button */}
            <div className="flex items-center justify-between gap-4 p-5 sm:p-6 border-t border-hazard-border/80 bg-hazard-void/60">
              <div className="flex items-center gap-2 text-xs sm:text-sm text-hazard-textMuted">
                <span className="font-bold text-hazard-textBright">{selected.length}</span>
                <span>of</span>
                <span className="font-bold text-hazard-textBright">{options.length}</span>
                <span>options selected</span>
              </div>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className={`px-8 py-3 rounded-2xl font-black text-sm sm:text-base shadow-xl transition-all cursor-pointer hover:brightness-110 active:scale-95 ${themeConfig.btnDone}`}
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
