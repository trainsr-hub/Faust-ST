import React, { useState, useMemo } from 'react';
import { X, RotateCcw, ExternalLink, Search, Trash2 } from 'lucide-react';
import { LinkageNodeData } from '../../../services/linkageLayout';

interface DiscardedPoolDrawerProps {
  isOpen: boolean;
  discardedNodes: LinkageNodeData[];
  onClose: () => void;
  onRestoreNode: (nodeId: string) => void;
  onRestoreAll: () => void;
}

export const DiscardedPoolDrawer: React.FC<DiscardedPoolDrawerProps> = ({
  isOpen,
  discardedNodes,
  onClose,
  onRestoreNode,
  onRestoreAll,
}) => {
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return discardedNodes;
    return discardedNodes.filter((n) => n.tag.toLowerCase().includes(q));
  }, [discardedNodes, search]);

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        right: 0,
        width: '340px',
        height: '100%',
        background: 'rgba(15, 23, 42, 0.96)',
        borderLeft: '1px solid var(--border-light, rgba(255, 255, 255, 0.12))',
        boxShadow: '-8px 0 32px rgba(0, 0, 0, 0.6)',
        backdropFilter: 'blur(16px)',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 50,
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 16px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Trash2 size={16} color="#f43f5e" />
          <span style={{ fontWeight: 700, fontSize: '13px', color: '#f8fafc' }}>
            Discarded Pool ({discardedNodes.length})
          </span>
        </div>

        <button
          className="btn icon-only"
          onClick={onClose}
          style={{ width: '26px', height: '26px', padding: 0 }}
        >
          <X size={14} />
        </button>
      </div>

      {/* Description & Restore All Toolbar */}
      <div
        style={{
          padding: '8px 16px',
          background: 'rgba(2, 6, 23, 0.5)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <span style={{ fontSize: '10.5px', color: 'var(--text-tertiary)' }}>
          Hidden traits (never deleted permanently)
        </span>
        {discardedNodes.length > 0 && (
          <button
            onClick={onRestoreAll}
            className="btn"
            style={{ fontSize: '10.5px', padding: '2px 8px', color: '#38bdf8' }}
            title="Restore all discarded traits to canvas"
          >
            Restore All
          </button>
        )}
      </div>

      {/* Search Bar */}
      <div style={{ padding: '8px 12px', borderBottom: '1px solid rgba(255, 255, 255, 0.06)' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            background: 'rgba(30, 41, 59, 0.6)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '6px',
            padding: '4px 8px',
          }}
        >
          <Search size={13} color="var(--text-dim)" />
          <input
            type="text"
            placeholder="Search discarded traits..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: '#f8fafc',
              fontSize: '11.5px',
              width: '100%',
            }}
          />
        </div>
      </div>

      {/* Trait List */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '8px 12px' }}>
        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--text-dim)', fontSize: '12px' }}>
            No discarded traits found.
          </div>
        ) : (
          filtered.map((node) => (
            <div
              key={node.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '6px 8px',
                borderRadius: '6px',
                background: 'rgba(30, 41, 59, 0.4)',
                marginBottom: '6px',
                gap: '8px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
                {node.image && (
                  <img
                    src={node.image}
                    alt={node.tag}
                    style={{ width: '32px', height: '32px', borderRadius: '4px', objectFit: 'cover' }}
                  />
                )}
                <div style={{ overflow: 'hidden' }}>
                  <div
                    style={{
                      fontSize: '11.5px',
                      fontWeight: 600,
                      color: '#f8fafc',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {node.tag}
                  </div>
                  <div style={{ fontSize: '9px', color: 'var(--text-tertiary)' }}>
                    {node.subcategory || node.category}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }}>
                <a
                  href={node.wikiUrl || `https://danbooru.donmai.us/wiki_pages/${node.id}`}
                  target="_blank"
                  rel="noreferrer"
                  title="Open original Danbooru wiki page"
                  className="btn icon-only"
                  style={{ width: '24px', height: '24px', padding: 0 }}
                >
                  <ExternalLink size={11} />
                </a>

                <button
                  onClick={() => onRestoreNode(node.id)}
                  className="btn icon-only"
                  style={{
                    width: '24px',
                    height: '24px',
                    padding: 0,
                    background: 'rgba(56, 189, 248, 0.2)',
                    color: '#38bdf8',
                  }}
                  title="Restore / Unhide to active canvas"
                >
                  <RotateCcw size={11} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
