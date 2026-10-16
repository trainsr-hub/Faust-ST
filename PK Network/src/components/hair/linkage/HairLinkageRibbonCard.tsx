import React from 'react';
import { Eye, EyeOff, Sparkles, ExternalLink } from 'lucide-react';
import { LinkageNodeData } from '../../../services/linkageLayout';

interface HairLinkageRibbonCardProps {
  node: LinkageNodeData;
  linkingCount?: number;
  isDraggingThis: boolean;
  isTargetHover: boolean;
  isExcluded?: boolean;
  aspectMode?: '3:2' | '1:1';
  onMouseDown: (e: React.MouseEvent, id: string) => void;
  onMouseEnter: (id: string) => void;
  onMouseLeave: () => void;
  onClick: () => void;
  onToggleExcludeBranch?: (id: string) => void;
}

export const HairLinkageRibbonCard: React.FC<HairLinkageRibbonCardProps> = ({
  node,
  linkingCount,
  isDraggingThis,
  isTargetHover,
  isExcluded = false,
  aspectMode = '3:2',
  onMouseDown,
  onMouseEnter,
  onMouseLeave,
  onClick,
  onToggleExcludeBranch,
}) => {
  const defaultBorder = node.isTagless
    ? '1.5px dashed rgba(245, 158, 11, 0.7)'
    : isExcluded
    ? '1px dashed rgba(255, 255, 255, 0.25)'
    : '1px solid rgba(255, 255, 255, 0.16)';

  const dependentCount = linkingCount !== undefined ? linkingCount : Object.keys(node.links_to || {}).length;
  const wikiUrl = `https://danbooru.donmai.us/wiki_pages/${encodeURIComponent(node.tag)}`;

  return (
    <div
      onMouseDown={(e) => onMouseDown(e, node.id)}
      onContextMenu={(e) => {
        e.preventDefault();
        e.stopPropagation();
      }}
      onMouseEnter={() => onMouseEnter(node.id)}
      onMouseLeave={onMouseLeave}
      onClick={onClick}
      title={
        node.isTagless
          ? `[Concept: ${node.customLabel || node.tag}]\nDependents: ${dependentCount}\nLeft-drag: connect ➔ | Right-drag: spawn Concept Parent ✦`
          : `[${node.tag}]\nDependents: ${dependentCount}\nRight-click: open Danbooru wiki ↗\nLeft-drag: connect ➔ | Right-drag: spawn Concept Parent ✦`
      }
      style={{
        width: '100%',
        flexShrink: 0,
        boxSizing: 'border-box',
        backgroundColor: '#0a0f1d',
        border: isDraggingThis
          ? '2px solid #00ffff'
          : isTargetHover
          ? '3px solid #f43f5e'
          : defaultBorder,
        borderRadius: '8px',
        boxShadow: isDraggingThis
          ? '0 0 16px #00ffff'
          : isTargetHover
          ? '0 0 20px rgba(244, 63, 94, 0.9)'
          : node.isTagless
          ? '0 0 12px rgba(245, 158, 11, 0.15)'
          : '0 4px 14px rgba(0,0,0,0.5)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        cursor: isDraggingThis ? 'grabbing' : 'grab',
        transition: 'transform 0.1s ease, box-shadow 0.1s ease, opacity 0.15s ease',
        transform: isTargetHover ? 'scale(1.03)' : 'none',
        opacity: isExcluded ? 0.45 : 1,
        filter: isExcluded ? 'grayscale(0.5)' : 'none',
        userSelect: 'none',
      }}
    >
      {/* Prominent Full-Width Image Banner (3:2 or 1:1) */}
      <div
        style={{
          width: '100%',
          aspectRatio: aspectMode === '1:1' ? '1 / 1' : '3 / 2',
          position: 'relative',
          overflow: 'hidden',
          backgroundColor: '#0f172a',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {node.isTagless ? (
          <div
            style={{
              width: '100%',
              height: '100%',
              background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.2), rgba(15, 23, 42, 0.95))',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
            }}
          >
            <Sparkles size={24} color="#f59e0b" />
            <span style={{ fontSize: '9px', fontWeight: 800, color: '#fbbf24', letterSpacing: '0.8px' }}>
              STRUCTURAL CONCEPT
            </span>
          </div>
        ) : node.image ? (
          <img
            src={node.image}
            alt={node.tag}
            loading="lazy"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              display: 'block',
            }}
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
              color: 'var(--text-dim)',
              fontSize: '10px',
              padding: '8px',
              textAlign: 'center',
            }}
          >
            <span>{node.tag}</span>
            <span style={{ fontSize: '8.5px', opacity: 0.6, marginTop: '2px' }}>Right-click for wiki</span>
          </div>
        )}

        {/* Top-Left Category Badge */}
        <span
          style={{
            position: 'absolute',
            top: '6px',
            left: '6px',
            fontSize: '8.5px',
            fontWeight: 700,
            padding: '2px 6px',
            borderRadius: '4px',
            background: 'rgba(15, 23, 42, 0.85)',
            backdropFilter: 'blur(6px)',
            border: node.isTagless ? '1px dashed rgba(245, 158, 11, 0.6)' : '1px solid rgba(255, 255, 255, 0.15)',
            color: node.isTagless ? '#fbbf24' : '#e2e8f0',
            letterSpacing: '0.02em',
            maxWidth: '120px',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {node.isTagless ? '✦ CONCEPT' : node.subcategory || node.category}
        </span>

        {/* Top-Right Exclude Branch Button */}
        {onToggleExcludeBranch && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              onToggleExcludeBranch(node.id);
            }}
            onMouseDown={(e) => e.stopPropagation()}
            style={{
              position: 'absolute',
              top: '6px',
              right: '6px',
              background: isExcluded ? 'rgba(56, 189, 248, 0.35)' : 'rgba(15, 23, 42, 0.85)',
              backdropFilter: 'blur(6px)',
              border: isExcluded ? '1px solid rgba(56, 189, 248, 0.6)' : '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '4px',
              padding: '3px 5px',
              color: isExcluded ? '#38bdf8' : 'rgba(255, 255, 255, 0.8)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            title={
              isExcluded
                ? `Restore "${node.customLabel || node.tag}" branch to Target Rail`
                : `Hide entire branch of "${node.customLabel || node.tag}" from Target Rail`
            }
          >
            {isExcluded ? <Eye size={11} /> : <EyeOff size={11} />}
          </button>
        )}

        {/* Bottom-Right Transitive Dependent Badge */}
        {dependentCount > 0 && (
          <span
            style={{
              position: 'absolute',
              bottom: '6px',
              right: '6px',
              background: 'rgba(2, 6, 23, 0.9)',
              border: '1px solid rgba(56, 189, 248, 0.5)',
              color: '#38bdf8',
              padding: '1px 6px',
              borderRadius: '4px',
              fontWeight: 700,
              fontSize: '9.5px',
              backdropFilter: 'blur(6px)',
            }}
            title={`${dependentCount} dependent nodes rely on this`}
          >
            ➔ {dependentCount}
          </span>
        )}
      </div>

      {/* Card Info Footer */}
      <div
        style={{
          padding: '6px 8px 7px',
          background: 'rgba(10, 15, 30, 0.95)',
          display: 'flex',
          flexDirection: 'column',
          gap: '3px',
          borderTop: '1px solid rgba(255, 255, 255, 0.06)',
        }}
      >
        <div
          style={{
            fontSize: '11.5px',
            fontWeight: 700,
            color: node.isTagless ? '#fbbf24' : '#ffffff',
            textShadow: '0 1px 2px rgba(0,0,0,0.8)',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            lineHeight: '1.25',
          }}
          title={node.customLabel || node.tag}
        >
          {node.customLabel || node.tag}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '4px', marginTop: '1px' }}>
          <span style={{ fontSize: '9px', color: 'rgba(255, 255, 255, 0.5)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {node.subcategory || node.category}
          </span>

          {!node.isTagless && (
            <a
              href={wikiUrl}
              target="_blank"
              rel="noreferrer"
              onClick={(e) => e.stopPropagation()}
              onMouseDown={(e) => e.stopPropagation()}
              style={{
                fontSize: '9px',
                color: '#38bdf8',
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '2px',
                opacity: 0.9,
                cursor: 'pointer',
              }}
              title="Right-click card or click here to open Danbooru wiki"
            >
              <ExternalLink size={9.5} />
              <span>wiki</span>
            </a>
          )}
        </div>
      </div>
    </div>
  );
};
