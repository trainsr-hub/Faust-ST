import React, { useState, useMemo } from 'react';
import { X, Sparkles, Copy, Check, ExternalLink, GitBranch, EyeOff, RotateCcw, Plus, Layers, Ruler } from 'lucide-react';
import { FacetNodeData } from '../../services/facetLiveDataService';

interface FacetCodexInspectorModalProps {
  item: FacetNodeData | null;
  database: Record<string, FacetNodeData>;
  onClose: () => void;
  onCopyTag: (tag: string) => void;
  onDiscard?: (id: string) => void;
  isDiscarded?: boolean;
  onRestore?: (id: string) => void;
  onConnect: (sourceId: string, targetId: string) => void;
  onDisconnect: (sourceId: string, targetId: string) => void;
  onSelectNode: (node: FacetNodeData) => void;
}

export const FacetCodexInspectorModal: React.FC<FacetCodexInspectorModalProps> = ({
  item,
  database,
  onClose,
  onCopyTag,
  onDiscard,
  isDiscarded,
  onRestore,
  onConnect,
  onDisconnect,
  onSelectNode,
}) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [parentSearch, setParentSearch] = useState('');
  const [isAddParentOpen, setIsAddParentOpen] = useState(false);

  if (!item) return null;
  const current = database[item.id] || item;

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedKey(key);
    onCopyTag(text);
    setTimeout(() => setCopiedKey(null), 1500);
  };

  const handleOpenLink = (url?: string) => {
    if (url) window.open(url, '_blank', 'noopener,noreferrer');
  };

  // Depend On: Parents that this node depends on (target is this item, source is parent)
  const parents = (current.dependOn || []).map((pid) => database[pid] || { id: pid, tag: pid, name: pid });

  // Dependents: Nodes that list this item in their dependOn
  const dependents = Object.values(database).filter(
    (n) => !n.isDiscarded && (n.dependOn || []).includes(current.id)
  );

  // Search candidates for adding parent dependencies
  const candidates = useMemo(() => {
    const q = parentSearch.trim().toLowerCase();
    if (!q) return [];
    return Object.values(database)
      .filter((n) => !n.isDiscarded && n.id !== current.id && !(current.dependOn || []).includes(n.id) && (n.tag.toLowerCase().includes(q) || n.name.toLowerCase().includes(q)))
      .slice(0, 6);
  }, [database, current.id, current.dependOn, parentSearch]);

  const wikiUrl = current.wikiUrl || `https://danbooru.donmai.us/wiki_pages/${encodeURIComponent(current.tag.replace(/ /g, '_'))}`;

  return (
    <div
      style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0, 0, 0, 0.78)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1.5rem' }}
      onClick={onClose}
    >
      <div
        style={{ background: '#0e1626', border: '1px solid rgba(56, 189, 248, 0.25)', borderRadius: '14px', width: '100%', maxWidth: '640px', overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 24px 50px rgba(0, 0, 0, 0.8), 0 0 32px rgba(56, 189, 248, 0.15)' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.85rem 1.25rem', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', background: 'rgba(15, 23, 42, 0.85)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Sparkles size={16} color="#38bdf8" />
            <span style={{ fontSize: '14px', fontWeight: 700, color: '#f8fafc' }}>{current.name || current.tag}</span>
            <span style={{ fontSize: '10.5px', padding: '2px 8px', borderRadius: '6px', background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8', fontWeight: 600 }}>
              {current.subcategory}
            </span>
          </div>
          <button onClick={onClose} className="btn icon-only" style={{ width: '28px', height: '28px', border: 'none', background: 'transparent', color: 'var(--text-dim)' }}>
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem', overflowY: 'auto', maxHeight: '75vh' }}>
          {/* Image Preview */}
          {current.image && (
            <div
              onContextMenu={(e) => { e.preventDefault(); handleOpenLink(current.image || undefined); }}
              style={{ width: '100%', maxHeight: '300px', borderRadius: '10px', overflow: 'hidden', background: '#070b14', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(255, 255, 255, 0.08)', cursor: 'pointer' }}
              title="Right click to open image in new tab"
            >
              <img src={current.image} alt={current.tag} style={{ width: '100%', height: '100%', maxHeight: '300px', objectFit: 'contain' }} />
            </div>
          )}

          {/* Tokens: Tag & Danbooru Tag */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '0.65rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)' }}>
              <span style={{ fontSize: '10px', color: 'var(--text-dim)', display: 'block', marginBottom: '2px' }}>Prompt Tag</span>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
                <code style={{ fontSize: '12px', color: '#f8fafc', fontWeight: 600 }}>{current.tag}</code>
                <button onClick={() => handleCopy(current.tag, 'tag')} className="btn icon-only" style={{ height: '22px', padding: '0 6px', fontSize: '10px' }}>
                  {copiedKey === 'tag' ? <Check size={11} color="#4ade80" /> : <Copy size={11} />}
                  <span>{copiedKey === 'tag' ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
            </div>
            <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '0.65rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)' }}>
              <span style={{ fontSize: '10px', color: 'var(--text-dim)', display: 'block', marginBottom: '2px' }}>Prompt ID (Slug)</span>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
                <code style={{ fontSize: '12px', color: '#38bdf8', fontWeight: 600 }}>{current.id}</code>
                <button onClick={() => handleCopy(current.id, 'id')} className="btn icon-only" style={{ height: '22px', padding: '0 6px', fontSize: '10px' }}>
                  {copiedKey === 'id' ? <Check size={11} color="#4ade80" /> : <Copy size={11} />}
                  <span>{copiedKey === 'id' ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Length Relation Column */}
          <div style={{ background: 'rgba(15, 23, 42, 0.5)', padding: '0.65rem', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: 'var(--text-tertiary)', marginBottom: '4px' }}>
              <Ruler size={13} color="#a855f7" />
              <span>Hair Length Specification</span>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {(current.length || []).length > 0 ? (
                current.length.map((len) => (
                  <span key={len} style={{ background: 'rgba(168, 85, 247, 0.15)', border: '1px solid rgba(168, 85, 247, 0.3)', color: '#d8b4fe', padding: '2px 8px', borderRadius: '6px', fontSize: '11px' }}>
                    {len}
                  </span>
                ))
              ) : (
                <span style={{ fontSize: '11px', color: 'var(--text-dim)', fontStyle: 'italic' }}>Unconstrained / Any length</span>
              )}
            </div>
          </div>

          {/* Depend On: Multi-Relation DAG Parents */}
          <div style={{ background: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(56, 189, 248, 0.2)', borderRadius: '10px', padding: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 700, color: '#f8fafc' }}>
                <GitBranch size={14} color="#38bdf8" />
                <span>Depend On (Prerequisite Parent Traits)</span>
              </div>
              <button onClick={() => setIsAddParentOpen((v) => !v)} className="btn" style={{ fontSize: '10px', padding: '2px 8px', color: '#00ffff', borderColor: 'rgba(0, 255, 255, 0.3)' }}>
                {isAddParentOpen ? 'Close Linker' : '+ Add Parent Dependency'}
              </button>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {parents.length > 0 ? (
                parents.map((p) => (
                  <span key={p.id} style={{ background: 'rgba(168, 85, 247, 0.18)', border: '1px solid rgba(168, 85, 247, 0.4)', color: '#e9d5ff', padding: '3px 8px', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11.5px' }}>
                    <span onClick={() => database[p.id] && onSelectNode(database[p.id])} style={{ cursor: 'pointer', textDecoration: 'underline' }}>{p.tag}</span>
                    <button onClick={() => onDisconnect(p.id, current.id)} style={{ background: 'none', border: 'none', color: '#f43f5e', cursor: 'pointer', padding: 0 }} title="Unlink parent dependency">
                      <X size={12} />
                    </button>
                  </span>
                ))
              ) : (
                <span style={{ fontSize: '11px', color: 'var(--text-dim)', fontStyle: 'italic' }}>Root trait (no prerequisite dependencies)</span>
              )}
            </div>

            {/* Quick add parent search */}
            {isAddParentOpen && (
              <div style={{ marginTop: '4px', paddingTop: '6px', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
                <input
                  type="text"
                  placeholder="Search trait to add as parent dependency..."
                  value={parentSearch}
                  onChange={(e) => setParentSearch(e.target.value)}
                  style={{ width: '100%', boxSizing: 'border-box', background: '#070b14', border: '1px solid rgba(56, 189, 248, 0.3)', borderRadius: '6px', padding: '6px 10px', fontSize: '11.5px', color: '#fff', outline: 'none', marginBottom: '6px' }}
                />
                {candidates.length > 0 && (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px' }}>
                    {candidates.map((cand) => (
                      <button key={cand.id} onClick={() => { onConnect(cand.id, current.id); setParentSearch(''); }} className="btn" style={{ fontSize: '11px', padding: '4px 8px', justifyContent: 'flex-start', gap: '4px' }}>
                        <Plus size={11} color="#00ffff" />
                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{cand.tag}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Dependents: Traits that depend on this */}
          {dependents.length > 0 && (
            <div style={{ background: 'rgba(15, 23, 42, 0.5)', padding: '0.65rem', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
              <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', marginBottom: '4px' }}>Outgoing Linkages (Required by):</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {dependents.map((dep) => (
                  <span key={dep.id} style={{ background: 'rgba(56, 189, 248, 0.15)', border: '1px solid rgba(56, 189, 248, 0.3)', color: '#38bdf8', padding: '3px 8px', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11.5px' }}>
                    <span onClick={() => onSelectNode(dep)} style={{ cursor: 'pointer', textDecoration: 'underline' }}>➔ {dep.tag}</span>
                    <button onClick={() => onDisconnect(current.id, dep.id)} style={{ background: 'none', border: 'none', color: '#f43f5e', cursor: 'pointer', padding: 0 }} title="Unlink dependent">
                      <X size={12} />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Action Row: Danbooru Wiki + Discard/Restore */}
          <div style={{ display: 'grid', gridTemplateColumns: onDiscard || onRestore ? '1fr 1fr' : '1fr', gap: '0.75rem', marginTop: '0.5rem' }}>
            <a
              href={wikiUrl}
              target="_blank"
              rel="noreferrer"
              onContextMenu={(e) => { e.preventDefault(); handleOpenLink(wikiUrl); }}
              className="btn"
              style={{ minHeight: '44px', fontSize: '12.5px', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', color: '#38bdf8', borderColor: 'rgba(56, 189, 248, 0.4)', background: 'rgba(56, 189, 248, 0.1)', textDecoration: 'none', borderRadius: '8px' }}
              title="Click or right-click to open Wiki Reference URL in new tab"
            >
              <ExternalLink size={15} />
              <span>Open Wiki Reference</span>
            </a>

            {isDiscarded && onRestore ? (
              <button onClick={() => { onRestore(current.id); onClose(); }} className="btn" style={{ minHeight: '44px', fontSize: '12.5px', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', color: '#4ade80', borderColor: 'rgba(74, 222, 128, 0.4)', background: 'rgba(74, 222, 128, 0.1)', borderRadius: '8px' }}>
                <RotateCcw size={15} />
                <span>Restore to Canvas</span>
              </button>
            ) : onDiscard ? (
              <button onClick={() => { onDiscard(current.id); onClose(); }} className="btn" style={{ minHeight: '44px', fontSize: '12.5px', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', color: '#fb7185', borderColor: 'rgba(251, 113, 133, 0.4)', background: 'rgba(244, 63, 94, 0.12)', borderRadius: '8px' }}>
                <EyeOff size={15} />
                <span>Hide Trait (Discard)</span>
              </button>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
};
