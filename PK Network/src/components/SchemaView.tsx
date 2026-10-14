import React, { useState } from 'react';
import { Plus, Trash2, Edit2, Save } from 'lucide-react';
import { TableSchema, ColumnDefinition, AtomicFieldType, FIELD_TYPES } from '../types';
import { ColumnEditorDrawer } from './ColumnEditorDrawer';

interface SchemaViewProps {
  schema: TableSchema;
  availableTables: string[];
  onSaveSchema: (updatedSchema: TableSchema) => Promise<void>;
  isSaving: boolean;
  isMobile: boolean;
}

export const SchemaView: React.FC<SchemaViewProps> = ({
  schema,
  availableTables,
  onSaveSchema,
  isSaving,
  isMobile,
}) => {
  const [columns, setColumns] = useState<ColumnDefinition[]>(schema.columns || []);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  // Drag and drop state
  const [draggedIdx, setDraggedIdx] = useState<number | null>(null);
  const [dragOverIdx, setDragOverIdx] = useState<number | null>(null);
  const [dragPosition, setDragPosition] = useState<'top' | 'bottom' | null>(null);

  // Synchronize columns when active table changes
  React.useEffect(() => {
    setColumns(schema.columns || []);
    setEditingIndex(null);
  }, [schema]);

  // Edit draft state
  const [draftName, setDraftName] = useState('');
  const [draftSlug, setDraftSlug] = useState('');
  const [draftType, setDraftType] = useState<AtomicFieldType>('text_single');
  const [draftOptions, setDraftOptions] = useState('');
  const [draftTarget, setDraftTarget] = useState('');
  const [draftPrefix, setDraftPrefix] = useState('');
  const [draftFormula, setDraftFormula] = useState('');

  const handleEditColumn = (index: number) => {
    const col = columns[index];
    setEditingIndex(index);
    setDraftName(col.name);
    setDraftSlug(col.slug);
    setDraftType(col.type);
    setDraftOptions(col.metadata?.options ? col.metadata.options.join(', ') : '');
    setDraftTarget(col.metadata?.target || (availableTables[0] || ''));
    setDraftPrefix(col.metadata?.prefix || '');
    setDraftFormula(col.metadata?.default_option || '');
  };

  const handleAddNewColumn = () => {
    const newIdx = columns.length;
    setEditingIndex(newIdx);
    setDraftName('New Column');
    setDraftSlug(`col_${newIdx + 1}`);
    setDraftType('text_single');
    setDraftOptions('');
    setDraftTarget(availableTables[0] || '');
    setDraftPrefix('');
    setDraftFormula('');
  };

  const handleSaveDraft = () => {
    if (editingIndex === null) return;
    const meta: Record<string, any> = {};

    if (draftType === 'hex_id' && draftPrefix) meta.prefix = draftPrefix.trim();
    if ((draftType === 'enum_single' || draftType === 'enum_multi') && draftOptions) {
      meta.options = draftOptions.split(',').map((s) => s.trim()).filter(Boolean);
    }
    if ((draftType === 'relation_single' || draftType === 'relation_multi') && draftTarget) {
      meta.target = draftTarget.trim();
    }
    if (draftFormula) meta.default_option = draftFormula.trim();

    const newCol: ColumnDefinition = {
      name: draftName.trim() || 'Untitled',
      slug: draftSlug.trim() || 'untitled',
      type: draftType,
      metadata: meta,
    };

    const nextCols = [...columns];
    if (editingIndex < columns.length) {
      nextCols[editingIndex] = newCol;
    } else {
      nextCols.push(newCol);
    }

    setColumns(nextCols);
    setEditingIndex(null);
  };

  const handleDeleteColumn = (index: number) => {
    if (confirm(`Are you sure you want to delete column "${columns[index].name}"?`)) {
      setColumns(columns.filter((_, i) => i !== index));
      if (editingIndex === index) setEditingIndex(null);
    }
  };

  const handleCommitSchema = async () => {
    await onSaveSchema({
      table_name: schema.table_name,
      columns,
    });
  };

  return (
    <div style={{ display: 'flex', flex: 1, height: '100%', overflow: 'hidden', position: 'relative' }}>
      {/* Main Table Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: 'var(--bg-canvas)' }}>
        {/* Action Toolbar */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0.6rem 1.25rem',
          borderBottom: '1px solid var(--border-table)',
          background: 'var(--bg-card)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <span style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '14px' }}>
              Table: <span style={{ color: 'var(--accent)' }}>{schema.table_name}</span>
            </span>
            <span style={{ color: 'var(--text-dim)', fontSize: '12px', fontFamily: 'var(--font-mono)' }}>
              ({columns.length} columns)
            </span>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button className="btn" onClick={handleAddNewColumn} title="Add new column definition">
              <Plus size={14} />
              <span>Add Column</span>
            </button>
            <button className="btn primary" onClick={handleCommitSchema} disabled={isSaving} title="Save Schema to Turso Cloud">
              <Save size={14} />
              <span>{isSaving ? 'Saving...' : 'Save Schema to Turso'}</span>
            </button>
          </div>
        </div>

        {/* Column List Table */}
        <div style={{ flex: 1, overflow: 'auto', padding: '1rem' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-mid)', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>
                <th style={{ padding: '0.6rem 0.75rem', width: '40px' }}>#</th>
                <th style={{ padding: '0.6rem 0.75rem' }}>Column Name</th>
                <th style={{ padding: '0.6rem 0.75rem' }}>Data Type</th>
                <th style={{ padding: '0.6rem 0.75rem' }}>SQL Slug</th>
                <th style={{ padding: '0.6rem 0.75rem' }}>Configuration / Formula</th>
                <th style={{ padding: '0.6rem 0.75rem' }}>SQL Type</th>
                <th style={{ padding: '0.6rem 0.75rem', width: '90px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {columns.map((col, idx) => {
                const typeMeta = FIELD_TYPES[col.type] || FIELD_TYPES.text_single;
                const isSelected = editingIndex === idx;
                const isDragging = draggedIdx === idx;
                const isOver = dragOverIdx === idx;
                const dragClass = isDragging ? 'is-dragging' : isOver && dragPosition === 'top' ? 'drag-over-top' : isOver && dragPosition === 'bottom' ? 'drag-over-bottom' : '';

                return (
                  <tr
                    key={col.slug + idx}
                    draggable
                    onDragStart={(e) => {
                      setDraggedIdx(idx);
                      e.dataTransfer.effectAllowed = 'move';
                      e.dataTransfer.setData('text/plain', String(idx));
                    }}
                    onDragOver={(e) => {
                      e.preventDefault();
                      e.dataTransfer.dropEffect = 'move';
                      const rect = e.currentTarget.getBoundingClientRect();
                      const mid = rect.top + rect.height / 2;
                      setDragOverIdx(idx);
                      setDragPosition(e.clientY < mid ? 'top' : 'bottom');
                    }}
                    onDragLeave={() => {
                      if (dragOverIdx === idx) {
                        setDragOverIdx(null);
                        setDragPosition(null);
                      }
                    }}
                    onDrop={(e) => {
                      e.preventDefault();
                      if (draggedIdx === null || draggedIdx === idx) {
                        setDraggedIdx(null);
                        setDragOverIdx(null);
                        setDragPosition(null);
                        return;
                      }
                      const next = [...columns];
                      const [moved] = next.splice(draggedIdx, 1);
                      let targetIdx = idx;
                      if (dragPosition === 'bottom' && draggedIdx > idx) targetIdx = idx + 1;
                      else if (dragPosition === 'top' && draggedIdx < idx) targetIdx = idx - 1;
                      next.splice(Math.max(0, targetIdx), 0, moved);
                      setColumns(next);
                      setDraggedIdx(null);
                      setDragOverIdx(null);
                      setDragPosition(null);
                    }}
                    onDragEnd={() => {
                      setDraggedIdx(null);
                      setDragOverIdx(null);
                      setDragPosition(null);
                    }}
                    onClick={() => handleEditColumn(idx)}
                    className={`notion-row ${dragClass}`}
                    style={{
                      borderBottom: '1px solid var(--border-table)',
                      cursor: 'pointer',
                      background: isSelected ? 'var(--bg-row-active)' : 'transparent',
                    }}
                  >
                    <td className="td-drag-num" style={{ padding: '0.65rem 0.5rem' }}>
                      <span className="row-idx">{idx + 1}</span>
                      <span className="drag-handle" title="Drag to reorder column">⋮⋮</span>
                    </td>
                    <td style={{ padding: '0.65rem 0.75rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                      {col.name}
                    </td>
                    <td style={{ padding: '0.65rem 0.75rem' }}>
                      <span className={`badge badge-${typeMeta.category}`}>
                        <span>{typeMeta.icon}</span>
                        <span>{typeMeta.title}</span>
                      </span>
                    </td>
                    <td style={{ padding: '0.65rem 0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--accent)' }}>
                      {col.slug}
                    </td>
                    <td style={{ padding: '0.65rem 0.75rem', color: 'var(--text-tertiary)', fontSize: '12px' }}>
                      {col.metadata?.target && <span>→ Target: <strong>{col.metadata.target}</strong></span>}
                      {col.metadata?.options && <span>Options: [{col.metadata.options.join(', ')}]</span>}
                      {col.metadata?.prefix && <span>Prefix: <code>{col.metadata.prefix}</code></span>}
                      {col.metadata?.default_option && <span style={{ color: 'var(--warning)', fontFamily: 'var(--font-mono)' }}>{col.metadata.default_option}</span>}
                    </td>
                    <td style={{ padding: '0.65rem 0.75rem', fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-dim)' }}>
                      {typeMeta.sql}
                    </td>
                    <td style={{ padding: '0.65rem 0.75rem', textAlign: 'right' }}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.3rem' }}>
                        <button className="btn icon-only" onClick={(e) => { e.stopPropagation(); handleEditColumn(idx); }} title="Edit column">
                          <Edit2 size={13} />
                        </button>
                        <button className="btn icon-only danger" onClick={(e) => { e.stopPropagation(); handleDeleteColumn(idx); }} title="Delete column">
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modular Column Editor Drawer */}
      <ColumnEditorDrawer
        isOpen={editingIndex !== null}
        onClose={() => setEditingIndex(null)}
        isNew={editingIndex !== null && editingIndex >= columns.length}
        draftName={draftName}
        setDraftName={setDraftName}
        draftSlug={draftSlug}
        setDraftSlug={setDraftSlug}
        draftType={draftType}
        setDraftType={setDraftType}
        draftPrefix={draftPrefix}
        setDraftPrefix={setDraftPrefix}
        draftOptions={draftOptions}
        setDraftOptions={setDraftOptions}
        draftTarget={draftTarget}
        setDraftTarget={setDraftTarget}
        draftFormula={draftFormula}
        setDraftFormula={setDraftFormula}
        onSave={handleSaveDraft}
        availableTables={availableTables}
        isMobile={isMobile}
      />
    </div>
  );
};
