import React, { useState, useMemo } from 'react';
import { Edit2, Trash2, Plus } from 'lucide-react';
import { TableSchema, TableRecord } from '../types';
import { GridToolbar } from './GridToolbar';
import { GridHeader } from './GridHeader';
import { GridCell } from './GridCell';
import { parseMultiValue } from './NotionMultiSelect';

interface DataGridProps {
  schema: TableSchema;
  records: TableRecord[];
  onSelectRecord: (record: TableRecord) => void;
  onNewRecord: () => Promise<TableRecord | null>;
  onDeleteRecord: (id: string) => Promise<void>;
  onInlineUpdate: (id: string, field: string, value: any) => Promise<void>;
  onReorderRecords?: (newRecords: TableRecord[]) => void;
  isLoading: boolean;
  relationOptions?: Record<string, { id: string; label: string }[]>;
  onEnsureRelation?: (targetTable?: string) => Promise<void>;
  onSaveSchema?: (updated: TableSchema) => Promise<void>;
}

export const DataGrid: React.FC<DataGridProps> = ({
  schema,
  records,
  onSelectRecord,
  onNewRecord,
  onDeleteRecord,
  onInlineUpdate,
  onReorderRecords,
  isLoading,
  relationOptions,
  onEnsureRelation,
  onSaveSchema,
}) => {
  const [search, setSearch] = useState('');
  const [sortCol, setSortCol] = useState<string | null>(null);
  const [sortAsc, setSortAsc] = useState<boolean>(true);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Dynamically aggregate all auto-suggest options for each column:
  // Combines predefined schema options + all distinct values already present in the table records
  const columnSuggestions = useMemo(() => {
    const map: Record<string, string[]> = {};
    for (const col of schema.columns) {
      if (col.type === 'enum_single' || col.type === 'enum_multi') {
        const set = new Set<string>(col.metadata?.options || []);
        for (const r of records) {
          const raw = r[col.slug];
          if (Array.isArray(raw)) {
            raw.forEach((v) => v && set.add(String(v).trim()));
          } else if (typeof raw === 'string') {
            parseMultiValue(raw).forEach((v) => v && set.add(v.trim()));
          }
        }
        map[col.slug] = Array.from(set).filter(Boolean);
      }
    }
    return map;
  }, [schema.columns, records]);

  const handleAddOptionToColumn = async (colSlug: string, newOption: string) => {
    const col = schema.columns.find((c) => c.slug === colSlug);
    if (!col) return;
    const existingOpts = col.metadata?.options || [];
    if (!existingOpts.includes(newOption)) {
      const nextCols = schema.columns.map((c) => {
        if (c.slug === colSlug) {
          return {
            ...c,
            metadata: {
              ...c.metadata,
              options: [...existingOpts, newOption],
            },
          };
        }
        return c;
      });
      if (onSaveSchema) {
        await onSaveSchema({ ...schema, columns: nextCols });
      }
    }
  };

  // Drag & drop states
  const [draggedIdx, setDraggedIdx] = useState<number | null>(null);
  const [dragOverIdx, setDragOverIdx] = useState<number | null>(null);
  const [dragPosition, setDragPosition] = useState<'top' | 'bottom' | null>(null);

  // Inline cell editing
  const [editingCell, setEditingCell] = useState<{ id: string; slug: string } | null>(null);

  // Filter records
  const filteredRecords = records.filter((r) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return Object.values(r).some((v) => String(v ?? '').toLowerCase().includes(q));
  });

  // Sort records
  const displayRecords = [...filteredRecords].sort((a, b) => {
    if (!sortCol) return 0;
    const [va, vb] = [a[sortCol], b[sortCol]];
    if (va === vb) return 0;
    if (va === null || va === undefined) return 1;
    if (vb === null || vb === undefined) return -1;
    const cmp = typeof va === 'number' && typeof vb === 'number' ? va - vb : String(va).localeCompare(String(vb));
    return sortAsc ? cmp : -cmp;
  });

  const toggleSort = (colSlug: string) => {
    if (sortCol === colSlug) {
      setSortAsc(!sortAsc);
    } else {
      setSortCol(colSlug);
      setSortAsc(true);
    }
  };

  const handleSelectAll = (checked: boolean) => {
    setSelectedIds(checked ? new Set(displayRecords.map((r) => r.id)) : new Set());
  };

  const handleToggleRow = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  const handleBulkDelete = async () => {
    const count = selectedIds.size;
    if (count === 0) return;
    if (confirm(`Are you sure you want to delete ${count} selected records?`)) {
      for (const id of selectedIds) {
        await onDeleteRecord(id);
      }
      setSelectedIds(new Set());
    }
  };

  const handleDropRow = (rIdx: number) => {
    if (draggedIdx === null || draggedIdx === rIdx) {
      setDraggedIdx(null);
      setDragOverIdx(null);
      setDragPosition(null);
      return;
    }
    if (onReorderRecords) {
      const next = [...records];
      const [moved] = next.splice(draggedIdx, 1);
      let targetIdx = rIdx;
      if (dragPosition === 'bottom' && draggedIdx > rIdx) targetIdx = rIdx + 1;
      else if (dragPosition === 'top' && draggedIdx < rIdx) targetIdx = rIdx - 1;
      next.splice(Math.max(0, targetIdx), 0, moved);
      onReorderRecords(next);
    }
    setDraggedIdx(null);
    setDragOverIdx(null);
    setDragPosition(null);
  };

  const handleCreateNewInlineRow = async () => {
    const newRec = await onNewRecord();
    if (newRec) {
      const targetCol = schema.columns.find((c) => c.slug !== 'id') || schema.columns[0];
      if (targetCol) setEditingCell({ id: newRec.id, slug: targetCol.slug });
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, height: '100%', overflow: 'hidden', background: 'var(--bg-canvas)' }}>
      <GridToolbar
        search={search}
        setSearch={setSearch}
        totalRecords={records.length}
        filteredCount={displayRecords.length}
        selectedCount={selectedIds.size}
        onBulkDelete={handleBulkDelete}
        onNewRecord={handleCreateNewInlineRow}
      />

      <div style={{ flex: 1, overflow: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left', minWidth: `${Math.max(850, schema.columns.length * 170)}px` }}>
          <GridHeader
            columns={schema.columns}
            allSelected={displayRecords.length > 0 && selectedIds.size === displayRecords.length}
            onSelectAll={handleSelectAll}
            sortCol={sortCol}
            sortAsc={sortAsc}
            onToggleSort={toggleSort}
          />

          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={schema.columns.length + 3} style={{ padding: '3.5rem', textAlign: 'center', color: 'var(--text-dim)' }}>
                  Loading records from Turso Cloud...
                </td>
              </tr>
            ) : displayRecords.length === 0 ? (
              <tr>
                <td colSpan={schema.columns.length + 3} style={{ padding: '3.5rem', textAlign: 'center', color: 'var(--text-dim)' }}>
                  No records yet. Click <strong>"+ New Record"</strong> to get started.
                </td>
              </tr>
            ) : (
              displayRecords.map((r, rIdx) => {
                const isDragging = draggedIdx === rIdx;
                const isOver = dragOverIdx === rIdx;
                const isSelected = selectedIds.has(r.id);
                const dragClass = isDragging ? 'is-dragging' : isOver && dragPosition === 'top' ? 'drag-over-top' : isOver && dragPosition === 'bottom' ? 'drag-over-bottom' : '';

                return (
                  <tr
                    key={r.id}
                    draggable
                    onDragStart={(e) => { setDraggedIdx(rIdx); e.dataTransfer.effectAllowed = 'move'; }}
                    onDragOver={(e) => {
                      e.preventDefault();
                      setDragOverIdx(rIdx);
                      setDragPosition(e.clientY < e.currentTarget.getBoundingClientRect().top + 22 ? 'top' : 'bottom');
                    }}
                    onDragLeave={() => dragOverIdx === rIdx && setDragOverIdx(null)}
                    onDrop={(e) => { e.preventDefault(); handleDropRow(rIdx); }}
                    onDragEnd={() => { setDraggedIdx(null); setDragOverIdx(null); }}
                    className={`notion-row ${dragClass}`}
                    style={{
                      borderBottom: '1px solid var(--border-table)',
                      background: isSelected ? 'var(--accent-bg)' : undefined,
                      minHeight: '44px',
                    }}
                  >
                    <td style={{ padding: '0.65rem 0.5rem', textAlign: 'center' }}>
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleToggleRow(r.id)}
                        style={{ accentColor: 'var(--accent)', cursor: 'pointer' }}
                      />
                    </td>

                    <td className="td-drag-num" style={{ padding: '0.65rem 0.5rem' }}>
                      <span className="row-idx">{rIdx + 1}</span>
                      <span className="drag-handle" title="Drag to reorder row">⋮⋮</span>
                    </td>

                    {schema.columns.map((col) => (
                      <td
                        key={col.slug}
                        style={{
                          padding: '0.55rem 0.75rem',
                          maxWidth: col.type === 'text_multi' ? '320px' : '220px',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: col.type === 'text_multi' ? 'normal' : 'nowrap',
                          minHeight: '44px',
                        }}
                      >
                        <GridCell
                          record={r}
                          column={col}
                          isEditing={editingCell?.id === r.id && editingCell?.slug === col.slug}
                          onStartEdit={() => setEditingCell({ id: r.id, slug: col.slug })}
                          onCancelEdit={() => setEditingCell(null)}
                          onCommitEdit={async (newVal) => {
                            await onInlineUpdate(r.id, col.slug, newVal);
                            setEditingCell(null);
                          }}
                          relationOptions={relationOptions}
                          onEnsureRelation={onEnsureRelation}
                          suggestedOptions={columnSuggestions[col.slug] || []}
                          onAddOption={(newOpt) => handleAddOptionToColumn(col.slug, newOpt)}
                        />
                      </td>
                    ))}

                    <td style={{ padding: '0.65rem 0.75rem', textAlign: 'right' }}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.3rem' }}>
                        <button className="btn icon-only" onClick={() => onSelectRecord(r)} title="Open detailed drawer">
                          <Edit2 size={13} />
                        </button>
                        <button
                          className="btn icon-only danger"
                          onClick={() => {
                            if (confirm(`Delete record #${r.id}?`)) {
                              onDeleteRecord(r.id);
                            }
                          }}
                          title="Delete row"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}

            {/* Notion-Style "+ New" Bottom Row */}
            {!isLoading && (
              <tr
                onClick={handleCreateNewInlineRow}
                className="notion-new-row"
                style={{
                  borderBottom: '1px solid var(--border-table)',
                  cursor: 'pointer',
                  color: 'var(--text-dim)',
                  minHeight: '44px',
                }}
                title="Click to insert new row"
              >
                <td style={{ padding: '0.65rem 0.5rem', textAlign: 'center' }}>
                  <Plus size={14} style={{ opacity: 0.5 }} />
                </td>
                <td className="td-drag-num" style={{ padding: '0.65rem 0.5rem' }}>
                  <span style={{ fontSize: '11px', opacity: 0.4 }}>+</span>
                </td>
                <td
                  colSpan={schema.columns.length + 1}
                  style={{
                    padding: '0.65rem 0.75rem',
                    fontSize: '13px',
                    fontWeight: 500,
                    color: 'var(--text-dim)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                    <Plus size={14} />
                    <span>New</span>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
