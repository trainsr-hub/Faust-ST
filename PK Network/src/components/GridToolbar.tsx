import React from 'react';
import { Search, Plus, Trash2, FolderTree, ChevronRight, ChevronDown } from 'lucide-react';

interface GridToolbarProps {
  search: string;
  setSearch: (s: string) => void;
  totalRecords: number;
  filteredCount: number;
  selectedCount: number;
  onBulkDelete: () => void;
  onNewRecord: () => void;
  hasHeadingSort?: boolean;
  headingSortActive?: boolean;
  onToggleHeadingSort?: () => void;
  headingSortColName?: string;
  candidates?: { slug: string; name: string }[];
  activeCandidateSlug?: string | null;
  onSelectCandidateSlug?: (slug: string) => void;
  hasBranches?: boolean;
  isAllFolded?: boolean;
  onToggleFoldAll?: () => void;
}

export const GridToolbar: React.FC<GridToolbarProps> = ({
  search,
  setSearch,
  totalRecords,
  filteredCount,
  selectedCount,
  onBulkDelete,
  onNewRecord,
  hasHeadingSort,
  headingSortActive,
  onToggleHeadingSort,
  headingSortColName,
  candidates,
  activeCandidateSlug,
  onSelectCandidateSlug,
  hasBranches,
  isAllFolded,
  onToggleFoldAll,
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
      {/* Left: Search Bar & Optional Heading Sort Toggle */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <div style={{ position: 'relative', width: '280px', display: 'flex', alignItems: 'center' }}>
          <Search size={15} style={{ position: 'absolute', left: '0.75rem', color: 'var(--text-dim)' }} />
          <input
            className="input-base"
            style={{ width: '100%', minHeight: '40px', paddingLeft: '2.2rem', fontSize: '13px' }}
            placeholder={`Search ${totalRecords} records...`}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {hasHeadingSort && onToggleHeadingSort && (
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
            <button
              type="button"
              className={`btn ${headingSortActive ? 'active' : ''}`}
              onClick={onToggleHeadingSort}
              style={{
                minHeight: '40px',
                padding: '0 0.85rem',
                fontSize: '13px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.45rem',
                background: headingSortActive ? 'rgba(99, 102, 241, 0.15)' : 'var(--bg-canvas)',
                color: headingSortActive ? 'var(--accent)' : 'var(--text-main)',
                border: headingSortActive
                  ? '1px solid var(--accent)'
                  : '1px solid var(--border-table)',
                fontWeight: headingSortActive ? 600 : 500,
                borderRadius: 'var(--radius-sm)',
                boxShadow: headingSortActive ? '0 0 10px rgba(99, 102, 241, 0.2)' : 'none',
                transition: 'all 0.15s ease',
                cursor: 'pointer',
              }}
              title={
                headingSortActive
                  ? `Heading Sort is ACTIVE: Parents are displayed as headers directly above their children (via '${headingSortColName}')`
                  : `Enable Heading Sort: Parents are displayed as headers directly above their children (via '${headingSortColName}')`
              }
            >
              <FolderTree size={15} style={{ color: headingSortActive ? 'var(--accent)' : 'var(--text-dim)' }} />
              <span>Heading Sort</span>
              {headingSortActive && (
                <span
                  style={{
                    fontSize: '10px',
                    padding: '0.1rem 0.4rem',
                    borderRadius: '10px',
                    background: 'var(--accent)',
                    color: '#ffffff',
                    fontWeight: 700,
                    marginLeft: '0.2rem',
                  }}
                >
                  ON
                </span>
              )}
            </button>

            {headingSortActive && candidates && candidates.length > 1 && (
              <select
                value={activeCandidateSlug || candidates[0]?.slug}
                onChange={(e) => onSelectCandidateSlug?.(e.target.value)}
                className="input-base"
                style={{
                  minHeight: '40px',
                  fontSize: '12px',
                  padding: '0 0.5rem',
                  borderRadius: 'var(--radius-sm)',
                  background: 'var(--bg-canvas)',
                  borderColor: 'var(--accent)',
                  color: 'var(--text-main)',
                }}
                title="Select relation column for Heading Sort"
              >
                {candidates.map((c) => (
                  <option key={c.slug} value={c.slug}>
                    via {c.name}
                  </option>
                ))}
              </select>
            )}

            {hasBranches && onToggleFoldAll && (
              <button
                type="button"
                className="btn"
                onClick={onToggleFoldAll}
                style={{
                  minHeight: '40px',
                  padding: '0 0.75rem',
                  fontSize: '12px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  background: 'var(--bg-canvas)',
                  border: '1px solid var(--border-table)',
                  color: 'var(--text-main)',
                  borderRadius: 'var(--radius-sm)',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
                title={isAllFolded ? 'Expand all tree branches' : 'Fold all tree branches'}
              >
                {isAllFolded ? <ChevronRight size={13} /> : <ChevronDown size={13} />}
                <span>{isAllFolded ? 'Expand All' : 'Fold All'}</span>
              </button>
            )}
          </div>
        )}
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
