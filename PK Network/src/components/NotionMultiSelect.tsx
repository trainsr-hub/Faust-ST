import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Search, Plus, X, Check, Trash2 } from 'lucide-react';
import { calculatePopoverPosition } from '../services/popoverPosition';

import {
  getTagColor,
  parseMultiValue,
  NOTION_COLORS,
  type NotionTagColor,
} from '../services/tagColors';

export { RelationTagPill, RelationMultiSelectPopover, type RelationOption } from './RelationMultiSelect';
export { getTagColor, parseMultiValue, NOTION_COLORS, type NotionTagColor };

export const NotionTagPill: React.FC<{
  tag: string; onRemove?: () => void; style?: React.CSSProperties;
}> = ({ tag, onRemove, style }) => {
  const color = getTagColor(tag);
  const urlMatch = tag.match(/https?:\/\/[^\s"'<>()[\]]+/);
  const url = urlMatch ? urlMatch[0].replace(/[.,;:!?)]+$/, '') : null;
  return (
    <span
      onContextMenu={(e) => {
        if (url) {
          e.preventDefault();
          e.stopPropagation();
          window.open(url, '_blank', 'noopener,noreferrer');
        }
      }}
      style={{
        display: 'inline-flex', alignItems: 'center', padding: '0.15rem 0.5rem',
        borderRadius: 'var(--radius-sm)', fontSize: '11.5px', fontWeight: 500,
        background: color.bg, color: color.text, border: `1px solid ${color.border}`,
        maxWidth: '180px', ...style,
      }}
      title={url ? `${tag} (Right-click to open link)` : tag}
    >
      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{tag}</span>
      {onRemove && (
        <span
          onClick={(e) => { e.stopPropagation(); onRemove(); }}
          style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '13px', height: '13px', borderRadius: '50%', cursor: 'pointer', opacity: 0.7, marginLeft: '4px' }}
          onMouseEnter={(e) => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.opacity = '0.7'; e.currentTarget.style.background = 'transparent'; }}
        >
          ×
        </span>
      )}
    </span>
  );
};

interface NotionMultiSelectPopoverProps {
  selected: string[]; options: string[]; onChange: (newSelected: string[]) => void;
  onClose: () => void; anchorRect: DOMRect | null; isSingle?: boolean;
  onCreateOption?: (newOption: string) => void;
  onDeleteOption?: (option: string) => void;
  pinnedOptions?: string[];
}

