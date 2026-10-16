import React, { useState, useEffect } from 'react';
import { X, Save, Trash2, Check, Plus, Link2 } from 'lucide-react';
import { TableSchema, TableRecord, ColumnDefinition } from '../types';
import { NotionTagPill, parseMultiValue, getTagColor, RelationTagPill } from './NotionMultiSelect';
import { buildDualTableRelationOptions, resolveRelationLabel } from '../services/relationFilter';

interface MobileRecordDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  schema: TableSchema;
  record: TableRecord | null;
  onSave: (record: Partial<TableRecord>) => Promise<void>;
  onDelete?: (id: string) => Promise<void>;
  isSaving: boolean;
  relationOptions?: Record<string, { id: string; label: string }[]>;
  relationStore?: Record<string, Record<string, TableRecord>>;
  allRecords?: TableRecord[];
}

export const MobileRecordDrawer: React.FC<MobileRecordDrawerProps> = ({
  isOpen,
  onClose,
  schema,
  record,
  onSave,
  onDelete,
  isSaving,
  relationOptions = {},
  relationStore = {},
  allRecords = [],
}) => {
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [newTagInput, setNewTagInput] = useState<Record<string, string>>({});

  // Resolve human-readable relation label across single or dual target tables
  const getResolvedRelationLabel = (col: ColumnDefinition, relId: string): string => {
    return resolveRelationLabel(
      relId,
      col.metadata?.target,
      col.metadata?.target_field,
      relationStore,
      relationOptions?.[col.metadata?.target || ''],
      col.metadata?.secondary_target,
      col.metadata?.secondary_target_field
    );
  };

  // Get available options formatted across primary and secondary target tables
  const getColRelationOptions = (col: ColumnDefinition) => {
    const t1 = col.metadata?.target;
    const t2 = col.metadata?.secondary_target;
    if (!t1 && !t2) return [];
    const r1 = t1 && relationStore?.[t1] ? Object.values(relationStore[t1]) : [];
    const r2 = t2 && relationStore?.[t2] ? Object.values(relationStore[t2]) : [];
    return buildDualTableRelationOptions(
      r1, t1, col.metadata?.target_field, col.metadata?.filter_rule,
      r2, t2, col.metadata?.secondary_target_field, col.metadata?.secondary_filter_rule,
      schema.table_name
    );
  };

  useEffect(() => {
    if (record) {
      setFormData({ ...record });
    } else {
      // Initialize with default values
      const initial: Record<string, any> = {};
      schema.columns.forEach((col) => {
        if (col.type === 'boolean') initial[col.slug] = 0;
        else if (col.type === 'enum_multi' || col.type === 'relation_multi') initial[col.slug] = [];
        else initial[col.slug] = '';
      });
      setFormData(initial);
    }
  }, [record, schema]);

  if (!isOpen) return null;

  const isEditing = Boolean(record && record.id);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = { ...formData };
    for (const [k, v] of Object.entries(payload)) {
      if (typeof v === 'string' && (v.trim().startsWith('{') || v.trim().startsWith('['))) {
        try {
          payload[k] = JSON.parse(v);
        } catch {}
      }
    }
    await onSave(payload);
    onClose();
  };

  const handleFieldChange = (slug: string, value: any) => {
    setFormData((prev) => ({ ...prev, [slug]: value }));
  };

  const toggleMultiItem = (slug: string, item: string) => {
    const list = parseMultiValue(formData[slug]);
    const idx = list.indexOf(item);
    if (idx >= 0) {
      list.splice(idx, 1);
    } else {
      list.push(item);
    }
    handleFieldChange(slug, list);
  };

  const handleAddCustomTag = (slug: string) => {
    const tag = (newTagInput[slug] || '').trim();
    if (!tag) return;
    const list = parseMultiValue(formData[slug]);
    if (!list.includes(tag)) {
      list.push(tag);
      handleFieldChange(slug, list);
    }
    setNewTagInput((prev) => ({ ...prev, [slug]: '' }));
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 1000,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'flex-end',
      background: 'rgba(0, 0, 0, 0.7)',
      backdropFilter: 'blur(4px)',
    }}>
      {/* Drawer Container */}
      <div style={{
        background: 'var(--bg-card)',
        borderTop: '1px solid var(--border-mid)',
        borderTopLeftRadius: 'var(--radius-lg)',
        borderTopRightRadius: 'var(--radius-lg)',
        maxHeight: '90vh',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: 'var(--shadow-lg)',
        animation: 'slideUp 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '1rem',
          borderBottom: '1px solid var(--border-light)',
        }}>
          <div>
            <h3 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)' }}>
              {isEditing ? `Edit Record #${record?.id}` : `New Record in "${schema.table_name}"`}
            </h3>
            <span style={{ fontSize: '11px', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>
              Turso Cloud Sync
            </span>
          </div>

          <div style={{ display: 'flex', gap: '0.4rem' }}>
            {isEditing && onDelete && (
              <button
                type="button"
                className="btn icon-only danger"
                onClick={() => {
                  if (confirm(`Are you sure you want to delete record ${record?.id}?`)) {
                    onDelete(record!.id);
                    onClose();
                  }
                }}
                title="Delete Record"
              >
                <Trash2 size={16} />
              </button>
            )}
            <button type="button" className="btn icon-only" onClick={onClose}>
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} style={{ flex: 1, overflowY: 'auto', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
          {schema.columns
            .filter((c) => c.type !== 'hex_id' && c.slug !== 'id')
            .map((col) => {
              const val = formData[col.slug] ?? '';

              return (
                <div key={col.slug}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                    <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>
                      {col.name}
                    </label>
                    <span style={{ fontSize: '10px', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>
                      {col.slug}
                    </span>
                  </div>

                  {/* Render input based on atomic type */}
                  {col.type === 'text_multi' ? (
                    <textarea
                      className="input-base"
                      rows={4}
                      style={{ width: '100%', minHeight: '80px', resize: 'vertical', fontFamily: typeof val === 'object' && val !== null ? 'var(--font-mono)' : 'inherit', fontSize: typeof val === 'object' && val !== null ? '12px' : 'inherit' }}
                      value={typeof val === 'object' && val !== null ? JSON.stringify(val, null, 2) : val}
                      onChange={(e) => handleFieldChange(col.slug, e.target.value)}
                    />
                  ) : col.type === 'boolean' ? (
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', cursor: 'pointer', minHeight: '48px', padding: '0 0.5rem', background: 'var(--bg-canvas)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-light)' }}>
                    <input
                      type="checkbox"
                      checked={val === 1 || val === true || val === '1'}
                      onChange={(e) => handleFieldChange(col.slug, e.target.checked ? 1 : 0)}
                      style={{ width: '20px', height: '20px', accentColor: 'var(--accent)' }}
                    />
                    <span style={{ fontSize: '13px', color: 'var(--text-primary)', fontWeight: 500 }}>
                      {val === 1 || val === true || val === '1' ? 'Enabled (True)' : 'Disabled (False)'}
                    </span>
                  </label>
                ) : col.type === 'int_scalar' || col.type === 'float_scalar' ? (
                  <input
                    type="number"
                    step={col.type === 'float_scalar' ? '0.01' : '1'}
                    className="input-base"
                    style={{ width: '100%', minHeight: '48px', fontFamily: 'var(--font-mono)' }}
                    value={val}
                    onChange={(e) => handleFieldChange(col.slug, e.target.value === '' ? '' : Number(e.target.value))}
                  />
                ) : col.type === 'enum_single' ? (
                  <select
                    className="input-base"
                    style={{ width: '100%', minHeight: '48px' }}
                    value={val}
                    onChange={(e) => handleFieldChange(col.slug, e.target.value)}
                  >
                    <option value="">-- Select an option --</option>
                    {(col.metadata?.options || []).map((opt: string) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                ) : col.type === 'enum_multi' ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', marginTop: '0.2rem' }}>
                    {/* Selected Tags Display */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', minHeight: '32px', alignItems: 'center' }}>
                      {parseMultiValue(val).length === 0 ? (
                        <span style={{ color: 'var(--text-dim)', fontSize: '12px' }}>No tags selected</span>
                      ) : (
                        parseMultiValue(val).map((tag: string) => (
                          <NotionTagPill
                            key={tag}
                            tag={tag}
                            onRemove={() => toggleMultiItem(col.slug, tag)}
                            style={{ fontSize: '12.5px', padding: '0.25rem 0.6rem' }}
                          />
                        ))
                      )}
                    </div>

                    {/* Predefined & Dynamically Discovered Options Toggles */}
                    {(() => {
                      const optSet = new Set<string>(col.metadata?.options || []);
                      for (const r of allRecords) {
                        const raw = r[col.slug];
                        if (Array.isArray(raw)) raw.forEach((item) => item && optSet.add(String(item).trim()));
                        else if (typeof raw === 'string') parseMultiValue(raw).forEach((item) => item && optSet.add(item.trim()));
                      }
                      const allColOptions = Array.from(optSet).filter(Boolean);
                      if (allColOptions.length === 0) return null;

                      return (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', paddingTop: '0.4rem', borderTop: '1px solid var(--border-table)' }}>
                          {allColOptions.map((opt: string) => {
                            const isSelected = parseMultiValue(val).includes(opt);
                            const color = getTagColor(opt);
                            return (
                              <button
                                key={opt}
                                type="button"
                                onClick={() => toggleMultiItem(col.slug, opt)}
                                style={{
                                  minHeight: '34px',
                                  padding: '0.25rem 0.65rem',
                                  borderRadius: 'var(--radius-sm)',
                                  border: isSelected ? `1px solid ${color.border}` : '1px solid var(--border-light)',
                                  background: isSelected ? color.bg : 'var(--bg-canvas)',
                                  color: isSelected ? color.text : 'var(--text-tertiary)',
                                  fontSize: '11.5px',
                                  fontWeight: isSelected ? 600 : 400,
                                  cursor: 'pointer',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '0.35rem',
                                  transition: 'all 0.15s ease',
                                }}
                              >
                                {isSelected && <Check size={12} />}
                                <span>{opt}</span>
                              </button>
                            );
                          })}
                        </div>
                      );
                    })()}

                    {/* Inline Add Custom Tag Input */}
                    <div style={{ display: 'flex', gap: '0.4rem', marginTop: '0.2rem' }}>
                      <input
                        type="text"
                        placeholder="Type new tag..."
                        className="input-base"
                        style={{ flex: 1, minHeight: '36px', fontSize: '12px' }}
                        value={newTagInput[col.slug] || ''}
                        onChange={(e) => setNewTagInput((prev) => ({ ...prev, [col.slug]: e.target.value }))}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddCustomTag(col.slug);
                          }
                        }}
                      />
                      <button
                        type="button"
                        className="btn"
                        onClick={() => handleAddCustomTag(col.slug)}
                        style={{ minHeight: '36px', padding: '0 0.75rem', fontSize: '12px' }}
                      >
                        <Plus size={13} />
                        <span>Add</span>
                      </button>
                    </div>
                  </div>
                ) : col.type === 'relation_single' ? (
                  <select
                    className="input-base"
                    style={{ width: '100%', minHeight: '48px' }}
                    value={val}
                    onChange={(e) => handleFieldChange(col.slug, e.target.value)}
                  >
                    <option value="">-- Select relation --</option>
                    {getColRelationOptions(col).map((rel) => (
                      <option key={rel.id} value={rel.id}>
                        {rel.label}
                      </option>
                    ))}
                  </select>
                ) : col.type === 'relation_multi' ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', marginTop: '0.2rem' }}>
                    {/* Selected Relations Display */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', minHeight: '32px', alignItems: 'center' }}>
                      {parseMultiValue(val).length === 0 ? (
                        <span style={{ color: 'var(--text-dim)', fontSize: '12px' }}>No relations linked</span>
                      ) : (
                        parseMultiValue(val).map((relId: string) => (
                          <RelationTagPill
                            key={relId}
                            id={relId}
                            label={getResolvedRelationLabel(col, relId)}
                            onRemove={() => toggleMultiItem(col.slug, relId)}
                            style={{ fontSize: '12.5px', padding: '0.25rem 0.6rem' }}
                          />
                        ))
                      )}
                    </div>

                    {/* Predefined Relation Options from Target Table */}
                    {(() => {
                      const colOpts = getColRelationOptions(col);
                      if (colOpts.length === 0) {
                        return (
                          <div style={{ fontSize: '11px', color: 'var(--text-dim)', fontStyle: 'italic' }}>
                            Loading target records...
                          </div>
                        );
                      }
                      return (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', paddingTop: '0.4rem', borderTop: '1px solid var(--border-table)' }}>
                          {colOpts.map((rel) => {
                            const isSelected = parseMultiValue(val).includes(rel.id);
                            return (
                              <button
                                key={rel.id}
                                type="button"
                                onClick={() => toggleMultiItem(col.slug, rel.id)}
                                title={`ID: ${rel.id}`}
                                style={{
                                  minHeight: '34px',
                                  padding: '0.25rem 0.65rem',
                                  borderRadius: 'var(--radius-sm)',
                                  border: isSelected ? '1px solid var(--accent)' : '1px solid var(--border-light)',
                                  background: isSelected ? 'rgba(56, 189, 248, 0.14)' : 'var(--bg-canvas)',
                                  color: isSelected ? 'var(--accent)' : 'var(--text-tertiary)',
                                  fontSize: '11.5px',
                                  fontWeight: isSelected ? 600 : 400,
                                  cursor: 'pointer',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '0.35rem',
                                  transition: 'all 0.15s ease',
                                }}
                              >
                                {isSelected ? <Check size={12} /> : <Link2 size={11} style={{ opacity: 0.7 }} />}
                                <span>{rel.label}</span>
                              </button>
                            );
                          })}
                        </div>
                      );
                    })()}
                  </div>
                ) : (
                  <input
                    className="input-base"
                    style={{ width: '100%', minHeight: '48px' }}
                    value={typeof val === 'object' && val !== null ? JSON.stringify(val) : val}
                    onChange={(e) => handleFieldChange(col.slug, e.target.value)}
                  />
                )}
              </div>
            );
          })}

          {/* Sticky Bottom Actions */}
          <div style={{
            position: 'sticky',
            bottom: 0,
            paddingTop: '1rem',
            background: 'var(--bg-card)',
            borderTop: '1px solid var(--border-light)',
            display: 'flex',
            gap: '0.75rem',
          }}>
            <button type="button" className="btn" style={{ flex: 1, minHeight: '52px' }} onClick={onClose}>
              Cancel
            </button>
            <button
              type="submit"
              className="btn primary"
              style={{ flex: 2, minHeight: '52px' }}
              disabled={isSaving}
            >
              <Save size={16} />
              <span>{isSaving ? 'Saving...' : 'Save Record'}</span>
            </button>
          </div>
        </form>
      </div>

      <style>{`
        @keyframes slideUp {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};
