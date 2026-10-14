import React, { useState } from 'react';
import { X, Plus, Database } from 'lucide-react';
import { TableRecord } from '../types';

interface NewTableModalProps {
  isOpen: boolean;
  onClose: () => void;
  availableTables: TableRecord[];
  onCreate: (table: { id: string; name: string; parent_id: string | null }) => Promise<void>;
}

export const NewTableModal: React.FC<NewTableModalProps> = ({
  isOpen,
  onClose,
  availableTables,
  onCreate,
}) => {
  const [name, setName] = useState<string>('');
  const [slug, setSlug] = useState<string>('');
  const [parentId, setParentId] = useState<string>('');
  const [autoSlug, setAutoSlug] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleNameChange = (val: string) => {
    setName(val);
    if (autoSlug) {
      const generated = val.toLowerCase().replace(/[^a-z0-9_]/g, '_').replace(/^_+|_+$/g, '');
      setSlug(generated);
    }
  };

  const handleSlugChange = (val: string) => {
    setAutoSlug(false);
    setSlug(val.toLowerCase().replace(/[^a-z0-9_]/g, '_'));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanId = slug.trim() || name.toLowerCase().replace(/[^a-z0-9_]/g, '_');
    if (!cleanId || !name.trim()) return;

    setIsSubmitting(true);
    try {
      await onCreate({
        id: cleanId,
        name: name.trim(),
        parent_id: parentId ? parentId : null,
      });
      setName('');
      setSlug('');
      setParentId('');
      setAutoSlug(true);
      onClose();
    } catch {
      // Error handled by caller
    } finally {
      setIsSubmitting(false);
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
        maxWidth: '460px',
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
            <Database size={18} style={{ color: 'var(--accent)' }} />
            <h2 style={{ fontSize: '15px', fontWeight: 600, margin: 0 }}>Create New Table</h2>
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
        <form onSubmit={handleSubmit} style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
          {/* Table Natural Name */}
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-dim)', marginBottom: '0.4rem' }}>
              Table Natural Language Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="e.g. Reading Archive"
              required
              autoFocus
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

          {/* Table ID (Slug) */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
              <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-dim)' }}>
                Database Table ID (lowercase, alphanumeric)
              </label>
              {autoSlug && (
                <span style={{ fontSize: '10px', color: 'var(--accent)' }}>Auto-derived</span>
              )}
            </div>
            <input
              type="text"
              value={slug}
              onChange={(e) => handleSlugChange(e.target.value)}
              placeholder="e.g. reading_archive"
              required
              style={{
                width: '100%',
                minHeight: '44px',
                padding: '0.65rem 0.85rem',
                borderRadius: 'var(--radius-sm)',
                background: 'var(--bg-canvas)',
                border: '1px solid var(--border-mid)',
                fontFamily: 'var(--font-mono)',
                color: 'var(--text-primary)',
                fontSize: '13px',
                outline: 'none',
              }}
            />
          </div>

          {/* Parent Table Selector */}
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-dim)', marginBottom: '0.4rem' }}>
              Parent Table Selector (Hierarchy Level)
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
              {availableTables.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name || t.id}
                </option>
              ))}
            </select>
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
              disabled={isSubmitting}
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
              disabled={isSubmitting}
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
              <Plus size={15} />
              <span>{isSubmitting ? 'Creating Table...' : 'Create Table'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
