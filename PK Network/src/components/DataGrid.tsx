import React, { useState, useMemo, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { TableSchema, TableRecord, TableState } from '../types';
import {
  HierarchicalRecord,
  getHeadingSortCandidates,
  buildHeadingSortedRecords,
  buildForeignHeadingSortedRecords,
  compareRecords,
} from '../services/headingSort';
import { GridToolbar } from './GridToolbar';
import { GridHeader } from './GridHeader';
import { GridRow } from './GridRow';
import { TreeHeaderRow } from './TreeHeaderRow';
import { resolveBranchDrop } from '../services/branchDragDrop';
import { buildBranchOptionsMap } from '../services/branchOptions';
import {
  computeColumnSuggestions,
  addOptionToSchema,
  removeOptionFromSchema,
  getRecordOptionCleanupUpdates,
} from '../services/columnOptions';

interface DataGridProps {
  schema: TableSchema; records: TableRecord[]; isLoading: boolean;
  onSelectRecord: (record: TableRecord) => void;
  onNewRecord: () => Promise<TableRecord | null>;
  onDeleteRecord: (id: string) => Promise<void>;
  onInlineUpdate: (id: string, field: string, value: any) => Promise<void>;
  onReorderRecords?: (newRecords: TableRecord[]) => void;
  relationOptions?: Record<string, { id: string; label: string }[]>;
  relationStore?: Record<string, Record<string, TableRecord>>;
  tables?: Record<string, TableSchema>;
  onEnsureRelation?: (targetTable?: string) => Promise<void>;
  onSaveSchema?: (updated: TableSchema) => Promise<void>;
  tableState?: TableState;
  onSaveTableState?: (state: Partial<TableState>) => void;
}

export const DataGrid: React.FC<DataGridProps> = ({
  schema, records, onSelectRecord, onNewRecord, onDeleteRecord, onInlineUpdate, onReorderRecords,
  isLoading, relationOptions, relationStore, tables, onEnsureRelation, onSaveSchema, tableState, onSaveTableState,
}) => {
  const [search, setSearch] = useState('');
  const [sortCol, setSortCol] = useState<string | null>(tableState?.sort_col ?? null);
  const [sortAsc, setSortAsc] = useState<boolean>(tableState?.sort_asc ?? true);
  const [headingSortActive, setHeadingSortActive] = useState<boolean>(tableState?.heading_sort_active ?? true);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [selectedCandidateSlug, setSelectedCandidateSlug] = useState<string | null>(tableState?.active_candidate_slug ?? null);
  const [foldedIds, setFoldedIds] = useState<Set<string>>(new Set(tableState?.config_json?.folded_ids || []));

  useEffect(() => {
    if (tableState) {
      setSortCol(tableState.sort_col ?? null);
      setSortAsc(tableState.sort_asc !== undefined ? tableState.sort_asc : true);
      setHeadingSortActive(tableState.heading_sort_active !== undefined ? tableState.heading_sort_active : true);
      setSelectedCandidateSlug(tableState.active_candidate_slug ?? null);
      setFoldedIds(new Set(tableState.config_json?.folded_ids || []));
    } else {
      setSortCol(null); setSortAsc(true); setHeadingSortActive(true); setSelectedCandidateSlug(null); setFoldedIds(new Set());
    }
  }, [schema.table_name, tableState]);

  const toggleFold = (id: string) => {
    const next = new Set(foldedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setFoldedIds(next);
    onSaveTableState?.({ config_json: { ...(tableState?.config_json || {}), folded_ids: Array.from(next) } });
  };

  const headingSortCandidates = useMemo(() => getHeadingSortCandidates(schema, tables || {}), [schema, tables]);
  const activeCandidate = useMemo(() => {
    if (!headingSortCandidates.length) return null;
    return headingSortCandidates.find((c) => c.column.slug === selectedCandidateSlug) || headingSortCandidates[0];
  }, [headingSortCandidates, selectedCandidateSlug]);

  useEffect(() => {
    if (headingSortActive && activeCandidate && !activeCandidate.isSelf) {
      onEnsureRelation?.(activeCandidate.targetTable);
    }
  }, [headingSortActive, activeCandidate, onEnsureRelation]);

  const columnSuggestions = useMemo(
    () => computeColumnSuggestions(schema.columns, records),
    [schema.columns, records]
  );

  const handleAddOptionToColumn = async (colSlug: string, newOption: string) => {
    const updated = addOptionToSchema(schema, colSlug, newOption);
    if (updated && onSaveSchema) await onSaveSchema(updated);
  };

  const handleDeleteOptionFromColumn = async (colSlug: string, optionToDelete: string) => {
    const col = schema.columns.find((c) => c.slug === colSlug);
    if (!col) return;
    const updated = removeOptionFromSchema(schema, colSlug, optionToDelete);
    if (updated && onSaveSchema) await onSaveSchema(updated);

    const cleanupUpdates = getRecordOptionCleanupUpdates(records, col, optionToDelete);
    for (const u of cleanupUpdates) {
      await onInlineUpdate(u.id, u.field, u.value);
    }
  };

  const [draggedIdx, setDraggedIdx] = useState<number | null>(null);
  const [dragOverIdx, setDragOverIdx] = useState<number | null>(null);
  const [dragPosition, setDragPosition] = useState<'top' | 'bottom' | null>(null);
  const [editingCell, setEditingCell] = useState<{ id: string; slug: string } | null>(null);

  const filteredRecords = useMemo(() => {
    if (!search.trim()) return records;
    const q = search.toLowerCase();
    return records.filter((r) =>
      Object.values(r).some((v) => String(typeof v === 'object' && v !== null ? JSON.stringify(v) : (v ?? '')).toLowerCase().includes(q))
    );
  }, [records, search]);

  const displayItems = useMemo<HierarchicalRecord[]>(() => {
    if (headingSortActive && activeCandidate) {
      if (activeCandidate.isSelf && activeCandidate.targetSelfRelColSlug) {
        return buildHeadingSortedRecords(filteredRecords, activeCandidate.targetSelfRelColSlug, sortCol, sortAsc);
      }
      if (!activeCandidate.isSelf && activeCandidate.targetSelfRelColSlug && tables) {
        const targetSchema = tables[activeCandidate.targetTable];
        const targetRecords = Object.values(relationStore?.[activeCandidate.targetTable] || {});
        if (targetSchema && targetRecords.length > 0) {
          return buildForeignHeadingSortedRecords(
            filteredRecords, activeCandidate.column, targetSchema, targetRecords,
            activeCandidate.targetSelfRelColSlug, sortCol, sortAsc
          );
        }
      }
    }
    const sorted = [...filteredRecords].sort((a, b) => compareRecords(a, b, sortCol, sortAsc));
    return sorted.map((r, idx) => ({
      record: r, level: 0, isParent: false, childCount: 0, parentId: null, treePath: String(idx + 1), isHeaderNode: false,
    }));
  }, [filteredRecords, headingSortActive, activeCandidate, tables, relationStore, sortCol, sortAsc]);

  const visibleItems = useMemo(() => {
    if (!headingSortActive || foldedIds.size === 0) return displayItems;
    return displayItems.filter((it) => !it.ancestorIds?.some((ancId) => foldedIds.has(ancId)));
  }, [displayItems, headingSortActive, foldedIds]);

  const branchOptionsMap = useMemo(() => (
    headingSortActive ? buildBranchOptionsMap(displayItems, schema.columns) : {}
  ), [headingSortActive, displayItems, schema.columns]);

  const branchIds = useMemo(() => displayItems.filter((it) => it.isParent).map((it) => it.record.id), [displayItems]);
  const isAllFolded = branchIds.length > 0 && branchIds.every((id) => foldedIds.has(id));
  const handleToggleFoldAll = () => {
    const next = isAllFolded ? new Set<string>() : new Set<string>(branchIds);
    setFoldedIds(next);
    onSaveTableState?.({ config_json: { ...(tableState?.config_json || {}), folded_ids: Array.from(next) } });
  };
  const actualItemCount = useMemo(() => visibleItems.filter((it) => !it.isHeaderNode).length, [visibleItems]);

  const toggleSort = (colSlug: string) => {
    const nextAsc = sortCol === colSlug ? !sortAsc : true;
    setSortCol(colSlug);
    setSortAsc(nextAsc);
    onSaveTableState?.({ sort_col: colSlug, sort_asc: nextAsc });
  };
  const handleToggleHeadingSort = () => {
    const next = !headingSortActive;
    setHeadingSortActive(next);
    onSaveTableState?.({ heading_sort_active: next });
  };
  const handleSelectCandidateSlug = (slug: string) => {
    setSelectedCandidateSlug(slug);
    onSaveTableState?.({ active_candidate_slug: slug });
  };
  const handleSelectAll = (checked: boolean) => {
    setSelectedIds(checked ? new Set(visibleItems.filter((it) => !it.isHeaderNode).map((it) => it.record.id)) : new Set());
  };
  const handleToggleRow = (id: string) => {
    const next = new Set(selectedIds);
    next.has(id) ? next.delete(id) : next.add(id);
    setSelectedIds(next);
  };

  const handleBulkDelete = async () => {
    if (selectedIds.size > 0 && confirm(`Delete ${selectedIds.size} selected records?`)) {
      for (const id of selectedIds) await onDeleteRecord(id);
      setSelectedIds(new Set());
    }
  };

  const handleDropRow = async (targetRIdx: number) => {
    if (draggedIdx === null || draggedIdx === targetRIdx) {
      setDraggedIdx(null); setDragOverIdx(null); setDragPosition(null); return;
    }
    const draggedItem = visibleItems[draggedIdx];
    const targetItem = visibleItems[targetRIdx];
    if (!draggedItem || !targetItem || draggedItem.isHeaderNode) {
      setDraggedIdx(null); setDragOverIdx(null); setDragPosition(null); return;
    }

    const { updatedField, reorderedRecords } = resolveBranchDrop(
      draggedItem, targetItem, records, headingSortActive, activeCandidate, dragPosition
    );
    if (headingSortActive) {
      if (updatedField) await onInlineUpdate(draggedItem.record.id, updatedField.slug, updatedField.value);
    } else {
      if (onReorderRecords) onReorderRecords(reorderedRecords);
    }
    setDraggedIdx(null); setDragOverIdx(null); setDragPosition(null);
  };

  const entryColumns = useMemo(() => schema.columns.filter((c) => c.type !== 'hex_id' && c.slug !== 'id'), [schema.columns]);

  const handleCreateNewInlineRow = async () => {
    const newRec = await onNewRecord();
    const targetCol = entryColumns[0] || schema.columns[0];
    if (newRec && targetCol) setEditingCell({ id: newRec.id, slug: targetCol.slug });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, height: '100%', overflow: 'hidden', background: 'var(--bg-canvas)' }}>
      <GridToolbar
        search={search} setSearch={setSearch} totalRecords={records.length} filteredCount={actualItemCount}
        selectedCount={selectedIds.size} onBulkDelete={handleBulkDelete} onNewRecord={handleCreateNewInlineRow}
        hasHeadingSort={headingSortCandidates.length > 0} headingSortActive={headingSortActive}
        onToggleHeadingSort={handleToggleHeadingSort} headingSortColName={activeCandidate?.column.name}
        candidates={headingSortCandidates.map((c) => ({ slug: c.column.slug, name: c.column.name }))}
        activeCandidateSlug={activeCandidate?.column.slug} onSelectCandidateSlug={handleSelectCandidateSlug}
        hasBranches={branchIds.length > 0} isAllFolded={isAllFolded} onToggleFoldAll={handleToggleFoldAll}
      />

      <div style={{ flex: 1, overflow: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left', minWidth: `${Math.max(650, entryColumns.length * 170)}px` }}>
          <GridHeader
            columns={entryColumns}
            allSelected={actualItemCount > 0 && selectedIds.size === actualItemCount}
            onSelectAll={handleSelectAll}
            sortCol={sortCol}
            sortAsc={sortAsc}
            onToggleSort={toggleSort}
          />

          <tbody>
            {isLoading ? (
              <tr><td colSpan={entryColumns.length + 3} style={{ padding: '3.5rem', textAlign: 'center', color: 'var(--text-dim)' }}>Loading records from Turso Cloud...</td></tr>
            ) : visibleItems.length === 0 ? (
              <tr><td colSpan={entryColumns.length + 3} style={{ padding: '3.5rem', textAlign: 'center', color: 'var(--text-dim)' }}>No records yet. Click <strong>"+ New Record"</strong> to get started.</td></tr>
            ) : (
              visibleItems.map((item, rIdx) => {
                if (item.isHeaderNode) {
                  return (
                    <TreeHeaderRow
                      key={item.record.id} item={item} colSpan={entryColumns.length + 1}
                      isFolded={foldedIds.has(item.record.id)} onToggleFold={() => toggleFold(item.record.id)}
                      isOver={dragOverIdx === rIdx} onDragOver={() => { setDragOverIdx(rIdx); setDragPosition(null); }}
                      onDragLeave={() => dragOverIdx === rIdx && setDragOverIdx(null)} onDrop={() => handleDropRow(rIdx)}
                    />
                  );
                }
                return (
                  <GridRow
                    key={item.record.id} item={item} rIdx={rIdx} entryColumns={entryColumns}
                    isSelected={selectedIds.has(item.record.id)} isDragging={draggedIdx === rIdx} isOver={dragOverIdx === rIdx}
                    dragPosition={dragPosition} headingSortActive={headingSortActive}
                    isFolded={foldedIds.has(item.record.id)} onToggleFold={() => toggleFold(item.record.id)}
                    editingCell={editingCell} columnSuggestions={columnSuggestions}
                    branchPinnedOptionsMap={branchOptionsMap[item.parentId ?? '__root__']}
                    relationOptions={relationOptions} relationStore={relationStore}
                    onToggleRow={handleToggleRow} onDragStart={() => setDraggedIdx(rIdx)}
                    onDragOver={(e) => { e.preventDefault(); setDragOverIdx(rIdx); setDragPosition(e.clientY < e.currentTarget.getBoundingClientRect().top + 22 ? 'top' : 'bottom'); }}
                    onDragLeave={() => dragOverIdx === rIdx && setDragOverIdx(null)}
                    onDrop={(e) => { e.preventDefault(); handleDropRow(rIdx); }}
                    onDragEnd={() => { setDraggedIdx(null); setDragOverIdx(null); }}
                    onStartEdit={(slug) => setEditingCell({ id: item.record.id, slug })}
                    onCancelEdit={() => setEditingCell(null)}
                    onCommitEdit={async (slug, newVal, shouldClose = true) => { await onInlineUpdate(item.record.id, slug, newVal); if (shouldClose) setEditingCell(null); }}
                    onAddOption={(slug, newOpt) => handleAddOptionToColumn(slug, newOpt)}
                    onDeleteOption={(slug, opt) => handleDeleteOptionFromColumn(slug, opt)}
                    onSelectRecord={onSelectRecord} onDeleteRecord={onDeleteRecord} onEnsureRelation={onEnsureRelation}
                  />
                );
              })
            )}

            {!isLoading && (
              <tr onClick={handleCreateNewInlineRow} className="notion-new-row" style={{ borderBottom: '1px solid var(--border-table)', cursor: 'pointer', color: 'var(--text-dim)', minHeight: '44px' }} title="Click to insert new row">
                <td style={{ padding: '0.65rem 0.5rem', textAlign: 'center' }}><Plus size={14} style={{ opacity: 0.5 }} /></td>
                <td className="td-drag-num" style={{ padding: '0.65rem 0.5rem' }}><span style={{ fontSize: '11px', opacity: 0.4 }}>+</span></td>
                <td colSpan={schema.columns.length + 1} style={{ padding: '0.65rem 0.75rem', fontSize: '13px', fontWeight: 500, color: 'var(--text-dim)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}><Plus size={14} /><span>New</span></div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
