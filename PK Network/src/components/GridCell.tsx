import React, { useState, useRef, useEffect } from 'react';
import { Plus, ExternalLink } from 'lucide-react';
import { ColumnDefinition, TableRecord } from '../types';
import {
  NotionMultiSelectPopover,
  NotionTagPill,
  parseMultiValue,
  RelationMultiSelectPopover,
  RelationTagPill,
} from './NotionMultiSelect';
import { buildDualTableRelationOptions, resolveRelationLabel } from '../services/relationFilter';
import { HexIdCell } from './HexIdCell';
import { JsonMatrixCell, parseAsObject } from './JsonMatrixCell';

export interface GridCellProps {
  record: TableRecord; column: ColumnDefinition; isEditing: boolean;
  onStartEdit: () => void; onCancelEdit: () => void;
  onCommitEdit: (value: any, shouldClose?: boolean) => Promise<void>;
  relationOptions?: Record<string, { id: string; label: string }[]>;
  relationStore?: Record<string, Record<string, TableRecord>>;
  onEnsureRelation?: (targetTable?: string) => Promise<void>;
  suggestedOptions?: string[]; branchPinnedOptions?: string[];
  onAddOption?: (newOption: string) => void;
  onDeleteOption?: (option: string) => void;
}

export const GridCell: React.FC<GridCellProps> = ({
  record, column, isEditing, onStartEdit, onCancelEdit, onCommitEdit,
  relationOptions = {}, relationStore = {}, onEnsureRelation,
  suggestedOptions = [], branchPinnedOptions = [], onAddOption, onDeleteOption,
}) => {
  const val = record[column.slug];
  const detectedUrl = typeof val === 'string' ? (val.match(/https?:\/\/[^\s"'<>()[\]]+/)?.[0]?.replace(/[.,;:!?)]+$/, '') || null) : null;
  const handleContextMenu = (e: React.MouseEvent) => {
    if (detectedUrl) {
      e.preventDefault();
      window.open(detectedUrl, '_blank', 'noopener,noreferrer');
    }
  };
  const formatValForInput = (v: any) => (v === null || v === undefined ? '' : typeof v === 'object' ? JSON.stringify(v) : String(v));
  const [draftVal, setDraftVal] = useState<any>(() => formatValForInput(val));
  const cellRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { setDraftVal(formatValForInput(val)); }, [val]);

  useEffect(() => {
    if (column.type === 'relation_single' || column.type === 'relation_multi') {
      if (column.metadata?.target) onEnsureRelation?.(column.metadata.target);
      if (column.metadata?.secondary_target) onEnsureRelation?.(column.metadata.secondary_target);
    }
    if (isEditing && inputRef.current) { inputRef.current.focus(); inputRef.current.select(); }
  }, [column.type, column.metadata?.target, column.metadata?.secondary_target, isEditing]);

  const getResolvedLabel = (relId: string): string => {
    return resolveRelationLabel(
      relId,
      column.metadata?.target,
      column.metadata?.target_field,
      relationStore,
      relationOptions?.[column.metadata?.target || ''],
      column.metadata?.secondary_target,
      column.metadata?.secondary_target_field
    );
  };

  const getColumnOptions = () => {
    const t1 = column.metadata?.target;
    const t2 = column.metadata?.secondary_target;
    if (!t1 && !t2) return [];
    const r1 = t1 && relationStore?.[t1] ? Object.values(relationStore[t1]) : [];
    const r2 = t2 && relationStore?.[t2] ? Object.values(relationStore[t2]) : [];
    return buildDualTableRelationOptions(
      r1, t1, column.metadata?.target_field, column.metadata?.filter_rule,
      r2, t2, column.metadata?.secondary_target_field, column.metadata?.secondary_filter_rule
    );
  };

  const handleCommitDraft = () => {
    let finalVal: any = draftVal;
    if (typeof draftVal === 'string') {
      const t = draftVal.trim();
      if ((t.startsWith('{') && t.endsWith('}')) || (t.startsWith('[') && t.endsWith(']'))) {
        try { finalVal = JSON.parse(t); } catch {}
      }
    }
    onCommitEdit(finalVal);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleCommitDraft();
    else if (e.key === 'Escape') { setDraftVal(formatValForInput(val)); onCancelEdit(); }
  };

  // 1. Hex ID with 1-click clipboard copy
  if (column.type === 'hex_id') return <HexIdCell value={val} />;

  // 2. Boolean
  if (column.type === 'boolean') {
    const isChecked = val === 1 || val === true || val === '1';
    return (
      <div style={{ display: 'flex', alignItems: 'center', height: '100%' }}>
        <input
          type="checkbox" checked={isChecked} onChange={(e) => onCommitEdit(e.target.checked ? 1 : 0)}
          style={{ width: '18px', height: '18px', accentColor: 'var(--accent)', cursor: 'pointer' }}
          title={isChecked ? 'True (Click to toggle)' : 'False (Click to toggle)'}
        />
      </div>
    );
  }

  // 3. Notion-Style Multi-Select: Enum Multi
  if (column.type === 'enum_multi') {
    const selectedList = parseMultiValue(val);
    const availableOptions = Array.from(new Set([...(column.metadata?.options || []), ...suggestedOptions]));
    return (
      <div
        ref={cellRef}
        onClick={onStartEdit}
        style={{ width: '100%', minHeight: '28px', display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '0.3rem', cursor: 'pointer', padding: '0.1rem 0' }}
      >
        {selectedList.length === 0 ? (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', color: 'var(--text-dim)', fontSize: '11.5px', padding: '0.1rem 0.35rem' }}>
            <Plus size={11} /><span>Add tag</span>
          </span>
        ) : (
          selectedList.map((tag, idx) => (
            <NotionTagPill key={`${tag}_${idx}`} tag={tag} onRemove={() => onCommitEdit(selectedList.filter((_, i) => i !== idx), false)} />
          ))
        )}
        {isEditing && (
          <NotionMultiSelectPopover
            selected={selectedList}
            options={availableOptions}
            pinnedOptions={branchPinnedOptions}
            anchorRect={cellRef.current?.getBoundingClientRect() || null}
            onChange={(newSelected) => onCommitEdit(newSelected, false)}
            onCreateOption={(newOpt) => onAddOption?.(newOpt)}
            onDeleteOption={onDeleteOption}
            onClose={onCancelEdit}
          />
        )}
      </div>
    );
  }

  // 4. Notion-Style Single-Select: Enum Single
  if (column.type === 'enum_single') {
    const currentVal = val ? String(val) : '';
    const selectedList = currentVal ? [currentVal] : [];
    const availableOptions = Array.from(new Set([...(column.metadata?.options || []), ...suggestedOptions]));
    return (
      <div
        ref={cellRef}
        onClick={onStartEdit}
        style={{ width: '100%', minHeight: '28px', display: 'flex', alignItems: 'center', cursor: 'pointer' }}
      >
        {!currentVal ? <span style={{ color: 'var(--text-dim)', fontSize: '12px' }}>—</span> : <NotionTagPill tag={currentVal} />}
        {isEditing && (
          <NotionMultiSelectPopover
            selected={selectedList}
            options={availableOptions}
            pinnedOptions={branchPinnedOptions}
            isSingle={true}
            anchorRect={cellRef.current?.getBoundingClientRect() || null}
            onChange={(newSelected) => onCommitEdit(newSelected[0] || '')}
            onCreateOption={(newOpt) => onAddOption?.(newOpt)}
            onDeleteOption={onDeleteOption}
            onClose={onCancelEdit}
          />
        )}
      </div>
    );
  }

  // 5. Notion-Style Relation Single & Multi-Select
  if (column.type === 'relation_single' || column.type === 'relation_multi') {
    const isSingle = column.type === 'relation_single';
    const selectedIds = isSingle ? (val ? [String(val)] : []) : parseMultiValue(val);
    const options = getColumnOptions();
    return (
      <div
        ref={cellRef}
        onClick={onStartEdit}
        style={{ width: '100%', minHeight: '28px', display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '0.3rem', cursor: 'pointer', padding: '0.1rem 0' }}
      >
        {selectedIds.length === 0 ? (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', color: 'var(--text-dim)', fontSize: '11.5px', padding: '0.1rem 0.35rem' }}>
            <Plus size={11} /><span>Link record</span>
          </span>
        ) : (
          selectedIds.map((id, idx) => (
            <RelationTagPill
              key={`${id}_${idx}`}
              id={id}
              label={getResolvedLabel(id)}
              onRemove={isSingle ? undefined : () => onCommitEdit(selectedIds.filter((_, i) => i !== idx), false)}
            />
          ))
        )}
        {isEditing && (
          <RelationMultiSelectPopover
            selected={selectedIds}
            options={options}
            isSingle={isSingle}
            pinnedIds={branchPinnedOptions}
            anchorRect={cellRef.current?.getBoundingClientRect() || null}
            onChange={(newSelected) => onCommitEdit(isSingle ? (newSelected[0] || '') : newSelected, !isSingle ? false : true)}
            onClose={onCancelEdit}
          />
        )}
      </div>
    );
  }

  // 5.5 Visual Matrix & JSON Object Handling
  const parsedObject = parseAsObject(val);
  if (parsedObject !== null) {
    return (
      <div ref={cellRef} style={{ width: '100%' }}>
        <JsonMatrixCell
          value={val}
          columnName={column.name}
          isEditing={isEditing}
          onStartEdit={onStartEdit}
          onCancelEdit={onCancelEdit}
          onCommitEdit={onCommitEdit}
          anchorRect={cellRef.current?.getBoundingClientRect() || null}
        />
      </div>
    );
  }

  // 6. Active Inline Edit for Other Types
  if (isEditing) {
    return (
      <input
        ref={inputRef}
        type={column.type === 'int_scalar' || column.type === 'float_scalar' ? 'number' : 'text'}
        step={column.type === 'float_scalar' ? '0.01' : '1'}
        className="input-base"
        style={{ width: '100%', minHeight: '34px', padding: '0.2rem 0.5rem', fontSize: '13px' }}
        value={draftVal}
        onChange={(e) => setDraftVal(e.target.value)}
        onBlur={handleCommitDraft}
        onKeyDown={handleKeyDown}
      />
    );
  }

  // 8. Array of Tags Fallback
  if (Array.isArray(val)) {
    return (
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem', cursor: 'pointer' }} onClick={onStartEdit}>
        {val.length === 0 ? <span style={{ color: 'var(--text-dim)' }}>—</span> : val.map((item, idx) => {
          const l = typeof item === 'object' && item !== null
            ? (item.conditionId ? `${item.conditionId}: ${item.setValue ?? item.expectedValue ? 'TRUE' : 'FALSE'}` : (item.name || item.tag || item.label || JSON.stringify(item)))
            : String(item);
          return <NotionTagPill key={`${l}_${idx}`} tag={l} />;
        })}
      </div>
    );
  }

  // 9. Default Text Presentation
  return (
    <div
      onClick={onStartEdit}
      onContextMenu={handleContextMenu}
      title={detectedUrl ? `Right-click to open link: ${detectedUrl}` : undefined}
      style={{
        width: '100%',
        minHeight: '26px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        cursor: 'text',
        color: val !== null && val !== undefined && val !== '' ? 'var(--text-primary)' : 'var(--text-dim)',
      }}
    >
      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1, minWidth: 0 }}>
        {val !== null && val !== undefined && val !== '' ? (typeof val === 'object' ? JSON.stringify(val) : String(val)) : '—'}
      </span>
      {detectedUrl && (
        <a
          href={detectedUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          title={`Right-click cell or click to open: ${detectedUrl}`}
          style={{ display: 'inline-flex', alignItems: 'center', marginLeft: '6px', color: 'var(--accent)', opacity: 0.75, flexShrink: 0 }}
        >
          <ExternalLink size={12} />
        </a>
      )}
    </div>
  );
};
