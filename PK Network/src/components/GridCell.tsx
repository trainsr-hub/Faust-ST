import React, { useState, useRef, useEffect } from 'react';
import { Link2, Check, Copy, Plus } from 'lucide-react';
import { ColumnDefinition, TableRecord } from '../types';
import { NotionMultiSelectPopover, NotionTagPill, parseMultiValue } from './NotionMultiSelect';

interface GridCellProps {
  record: TableRecord;
  column: ColumnDefinition;
  isEditing: boolean;
  onStartEdit: () => void;
  onCancelEdit: () => void;
  onCommitEdit: (value: any) => Promise<void>;
  relationOptions?: Record<string, { id: string; label: string }[]>;
  onEnsureRelation?: (targetTable?: string) => Promise<void>;
  suggestedOptions?: string[];
  onAddOption?: (newOption: string) => void;
}

export const GridCell: React.FC<GridCellProps> = ({
  record,
  column,
  isEditing,
  onStartEdit,
  onCancelEdit,
  onCommitEdit,
  relationOptions = {},
  onEnsureRelation,
  suggestedOptions = [],
  onAddOption,
}) => {
  const val = record[column.slug];
  const [draftVal, setDraftVal] = useState<any>(val ?? '');
  const [copied, setCopied] = useState<boolean>(false);
  const cellRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setDraftVal(val ?? '');
  }, [val]);

  useEffect(() => {
    if (isEditing) {
      if ((column.type === 'relation_single' || column.type === 'relation_multi') && column.metadata?.target) {
        onEnsureRelation?.(column.metadata.target);
      }
      if (inputRef.current) {
        inputRef.current.focus();
        inputRef.current.select();
      }
    }
  }, [isEditing]);

  const handleCopyId = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (val) {
      navigator.clipboard.writeText(String(val));
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      onCommitEdit(draftVal);
    } else if (e.key === 'Escape') {
      setDraftVal(val ?? '');
      onCancelEdit();
    }
  };

  // Render Hex ID with 1-click clipboard copy
  if (column.type === 'hex_id') {
    return (
      <div
        onClick={handleCopyId}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.35rem',
          fontFamily: 'var(--font-mono)',
          color: 'var(--accent)',
          fontWeight: 600,
          fontSize: '12px',
          cursor: 'pointer',
          padding: '0.2rem 0.4rem',
          borderRadius: 'var(--radius-sm)',
          background: copied ? 'rgba(16, 185, 129, 0.15)' : 'transparent',
          transition: 'all 0.15s ease',
        }}
        title="Click to copy ID"
      >
        <span>{val || '—'}</span>
        {copied ? <Check size={12} color="var(--success)" /> : <Copy size={11} style={{ opacity: 0.5 }} />}
      </div>
    );
  }

  // Render Boolean
  if (column.type === 'boolean') {
    const isChecked = val === 1 || val === true || val === '1';
    return (
      <div style={{ display: 'flex', alignItems: 'center', height: '100%' }}>
        <input
          type="checkbox"
          checked={isChecked}
          onChange={(e) => onCommitEdit(e.target.checked ? 1 : 0)}
          style={{ width: '18px', height: '18px', accentColor: 'var(--accent)', cursor: 'pointer' }}
          title={isChecked ? 'True (Click to toggle)' : 'False (Click to toggle)'}
        />
      </div>
    );
  }

  // Notion-Style Multi-Select: Enum Multi
  if (column.type === 'enum_multi') {
    const selectedList = parseMultiValue(val);
    const availableOptions = Array.from(new Set([...(column.metadata?.options || []), ...suggestedOptions]));

    const handleRemoveTag = (tagToRemove: string) => {
      const next = selectedList.filter((t) => t !== tagToRemove);
      onCommitEdit(next);
    };

    return (
      <div
        ref={cellRef}
        onClick={onStartEdit}
        style={{
          width: '100%',
          minHeight: '28px',
          display: 'flex',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '0.3rem',
          cursor: 'pointer',
          padding: '0.1rem 0',
        }}
      >
        {selectedList.length === 0 ? (
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.25rem',
              color: 'var(--text-dim)',
              fontSize: '11.5px',
              padding: '0.1rem 0.35rem',
              borderRadius: 'var(--radius-sm)',
              border: '1px dashed transparent',
              transition: 'all 0.15s ease',
            }}
            className="notion-tag-empty-btn"
          >
            <Plus size={11} />
            <span>Add tag</span>
          </span>
        ) : (
          selectedList.map((tag) => (
            <NotionTagPill
              key={tag}
              tag={tag}
              onRemove={() => handleRemoveTag(tag)}
            />
          ))
        )}

        {/* Floating Notion Multi-Select Popover Menu with Live Auto-Suggestions */}
        {isEditing && (
          <NotionMultiSelectPopover
            selected={selectedList}
            options={availableOptions}
            anchorRect={cellRef.current?.getBoundingClientRect() || null}
            onChange={(newSelected) => {
              onCommitEdit(newSelected);
            }}
            onCreateOption={(newOpt) => {
              onAddOption?.(newOpt);
            }}
            onClose={onCancelEdit}
          />
        )}
      </div>
    );
  }

  // Notion-Style Single-Select: Enum Single
  if (column.type === 'enum_single') {
    const currentVal = val ? String(val) : '';
    const selectedList = currentVal ? [currentVal] : [];
    const availableOptions = Array.from(new Set([...(column.metadata?.options || []), ...suggestedOptions]));

    return (
      <div
        ref={cellRef}
        onClick={onStartEdit}
        style={{
          width: '100%',
          minHeight: '28px',
          display: 'flex',
          alignItems: 'center',
          cursor: 'pointer',
        }}
      >
        {!currentVal ? (
          <span style={{ color: 'var(--text-dim)', fontSize: '12px' }}>—</span>
        ) : (
          <NotionTagPill tag={currentVal} />
        )}

        {/* Floating Notion Single-Select Popover Menu with Live Auto-Suggestions */}
        {isEditing && (
          <NotionMultiSelectPopover
            selected={selectedList}
            options={availableOptions}
            isSingle={true}
            anchorRect={cellRef.current?.getBoundingClientRect() || null}
            onChange={(newSelected) => {
              onCommitEdit(newSelected[0] || '');
            }}
            onCreateOption={(newOpt) => {
              onAddOption?.(newOpt);
            }}
            onClose={onCancelEdit}
          />
        )}
      </div>
    );
  }

  // Active Inline Edit Mode for Other Types
  if (isEditing) {
    if (column.type === 'relation_single') {
      const rels = relationOptions[column.metadata?.target || ''] || [];
      return (
        <select
          className="input-base"
          style={{ width: '100%', minHeight: '34px', padding: '0.2rem 0.4rem' }}
          value={draftVal}
          onChange={(e) => {
            setDraftVal(e.target.value);
            onCommitEdit(e.target.value);
          }}
          onBlur={onCancelEdit}
          autoFocus
        >
          <option value="">-- None --</option>
          {rels.map((r) => (
            <option key={r.id} value={r.id}>{r.id} — {r.label}</option>
          ))}
        </select>
      );
    }

    return (
      <input
        ref={inputRef}
        type={column.type === 'int_scalar' || column.type === 'float_scalar' ? 'number' : 'text'}
        step={column.type === 'float_scalar' ? '0.01' : '1'}
        className="input-base"
        style={{ width: '100%', minHeight: '34px', padding: '0.2rem 0.5rem', fontSize: '13px' }}
        value={draftVal}
        onChange={(e) => setDraftVal(e.target.value)}
        onBlur={() => onCommitEdit(draftVal)}
        onKeyDown={handleKeyDown}
      />
    );
  }

  // Static Presentation Renderers
  if (column.type === 'relation_single' && val) {
    return (
      <span className="badge badge-rel" style={{ cursor: 'pointer' }} onClick={onStartEdit}>
        <Link2 size={10} />
        <span>{val}</span>
      </span>
    );
  }

  if (Array.isArray(val)) {
    return (
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem', cursor: 'pointer' }} onClick={onStartEdit}>
        {val.length === 0 ? <span style={{ color: 'var(--text-dim)' }}>—</span> : val.map((item) => (
          <NotionTagPill key={item} tag={String(item)} />
        ))}
      </div>
    );
  }

  return (
    <div
      onClick={onStartEdit}
      style={{
        width: '100%',
        minHeight: '26px',
        display: 'flex',
        alignItems: 'center',
        cursor: 'text',
        color: val !== null && val !== undefined && val !== '' ? 'var(--text-primary)' : 'var(--text-dim)',
      }}
    >
      {val !== null && val !== undefined && val !== '' ? String(val) : '—'}
    </div>
  );
};
