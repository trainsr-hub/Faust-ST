import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Search, X, Check, Link2 } from 'lucide-react';
import { calculatePopoverPosition } from '../services/popoverPosition';

export interface RelationOption {
  id: string;
  label: string;
  table?: string;
  isSelf?: boolean;
}

export const RelationTagPill: React.FC<{
  label: string;
  id?: string;
  onRemove?: () => void;
  style?: React.CSSProperties;
}> = ({ label, id, onRemove, style }) => (
  <span
    className="badge badge-rel"
    title={id ? `ID: ${id}` : label}
    style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '0.3rem',
      padding: '0.15rem 0.5rem',
      fontSize: '11.5px',
      fontWeight: 500,
      borderRadius: 'var(--radius-sm)',
      maxWidth: '220px',
      ...style,
    }}
  >
    <Link2 size={10} style={{ opacity: 0.7, flexShrink: 0 }} />
    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
      {label || id || '—'}
    </span>
    {onRemove && (
      <span
        onClick={(e) => {
          e.stopPropagation();
          onRemove();
        }}
        title="Remove relation"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '13px',
          height: '13px',
          borderRadius: '50%',
          cursor: 'pointer',
          opacity: 0.7,
          marginLeft: '2px',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.opacity = '1';
          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.opacity = '0.7';
          e.currentTarget.style.background = 'transparent';
        }}
      >
        ×
      </span>
    )}
  </span>
);

export interface RelationMultiSelectPopoverProps {
  selected: string[];
  options: RelationOption[];
  onChange: (newSelected: string[]) => void;
  onClose: () => void;
  anchorRect: DOMRect | null;
  isSingle?: boolean;
  pinnedIds?: string[];
}

