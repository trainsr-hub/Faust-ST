import React, { useState } from 'react';
import { GitBranch, ExternalLink, Copy, Check, ChevronDown, ChevronRight } from 'lucide-react';
import { HairRelationNode, HairCodexItem } from '../../types/hairCodex';

interface HairCodexRelationshipTreeProps {
  treeRoots: HairRelationNode[];
  onSelect: (item: HairCodexItem) => void;
  onCopyTag: (tag: string) => void;
}

export const HairCodexRelationshipTree: React.FC<HairCodexRelationshipTreeProps> = ({
  treeRoots,
  onSelect,
  onCopyTag,
}) => {
  const [copiedTag, setCopiedTag] = useState<string | null>(null);
  const [collapsedRoots, setCollapsedRoots] = useState<Record<string, boolean>>({});

  const toggleCollapse = (tag: string) => {
    setCollapsedRoots((prev) => ({ ...prev, [tag]: !prev[tag] }));
  };

  const handleCopy = (e: React.MouseEvent, tag: string) => {
    e.stopPropagation();
    navigator.clipboard.writeText(tag);
    setCopiedTag(tag);
    onCopyTag(tag);
    setTimeout(() => setCopiedTag(null), 1500);
  };

  return (
    <div className="hair-tree-container">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <GitBranch size={16} color="#a855f7" />
          <span style={{ fontSize: '13px', fontWeight: 700, color: '#f8fafc' }}>
            Taxonomy & Trait Relationships ({treeRoots.length} Parent Clusters)
          </span>
        </div>
        <span style={{ fontSize: '11px', color: 'var(--text-dim)' }}>
          Showing explicit parent-child links extracted from ZZZZHair.md
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
        {treeRoots.map((root) => {
          const isCollapsed = Boolean(collapsedRoots[root.tag]);

          return (
            <div key={root.tag} className="hair-tree-branch">
              {/* Parent Root Header */}
              <div
                onClick={() => toggleCollapse(root.tag)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                  userSelect: 'none',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  {isCollapsed ? <ChevronRight size={14} color="#a855f7" /> : <ChevronDown size={14} color="#a855f7" />}
                  <span style={{ fontSize: '13px', fontWeight: 700, color: '#c084fc' }}>
                    {root.tag}
                  </span>
                  <span
                    style={{
                      fontSize: '10.5px',
                      fontFamily: 'var(--font-mono)',
                      padding: '1px 6px',
                      borderRadius: '999px',
                      background: 'rgba(168, 85, 247, 0.18)',
                      color: '#d8b4fe',
                    }}
                  >
                    {root.children.length} variations
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <button
                    onClick={(e) => handleCopy(e, root.tag)}
                    className="btn icon-only"
                    title="Copy parent tag"
                    style={{ padding: '2px 6px', fontSize: '10.5px', height: '22px' }}
                  >
                    {copiedTag === root.tag ? <Check size={11} color="#4ade80" /> : <Copy size={11} />}
                    <span>{copiedTag === root.tag ? 'Copied' : 'Copy'}</span>
                  </button>
                  {root.item && (
                    <a
                      href={root.item.wikiUrl}
                      target="_blank"
                      rel="noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      style={{ color: '#38bdf8', display: 'flex', alignItems: 'center', padding: '2px 4px' }}
                      title="Open Danbooru Wiki"
                    >
                      <ExternalLink size={12} />
                    </a>
                  )}
                </div>
              </div>

              {/* Children Nodes Grid */}
              {!isCollapsed && (
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
                    gap: '0.5rem',
                    paddingLeft: '1rem',
                    borderLeft: '2px solid rgba(168, 85, 247, 0.25)',
                    marginTop: '0.25rem',
                  }}
                >
                  {root.children.map((child) => {
                    const cItem = child.item;
                    return (
                      <div
                        key={child.tag}
                        onClick={() => cItem && onSelect(cItem)}
                        style={{
                          background: 'rgba(15, 23, 42, 0.7)',
                          border: '1px solid rgba(255, 255, 255, 0.08)',
                          borderRadius: '8px',
                          padding: '0.45rem 0.6rem',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          cursor: cItem ? 'pointer' : 'default',
                          transition: 'all 0.15s ease',
                        }}
                      >
                        {cItem?.imageUrl ? (
                          <img
                            src={cItem.imageUrl}
                            alt={child.tag}
                            style={{
                              width: '36px',
                              height: '36px',
                              borderRadius: '6px',
                              objectFit: 'cover',
                              flexShrink: 0,
                              background: '#0b1120',
                            }}
                            loading="lazy"
                          />
                        ) : (
                          <div
                            style={{
                              width: '36px',
                              height: '36px',
                              borderRadius: '6px',
                              background: 'rgba(255,255,255,0.04)',
                              flexShrink: 0,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '9px',
                              color: 'var(--text-dim)',
                            }}
                          >
                            Tag
                          </div>
                        )}

                        <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0, gap: '2px' }}>
                          <span
                            style={{
                              fontSize: '11.5px',
                              fontWeight: 600,
                              color: '#f8fafc',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {child.tag}
                          </span>
                          <span style={{ fontSize: '9.5px', color: 'var(--text-dim)' }}>
                            {cItem?.subcategory || 'Variation'}
                          </span>
                        </div>

                        <button
                          onClick={(e) => handleCopy(e, child.tag)}
                          className="btn icon-only"
                          title="Copy tag"
                          style={{ padding: '2px 4px', height: '22px', fontSize: '10px' }}
                        >
                          {copiedTag === child.tag ? <Check size={11} color="#4ade80" /> : <Copy size={11} />}
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
