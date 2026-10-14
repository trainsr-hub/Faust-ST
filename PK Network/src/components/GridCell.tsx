import React, { useState, useRef, useEffect } from 'react';
import { Link2, Check, Copy, Tag } from 'lucide-react';
import { ColumnDefinition, TableRecord } from '../types';

interface GridCellProps {
  record: TableRecord;
  column: ColumnDefinition;
  isEditing: boolean;
  onStartEdit: () => void;
  onCancelEdit: () => void;
  onCommitEdit: (value: any) => Promise<void>;
  relationOptions?: Record<string, { id: string; label: string }[]>;
  onEnsureRelation?: (targetTable?: string) => Promise<void>;
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
}) => {
  const val = record[column.slug];
  const [draftVal, setDraftVal] = useState<any>(val ?? '');
  const [copied, setCopied] = useState<boolean>(false);
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

  // Active Inline Edit Mode
  if (isEditing) {
    if (column.type === 'enum_single') {
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
          {(column.metadata?.options || []).map((opt: string) => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
      );
    }

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
  if (Array.isArray(val)) {
    return (
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem', cursor: 'pointer' }} onClick={onStartEdit}>
        {val.length === 0 ? <span style={{ color: 'var(--text-dim)' }}>—</span> : val.map((item) => (
          <span key={item} className="badge badge-enum">
            <Tag size={10} />
            <span>{item}</span>
          </span>
        ))}
      </div>
    );
  }

  if (column.type === 'relation_single' && val) {
    return (
      <span className="badge badge-rel" style={{ cursor: 'pointer' }} onClick={onStartEdit}>
        <Link2 size={10} />
        <span>{val}</span>
      </span>
    );
  }

  if (column.type === 'enum_single' && val) {
    return (
      <span className="badge badge-enum" style={{ cursor: 'pointer' }} onClick={onStartEdit}>
        {val}
      </span>
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