export const NotionMultiSelectPopover: React.FC<NotionMultiSelectPopoverProps> = ({
  selected, options, onChange, onClose, anchorRect, isSingle = false,
  onCreateOption, onDeleteOption, pinnedOptions = [],
}) => {
  const [query, setQuery] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState<number>(0);
  const popoverRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);

  const pinnedSet = useMemo(() => new Set(pinnedOptions), [pinnedOptions]);
  const allOptions = Array.from(new Set([...options, ...selected])).filter(Boolean);

  const sortedOptions = useMemo(() => {
    if (pinnedSet.size === 0) return allOptions;
    const pinned: string[] = [];
    const rest: string[] = [];
    for (const opt of allOptions) {
      pinnedSet.has(opt) ? pinned.push(opt) : rest.push(opt);
    }
    return [...pinned, ...rest];
  }, [allOptions, pinnedSet]);

  const filteredOptions = sortedOptions.filter((opt) => opt.toLowerCase().includes(query.toLowerCase()));
  const exactMatch = allOptions.some((opt) => opt.toLowerCase() === query.trim().toLowerCase());
  const canCreate = Boolean(query.trim() && !exactMatch);
  const totalNavigable = canCreate ? filteredOptions.length + 1 : filteredOptions.length;

  useEffect(() => { inputRef.current?.focus(); }, []);
  useEffect(() => { setHighlightedIndex(totalNavigable > 0 ? 0 : -1); }, [query, totalNavigable]);

  useEffect(() => {
    if (highlightedIndex >= 0) itemRefs.current[highlightedIndex]?.scrollIntoView({ block: 'nearest' });
  }, [highlightedIndex]);

  useEffect(() => {
    const handleMouseDown = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener('mousedown', handleMouseDown);
    return () => document.removeEventListener('mousedown', handleMouseDown);
  }, [onClose]);

  const handleToggle = (opt: string) => {
    if (isSingle) { onChange([opt]); onClose(); return; }
    onChange(selected.includes(opt) ? selected.filter((s) => s !== opt) : [...selected, opt]);
  };

  const handleCreateNew = () => {
    const clean = query.trim();
    if (!clean) return;
    onCreateOption?.(clean);
    if (isSingle) { onChange([clean]); onClose(); return; }
    if (!selected.includes(clean)) onChange([...selected, clean]);
    setQuery('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.preventDefault(); onClose();
    } else if (e.key === 'ArrowDown') {
      if (totalNavigable > 0) { e.preventDefault(); setHighlightedIndex((prev) => (prev + 1) % totalNavigable); }
    } else if (e.key === 'ArrowUp') {
      if (totalNavigable > 0) { e.preventDefault(); setHighlightedIndex((prev) => (prev - 1 + totalNavigable) % totalNavigable); }
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (totalNavigable === 0) return;
      if (canCreate && highlightedIndex === 0) {
        handleCreateNew();
      } else {
        const opt = canCreate ? filteredOptions[highlightedIndex - 1] : filteredOptions[highlightedIndex];
        if (opt) handleToggle(opt);
      }
    } else if (e.key === 'Backspace' && !query && !isSingle && selected.length > 0) {
      onChange(selected.slice(0, -1));
    }
  };

  const pos = calculatePopoverPosition(anchorRect, 260, 360);

  return (
    <div
      ref={popoverRef}
      style={{
        ...pos.style, background: 'var(--bg-card)', border: '1px solid var(--border-mid)',
        borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-lg)', zIndex: 99999,
        display: 'flex', flexDirection: 'column', overflow: 'hidden', backdropFilter: 'blur(8px)',
        animation: 'fadeIn 0.12s ease-out',
      }}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Search Bar */}
      <div style={{ padding: '0.45rem 0.65rem', borderBottom: '1px solid var(--border-table)', display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'var(--bg-input)', flexShrink: 0 }}>
        <Search size={13} style={{ color: 'var(--text-tertiary)', flexShrink: 0 }} />
        <input
          ref={inputRef} type="text" placeholder="Search tags (↑↓, ↵ to pick)..."
          value={query} onChange={(e) => setQuery(e.target.value)} onKeyDown={handleKeyDown}
          style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', color: 'var(--text-primary)', fontSize: '12px' }}
        />
        {query && (
          <button onClick={() => setQuery('')} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-tertiary)', padding: '0 2px' }}>
            <X size={12} />
          </button>
        )}
      </div>

      {/* Options List */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '0.3rem 0' }}>
        {canCreate && (
          <div
            ref={(el) => { itemRefs.current[0] = el; }}
            onClick={handleCreateNew}
            onMouseEnter={() => setHighlightedIndex(0)}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.45rem 0.65rem',
              cursor: 'pointer', fontSize: '12px', color: 'var(--accent)', borderBottom: '1px solid var(--border-table)',
              background: highlightedIndex === 0 ? 'var(--accent-hover-bg)' : 'var(--accent-bg)',
              borderLeft: highlightedIndex === 0 ? '3px solid var(--accent)' : '3px solid transparent',
              transition: 'all 0.1s ease',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Plus size={13} /><span>Create <strong>"{query.trim()}"</strong></span>
            </div>
            {highlightedIndex === 0 && <span style={{ fontSize: '10px', opacity: 0.7, fontFamily: 'var(--font-mono)' }}>↵ Enter</span>}
          </div>
        )}

        {filteredOptions.length === 0 && !canCreate ? (
          <div style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-dim)', fontSize: '11px' }}>
            No options defined. Type above to add a tag.
          </div>
        ) : (
          filteredOptions.map((opt, idx) => {
            const itemIndex = canCreate ? idx + 1 : idx;
            const isSel = selected.includes(opt);
            const isPinned = pinnedSet.has(opt);
            const isHighlighted = highlightedIndex === itemIndex;
            const color = getTagColor(opt);
            const prevWasPinned = idx > 0 && pinnedSet.has(filteredOptions[idx - 1]);
            const showDivider = !query.trim() && prevWasPinned && !isPinned;
            const showPinnedHeader = !query.trim() && idx === 0 && isPinned;

            return (
              <React.Fragment key={`${typeof opt === 'object' ? JSON.stringify(opt) : opt}_${idx}`}>
                {showPinnedHeader && (
                  <div style={{ padding: '0.25rem 0.65rem 0.15rem', fontSize: '10px', fontWeight: 700, color: 'var(--accent)', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                    📌 Branch options
                  </div>
                )}
                {showDivider && (
                  <div style={{ padding: '0.4rem 0.65rem 0.15rem', fontSize: '10px', fontWeight: 700, color: 'var(--text-dim)', letterSpacing: '0.04em', textTransform: 'uppercase', borderTop: '1px solid var(--border-table)', marginTop: '0.2rem' }}>
                    Other options
                  </div>
                )}
                <div
                  ref={(el) => { itemRefs.current[itemIndex] = el; }}
                  onClick={() => handleToggle(opt)}
                  onMouseEnter={() => setHighlightedIndex(itemIndex)}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.35rem 0.65rem',
                    cursor: 'pointer', transition: 'all 0.1s ease',
                    background: isHighlighted ? 'var(--bg-row-hover)' : isSel ? 'rgba(255, 255, 255, 0.04)' : 'transparent',
                    borderLeft: isHighlighted ? '3px solid var(--accent)' : '3px solid transparent',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', minWidth: 0 }}>
                    <span
                      style={{
                        display: 'inline-flex', alignItems: 'center', padding: '0.15rem 0.5rem',
                        borderRadius: 'var(--radius-sm)', fontSize: '11px', fontWeight: 500,
                        background: color.bg, color: color.text, border: `1px solid ${color.border}`,
                        maxWidth: '170px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                      }}
                    >
                      {opt}
                    </span>
                    {isPinned && (
                      <span title="Used by a sibling in this branch" style={{ fontSize: '9.5px', color: 'var(--accent)', background: 'rgba(99, 102, 241, 0.12)', padding: '1px 5px', borderRadius: '4px', fontWeight: 600, flexShrink: 0 }}>
                        📌 branch
                      </span>
                    )}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    {onDeleteOption && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm(`Delete option "${opt}" from this column?`)) onDeleteOption(opt);
                        }}
                        title={`Delete option "${opt}"`}
                        style={{
                          background: 'none', border: 'none', cursor: 'pointer',
                          color: 'var(--text-tertiary)', padding: '2px', display: 'flex',
                          opacity: isHighlighted ? 0.9 : 0.25,
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--danger)'; e.currentTarget.style.opacity = '1'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-tertiary)'; e.currentTarget.style.opacity = isHighlighted ? '0.9' : '0.25'; }}
                      >
                        <Trash2 size={11} />
                      </button>
                    )}
                    {isHighlighted && <span style={{ fontSize: '10px', opacity: 0.5, fontFamily: 'var(--font-mono)' }}>↵</span>}
                    {isSel && <Check size={13} style={{ color: 'var(--accent)', flexShrink: 0 }} />}
                  </div>
                </div>
              </React.Fragment>
            );
          })
        )}
      </div>

      {/* Footer info bar */}
      <div style={{ padding: '0.35rem 0.65rem', borderTop: '1px solid var(--border-table)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-tertiary)', background: 'var(--bg-card)', flexShrink: 0 }}>
        <span>{isSingle ? (selected.length > 0 ? `Selected: ${selected[0]}` : 'None') : `${selected.length} selected`}</span>
        <div style={{ display: 'flex', gap: '0.4rem' }}>
          {selected.length > 0 && (
            <button
              type="button"
              onClick={() => { onChange([]); if (isSingle) onClose(); }}
              style={{ background: 'transparent', border: '1px solid var(--border-light)', color: 'var(--text-tertiary)', borderRadius: 'var(--radius-sm)', padding: '0.15rem 0.5rem', fontSize: '11px', cursor: 'pointer' }}
            >
              Clear
            </button>
          )}
          <button
            type="button" onClick={onClose}
            style={{ background: 'var(--accent-bg)', border: '1px solid var(--accent)', color: 'var(--accent)', borderRadius: 'var(--radius-sm)', padding: '0.15rem 0.5rem', fontSize: '11px', fontWeight: 600, cursor: 'pointer' }}
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
