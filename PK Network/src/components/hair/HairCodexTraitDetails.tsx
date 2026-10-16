import React, { useState } from 'react';
import { ExternalLink, Copy, Check, GitBranch, Image as ImageIcon, EyeOff, RotateCcw } from 'lucide-react';
import { HairCodexItem } from '../../types/hairCodex';
import { HairLinkageQuickConnect } from './linkage/HairLinkageQuickConnect';

interface HairCodexTraitDetailsProps {
  item: HairCodexItem;
  database?: Record<string, any>;
  onClose: () => void;
  onCopyTag: (tag: string) => void;
  onDiscard?: (id: string) => void;
  isDiscarded?: boolean;
  onRestore?: (id: string) => void;
  onConnect?: (sourceId: string, targetId: string) => void;
  onDisconnect?: (sourceId: string, targetId: string) => void;
}

export const HairCodexTraitDetails: React.FC<HairCodexTraitDetailsProps> = ({
  item,
  database,
  onClose,
  onCopyTag,
  onDiscard,
  isDiscarded,
  onRestore,
  onConnect,
  onDisconnect,
}) => {
  const [copied, setCopied] = useState<string | null>(null);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    onCopyTag(text);
    setTimeout(() => setCopied(null), 1500);
  };

  return (
    <>
      {/* Main Visual Image */}
      {item.imageUrl ? (
        <div
          style={{
            width: '100%',
            maxHeight: '360px',
            borderRadius: '10px',
            overflow: 'hidden',
            background: '#0b1120',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '1px solid rgba(255, 255, 255, 0.08)',
          }}
        >
          <img
            src={item.imageUrl}
            alt={item.tag}
            style={{ width: '100%', height: '100%', maxHeight: '360px', objectFit: 'contain' }}
          />
        </div>
      ) : (
        <div
          style={{
            padding: '2.5rem',
            textAlign: 'center',
            background: 'rgba(255, 255, 255, 0.02)',
            borderRadius: '10px',
            color: 'var(--text-dim)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          <ImageIcon size={32} opacity={0.4} />
          <span>No image preview directly embedded in markdown.</span>
        </div>
      )}

      {/* Prompt Tokens & Quick Copy Buttons */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
        {[
          { label: 'Standard Prompt Tag:', val: item.tag, key: 'standard', color: '#f8fafc' },
          { label: 'Danbooru Underscore Tag:', val: item.danbooruTag, key: 'danbooru', color: '#38bdf8' },
        ].map((token) => (
          <div key={token.key} style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '0.65rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)' }}>
            <span style={{ fontSize: '10px', color: 'var(--text-dim)', display: 'block', marginBottom: '2px' }}>{token.label}</span>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
              <code style={{ fontSize: '11.5px', color: token.color, fontWeight: 600 }}>{token.val}</code>
              <button onClick={() => handleCopy(token.val, token.key)} className="btn icon-only" style={{ height: '22px', padding: '0 6px', fontSize: '10px' }}>
                {copied === token.key ? <Check size={11} color="#4ade80" /> : <Copy size={11} />}
                <span>{copied === token.key ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          </div>
        ))}
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

      {/* Parent Relationship */}
      {item.parentTag && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(168, 85, 247, 0.1)', padding: '0.6rem 0.85rem', borderRadius: '8px', border: '1px solid rgba(168, 85, 247, 0.25)', fontSize: '12px' }}>
          <GitBranch size={14} color="#c084fc" />
          <span>Parent Taxonomy Link: <strong style={{ color: '#d8b4fe' }}>{item.parentTag}</strong></span>
        </div>
      )}

      {/* Primary Command Actions: Danbooru Wiki + Discard/Restore */}
      <div style={{ display: 'grid', gridTemplateColumns: onDiscard || onRestore ? '1fr 1fr' : '1fr', gap: '0.75rem', marginTop: '0.25rem' }}>
        <a
          href={item.wikiUrl || `https://danbooru.donmai.us/wiki_pages/${item.danbooruTag || item.id}`}
          target="_blank"
          rel="noreferrer"
          className="btn"
          style={{
            minHeight: '44px',
            fontSize: '12.5px',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            color: '#38bdf8',
            borderColor: 'rgba(56, 189, 248, 0.4)',
            background: 'rgba(56, 189, 248, 0.1)',
            textDecoration: 'none',
            borderRadius: '8px',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
          }}
          title="Open official Danbooru wiki documentation in new tab"
        >
          <ExternalLink size={15} />
          <span>Open Danbooru Wiki</span>
        </a>

        {isDiscarded && onRestore ? (
          <button
            onClick={() => {
              onRestore(item.id);
              onClose();
            }}
            className="btn"
            style={{
              minHeight: '44px',
              fontSize: '12.5px',
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
            title="Restore this trait back to active linkage canvas"
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
              fontSize: '12.5px',
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
            title="Hide this trait from canvas (safely recoverable from Discarded Pool)"
          >
            <EyeOff size={15} />
            <span>Hide Trait (Discard)</span>
          </button>
        ) : null}
      </div>

      {/* Reference Artwork Post */}
      {item.postUrl && (
        <a
          href={item.postUrl}
          target="_blank"
          rel="noreferrer"
          style={{
            fontSize: '11px',
            color: 'var(--text-tertiary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '4px',
            textDecoration: 'none',
          }}
        >
          <ExternalLink size={11} />
          <span>View Reference Artwork Post</span>
        </a>
      )}
    </>
  );
};
