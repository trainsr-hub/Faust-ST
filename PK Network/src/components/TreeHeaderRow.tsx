import React from 'react';
import { Folder, FolderOpen, ChevronRight, ChevronDown } from 'lucide-react';
import { HierarchicalRecord } from '../services/headingSort';

interface TreeHeaderRowProps {
  item: HierarchicalRecord;
  colSpan: number;
  isFolded?: boolean;
  onToggleFold?: () => void;
  isOver?: boolean;
  onDragOver?: (e: React.DragEvent) => void;
  onDragLeave?: () => void;
  onDrop?: (e: React.DragEvent) => void;
}

export const TreeHeaderRow: React.FC<TreeHeaderRowProps> = ({
  item,
  colSpan,
  isFolded = false,
  onToggleFold,
  isOver = false,
  onDragOver,
  onDragLeave,
  onDrop,
}) => {
  return (
    <tr
      className={`tree-category-header-row ${isOver ? 'drag-over-header' : ''}`}
      onClick={onToggleFold}
      onDragOver={(e) => { e.preventDefault(); onDragOver?.(e); }}
      onDragLeave={onDragLeave}
      onDrop={(e) => { e.preventDefault(); onDrop?.(e); }}
      style={{
        background: isOver
          ? 'rgba(99, 102, 241, 0.2)'
          : isFolded
          ? 'rgba(99, 102, 241, 0.04)'
          : 'var(--bg-card)',
        borderBottom: isOver ? '2px dashed var(--accent)' : '1px solid var(--border-table)',
        borderLeft: isFolded ? '4px solid var(--text-dim)' : '4px solid var(--accent)',
        minHeight: '44px',
        cursor: 'pointer',
        userSelect: 'none',
        transition: 'all 0.15s ease',
      }}
      title={isFolded ? `Click to expand branch: ${item.headerTitle}` : `Click to fold branch: ${item.headerTitle}`}
    >
      <td style={{ padding: '0.65rem 0.5rem', textAlign: 'center', width: '36px' }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: isFolded ? 'var(--text-dim)' : 'var(--accent)' }}>
          {isFolded ? <ChevronRight size={14} /> : <ChevronDown size={14} />}
        </span>
      </td>
      <td className="td-drag-num" style={{ padding: '0.65rem 0.5rem', width: '54px' }}>
        <span
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '11px',
            fontWeight: 700,
            color: isFolded ? 'var(--text-dim)' : 'var(--accent)',
          }}
        >
          {item.treePath}
        </span>
      </td>
      <td
        colSpan={colSpan}
        style={{
          padding: '0.6rem 0.75rem',
          paddingLeft: `${0.75 + item.level * 1.4}rem`,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {item.level > 0 && (
            <span style={{ fontFamily: 'monospace', color: 'var(--text-dim)', fontSize: '12px', fontWeight: 600 }}>
              └─
            </span>
          )}
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '22px',
              height: '22px',
              borderRadius: '4px',
              background: isFolded ? 'rgba(148, 163, 184, 0.15)' : 'rgba(99, 102, 241, 0.15)',
              color: isFolded ? 'var(--text-dim)' : 'var(--accent)',
              flexShrink: 0,
            }}
          >
            {isFolded ? <Folder size={13} strokeWidth={2.2} /> : <FolderOpen size={13} strokeWidth={2.2} />}
          </span>
          <span
            style={{
              fontWeight: 700,
              fontSize: '13px',
              color: isFolded ? 'var(--text-dim)' : 'var(--text-main)',
              letterSpacing: '-0.01em',
            }}
          >
            {item.headerTitle}
          </span>
          <span
            style={{
              fontSize: '11px',
              color: 'var(--text-dim)',
              fontFamily: 'var(--font-mono)',
              marginLeft: '0.2rem',
              opacity: isFolded ? 0.7 : 1,
            }}
          >
            ({item.childCount})
          </span>
        </div>
      </td>
    </tr>
  );
};
