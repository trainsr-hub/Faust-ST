import React, { useState, useEffect } from 'react';
import { X, Trash2, Check, Settings, AlertTriangle, Folder } from 'lucide-react';
import { TableMetaRecord, TableGroup } from '../types';

interface TableSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  tableId: string;
  tableMeta?: TableMetaRecord;
  availableTables: TableMetaRecord[];
  availableGroups?: TableGroup[];
  onSave: (updates: { name: string; parent_id: string | null; group_id: string | null }) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export const TableSettingsModal: React.FC<TableSettingsModalProps> = ({
  isOpen,
  onClose,
  tableId,
  tableMeta,
  availableTables,
  availableGroups = [],
  onSave,
  onDelete,
}) => {
  const [name, setName] = useState<string>('');
  const [parentId, setParentId] = useState<string>('');
  const [groupId, setGroupId] = useState<string>('');
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [confirmDelete, setConfirmDelete] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      setName(tableMeta?.name || tableId);
      setParentId(tableMeta?.parent_id ? String(tableMeta.parent_id) : '');
      setGroupId(tableMeta?.group_id ? String(tableMeta.group_id) : '');
      setConfirmDelete(false);
    }
  }, [isOpen, tableId, tableMeta]);

  if (!isOpen) return null;

  const validParents = availableTables.filter((t) => t.id !== tableId);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setIsSaving(true);
    try {
      await onSave({
        name: name.trim(),
        parent_id: parentId ? parentId : null,
        group_id: groupId ? groupId : null,
      });
      onClose();
    } catch {
      // Error handled by parent
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }
    setIsSaving(true);
    try {
      await onDelete(tableId);
      onClose();
    } catch {
      // Error handled by parent
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0, 0, 0, 0.7)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '1rem',
    }}>
      <div style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border-mid)',
        borderRadius: 'var(--radius-lg, 12px)',
        width: '100%',
        maxWidth: '480px',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4)',
        overflow: 'hidden',
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '1rem 1.25rem',
          borderBottom: '1px solid var(--border-subtle)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Settings size={18} style={{ color: 'var(--accent)' }} />
            <h2 style={{ fontSize: '15px', fontWeight: 600, margin: 0 }}>Table Settings</h2>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-dim)',
              cursor: 'pointer',
              padding: '0.2rem',
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
          {/* Table ID Display */}
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-dim)', marginBottom: '0.4rem' }}>
              Table ID (Database Identifier)
            </label>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              padding: '0.65rem 0.85rem',
              borderRadius: 'var(--radius-sm)',
              background: 'rgba(0, 0, 0, 0.25)',
              border: '1px solid var(--border-subtle)',
              fontFamily: 'var(--font-mono)',
              fontSize: '13px',
              color: 'var(--text-secondary)',
            }}>
              <span>{tableId}</span>
              <span style={{ marginLeft: 'auto', fontSize: '10px', color: 'var(--text-dim)' }}>Locked / Immutable</span>
            </div>
          </div>

          {/* Table Natural Name */}
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-dim)', marginBottom: '0.4rem' }}>
              Table Natural Language Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Quotes & Excerpts"
              required
              style={{
                width: '100%',
                minHeight: '44px',
                padding: '0.65rem 0.85rem',
                borderRadius: 'var(--radius-sm)',
                background: 'var(--bg-canvas)',
                border: '1px solid var(--border-mid)',
                color: 'var(--text-primary)',
                fontSize: '14px',
                outline: 'none',
              }}
            />
          </div>

          {/* Parent Table Selector */}
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-dim)', marginBottom: '0.4rem' }}>
              Parent Table (Domain Hierarchy Selector)
            </label>
            <select
              value={parentId}
              onChange={(e) => setParentId(e.target.value)}
              style={{
                width: '100%',
                minHeight: '44px',
                padding: '0.65rem 0.85rem',
                borderRadius: 'var(--radius-sm)',
                background: 'var(--bg-canvas)',
                border: '1px solid var(--border-mid)',
                color: 'var(--text-primary)',
                fontSize: '14px',
                outline: 'none',
              }}
            >
              <option value="">None (Top-Level Root Table)</option>
              {validParents.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name || t.id} ({t.id})
                </option>
              ))}
            </select>
          </div>

          {/* Table Group Selector */}
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-dim)', marginBottom: '0.4rem' }}>
              Workspace Group (Outliner Taxonomy)
            </label>
            <select
              value={groupId}
              onChange={(e) => setGroupId(e.target.value)}
              style={{
                width: '100%',
                minHeight: '44px',
                padding: '0.65rem 0.85rem',
                borderRadius: 'var(--radius-sm)',
                background: 'var(--bg-canvas)',
                border: '1px solid var(--border-mid)',
                color: 'var(--text-primary)',
                fontSize: '14px',
                outline: 'none',
              }}
            >
              <option value="">None (Ungrouped)</option>
              {availableGroups.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.natural_name} ({g.id})
                </option>
              ))}
            </select>
          </div>

          {/* Danger Zone: Delete */}
          <div style={{
            marginTop: '0.5rem',
            padding: '0.85rem',
            borderRadius: 'var(--radius-sm)',
            background: 'rgba(239, 68, 68, 0.06)',
            border: '1px solid rgba(239, 68, 68, 0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
            <div>
              <div style={{ fontSize: '12px', fontWeight: 600, color: '#f87171', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <AlertTriangle size={14} />
                <span>Delete Table</span>
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-dim)', marginTop: '0.2rem' }}>
                Permanently drop table and unlink from hierarchy.
              </div>
            </div>
            <button
              type="button"
              onClick={handleDelete}
              disabled={isSaving}
              style={{
                padding: '0.45rem 0.85rem',
                borderRadius: 'var(--radius-sm)',
                border: 'none',
                background: confirmDelete ? '#ef4444' : 'rgba(239, 68, 68, 0.15)',
                color: confirmDelete ? '#fff' : '#f87171',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                transition: 'all 0.15s ease',
              }}
            >
              <Trash2 size={13} />
              <span>{confirmDelete ? 'Confirm Drop?' : 'Delete'}</span>
            </button>
          </div>

          {/* Footer Actions */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            gap: '0.65rem',
            marginTop: '0.5rem',
            paddingTop: '0.75rem',
            borderTop: '1px solid var(--border-subtle)',
          }}>
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              style={{
                minHeight: '44px',
                padding: '0.55rem 1rem',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-mid)',
                background: 'transparent',
                color: 'var(--text-secondary)',
                fontSize: '13px',
                cursor: 'pointer',
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              style={{
                minHeight: '44px',
                padding: '0.55rem 1.25rem',
                borderRadius: 'var(--radius-sm)',
                border: 'none',
                background: 'var(--accent)',
                color: '#fff',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
              }}
            >
              <Check size={15} />
              <span>{isSaving ? 'Saving...' : 'Save Settings'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
