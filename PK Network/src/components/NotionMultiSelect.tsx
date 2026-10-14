import React, { useState, useRef, useEffect } from 'react';
import { Search, Check, Plus, X } from 'lucide-react';

export interface NotionTagColor {
  bg: string;
  text: string;
  border: string;
}

export const NOTION_COLORS: NotionTagColor[] = [
  { bg: 'rgba(56, 189, 248, 0.14)', text: '#38bdf8', border: 'rgba(56, 189, 248, 0.35)' }, // Blue
  { bg: 'rgba(16, 185, 129, 0.14)', text: '#10b981', border: 'rgba(16, 185, 129, 0.35)' }, // Green
  { bg: 'rgba(249, 115, 22, 0.14)', text: '#f97316', border: 'rgba(249, 115, 22, 0.35)' }, // Orange
  { bg: 'rgba(168, 85, 247, 0.14)', text: '#a855f7', border: 'rgba(168, 85, 247, 0.35)' }, // Purple
  { bg: 'rgba(244, 63, 94, 0.14)', text: '#f43f5e', border: 'rgba(244, 63, 94, 0.35)' },   // Pink/Rose
  { bg: 'rgba(245, 158, 11, 0.14)', text: '#f59e0b', border: 'rgba(245, 158, 11, 0.35)' }, // Amber/Yellow
  { bg: 'rgba(20, 184, 166, 0.14)', text: '#14b8a6', border: 'rgba(20, 184, 166, 0.35)' }, // Teal
  { bg: 'rgba(99, 102, 241, 0.14)', text: '#818cf8', border: 'rgba(99, 102, 241, 0.35)' }, // Indigo
  { bg: 'rgba(148, 163, 184, 0.14)', text: '#94a3b8', border: 'rgba(148, 163, 184, 0.35)' }, // Gray/Slate
];

export function getTagColor(tag: string): NotionTagColor {
  let hash = 0;
  for (let i = 0; i < tag.length; i++) {
    hash = tag.charCodeAt(i) + ((hash << 5) - hash);
  }
  const idx = Math.abs(hash) % NOTION_COLORS.length;
  return NOTION_COLORS[idx];
}

export function parseMultiValue(val: any): string[] {
  if (Array.isArray(val)) {
    return val.map(String).filter((s) => s.trim().length > 0);
  }
  if (!val) return [];
  if (typeof val === 'string') {
    const trimmed = val.trim();
    if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
      try {
        const parsed = JSON.parse(trimmed);
        if (Array.isArray(parsed)) {
          return parsed.map(String).filter((s) => s.trim().length > 0);
        }
      } catch {}
    }
    return trimmed
      .split(',')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);
  }
  return [String(val)];
}

interface NotionMultiSelectPopoverProps {
  selected: string[];
  options: string[];
  onChange: (newSelected: string[]) => void;
  onClose: () => void;
  anchorRect: DOMRect | null;
  onCreateOption?: (newOption: string) => void;
}

