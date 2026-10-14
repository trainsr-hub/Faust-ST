import React from 'react';
import { X, Settings2 } from 'lucide-react';
import { ColumnDefinition, AtomicFieldType, FIELD_TYPES } from '../types';
import { evaluateFormula, extractDependencies } from '../services/formula';

interface ColumnEditorDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  isNew: boolean;
  draftName: string;
  setDraftName: (val: string) => void;
  draftSlug: string;
  setDraftSlug: (val: string) => void;
  draftType: AtomicFieldType;
  setDraftType: (val: AtomicFieldType) => void;
  draftPrefix: string;
  setDraftPrefix: (val: string) => void;
  draftOptions: string;
  setDraftOptions: (val: string) => void;
  draftTarget: string;
  setDraftTarget: (val: string) => void;
  draftFormula: string;
  setDraftFormula: (val: string) => void;
  onSave: () => void;
  availableTables: string[];
  isMobile: boolean;
}

export const ColumnEditorDrawer: React.FC<ColumnEditorDrawerProps> = ({
  isOpen,
  onClose,
  isNew,
  draftName,
  setDraftName,
  draftSlug,
  setDraftSlug,
  draftType,
  setDraftType,
  draftPrefix,
  setDraftPrefix,
  draftOptions,
  setDraftOptions,
  draftTarget,
  setDraftTarget,
  draftFormula,
  setDraftFormula,
  onSave,
  availableTables,
  isMobile,
}) => {
  if (!isOpen) return null;

  return (
    <aside style={{
      width: isMobile ? '100%' : '380px',
      position: isMobile ? 'absolute' : 'relative',
      top: 0,
      right: 0,
      bottom: 0,
      background: 'var(--bg-card)',
      borderLeft: '1px solid var(--border-mid)',
      display: 'flex',
      flexDirection: 'column',
      zIndex: 20,
      boxShadow: isMobile ? 'var(--shadow-lg)' : 'none',
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0.75rem 1rem',
        borderBottom: '1px solid var(--border-light)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600 }}>
          <Settings2 size={16} color="var(--accent)" />
          <span>{isNew ? 'Add New Column' : 'Edit Column Schema'}</span>
        </div>
        <button className="btn icon-only" onClick={onClose} title="Close drawer">
          <X size={15} />
        </button>
      </div>

      {/* Form Fields */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div>
          <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-tertiary)', marginBottom: '0.3rem' }}>
            Column Display Name
          </label>
          <input
            className="input-base"
            style={{ width: '100%', minHeight: '44px' }}
            value={draftName}
            onChange={(e) => {
              setDraftName(e.target.value);
              if (isNew) {
                setDraftSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, ''));
              }
            }}
          />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-tertiary)', marginBottom: '0.3rem' }}>
            SQL Slug (SQLite Column Identifier)
          </label>
          <input
            className="input-base"
            style={{ width: '100%', minHeight: '44px', fontFamily: 'var(--font-mono)' }}
            value={draftSlug}
            onChange={(e) => setDraftSlug(e.target.value)}
          />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-tertiary)', marginBottom: '0.3rem' }}>
            Atomic Data Type (10 Primitives)
          </label>
          <select
            className="input-base"
            style={{ width: '100%', minHeight: '44px' }}
            value={draftType}
            onChange={(e) => setDraftType(e.target.value as AtomicFieldType)}
          >
            {Object.entries(FIELD_TYPES).map(([typeKey, meta]) => (
              <option key={typeKey} value={typeKey}>
                {meta.icon} {meta.title} ({meta.sql})
              </option>
            ))}
          </select>
        </div>

        {/* Dynamic Metadata configs */}
        {draftType === 'hex_id' && (
          <div>
            <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-tertiary)', marginBottom: '0.3rem' }}>
              Hex ID Prefix
            </label>
            <input
              className="input-base"
              style={{ width: '100%', minHeight: '44px', fontFamily: 'var(--font-mono)' }}
              placeholder="e.g. CONT, SPEC, QUOT"
              value={draftPrefix}
              onChange={(e) => setDraftPrefix(e.target.value)}
            />
          </div>
        )}

        {(draftType === 'enum_single' || draftType === 'enum_multi') && (
          <div>
            <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-tertiary)', marginBottom: '0.3rem' }}>
              Enum Options (comma-separated)
            </label>
            <textarea
              className="input-base"
              rows={3}
              style={{ width: '100%', minHeight: '60px', resize: 'vertical' }}
              placeholder="option1, option2, option3"
              value={draftOptions}
              onChange={(e) => setDraftOptions(e.target.value)}
            />
          </div>
        )}

        {(draftType === 'relation_single' || draftType === 'relation_multi') && (
          <div>
            <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-tertiary)', marginBottom: '0.3rem' }}>
              Foreign Target Table
            </label>
            <select
              className="input-base"
              style={{ width: '100%', minHeight: '44px' }}
              value={draftTarget}
              onChange={(e) => setDraftTarget(e.target.value)}
            >
              {availableTables.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
        )}

        <div>
          <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-tertiary)', marginBottom: '0.3rem' }}>
            Formula Engine & Default Calculation
          </label>
          <input
            className="input-base"
            style={{ width: '100%', minHeight: '44px', fontFamily: 'var(--font-mono)' }}
            placeholder="=MAX(idx) + 1 or =[quantity] * [price]"
            value={draftFormula}
            onChange={(e) => setDraftFormula(e.target.value)}
          />

          {/* Formula Quick Presets */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem', marginTop: '0.4rem' }}>
            <button
              type="button"
              className="btn"
              style={{ padding: '0.2rem 0.5rem', fontSize: '11px', fontFamily: 'var(--font-mono)' }}
              onClick={() => setDraftFormula(`=MAX(${draftSlug || 'idx'}) + 1`)}
            >
              ⚡ =MAX({draftSlug || 'idx'}) + 1
            </button>
            <button
              type="button"
              className="btn"
              style={{ padding: '0.2rem 0.5rem', fontSize: '11px', fontFamily: 'var(--font-mono)' }}
              onClick={() => setDraftFormula('=COUNT() + 1')}
            >
              🔢 =COUNT() + 1
            </button>
            <button
              type="button"
              className="btn"
              style={{ padding: '0.2rem 0.5rem', fontSize: '11px', fontFamily: 'var(--font-mono)' }}
              onClick={() => setDraftFormula('=TODAY()')}
            >
              📅 =TODAY()
            </button>
          </div>

          {/* Live Formula Preview */}
          {draftFormula && draftFormula.startsWith('=') && (
            <div style={{
              marginTop: '0.6rem',
              padding: '0.5rem 0.75rem',
              borderRadius: 'var(--radius-sm)',
              background: 'var(--bg-canvas)',
              border: '1px solid var(--border-light)',
              fontSize: '12px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-tertiary)' }}>Live Formula Preview:</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--accent)' }}>
                  {String(evaluateFormula(draftFormula, [], {}, draftSlug))}
                </span>
              </div>
              {extractDependencies(draftFormula).length > 0 && (
                <div style={{ marginTop: '0.3rem', fontSize: '11px', color: 'var(--c-rel)' }}>
                  🔗 Depends on: {extractDependencies(draftFormula).map((d) => `[${d}]`).join(', ')}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Footer Save */}
      <div style={{
        padding: '0.75rem 1rem',
        borderTop: '1px solid var(--border-light)',
        display: 'flex',
        gap: '0.5rem',
      }}>
        <button className="btn" style={{ flex: 1, minHeight: '44px' }} onClick={onClose}>
          Cancel
        </button>
        <button className="btn primary" style={{ flex: 1, minHeight: '44px' }} onClick={onSave}>
          Save Column
        </button>
      </div>
    </aside>
  );
};
