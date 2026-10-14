import React, { useState } from 'react';
import { Plus, Search, Edit3, Trash2, Tag, Link2 } from 'lucide-react';
import { TableSchema, TableRecord } from '../types';

interface MobileCardViewProps {
  schema: TableSchema;
  records: TableRecord[];
  onSelectRecord: (record: TableRecord) => void;
  onNewRecord: () => void;
  onDeleteRecord: (id: string) => Promise<void>;
  isLoading: boolean;
}

export const MobileCardView: React.FC<MobileCardViewProps> = ({
  schema,
  records,
  onSelectRecord,
  onNewRecord,
  onDeleteRecord,
  isLoading,
}) => {
  const [search, setSearch] = useState('');

  // Primary title column (usually 'name' or 'main_content' or first non-id text column)
  const primaryCol = schema.columns.find((c) => c.slug === 'name' || c.slug === 'main_content') ||
    schema.columns.find((c) => c.type === 'text_single' || c.type === 'text_multi') ||
    schema.columns[1] || schema.columns[0];

  // Secondary badge columns (enums, tags, dates)
  const secondaryCols = schema.columns.filter((c) =>
    c.slug !== 'id' && c.slug !== primaryCol?.slug &&
    (c.type === 'enum_single' || c.type === 'enum_multi' || c.type === 'relation_single' || c.slug === 'date' || c.slug === 'idx')
  );

  const filteredRecords = records.filter((r) => {
    if (!search.trim()) return true;
    const query = search.toLowerCase();
    return Object.values(r).some((v) =>
      typeof v === 'string' ? v.toLowerCase().includes(query) :
      typeof v === 'number' ? v.toString().includes(query) :
      Array.isArray(v) ? v.some((item) => String(item).toLowerCase().includes(query)) : false
    );
  });

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      flex: 1,
      height: '100%',
      overflow: 'hidden',
      background: 'var(--bg-canvas)',
      position: 'relative',
    }}>
      {/* Search Header */}
      <div style={{
        padding: '0.65rem 1rem',
        borderBottom: '1px solid var(--border-table)',
        background: 'var(--bg-card)',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
      }}>
        <div style={{
          position: 'relative',
          flex: 1,
          display: 'flex',
          alignItems: 'center',
        }}>
          <Search size={16} style={{ position: 'absolute', left: '0.75rem', color: 'var(--text-dim)' }} />
          <input
            className="input-base"
            style={{ width: '100%', minHeight: '48px', paddingLeft: '2.4rem', fontSize: '14px' }}
            placeholder={`Search ${records.length} records in ${schema.table_name}...`}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Card List Area */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '0.75rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.65rem',
      }}>
        {isLoading ? (
          <div style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--text-dim)' }}>
            Loading records from Turso Cloud...
          </div>
        ) : filteredRecords.length === 0 ? (
          <div style={{ padding: '3.5rem 1.25rem', textAlign: 'center', color: 'var(--text-dim)' }}>
            <p style={{ fontSize: '14px', marginBottom: '0.75rem' }}>No records found in this table.</p>
            <button className="btn primary" style={{ minHeight: '48px', padding: '0 1.25rem' }} onClick={onNewRecord}>
              + Create First Record
            </button>
          </div>
        ) : (
          filteredRecords.map((r) => {
            const primaryText = primaryCol ? String(r[primaryCol.slug] ?? '') : '';

            return (
              <div
                key={r.id}
                onClick={() => onSelectRecord(r)}
                style={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-light)',
                  borderRadius: 'var(--radius-md)',
                  padding: '0.85rem 1rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.5rem',
                  cursor: 'pointer',
                  transition: 'border-color 0.15s, background 0.15s',
                }}
              >
                {/* Card Top: ID & Actions */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '11px',
                    fontWeight: 600,
                    color: 'var(--accent)',
                    background: 'var(--accent-bg)',
                    padding: '0.15rem 0.45rem',
                    borderRadius: 'var(--radius-sm)',
                  }}>
                    {r.id}
                  </span>

                  <div style={{ display: 'flex', gap: '0.3rem' }} onClick={(e) => e.stopPropagation()}>
                    <button
                      className="btn icon-only"
                      onClick={() => onSelectRecord(r)}
                      title="Edit"
                    >
                      <Edit3 size={13} />
                    </button>
                    <button
                      className="btn icon-only danger"
                      onClick={() => {
                        if (confirm(`Delete record ${r.id}?`)) {
                          onDeleteRecord(r.id);
                        }
                      }}
                      title="Delete"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>

                {/* Primary Content Title */}
                <div style={{
                  fontSize: '14px',
                  fontWeight: 600,
                  color: 'var(--text-primary)',
                  lineHeight: 1.4,
                  maxHeight: '4.2em',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  display: '-webkit-box',
                  WebkitLineClamp: 3,
                  WebkitBoxOrient: 'vertical',
                }}>
                  {primaryText || <em style={{ color: 'var(--text-dim)', fontWeight: 400 }}>Untitled Record</em>}
                </div>

                {/* Card Badges */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginTop: '0.2rem' }}>
                  {secondaryCols.map((col) => {
                    const val = r[col.slug];
                    if (val === undefined || val === null || val === '') return null;

                    if (Array.isArray(val)) {
                      return val.map((item) => (
                        <span key={item} className="badge badge-enum">
                          <Tag size={10} />
                          <span>{item}</span>
                        </span>
                      ));
                    }

                    if (col.type === 'relation_single') {
                      return (
                        <span key={col.slug} className="badge badge-rel">
                          <Link2 size={10} />
                          <span>{val}</span>
                        </span>
                      );
                    }

                    return (
                      <span key={col.slug} className="badge badge-text">
                        <span>{val}</span>
                      </span>
                    );
                  })}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Floating Action Button for Phone */}
      <button
        onClick={onNewRecord}
        style={{
          position: 'absolute',
          right: '1.25rem',
          bottom: '1.5rem',
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          background: 'var(--accent)',
          color: '#000',
          border: 'none',
          boxShadow: '0 4px 16px var(--accent-glow)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          zIndex: 10,
        }}
        title="Create New Record"
      >
        <Plus size={26} strokeWidth={2.5} />
      </button>
    </div>
  );
};
