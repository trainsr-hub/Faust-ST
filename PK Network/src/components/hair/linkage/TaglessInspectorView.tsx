import React, { useState, useEffect } from 'react';
import { Sparkles, Trash2, Edit3, Check, RotateCcw, EyeOff } from 'lucide-react';
import { HairCodexItem } from '../../../types/hairCodex';
import { HairLinkageQuickConnect } from './HairLinkageQuickConnect';

interface TaglessInspectorViewProps {
  item: HairCodexItem;
  database?: Record<string, any>;
  onClose: () => void;
  onConnect?: (sourceId: string, targetId: string) => void;
  onDisconnect?: (sourceId: string, targetId: string) => void;
  onUpdateLabel?: (id: string, newLabel: string) => void;
  onDeleteNode?: (id: string) => void;
  onDiscard?: (id: string) => void;
  isDiscarded?: boolean;
  onRestore?: (id: string) => void;
}

export const TaglessInspectorView: React.FC<TaglessInspectorViewProps> = ({
  item,
  database,
  onClose,
  onConnect,
  onDisconnect,
  onUpdateLabel,
  onDeleteNode,
  onDiscard,
  isDiscarded,
  onRestore,
}) => {
  const currentDbNode = database?.[item.id];
  const initialLabel = currentDbNode?.customLabel || currentDbNode?.tag || item.customLabel || item.tag || '';
  const [label, setLabel] = useState(initialLabel);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    setLabel(initialLabel);
  }, [initialLabel]);

  const handleSaveLabel = () => {
    if (!label.trim()) return;
    onUpdateLabel?.(item.id, label.trim());
    setIsEditing(false);
  };

  const handleDelete = () => {
    if (window.confirm(`Permanently delete concept node "${label}" from mindmap?`)) {
      onDeleteNode?.(item.id);
      onClose();
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {/* Concept Hero Card */}
      <div
        style={{
          background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.12), rgba(15, 23, 42, 0.95))',
          border: '1.5px dashed rgba(245, 158, 11, 0.5)',
          borderRadius: '10px',
          padding: '1.25rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Sparkles size={16} color="#fbbf24" />
            <span style={{ fontSize: '11px', fontWeight: 800, color: '#fbbf24', letterSpacing: '0.5px' }}>
              ✦ TAGLESS CONCEPT NODE
            </span>
          </div>
          <span style={{ fontSize: '11px', color: 'var(--text-dim)' }}>
            Category: <strong style={{ color: '#cbd5e1' }}>{item.subcategory || 'Concept Hub'}</strong>
          </span>
        </div>

        {/* Label Editing / Display */}
        <div>
          <span style={{ fontSize: '10.5px', color: 'var(--text-dim)', display: 'block', marginBottom: '4px' }}>
            Concept Group Name:
          </span>
          {isEditing ? (
            <div style={{ display: 'flex', gap: '6px' }}>
              <input
                type="text"
                autoFocus
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSaveLabel()}
                style={{
                  flex: 1,
                  background: '#090d16',
                  border: '1px solid rgba(245, 158, 11, 0.5)',
                  borderRadius: '6px',
                  padding: '6px 10px',
                  fontSize: '13px',
                  color: '#fbbf24',
                  fontWeight: 600,
                  outline: 'none',
                }}
              />
              <button
                onClick={handleSaveLabel}
                className="btn"
                style={{ background: 'rgba(245, 158, 11, 0.25)', borderColor: '#fbbf24', color: '#fbbf24', fontSize: '11px', padding: '0 10px' }}
              >
                <Check size={13} /> Save
              </button>
            </div>
          ) : (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: 'rgba(0, 0, 0, 0.35)',
                padding: '6px 10px',
                borderRadius: '6px',
                border: '1px solid rgba(255, 255, 255, 0.08)',
              }}
            >
              <span style={{ fontSize: '14px', fontWeight: 700, color: '#fbbf24' }}>{label}</span>
              <button
                onClick={() => setIsEditing(true)}
                className="btn icon-only"
                style={{ height: '24px', padding: '0 6px', fontSize: '11px', gap: '4px' }}
                title="Rename concept node"
              >
                <Edit3 size={11} /> Rename
              </button>
            </div>
          )}
        </div>

        <div style={{ fontSize: '11px', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
          This node does not emit a prompt tag. It serves as a visual parent/child hub in your DAG mindmap.
        </div>
      </div>

      {/* Quick Connect & Dependency Inspector */}
      {database && onConnect && onDisconnect && (
        <HairLinkageQuickConnect
          item={item}
          database={database}
          onConnect={onConnect}
          onDisconnect={onDisconnect}
        />
      )}

      {/* Primary Actions: Delete or Discard */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginTop: '0.25rem' }}>
        {onDeleteNode && (
          <button
            onClick={handleDelete}
            className="btn"
            style={{
              minHeight: '44px',
              fontSize: '12px',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              color: '#ef4444',
              borderColor: 'rgba(239, 68, 68, 0.4)',
              background: 'rgba(239, 68, 68, 0.1)',
              borderRadius: '8px',
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
            }}
            title="Permanently remove this concept node and all connected linkages"
          >
            <Trash2 size={15} />
            <span>Delete Concept Node</span>
          </button>
        )}

        {isDiscarded && onRestore ? (
          <button
            onClick={() => {
              onRestore(item.id);
              onClose();
            }}
            className="btn"
            style={{
              minHeight: '44px',
              fontSize: '12px',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              color: '#4ade80',
              borderColor: 'rgba(74, 222, 128, 0.4)',
              background: 'rgba(74, 222, 128, 0.1)',
              borderRadius: '8px',
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
            }}
          >
            <RotateCcw size={15} />
            <span>Restore to Canvas</span>
          </button>
        ) : onDiscard ? (
          <button
            onClick={() => {
              onDiscard(item.id);
              onClose();
            }}
            className="btn"
            style={{
              minHeight: '44px',
              fontSize: '12px',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              color: '#fb7185',
              borderColor: 'rgba(251, 113, 133, 0.4)',
              background: 'rgba(244, 63, 94, 0.12)',
              borderRadius: '8px',
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
            }}
            title="Hide this node into Discarded Pool"
          >
            <EyeOff size={15} />
            <span>Hide Concept</span>
          </button>
        ) : null}
      </div>
    </div>
  );
};
