import React, { useState } from 'react';
import { X, Sparkles, FolderPlus } from 'lucide-react';

interface CreateTaglessNodeModalProps {
  isOpen: boolean;
  defaultSubcategory?: string | null;
  parentOfNodeTag?: string | null;
  onClose: () => void;
  onCreate: (label: string, subcategory: string) => void;
}

export const CreateTaglessNodeModal: React.FC<CreateTaglessNodeModalProps> = ({
  isOpen,
  defaultSubcategory,
  parentOfNodeTag,
  onClose,
  onCreate,
}) => {
  const [label, setLabel] = useState('');
  const [subcategory, setSubcategory] = useState(defaultSubcategory || 'Concept Hub');

  // Sync subcategory when defaultSubcategory changes
  React.useEffect(() => {
    if (defaultSubcategory) setSubcategory(defaultSubcategory);
  }, [defaultSubcategory]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!label.trim()) return;
    onCreate(label.trim(), subcategory.trim() || 'Concept Hub');
    setLabel('');
    onClose();
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '1.5rem',
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: 'var(--bg-surface, #131d31)',
          border: '1px solid rgba(245, 158, 11, 0.4)',
          borderRadius: '12px',
          width: '100%',
          maxWidth: '440px',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 20px 48px rgba(0, 0, 0, 0.7), 0 0 24px rgba(245, 158, 11, 0.15)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '12px 16px',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            background: 'rgba(15, 23, 42, 0.85)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sparkles size={16} color="#f59e0b" />
            <span style={{ fontSize: '13.5px', fontWeight: 700, color: '#f8fafc' }}>
              {parentOfNodeTag ? `Create Concept Parent for "${parentOfNodeTag}"` : 'Create Tagless Concept Node'}
            </span>
          </div>
          <button onClick={onClose} className="btn icon-only" style={{ width: '26px', height: '26px', padding: 0 }}>
            <X size={14} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {parentOfNodeTag ? (
            <div style={{ background: 'rgba(245, 158, 11, 0.15)', border: '1px solid rgba(245, 158, 11, 0.35)', borderRadius: '6px', padding: '6px 10px', fontSize: '11px', color: '#fbbf24' }}>
              ✦ Linking as Parent: <strong>{label.trim() || 'New Concept'}</strong> ➔ <strong>{parentOfNodeTag}</strong>
            </div>
          ) : (
            <div style={{ fontSize: '11px', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
              Tagless nodes act as intermediate structural hubs, conceptual categories, or branch junctions in your hair taxonomy without injecting prompt tags.
            </div>
          )}

          <div>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>
              Concept / Group Label:
            </label>
            <input
              type="text"
              autoFocus
              placeholder="e.g. Parted Bangs Group, Traditional Styles, Volume Branch..."
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              style={{
                width: '100%',
                boxSizing: 'border-box',
                background: '#090d16',
                border: '1px solid rgba(245, 158, 11, 0.35)',
                borderRadius: '6px',
                padding: '8px 10px',
                fontSize: '12px',
                color: '#ffffff',
                outline: 'none',
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>
              Subcategory (Optional):
            </label>
            <input
              type="text"
              placeholder="e.g. Bangs, Short Hair, Concept Hub..."
              value={subcategory}
              onChange={(e) => setSubcategory(e.target.value)}
              style={{
                width: '100%',
                boxSizing: 'border-box',
                background: '#090d16',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                borderRadius: '6px',
                padding: '8px 10px',
                fontSize: '12px',
                color: '#ffffff',
                outline: 'none',
              }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '6px' }}>
            <button type="button" onClick={onClose} className="btn" style={{ fontSize: '11.5px', padding: '6px 12px' }}>
              Cancel
            </button>
            <button
              type="submit"
              disabled={!label.trim()}
              className="btn"
              style={{
                fontSize: '11.5px',
                padding: '6px 14px',
                background: label.trim() ? 'rgba(245, 158, 11, 0.2)' : undefined,
                color: label.trim() ? '#fbbf24' : 'var(--text-dim)',
                borderColor: label.trim() ? 'rgba(245, 158, 11, 0.5)' : undefined,
                cursor: label.trim() ? 'pointer' : 'not-allowed',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <FolderPlus size={14} />
              <span>{parentOfNodeTag ? 'Create Parent Concept' : 'Create Concept Node'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
