import React, { useState } from 'react';
import { Copy, ExternalLink, GitBranch, Check, Sparkles } from 'lucide-react';
import { HairCodexItem } from '../../types/hairCodex';

interface HairCodexCardProps {
  item: HairCodexItem;
  linkingCount?: number;
  onSelect: (item: HairCodexItem) => void;
  onCopyTag: (tag: string) => void;
}

export const HairCodexCard: React.FC<HairCodexCardProps> = ({
  item,
  linkingCount,
  onSelect,
  onCopyTag,
}) => {
  const [copied, setCopied] = useState(false);
  const [imgError, setImgError] = useState(false);

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(item.tag);
    setCopied(true);
    onCopyTag(item.tag);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleWiki = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (item.wikiUrl) {
      window.open(item.wikiUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const isTagless = Boolean(item.isTagless);

  return (
    <div
      className="hair-card"
      onClick={() => onSelect(item)}
      style={{
        borderColor: isTagless ? 'rgba(245, 158, 11, 0.4)' : undefined,
        boxShadow: isTagless ? '0 4px 16px rgba(245, 158, 11, 0.12)' : undefined,
      }}
    >
      {/* Image / Concept Preview Container */}
      <div className="hair-card-image-wrap">
        {item.imageUrl && !imgError ? (
          <img
            src={item.imageUrl}
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
              color: isTagless ? '#fbbf24' : 'var(--text-dim, #64748b)',
              fontSize: '11px',
              padding: '1rem',
              textAlign: 'center',
              background: isTagless
                ? 'linear-gradient(135deg, rgba(30, 41, 59, 0.95), rgba(15, 23, 42, 0.98))'
                : 'radial-gradient(ellipse at center, #1e293b 0%, #0f172a 100%)',
            }}
          >
            {isTagless ? (
              <>
                <Sparkles size={24} color="#f59e0b" style={{ marginBottom: '4px' }} />
                <span style={{ fontWeight: 700, color: '#fbbf24' }}>Structural Concept Hub</span>
              </>
            ) : (
              <>
                <span>No Image Preview</span>
                <span style={{ fontSize: '9px', opacity: 0.6, marginTop: '4px' }}>Danbooru Wiki Link Available</span>
              </>
            )}
          </div>
        )}

        {/* Subcategory Chip */}
        <span
          className="hair-card-badge"
          style={{
            background: isTagless ? 'rgba(245, 158, 11, 0.25)' : undefined,
            color: isTagless ? '#fbbf24' : undefined,
          }}
        >
          {isTagless ? '✦ CONCEPT' : item.subcategory}
        </span>
      </div>

      {/* Card Content Body */}
      <div className="hair-card-body">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.25rem' }}>
          <span className="hair-card-tag" style={{ color: isTagless ? '#fbbf24' : undefined }}>
            {item.customLabel || item.tag}
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
              title={`${linkingCount} dependent nodes (down to leaves) rely on this`}
            >
              ➔ {linkingCount}
            </span>
          )}
        </div>

        {/* Parent Relation Chip */}
        {item.parentTag && (
          <div className="hair-card-parent" title={`Parent tag: ${item.parentTag}`}>
            <GitBranch size={11} />
            <span>Parent: <strong>{item.parentTag}</strong></span>
          </div>
        )}

        {/* Action Row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.25rem', paddingTop: '0.35rem', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          {isTagless ? (
            <div style={{ width: '100%', textAlign: 'center', fontSize: '10px', color: '#fbbf24', opacity: 0.85 }}>
              Click to view or edit concept
            </div>
          ) : (
            <>
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
                className="btn icon-only"
                title="Open Danbooru wiki page"
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
            </>
          )}
        </div>
      </div>
    </div>
  );
};
