import React, { useState } from 'react';
import { Copy, ExternalLink, GitBranch, Check, Ruler } from 'lucide-react';
import { FacetNodeData } from '../../services/facetLiveDataService';

interface FacetCodexCardProps {
  item: FacetNodeData;
  linkingCount?: number;
  onSelect: (item: FacetNodeData) => void;
  onCopyTag: (tag: string) => void;
}

export const FacetCodexCard: React.FC<FacetCodexCardProps> = ({
  item,
  linkingCount,
  onSelect,
  onCopyTag,
}) => {
  const [copied, setCopied] = useState(false);
  const [imgError, setImgError] = useState(false);

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard?.writeText(item.tag);
    setCopied(true);
    onCopyTag(item.tag);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleWiki = (e: React.MouseEvent) => {
    e.stopPropagation();
    const url = item.wikiUrl || `https://danbooru.donmai.us/wiki_pages/${encodeURIComponent(item.tag.replace(/ /g, '_'))}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleImageContextMenu = (e: React.MouseEvent) => {
    if (item.image) {
      e.preventDefault();
      e.stopPropagation();
      window.open(item.image, '_blank', 'noopener,noreferrer');
    }
  };

  const depsCount = (item.dependOn || []).length;
  const lengthCount = (item.length || []).length;

  return (
    <div className="hair-card" onClick={() => onSelect(item)}>
      {/* Thumbnail Container */}
      <div className="hair-card-image-wrap" onContextMenu={handleImageContextMenu} title={item.image ? 'Right click to open image in new tab' : undefined}>
        {item.image && !imgError ? (
          <img
            src={item.image}
            alt={item.tag}
            className="hair-card-image"
            loading="lazy"
            onError={() => setImgError(true)}
          />
        ) : (
          <div
            style={{
              width: '100%',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--text-dim, #64748b)',
              fontSize: '11px',
              padding: '1rem',
              textAlign: 'center',
              background: 'radial-gradient(ellipse at center, #1e293b 0%, #0f172a 100%)',
            }}
          >
            <span>No Image Preview</span>
            <span style={{ fontSize: '9px', opacity: 0.6, marginTop: '4px' }}>Wiki Available</span>
          </div>
        )}

        {/* Subcategory Badge */}
        <span className="hair-card-badge">
          {item.subcategory}
        </span>
      </div>

      {/* Card Content Body */}
      <div className="hair-card-body">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.25rem' }}>
          <span className="hair-card-tag" title={item.name || item.tag}>
            {item.name || item.tag}
          </span>
          {linkingCount !== undefined && linkingCount > 0 && (
            <span
              style={{
                background: 'rgba(56, 189, 248, 0.25)',
                color: '#38bdf8',
                padding: '1px 5px',
                borderRadius: '4px',
                fontSize: '10px',
                fontWeight: 700,
                flexShrink: 0,
              }}
              title={`${linkingCount} dependent nodes rely on this`}
            >
              ➔ {linkingCount}
            </span>
          )}
        </div>

        {/* Depend On & Length Chips */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap', marginTop: '3px' }}>
          {depsCount > 0 && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '3px',
                background: 'rgba(168, 85, 247, 0.15)',
                color: '#d8b4fe',
                fontSize: '10px',
                padding: '1px 5px',
                borderRadius: '4px',
                border: '1px solid rgba(168, 85, 247, 0.25)',
              }}
              title={`Depends on: ${(item.dependOn || []).join(', ')}`}
            >
              <GitBranch size={10} />
              <span>{depsCount} {depsCount === 1 ? 'Parent' : 'Parents'}</span>
            </div>
          )}

          {lengthCount > 0 && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '3px',
                background: 'rgba(56, 189, 248, 0.12)',
                color: '#38bdf8',
                fontSize: '10px',
                padding: '1px 5px',
                borderRadius: '4px',
              }}
              title={`Length: ${(item.length || []).join(', ')}`}
            >
              <Ruler size={10} />
              <span>{lengthCount} Length</span>
            </div>
          )}
        </div>

        {/* Action Row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.25rem', paddingTop: '0.35rem', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <button
            onClick={handleCopy}
            className="btn icon-only"
            title="Copy prompt tag"
            style={{
              padding: '2px 6px',
              fontSize: '10.5px',
              height: '24px',
              background: copied ? 'rgba(34, 197, 94, 0.2)' : 'rgba(255, 255, 255, 0.06)',
              color: copied ? '#4ade80' : 'var(--text-secondary, #94a3b8)',
              borderColor: copied ? '#22c55e' : 'transparent',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            {copied ? <Check size={12} /> : <Copy size={12} />}
            <span>{copied ? 'Copied' : 'Tag'}</span>
          </button>

          <button
            onClick={handleWiki}
            onContextMenu={(e) => { e.preventDefault(); handleWiki(e); }}
            className="btn icon-only"
            title="Click or right click to open Danbooru wiki page"
            style={{
              padding: '2px 6px',
              fontSize: '10.5px',
              height: '24px',
              background: 'rgba(56, 189, 248, 0.1)',
              color: '#38bdf8',
              borderColor: 'transparent',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <ExternalLink size={11} />
            <span>Wiki</span>
          </button>
        </div>
      </div>
    </div>
  );
};
