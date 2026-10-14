import React from 'react';
import { Plus, ChevronRight, Settings } from 'lucide-react';
import { TableSchema, TableRecord } from '../types';

interface TableTabsProps {
  tables: Record<string, TableSchema>;
  activeTable: string;
  onSelectTable: (name: string) => void;
  onAddTable: () => void;
  onOpenTableSettings: (name: string) => void;
  recordCounts: Record<string, number>;
  tableMetadata?: TableRecord[];
}

export const TableTabs: React.FC<TableTabsProps> = ({
  tables,
  activeTable,
  onSelectTable,
  onAddTable,
  onOpenTableSettings,
  recordCounts,
  tableMetadata = [],
}) => {
  const metaMap = new Map<string, TableRecord>();
  tableMetadata.forEach((m) => metaMap.set(m.id, m));

  // Determine sorted list of table names
  const allNames = Object.keys(tables);
  const dataTableNames = allNames.filter((n) => n !== 'tables');
  
  // Sort data tables by order_index if defined
  dataTableNames.sort((a, b) => {
    const orderA = metaMap.get(a)?.order_index ?? 999;
    const orderB = metaMap.get(b)?.order_index ?? 999;
    return Number(orderA) - Number(orderB);
  });

  const getDisplayName = (id: string) => metaMap.get(id)?.name || id;

  // Build breadcrumb hierarchy lineage for active table
  const lineage: { id: string; name: string }[] = [];
  let curr: string | undefined = activeTable;
  const visited = new Set<string>();

  while (curr && !visited.has(curr)) {
    visited.add(curr);
    lineage.unshift({ id: curr, name: getDisplayName(curr) });
    const meta = metaMap.get(curr);
    curr = meta?.parent_id ? String(meta.parent_id) : undefined;
  }

  const hasLineage = lineage.length > 1 && activeTable !== 'tables';

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      background: 'var(--bg-canvas)',
      borderBottom: '1px solid var(--border-table)',
    }}>
      {/* Primary Tab Strip */}
      <nav style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0.4rem 1rem',
        overflowX: 'auto',
        scrollbarWidth: 'none',
        WebkitOverflowScrolling: 'touch',
        gap: '0.5rem',
      }}>
        {/* Left Side: Data Tables */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', overflowX: 'auto' }}>
          {dataTableNames.map((name) => {
            const isActive = name === activeTable;
            const count = recordCounts[name];
            const displayName = getDisplayName(name);
            const parentId = metaMap.get(name)?.parent_id;

            return (
              <button
                key={name}
                onClick={() => onSelectTable(name)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  padding: '0.4rem 0.85rem',
                  borderRadius: 'var(--radius-sm)',
                  border: isActive ? '1px solid var(--accent)' : '1px solid var(--border-subtle, transparent)',
                  background: isActive ? 'var(--bg-card)' : 'transparent',
                  color: isActive ? 'var(--accent)' : 'var(--text-tertiary)',
                  fontWeight: isActive ? 600 : 500,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  fontSize: '13px',
                  transition: 'all 0.15s ease',
                }}
                title={parentId ? `Child of ${getDisplayName(String(parentId))}` : 'Root Table'}
              >
                <span>{displayName}</span>
                {count !== undefined && (
                  <span style={{
                    fontSize: '10px',
                    fontFamily: 'var(--font-mono)',
                    padding: '0.1rem 0.4rem',
                    borderRadius: 'var(--radius-full)',
                    background: isActive ? 'var(--accent-bg)' : 'var(--bg-card)',
                    color: isActive ? 'var(--accent)' : 'var(--text-dim)',
                  }}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}

          <button
            onClick={onAddTable}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.3rem',
              padding: '0.4rem 0.65rem',
              borderRadius: 'var(--radius-sm)',
              border: '1px dashed var(--border-mid)',
              background: 'transparent',
              color: 'var(--text-dim)',
              cursor: 'pointer',
              fontSize: '12px',
              whiteSpace: 'nowrap',
            }}
            title="Add new data table"
          >
            <Plus size={13} />
            <span>New Table</span>
          </button>
        </div>

        {/* Right Side: Table Settings & Management */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', flexShrink: 0 }}>
          <button
            onClick={() => onOpenTableSettings(activeTable)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.4rem 0.75rem',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-mid)',
              background: 'rgba(255, 255, 255, 0.03)',
              color: 'var(--text-secondary)',
              fontWeight: 600,
              cursor: 'pointer',
              fontSize: '12px',
              whiteSpace: 'nowrap',
              transition: 'all 0.15s ease',
            }}
            title={`Configure settings and parent hierarchy for ${getDisplayName(activeTable)}`}
          >
            <Settings size={13} />
            <span>Table Settings</span>
          </button>
        </div>
      </nav>

      {/* Hierarchical Breadcrumb Spine */}
      {hasLineage && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.35rem',
          padding: '0.3rem 1.1rem',
          background: 'rgba(0, 0, 0, 0.15)',
          borderTop: '1px solid var(--border-subtle, rgba(255,255,255,0.03))',
          fontSize: '11px',
          color: 'var(--text-dim)',
        }}>
          <span style={{ textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600, fontSize: '10px', color: 'var(--text-dim)' }}>
            Hierarchy:
          </span>
          {lineage.map((item, index) => {
            const isLast = index === lineage.length - 1;
            return (
              <React.Fragment key={item.id}>
                {index > 0 && <ChevronRight size={11} style={{ opacity: 0.5 }} />}
                <button
                  onClick={() => onSelectTable(item.id)}
                  style={{
                    background: 'none',
                    border: 'none',
                    padding: '0.1rem 0.3rem',
                    cursor: 'pointer',
                    fontSize: '11px',
                    fontWeight: isLast ? 600 : 400,
                    color: isLast ? 'var(--accent)' : 'var(--text-secondary)',
                    borderRadius: 'var(--radius-xs, 3px)',
                  }}
                  title={`Switch to ${item.name}`}
                >
                  {item.name}
                </button>
              </React.Fragment>
            );
          })}
        </div>
      )}
    </div>
  );
};
