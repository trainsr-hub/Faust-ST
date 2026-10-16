import React from 'react';
import { X, Sparkles } from 'lucide-react';
import { HairCodexItem } from '../../types/hairCodex';
import { HairCodexTraitDetails } from './HairCodexTraitDetails';
import { TaglessInspectorView } from './linkage/TaglessInspectorView';

interface HairCodexInspectorModalProps {
  item: HairCodexItem | null;
  database?: Record<string, any>;
  onClose: () => void;
  onCopyTag: (tag: string) => void;
  onDiscard?: (id: string) => void;
  isDiscarded?: boolean;
  onRestore?: (id: string) => void;
  onConnect?: (sourceId: string, targetId: string) => void;
  onDisconnect?: (sourceId: string, targetId: string) => void;
  onUpdateLabel?: (id: string, newLabel: string) => void;
  onDeleteNode?: (id: string) => void;
}

export const HairCodexInspectorModal: React.FC<HairCodexInspectorModalProps> = ({
  item,
  database,
  onClose,
  onCopyTag,
  onDiscard,
  isDiscarded,
  onRestore,
  onConnect,
  onDisconnect,
  onUpdateLabel,
  onDeleteNode,
}) => {
  if (!item) return null;

  const currentDbNode = database?.[item.id];
  const isTagless = Boolean(item.isTagless || currentDbNode?.isTagless);
  const displayTitle = isTagless
    ? (currentDbNode?.customLabel || currentDbNode?.tag || item.customLabel || item.tag)
    : item.tag;

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
          border: isTagless
            ? '1.5px solid rgba(245, 158, 11, 0.45)'
            : '1px solid var(--border-light, rgba(255, 255, 255, 0.12))',
          borderRadius: '14px',
          width: '100%',
          maxWidth: '620px',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: isTagless
            ? '0 20px 48px rgba(0, 0, 0, 0.7), 0 0 32px rgba(245, 158, 11, 0.2)'
            : '0 20px 48px rgba(0, 0, 0, 0.6), 0 0 32px rgba(236, 72, 153, 0.2)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0.85rem 1.25rem',
            borderBottom: '1px solid var(--border-light, rgba(255, 255, 255, 0.08))',
            background: isTagless ? 'rgba(30, 41, 59, 0.9)' : 'rgba(15, 23, 42, 0.8)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {isTagless && <Sparkles size={16} color="#fbbf24" />}
            <span style={{ fontSize: '14px', fontWeight: 700, color: isTagless ? '#fbbf24' : '#f8fafc' }}>
              {isTagless ? `Concept: ${displayTitle}` : `Trait Dossier: ${displayTitle}`}
            </span>
            <span
              style={{
                fontSize: '10.5px',
                padding: '2px 8px',
                borderRadius: '6px',
                background: isTagless ? 'rgba(245, 158, 11, 0.2)' : 'rgba(236, 72, 153, 0.15)',
                color: isTagless ? '#fbbf24' : '#f472b6',
                fontWeight: 600,
              }}
            >
              {isTagless ? '✦ CONCEPT HUB' : item.subcategory}
            </span>
          </div>

          <button
            onClick={onClose}
            className="btn icon-only"
            style={{ width: '28px', height: '28px', border: 'none', background: 'transparent', color: 'var(--text-dim)' }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem', overflowY: 'auto', maxHeight: '75vh' }}>
          {isTagless ? (
            <TaglessInspectorView
              item={item}
              database={database}
              onClose={onClose}
              onConnect={onConnect}
              onDisconnect={onDisconnect}
              onUpdateLabel={onUpdateLabel}
              onDeleteNode={onDeleteNode}
              onDiscard={onDiscard}
              isDiscarded={isDiscarded}
              onRestore={onRestore}
            />
          ) : (
            <HairCodexTraitDetails
              item={item}
              database={database}
              onClose={onClose}
              onCopyTag={onCopyTag}
              onDiscard={onDiscard}
              isDiscarded={isDiscarded}
              onRestore={onRestore}
              onConnect={onConnect}
              onDisconnect={onDisconnect}
            />
          )}
        </div>
      </div>
    </div>
  );
};