export const NotionMultiSelectPopover: React.FC<NotionMultiSelectPopoverProps> = ({
  selected,
  options,
  onChange,
  onClose,
  anchorRect,
  onCreateOption,
}) => {
  const [query, setQuery] = useState('');
  const popoverRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Combine schema options with any custom selected items
  const allOptions = Array.from(new Set([...options, ...selected]));

  const filteredOptions = allOptions.filter((opt) =>
    opt.toLowerCase().includes(query.toLowerCase())
  );

  const exactMatch = allOptions.some(
    (opt) => opt.toLowerCase() === query.trim().toLowerCase()
  );

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

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

  const handleToggle = (opt: string) => {
    if (selected.includes(opt)) {
      onChange(selected.filter((s) => s !== opt));
    } else {
      onChange([...selected, opt]);
    }
  };

  const handleCreateNew = () => {
    const clean = query.trim();
    if (!clean) return;
    if (!selected.includes(clean)) {
      onChange([...selected, clean]);
    }
    onCreateOption?.(clean);
    setQuery('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (!exactMatch && query.trim()) {
        handleCreateNew();
      } else if (filteredOptions.length > 0) {
        handleToggle(filteredOptions[0]);
      }
    }
  };

  // Smart viewport positioning
  let top = (anchorRect?.bottom || 0) + 4;
  let left = anchorRect?.left || 0;
  const popoverWidth = 260;
  const popoverHeight = 310;

  if (top + popoverHeight > window.innerHeight && (anchorRect?.top || 0) > popoverHeight) {
    top = (anchorRect?.top || 0) - popoverHeight - 4;
  }
  if (left + popoverWidth > window.innerWidth) {
    left = window.innerWidth - popoverWidth - 12;
  }
  if (left < 10) left = 10;

  return (
    <div
      ref={popoverRef}
      style={{
        position: 'fixed',
        top: `${top}px`,
        left: `${left}px`,
        width: `${popoverWidth}px`,
        maxHeight: `${popoverHeight}px`,
        background: 'var(--bg-card)',
        border: '1px solid var(--border-mid)',
        borderRadius: 'var(--radius-md)',
        boxShadow: 'var(--shadow-lg)',
        zIndex: 99999,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        backdropFilter: 'blur(8px)',
        animation: 'fadeIn 0.12s ease-out',
      }}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Search Bar */}
      <div
        style={{
          padding: '0.5rem',
          borderBottom: '1px solid var(--border-table)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.4rem',
          background: 'var(--bg-input)',
        }}
      >
        <Search size={13} style={{ color: 'var(--text-tertiary)', flexShrink: 0 }} />
        <input
          ref={inputRef}
          type="text"
          placeholder="Search or create tag..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          style={{
            flex: 1,
            background: 'transparent',
            border: 'none',
            outline: 'none',
            color: 'var(--text-primary)',
            fontSize: '12px',
          }}
        />
        {query && (
          <button
            onClick={() => setQuery('')}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--text-tertiary)',
              padding: '0 2px',
            }}
          >
            <X size={12} />
          </button>
        )}
      </div>

      {/* Options List */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '0.35rem 0' }}>
        {/* Create new tag prompt */}
        {query.trim() && !exactMatch && (
          <div
            onClick={handleCreateNew}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.45rem 0.65rem',
              cursor: 'pointer',
              fontSize: '12px',
              color: 'var(--accent)',
              borderBottom: '1px solid var(--border-table)',
              background: 'var(--accent-bg)',
            }}
          >
            <Plus size={13} />
            <span>Create <strong>"{query.trim()}"</strong></span>
          </div>
        )}

        {filteredOptions.length === 0 && !query.trim() ? (
          <div style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-dim)', fontSize: '11px' }}>
            No options defined. Type above to add a tag.
          </div>
        ) : (
          filteredOptions.map((opt) => {
            const isSel = selected.includes(opt);
            const color = getTagColor(opt);
            return (
              <div
                key={opt}
                onClick={() => handleToggle(opt)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.35rem 0.65rem',
                  cursor: 'pointer',
                  transition: 'background 0.1s ease',
                  background: isSel ? 'rgba(255, 255, 255, 0.04)' : 'transparent',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'var(--bg-row-hover)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = isSel ? 'rgba(255, 255, 255, 0.04)' : 'transparent';
                }}
              >
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    padding: '0.15rem 0.5rem',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '11px',
                    fontWeight: 500,
                    background: color.bg,
                    color: color.text,
                    border: `1px solid ${color.border}`,
                    maxWidth: '180px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {opt}
                </span>
                {isSel && <Check size={13} style={{ color: 'var(--accent)', flexShrink: 0 }} />}
              </div>
            );
          })
        )}
      </div>

      {/* Footer info bar */}
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
        }}
      >
        <span>{selected.length} selected</span>
        <button
          onClick={onClose}
          style={{
            background: 'var(--accent-bg)',
            border: '1px solid var(--accent)',
            color: 'var(--accent)',
            borderRadius: 'var(--radius-sm)',
            padding: '0.15rem 0.5rem',
            fontSize: '11px',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          Done
        </button>
      </div>
    </div>
  );
};

export const NotionTagPill: React.FC<{
  tag: string;
  onRemove?: () => void;
  style?: React.CSSProperties;
}> = ({ tag, onRemove, style }) => {
  const color = getTagColor(tag);
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.3rem',
        padding: '0.12rem 0.45rem',
        borderRadius: 'var(--radius-sm)',
        fontSize: '11.5px',
        fontWeight: 500,
        background: color.bg,
        color: color.text,
        border: `1px solid ${color.border}`,
        lineHeight: 1.3,
        transition: 'transform 0.1s ease',
        ...style,
      }}
    >
      <span>{tag}</span>
      {onRemove && (
        <span
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          title={`Remove tag "${tag}"`}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '13px',
            height: '13px',
            borderRadius: '50%',
            cursor: 'pointer',
            opacity: 0.65,
            transition: 'opacity 0.15s, background 0.15s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.opacity = '1';
            e.currentTarget.style.background = 'rgba(0, 0, 0, 0.2)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.opacity = '0.65';
            e.currentTarget.style.background = 'transparent';
          }}
        >
          ×
        </span>
      )}
    </span>
  );
};
