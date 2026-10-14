import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Plus, Check, ChevronDown, Sparkles, Search, Tag } from 'lucide-react';

interface NotionCategorySelectProps {
  value: string;
  allCategories: string[];
  onChange: (newCategory: string) => void;
  onAddNewCategory?: (createdCategory: string) => void;
}

export function getCategoryBadgeStyle(category: string): string {
  const cat = (category || 'General').toLowerCase().trim();
  if (cat.includes('subject')) return 'bg-amber-500/20 text-amber-300 border-amber-400/50';
  if (cat.includes('pose') || cat.includes('action')) return 'bg-cyan-500/20 text-cyan-300 border-cyan-400/50';
  if (cat.includes('apparel') || cat.includes('clothing') || cat.includes('outfit')) return 'bg-purple-500/20 text-purple-300 border-purple-400/50';
  if (cat.includes('environment') || cat.includes('background') || cat.includes('setting')) return 'bg-emerald-500/20 text-emerald-300 border-emerald-400/50';
  if (cat.includes('camera') || cat.includes('framing') || cat.includes('angle')) return 'bg-sky-500/20 text-sky-300 border-sky-400/50';
  if (cat.includes('expression') || cat.includes('mood') || cat.includes('emotion')) return 'bg-pink-500/20 text-pink-300 border-pink-400/50';
  if (cat.includes('lighting') || cat.includes('atmosphere')) return 'bg-yellow-500/20 text-yellow-300 border-yellow-400/50';
  if (cat.includes('style') || cat.includes('art') || cat.includes('quality')) return 'bg-fuchsia-500/20 text-fuchsia-300 border-fuchsia-400/50';
  return 'bg-indigo-500/20 text-indigo-300 border-indigo-400/50';
}

export const NotionCategorySelect: React.FC<NotionCategorySelectProps> = ({
  value,
  allCategories,
  onChange,
  onAddNewCategory,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const popoverRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setSearch('');
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      setTimeout(() => searchInputRef.current?.focus(), 50);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // Clean category options
  const cleanCategories = useMemo(() => {
    const list = allCategories.filter((c) => c && c.toLowerCase() !== 'all');
    return Array.from(new Set(list));
  }, [allCategories]);

  // Filtered categories
  const filteredCategories = useMemo(() => {
    if (!search.trim()) return cleanCategories;
    const q = search.toLowerCase().trim();
    return cleanCategories.filter((c) => c.toLowerCase().includes(q));
  }, [cleanCategories, search]);

  const exactMatchExists = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return true;
    return cleanCategories.some((c) => c.toLowerCase() === q);
  }, [cleanCategories, search]);

  const handleSelect = (cat: string) => {
    onChange(cat);
    setIsOpen(false);
    setSearch('');
  };

  const handleCreateNew = () => {
    const trimmed = search.trim();
    if (!trimmed) return;
    const formatted = trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
    if (onAddNewCategory) onAddNewCategory(formatted);
    onChange(formatted);
    setIsOpen(false);
    setSearch('');
  };

  return (
    <div className="relative inline-block w-full" ref={popoverRef}>
      {/* Trigger Button: Notion Style Pill */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        className={`inline-flex items-center justify-between gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-mono font-bold transition-all w-full max-w-[150px] truncate ${getCategoryBadgeStyle(
          value || 'General'
        )} hover:brightness-110 active:scale-95`}
      >
        <span className="truncate">{value || 'General'}</span>
        <ChevronDown className="w-3 h-3 opacity-60 shrink-0" />
      </button>

      {/* Notion Popover Dropdown */}
      {isOpen && (
        <div
          onClick={(e) => e.stopPropagation()}
          className="absolute left-0 top-full mt-1 z-50 w-60 rounded-2xl bg-hazard-card border-2 border-hazard-gold/60 shadow-2xl backdrop-blur-xl p-2 flex flex-col gap-1.5 animate-fadeIn"
        >
          {/* Search / Create Input */}
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-hazard-void border border-hazard-border">
            <Search className="w-3.5 h-3.5 text-hazard-textMuted shrink-0" />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search or type new..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  if (!exactMatchExists && search.trim()) {
                    handleCreateNew();
                  } else if (filteredCategories.length > 0) {
                    handleSelect(filteredCategories[0]);
                  }
                } else if (e.key === 'Escape') {
                  setIsOpen(false);
                }
              }}
              className="w-full bg-transparent text-xs font-mono text-hazard-textBright placeholder:text-hazard-textMuted/50 outline-none"
            />
          </div>

          {/* Create New Category Option (if not exact match) */}
          {!exactMatchExists && search.trim() && (
            <button
              type="button"
              onClick={handleCreateNew}
              className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-hazard-cyan/15 hover:bg-hazard-cyan/25 text-hazard-cyan border border-hazard-cyan/40 text-xs font-mono font-bold transition text-left"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create "{search.trim()}"</span>
            </button>
          )}

          {/* Existing Categories List */}
          <div className="flex flex-col gap-0.5 max-h-48 overflow-y-auto pr-0.5 scrollbar-thin">
            <span className="text-[10px] font-mono text-hazard-textMuted px-2 py-0.5 uppercase tracking-wider">
              Select Category
            </span>
            {filteredCategories.map((cat) => {
              const isSelected = (value || 'General').toLowerCase() === cat.toLowerCase();
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => handleSelect(cat)}
                  className={`flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-xl text-xs font-mono transition text-left ${
                    isSelected
                      ? 'bg-hazard-gold/20 text-hazard-gold font-bold border border-hazard-gold/40'
                      : 'text-hazard-textMuted hover:text-white hover:bg-hazard-void'
                  }`}
                >
                  <span className={`px-2 py-0.5 rounded-md border text-[11px] font-bold ${getCategoryBadgeStyle(cat)}`}>
                    {cat}
                  </span>
                  {isSelected && <Check className="w-3.5 h-3.5 text-hazard-gold" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
