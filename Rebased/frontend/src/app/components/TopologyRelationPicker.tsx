import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Plus, Check, X, Search, Tag, ShieldAlert, Layers } from 'lucide-react';
import { getZoneBadgeStyle } from './TopologyZoneBadge';

export interface TopologyOptionItem {
  key: string;
  label?: string;
  subLabel?: string;
  zone?: string;
  badgeType?: 'zone' | 'condition' | 'layer' | 'default';
}

interface TopologyRelationPickerProps {
  selectedKeys: string[];
  availableOptions: TopologyOptionItem[];
  onChange: (updatedKeys: string[]) => void;
  placeholder?: string;
  allowCustom?: boolean;
  colorVariant?: 'cyan' | 'gold' | 'purple' | 'emerald' | 'crimson';
  iconType?: 'tag' | 'condition' | 'layer';
}

export const TopologyRelationPicker: React.FC<TopologyRelationPickerProps> = ({
  selectedKeys = [],
  availableOptions = [],
  onChange,
  placeholder = 'Add reference...',
  allowCustom = true,
  colorVariant = 'cyan',
  iconType = 'tag',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const popoverRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setSearch('');
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // Fast map lookup
  const optionsMap = useMemo(() => {
    const map = new Map<string, TopologyOptionItem>();
    availableOptions.forEach((opt) => map.set(opt.key, opt));
    return map;
  }, [availableOptions]);

  // Filtered options
  const filteredOptions = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return availableOptions;
    return availableOptions.filter((opt) => {
      return (
        opt.key.toLowerCase().includes(q) ||
        (opt.label && opt.label.toLowerCase().includes(q)) ||
        (opt.subLabel && opt.subLabel.toLowerCase().includes(q)) ||
        (opt.zone && opt.zone.toLowerCase().includes(q))
      );
    });
  }, [availableOptions, search]);

  const handleToggle = (key: string) => {
    if (selectedKeys.includes(key)) {
      onChange(selectedKeys.filter((k) => k !== key));
    } else {
      onChange([...selectedKeys, key]);
    }
  };

  const handleRemove = (e: React.MouseEvent, key: string) => {
    e.stopPropagation();
    onChange(selectedKeys.filter((k) => k !== key));
  };

  const handleAddCustom = () => {
    const clean = search.trim().toLowerCase().replace(/\s+/g, '_');
    if (!clean) return;
    if (!selectedKeys.includes(clean)) {
      onChange([...selectedKeys, clean]);
    }
    setSearch('');
  };

  const isExactMatch = availableOptions.some(
    (opt) => opt.key.toLowerCase() === search.trim().toLowerCase()
  );

  return (
    <div className="relative inline-block w-full min-w-[200px]" ref={popoverRef}>
      {/* Trigger & Selected Pills Display */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full min-h-[36px] flex flex-wrap items-center gap-1.5 p-1.5 bg-hazard-card/60 hover:bg-hazard-card/90 border border-hazard-border rounded-xl cursor-pointer transition text-xs select-none ${
          isOpen ? 'ring-2 ring-hazard-gold/50 border-hazard-gold' : ''
        }`}
      >
        {selectedKeys.length === 0 ? (
          <span className="text-hazard-textMuted/60 text-xs italic px-2 flex items-center gap-1.5">
            <Plus className="w-3 h-3" />
            {placeholder}
          </span>
        ) : (
          selectedKeys.map((key) => {
            const item = optionsMap.get(key);
            const zoneStyle = item?.zone ? getZoneBadgeStyle(item.zone) : null;

            return (
              <span
                key={key}
                className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg text-xs font-mono font-medium border transition ${
                  zoneStyle
                    ? `${zoneStyle.bg} ${zoneStyle.text} ${zoneStyle.border}`
                    : 'bg-hazard-cardHover text-hazard-textBright border-hazard-border'
                }`}
              >
                {iconType === 'condition' ? (
                  <ShieldAlert className="w-3 h-3 opacity-70" />
                ) : iconType === 'layer' ? (
                  <Layers className="w-3 h-3 opacity-70" />
                ) : (
                  <Tag className="w-3 h-3 opacity-70" />
                )}
                <span>{key}</span>
                {item?.zone && (
                  <span className="text-[10px] opacity-75 uppercase font-sans">
                    ({item.zone})
                  </span>
                )}
                <button
                  type="button"
                  onClick={(e) => handleRemove(e, key)}
                  className="hover:text-hazard-crimson hover:bg-black/30 rounded p-0.5 transition"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            );
          })
        )}

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setIsOpen(!isOpen);
          }}
          className="ml-auto p-1 text-hazard-textMuted hover:text-white hover:bg-hazard-cardHover rounded-lg transition"
          title="Add / Edit References"
        >
          <Plus className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Popover Dropdown Picker */}
      {isOpen && (
        <div className="absolute z-50 top-full left-0 mt-1.5 w-80 max-h-80 bg-[#161922] border border-hazard-border/90 rounded-2xl shadow-2xl p-2.5 flex flex-col gap-2 backdrop-blur-xl animate-in fade-in zoom-in-95 duration-100">
          {/* Search Input */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-hazard-textMuted" />
            <input
              ref={searchInputRef}
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  if (search.trim() && !isExactMatch && allowCustom) {
                    handleAddCustom();
                  }
                }
              }}
              placeholder="Search or type new ID..."
              className="w-full bg-hazard-card/80 border border-hazard-border rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder:text-hazard-textMuted/60 focus:outline-none focus:border-hazard-gold"
            />
          </div>

          {/* Quick Add Custom Key */}
          {allowCustom && search.trim() && !isExactMatch && (
            <button
              type="button"
              onClick={handleAddCustom}
              className="flex items-center gap-2 px-2.5 py-1.5 text-xs font-mono text-hazard-gold bg-hazard-gold/10 hover:bg-hazard-gold/20 border border-hazard-gold/30 rounded-xl transition text-left"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>
                Create &quot;<strong className="text-white">{search.trim().toLowerCase().replace(/\s+/g, '_')}</strong>&quot;
              </span>
            </button>
          )}

          {/* Options List */}
          <div className="flex-1 overflow-y-auto max-h-52 flex flex-col gap-1 pr-1 custom-scrollbar">
            {filteredOptions.length === 0 && !search.trim() ? (
              <div className="text-center py-4 text-xs text-hazard-textMuted italic">
                No options available
              </div>
            ) : filteredOptions.length === 0 ? (
              <div className="text-center py-4 text-xs text-hazard-textMuted italic">
                No matching options found
              </div>
            ) : (
              filteredOptions.map((opt) => {
                const isSelected = selectedKeys.includes(opt.key);
                const zoneStyle = opt.zone ? getZoneBadgeStyle(opt.zone) : null;

                return (
                  <div
                    key={opt.key}
                    onClick={() => handleToggle(opt.key)}
                    className={`flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-xl cursor-pointer transition text-xs ${
                      isSelected
                        ? 'bg-hazard-gold/15 text-white font-medium border border-hazard-gold/30'
                        : 'text-hazard-textMuted hover:text-white hover:bg-hazard-cardHover'
                    }`}
                  >
                    <div className="flex flex-col min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-xs text-hazard-textBright truncate">
                          {opt.key}
                        </span>
                        {opt.zone && (
                          <span
                            className={`text-[10px] px-1.5 py-0.2 rounded font-sans font-medium border ${
                              zoneStyle
                                ? `${zoneStyle.bg} ${zoneStyle.text} ${zoneStyle.border}`
                                : 'bg-hazard-card text-hazard-textMuted border-hazard-border'
                            }`}
                          >
                            {opt.zone}
                          </span>
                        )}
                      </div>
                      {opt.subLabel && (
                        <span className="text-[10px] text-hazard-textMuted truncate font-sans">
                          {opt.subLabel}
                        </span>
                      )}
                    </div>

                    <div
                      className={`w-4 h-4 rounded flex items-center justify-center border transition ${
                        isSelected
                          ? 'bg-hazard-gold border-hazard-gold text-black'
                          : 'border-hazard-border bg-hazard-card/50'
                      }`}
                    >
                      {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};