export const RelationMultiSelectPopover: React.FC<RelationMultiSelectPopoverProps> = ({
  selected,
  options,
  onChange,
  onClose,
  anchorRect,
  isSingle = false,
  pinnedIds = [],
}) => {
  const [query, setQuery] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState<number>(0);
  const popoverRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);

  const pinnedSet = useMemo(() => new Set(pinnedIds), [pinnedIds]);

  const sortedOptions = useMemo(() => {
    if (pinnedSet.size === 0) return options;
    const pinned: RelationOption[] = [];
    const rest: RelationOption[] = [];
    for (const opt of options) {
      if (pinnedSet.has(opt.id)) pinned.push(opt);
      else rest.push(opt);
    }
    return [...pinned, ...rest];
  }, [options, pinnedSet]);

  const filteredOptions = sortedOptions.filter((opt) => {
    const q = query.toLowerCase();
    return (
      opt.label.toLowerCase().includes(q) ||
      opt.id.toLowerCase().includes(q) ||
      (opt.table && opt.table.toLowerCase().includes(q))
    );
  });

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    setHighlightedIndex(filteredOptions.length > 0 ? 0 : -1);
  }, [query, filteredOptions.length]);

  useEffect(() => {
    if (highlightedIndex >= 0 && itemRefs.current[highlightedIndex]) {
      itemRefs.current[highlightedIndex]?.scrollIntoView({ block: 'nearest' });
    }
  }, [highlightedIndex]);

  // Click outside to close
  useEffect(() => {
    const handleMouseDown = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleMouseDown);
    return () => document.removeEventListener('mousedown', handleMouseDown);
  }, [onClose]);

  const handleToggle = (id: string) => {
    if (isSingle) {
      onChange([id]);
      onClose();
      return;
    }
    if (selected.includes(id)) {
      onChange(selected.filter((item) => item !== id));
    } else {
      onChange([...selected, id]);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    } else if (e.key === 'ArrowDown') {
      if (filteredOptions.length > 0) {
        e.preventDefault();
        setHighlightedIndex((prev) => (prev + 1) % filteredOptions.length);
      }
    } else if (e.key === 'ArrowUp') {
      if (filteredOptions.length > 0) {
        e.preventDefault();
        setHighlightedIndex((prev) => (prev - 1 + filteredOptions.length) % filteredOptions.length);
      }
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (highlightedIndex >= 0 && filteredOptions[highlightedIndex]) {
        handleToggle(filteredOptions[highlightedIndex].id);
      }
    } else if (e.key === 'Backspace' && !query && !isSingle && selected.length > 0) {
      onChange(selected.slice(0, -1));
    }
  };

  const pos = calculatePopoverPosition(anchorRect, 290, 360);

  return (
    <div
      ref={popoverRef}
      style={{
        ...pos.style,
        background: 'var(--bg-card)',
        border: '1px solid var(--border-mid)',
        borderRadius: 'var(--radius-md)',
        boxShadow: 'var(--shadow-lg)',
        zIndex: 99999,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        animation: 'fadeIn 0.12s ease-out',
      }}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Search Input Bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.4rem',
          padding: '0.45rem 0.65rem',
          borderBottom: '1px solid var(--border-table)',
          background: 'var(--bg-canvas)',
          flexShrink: 0,
        }}
      >
        <Search size={13} style={{ color: 'var(--text-tertiary)', flexShrink: 0 }} />
        <input
          ref={inputRef}
          type="text"
          placeholder="Search relations (↑↓ to navigate, ↵ to pick)..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          style={{
            flex: 1,
            background: 'transparent',
            border: 'none',
            outline: 'none',
            fontSize: '12px',
            color: 'var(--text-primary)',
          }}
        />
        {query && (
          <button
            type="button"
            onClick={() => setQuery('')}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--text-tertiary)',
              padding: '2px',
            }}
          >
            <X size={12} />
          </button>
        )}
      </div>

      {/* Relation Options List */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '0.3rem 0' }}>
        {filteredOptions.length === 0 ? (
          <div style={{ padding: '0.8rem', textAlign: 'center', color: 'var(--text-dim)', fontSize: '12px' }}>
            No matching relation records
          </div>
        ) : (
          filteredOptions.map((opt, idx) => {
            const isSel = selected.includes(opt.id);
            const isPinned = pinnedSet.has(opt.id);
            const isHighlighted = highlightedIndex === idx;
            const prevWasPinned = idx > 0 && pinnedSet.has(filteredOptions[idx - 1].id);
            const showDivider = !query.trim() && prevWasPinned && !isPinned;
            const showPinnedHeader = !query.trim() && idx === 0 && isPinned;

            return (
              <React.Fragment key={`${opt.id}_${idx}`}>
                {showPinnedHeader && (
                  <div style={{ padding: '0.25rem 0.65rem 0.15rem', fontSize: '10px', fontWeight: 700, color: 'var(--accent)', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                    📌 Branch options
                  </div>
                )}
                {showDivider && (
                  <div style={{ padding: '0.4rem 0.65rem 0.15rem', fontSize: '10px', fontWeight: 700, color: 'var(--text-dim)', letterSpacing: '0.04em', textTransform: 'uppercase', borderTop: '1px solid var(--border-table)', marginTop: '0.2rem' }}>
                    Other records
                  </div>
                )}
                <div
                  ref={(el) => { itemRefs.current[idx] = el; }}
                  onClick={() => handleToggle(opt.id)}
                  onMouseEnter={() => setHighlightedIndex(idx)}
                  title={`Record ID: ${opt.id}`}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.4rem 0.65rem',
                    cursor: 'pointer',
                    transition: 'all 0.1s ease',
                    background: isHighlighted
                      ? 'var(--bg-row-hover)'
                      : isSel
                      ? 'rgba(255, 255, 255, 0.04)'
                      : 'transparent',
                    borderLeft: isHighlighted ? '3px solid var(--accent)' : '3px solid transparent',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', minWidth: 0, flex: 1 }}>
                    <Link2 size={12} style={{ color: 'var(--c-rel)', flexShrink: 0 }} />
                    <span
                      style={{
                        fontSize: '12px',
                        fontWeight: 500,
                        color: 'var(--text-primary)',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {opt.label}
                    </span>
                    {opt.table && (
                      <span
                        title={opt.isSelf ? `Self-reference from this table (${opt.table})` : `Foreign reference from table: ${opt.table}`}
                        style={{
                          fontSize: '9.5px',
                          color: opt.isSelf ? 'var(--tag-blue-text, #38bdf8)' : 'var(--tag-purple-text, #c084fc)',
                          background: opt.isSelf ? 'var(--tag-blue-bg, rgba(56, 189, 248, 0.15))' : 'var(--tag-purple-bg, rgba(168, 85, 247, 0.15))',
                          border: `1px solid ${opt.isSelf ? 'var(--tag-blue-border, rgba(56, 189, 248, 0.35))' : 'var(--tag-purple-border, rgba(168, 85, 247, 0.35))'}`,
                          padding: '0.5px 5px',
                          borderRadius: '3px',
                          fontWeight: 600,
                          flexShrink: 0,
                          marginLeft: '0.3rem',
                        }}
                      >
                        {opt.isSelf ? 'self' : opt.table}
                      </span>
                    )}
                    {isPinned && (
                      <span
                        title="Used by a sibling in this branch"
                        style={{
                          fontSize: '9.5px',
                          color: 'var(--accent)',
                          background: 'rgba(99, 102, 241, 0.12)',
                          padding: '1px 5px',
                          borderRadius: '4px',
                          fontWeight: 600,
                          flexShrink: 0,
                          marginLeft: '0.2rem',
                        }}
                      >
                        📌 branch
                      </span>
                    )}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', flexShrink: 0, marginLeft: '0.4rem' }}>
                    {isHighlighted && (
                      <span style={{ fontSize: '10px', color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)' }}>↵</span>
                    )}
                    {isSel && <Check size={13} style={{ color: 'var(--accent)' }} />}
                  </div>
                </div>
              </React.Fragment>
            );
          })
        )}
      </div>

      {/* Footer Info Bar */}
      <div
        style={{
          padding: '0.35rem 0.65rem',
          borderTop: '1px solid var(--border-table)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: '11px',
          color: 'var(--text-tertiary)',
          background: 'var(--bg-card)',
          flexShrink: 0,
        }}
      >
        <span>{isSingle ? (selected.length > 0 ? '1 selected' : 'None') : `${selected.length} selected`}</span>
        <div style={{ display: 'flex', gap: '0.4rem' }}>
          {selected.length > 0 && (
            <button
              type="button"
              onClick={() => {
                onChange([]);
                if (isSingle) onClose();
              }}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--text-dim)',
                cursor: 'pointer',
                fontSize: '11px',
              }}
            >
              Clear
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--accent)',
              cursor: 'pointer',
              fontSize: '11px',
              fontWeight: 600,
            }}
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
