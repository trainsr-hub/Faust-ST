import React from 'react';
import { Search, Plus, Trash2 } from 'lucide-react';

interface GridToolbarProps {
  search: string;
  setSearch: (s: string) => void;
  totalRecords: number;
  filteredCount: number;
  selectedCount: number;
  onBulkDelete: () => void;
  onNewRecord: () => void;
}

export const GridToolbar: React.FC<GridToolbarProps> = ({
  search,
  setSearch,
  totalRecords,
  filteredCount,
  selectedCount,
  onBulkDelete,
  onNewRecord,
}) => {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0.6rem 1.25rem',
      borderBottom: '1px solid var(--border-table)',
      background: 'var(--bg-card)',
      gap: '1rem',
      minHeight: '52px',
    }}>
      {/* Search Bar */}
      <div style={{ position: 'relative', width: '300px', display: 'flex', alignItems: 'center' }}>
        <Search size={15} style={{ position: 'absolute', left: '0.75rem', color: 'var(--text-dim)' }} />
        <input
          className="input-base"
          style={{ width: '100%', minHeight: '40px', paddingLeft: '2.2rem', fontSize: '13px' }}
          placeholder={`Search ${totalRecords} records...`}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Right Controls: Bulk Bar & Action */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        {selectedCount > 0 ? (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem',
            background: 'rgba(244, 63, 94, 0.1)',
            padding: '0.25rem 0.75rem',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid rgba(244, 63, 94, 0.3)',
          }}>
            <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--danger)', fontFamily: 'var(--font-mono)' }}>
              {selectedCount} selected
            </span>
            <button
              className="btn danger"
              style={{ padding: '0.25rem 0.6rem', fontSize: '12px', minHeight: '32px' }}
              onClick={onBulkDelete}
              title="Delete all selected records"
            >
              <Trash2 size={13} />
              <span>Bulk Delete</span>
            </button>
          </div>
        ) : (
          <span style={{ fontSize: '12px', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>
            {filteredCount} / {totalRecords} records
          </span>
        )}

        <button className="btn primary" style={{ minHeight: '40px' }} onClick={onNewRecord} title="Create new record">
          <Plus size={15} />
          <span>New Record</span>
        </button>
      </div>
    </div>
  );
};
