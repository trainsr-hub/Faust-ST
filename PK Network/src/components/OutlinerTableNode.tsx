import React from 'react';
import { Table as TableIcon, GripVertical } from 'lucide-react';
import { TableMetaRecord } from '../types';

interface OutlinerTableNodeProps {
  id: string;
  depth: number;
  isActive: boolean;
  meta?: TableMetaRecord;
  count?: number;
  onSelect: (id: string) => void;
  onDragStart: (e: React.DragEvent, id: string) => void;
  onDragEnd: () => void;
}

export const OutlinerTableNode: React.FC<OutlinerTableNodeProps> = ({
  id,
  depth,
  isActive,
  meta,
  count,
  onSelect,
  onDragStart,
  onDragEnd,
}) => {
  const displayName = meta?.name || id;

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, id)}
      onDragEnd={onDragEnd}
      onClick={() => onSelect(id)}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0.42rem 0.55rem',
        paddingLeft: `${0.8 + depth * 0.85}rem`,
        borderRadius: 'var(--radius-sm, 6px)',
        background: isActive ? 'var(--accent-bg)' : 'transparent',
        color: isActive ? 'var(--accent)' : 'var(--text-secondary)',
        cursor: 'grab',
        fontSize: '13px',
        fontWeight: isActive ? 600 : 400,
        borderLeft: isActive ? '2px solid var(--accent)' : '2px solid transparent',
        transition: 'all 0.12s ease',
      }}
      title={`Table: ${displayName} (${id}) - Drag to re-group`}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', overflow: 'hidden' }}>
        <GripVertical size={11} style={{ opacity: 0.3, flexShrink: 0 }} />
        <TableIcon size={13} style={{ opacity: isActive ? 1 : 0.6, flexShrink: 0 }} />
        <span style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
          {displayName}
        </span>
      </div>
      {count !== undefined && (
        <span style={{
          fontSize: '10px',
          fontFamily: 'var(--font-mono)',
          padding: '0.05rem 0.35rem',
          borderRadius: 'var(--radius-full)',
          background: isActive ? 'var(--accent)' : 'rgba(255,255,255,0.06)',
          color: isActive ? '#fff' : 'var(--text-dim)',
          flexShrink: 0,
        }}>
          {count}
        </span>
      )}
    </div>
  );
};
