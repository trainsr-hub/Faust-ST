import React from 'react';
import { ColumnDefinition, FIELD_TYPES } from '../types';

interface GridHeaderProps {
  columns: ColumnDefinition[];
  allSelected: boolean;
  onSelectAll: (checked: boolean) => void;
  sortCol: string | null;
  sortAsc: boolean;
  onToggleSort: (slug: string) => void;
}

export const GridHeader: React.FC<GridHeaderProps> = ({
  columns,
  allSelected,
  onSelectAll,
  sortCol,
  sortAsc,
  onToggleSort,
}) => {
  return (
    <thead>
      <tr style={{ position: 'sticky', top: 0, background: 'var(--bg-card)', zIndex: 2, borderBottom: '1px solid var(--border-mid)', minHeight: '44px' }}>
        {/* Select All Checkbox */}
        <th style={{ padding: '0.65rem 0.5rem', width: '36px', textAlign: 'center' }}>
          <input
            type="checkbox"
            checked={allSelected}
            onChange={(e) => onSelectAll(e.target.checked)}
            style={{ accentColor: 'var(--accent)', cursor: 'pointer' }}
            title="Select all records"
          />
        </th>
        <th style={{ padding: '0.65rem 0.5rem', width: '40px', textAlign: 'center', color: 'var(--text-dim)' }}>#</th>
        {columns.map((col) => {
          const typeMeta = FIELD_TYPES[col.type] || FIELD_TYPES.text_single;
          const isSorted = sortCol === col.slug;
          const formula = col.metadata?.formula || col.metadata?.default_option;
          const hasFormula = formula && String(formula).startsWith('=');

          return (
            <th
              key={col.slug}
              onClick={() => onToggleSort(col.slug)}
              style={{ padding: '0.65rem 0.75rem', color: 'var(--text-secondary)', fontWeight: 600, cursor: 'pointer', userSelect: 'none', whiteSpace: 'nowrap' }}
              title={hasFormula ? `Formula: ${formula}` : `Sort by ${col.name}`}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <span style={{ fontSize: '12px' }}>{typeMeta.icon}</span>
                <span>{col.name}</span>
                {hasFormula && (
                  <span className="badge" style={{ background: 'rgba(255, 158, 27, 0.15)', color: 'var(--accent)', padding: '0.1rem 0.35rem', fontSize: '10px' }}>
                    fx
                  </span>
                )}
                {isSorted && (
                  <span style={{ color: 'var(--accent)', fontSize: '11px', fontFamily: 'var(--font-mono)' }}>
                    {sortAsc ? '▲' : '▼'}
                  </span>
                )}
              </div>
            </th>
          );
        })}
        <th style={{ padding: '0.65rem 0.75rem', width: '80px', textAlign: 'right', color: 'var(--text-dim)' }}>Actions</th>
      </tr>
    </thead>
  );
};
