import React from 'react';
import { Edit2, Trash2, Folder, FolderOpen, ChevronRight, ChevronDown } from 'lucide-react';
import { TableRecord, ColumnDefinition } from '../types';
import { HierarchicalRecord } from '../services/headingSort';
import { GridCell } from './GridCell';

interface GridRowProps {
  item: HierarchicalRecord;
  rIdx: number;
  entryColumns: ColumnDefinition[];
  isSelected: boolean;
  isDragging: boolean;
  isOver: boolean;
  dragPosition: 'top' | 'bottom' | null;
  headingSortActive: boolean;
  isFolded?: boolean;
  onToggleFold?: () => void;
  editingCell: { id: string; slug: string } | null;
  columnSuggestions: Record<string, string[]>;
  relationOptions?: Record<string, { id: string; label: string }[]>;
  relationStore?: Record<string, Record<string, TableRecord>>;
  branchPinnedOptionsMap?: Record<string, string[]>;
  onToggleRow: (id: string) => void;
  onDragStart: (e: React.DragEvent) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: () => void;
  onDrop: (e: React.DragEvent) => void;
  onDragEnd: () => void;
  onStartEdit: (slug: string) => void;
  onCancelEdit: () => void;
  onCommitEdit: (slug: string, newVal: any, shouldClose?: boolean) => Promise<void>;
  onAddOption: (colSlug: string, newOpt: string) => void;
  onDeleteOption?: (colSlug: string, option: string) => void;
  onSelectRecord: (record: TableRecord) => void;
  onDeleteRecord: (id: string) => void;
  onEnsureRelation?: (targetTable?: string) => Promise<void>;
}

export const GridRow: React.FC<GridRowProps> = ({
  item,
  rIdx,
  entryColumns,
  isSelected,
  isDragging,
  isOver,
  dragPosition,
  headingSortActive,
  isFolded = false,
  onToggleFold,
  editingCell,
  columnSuggestions,
  relationOptions,
  relationStore,
  branchPinnedOptionsMap,
  onToggleRow,
  onDragStart,
  onDragOver,
  onDragLeave,
  onDrop,
  onDragEnd,
  onStartEdit,
  onCancelEdit,
  onCommitEdit,
  onAddOption,
  onDeleteOption,
  onSelectRecord,
  onDeleteRecord,
  onEnsureRelation,
}) => {
  const r = item.record;
  const isHeader = headingSortActive && item.isParent;
  const dragClass = isDragging
    ? 'is-dragging'
    : isOver && dragPosition === 'top'
    ? 'drag-over-top'
    : isOver && dragPosition === 'bottom'
    ? 'drag-over-bottom'
    : '';

  return (
    <tr
      draggable={true}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      onDragEnd={onDragEnd}
      className={`notion-row ${dragClass} ${isHeader ? 'is-tree-header' : ''}`}
      style={{
        borderBottom: '1px solid var(--border-table)',
        borderLeft: isHeader ? '4px solid var(--accent)' : undefined,
        background: isSelected
          ? 'var(--accent-bg)'
          : isHeader
          ? 'rgba(99, 102, 241, 0.05)'
          : undefined,
        minHeight: '44px',
        fontWeight: isHeader ? 600 : undefined,
      }}
    >
      {/* Selection Checkbox */}
      <td style={{ padding: '0.65rem 0.5rem', textAlign: 'center', width: '36px' }}>
        <input
          type="checkbox"
          checked={isSelected}
          onChange={() => onToggleRow(r.id)}
          style={{ accentColor: 'var(--accent)', cursor: 'pointer' }}
        />
      </td>

      {/* Index & Tree Hierarchy Badge */}
      <td className="td-drag-num" style={{ padding: '0.65rem 0.5rem', width: '54px' }}>
        <span
          className="row-idx"
          style={{
            fontFamily: headingSortActive ? 'var(--font-mono)' : undefined,
            fontWeight: isHeader ? 700 : 500,
            fontSize: headingSortActive ? '11px' : '12px',
            color: isHeader ? 'var(--accent)' : undefined,
          }}
          title={headingSortActive ? `Tree Path: ${item.treePath}` : `Row #${rIdx + 1}`}
        >
          {headingSortActive ? item.treePath : rIdx + 1}
        </span>
        <span className="drag-handle" title="Drag to reorder or move between branches">
          ⋮⋮
        </span>
      </td>

      {/* Data Cells */}
      {entryColumns.map((col, colIdx) => {
        const isFirstCol = colIdx === 0;
        const indentPx = isFirstCol && headingSortActive && item.level > 0 ? item.level * 22 : 0;

        return (
          <td
            key={col.slug}
            style={{
              padding: '0.55rem 0.75rem',
              paddingLeft: isFirstCol && indentPx > 0 ? `${0.75 + indentPx / 16}rem` : '0.75rem',
              maxWidth: col.type === 'text_multi' ? '320px' : '220px',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: col.type === 'text_multi' ? 'normal' : 'nowrap',
              minHeight: '44px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              {/* Hierarchical Tree Branch Guide */}
              {isFirstCol && headingSortActive && item.level > 0 && (
                <span
                  style={{
                    fontFamily: 'monospace',
                    color: 'var(--text-dim)',
                    fontSize: '12px',
                    fontWeight: 600,
                    userSelect: 'none',
                    marginRight: '0.2rem',
                  }}
                >
                  └─
                </span>
              )}

              {/* Parent Header Expand/Fold Toggle */}
              {isFirstCol && isHeader && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleFold?.();
                  }}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '2px',
                    padding: '2px 4px',
                    borderRadius: '4px',
                    background: isFolded ? 'rgba(148, 163, 184, 0.15)' : 'rgba(99, 102, 241, 0.15)',
                    color: isFolded ? 'var(--text-dim)' : 'var(--accent)',
                    marginRight: '0.35rem',
                    flexShrink: 0,
                    border: 'none',
                    cursor: 'pointer',
                  }}
                  title={isFolded ? `Expand branch (${item.childCount} children)` : `Fold branch (${item.childCount} children)`}
                >
                  {isFolded ? <ChevronRight size={11} strokeWidth={2.5} /> : <ChevronDown size={11} strokeWidth={2.5} />}
                  {isFolded ? <Folder size={12} strokeWidth={2.2} /> : <FolderOpen size={12} strokeWidth={2.2} />}
                </button>
              )}

              <div style={{ flex: 1, minWidth: 0 }}>
                <GridCell
                  record={r}
                  column={col}
                  isEditing={editingCell?.id === r.id && editingCell?.slug === col.slug}
                  onStartEdit={() => onStartEdit(col.slug)}
                  onCancelEdit={onCancelEdit}
                  onCommitEdit={(newVal, shouldClose = true) =>
                    onCommitEdit(col.slug, newVal, shouldClose)
                  }
                  relationOptions={relationOptions}
                  relationStore={relationStore}
                  onEnsureRelation={onEnsureRelation}
                  suggestedOptions={columnSuggestions[col.slug] || []}
                  branchPinnedOptions={branchPinnedOptionsMap?.[col.slug] || []}
                  onAddOption={(newOpt) => onAddOption(col.slug, newOpt)}
                  onDeleteOption={(opt) => onDeleteOption?.(col.slug, opt)}
                />
              </div>
            </div>
          </td>
        );
      })}

      {/* Row Actions */}
      <td style={{ padding: '0.65rem 0.75rem', textAlign: 'right', width: '70px' }}>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.3rem' }}>
          <button
            className="btn icon-only"
            onClick={() => onSelectRecord(r)}
            title="Open detailed drawer"
          >
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
};
