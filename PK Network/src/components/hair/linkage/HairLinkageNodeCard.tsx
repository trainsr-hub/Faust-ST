import React from 'react';
import { LinkageNodeData, NODE_SIZE } from '../../../services/linkageLayout';

interface HairLinkageNodeCardProps {
  node: LinkageNodeData;
  isDraggingThis: boolean;
  isTargetHover: boolean;
  onMouseDown: (e: React.MouseEvent, id: string) => void;
  onMouseEnter: (id: string) => void;
  onMouseLeave: (id: string) => void;
  onClick: () => void;
  onDoubleClick: () => void;
}

export const HairLinkageNodeCard: React.FC<HairLinkageNodeCardProps> = ({
  node,
  isDraggingThis,
  isTargetHover,
  onMouseDown,
  onMouseEnter,
  onMouseLeave,
  onClick,
  onDoubleClick,
}) => {
  const bgImage = node.isTagless
    ? 'linear-gradient(135deg, rgba(30, 41, 59, 0.96), rgba(15, 23, 42, 0.98))'
    : node.image
    ? `linear-gradient(rgba(0, 0, 0, 0.45), rgba(0, 0, 0, 0.72)), url(${node.image})`
    : 'linear-gradient(rgba(15, 23, 42, 0.95), rgba(15, 23, 42, 0.95))';

  const defaultBorder = node.isTagless
    ? '2px dashed rgba(245, 158, 11, 0.7)'
    : '1px solid rgba(255, 255, 255, 0.16)';

  return (
    <div
      onMouseDown={(e) => onMouseDown(e, node.id)}
      onContextMenu={(e) => {
        e.preventDefault();
        e.stopPropagation();
      }}
      onMouseEnter={() => onMouseEnter(node.id)}
      onMouseLeave={() => onMouseLeave(node.id)}
      onClick={onClick}
      onDoubleClick={(e) => {
        e.stopPropagation();
        onDoubleClick();
      }}
      title={
        node.isTagless
          ? `[Concept Group: ${node.customLabel || node.tag}]\nLeft-drag: connect ➔ (A => B)\nRight-drag: spawn Concept Parent ✦\nClick: inspect`
          : `[${node.tag}]\nLeft-drag: connect ➔ (A => B)\nRight-drag: spawn Concept Parent ✦\nClick: inspect`
      }
      style={{
        position: 'absolute',
        left: `${node.x || 0}px`,
        top: `${node.y || 0}px`,
        width: `${NODE_SIZE.w}px`,
        height: `${NODE_SIZE.h}px`,
        backgroundImage: bgImage,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundColor: '#0f172a',
        border: isDraggingThis
          ? '2px solid #00ffff'
          : isTargetHover
          ? '3px solid #f43f5e'
          : defaultBorder,
        borderRadius: '8px',
        boxShadow: isDraggingThis
          ? '0 0 20px #00ffff'
          : isTargetHover
          ? '0 0 25px rgba(244, 63, 94, 0.8)'
          : node.isTagless
          ? '0 0 16px rgba(245, 158, 11, 0.18)'
          : '0 6px 16px rgba(0,0,0,0.4)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '8px 10px',
        boxSizing: 'border-box',
        zIndex: isTargetHover || isDraggingThis ? 20 : 10,
        cursor: isDraggingThis ? 'grabbing' : 'grab',
        transition: 'transform 0.1s ease, box-shadow 0.1s ease',
        transform: isTargetHover ? 'scale(1.05)' : 'none',
        userSelect: 'none',
      }}
    >
      {/* Top Header */}
      {node.isTagless ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', overflow: 'hidden' }}>
          <span style={{ fontSize: '8.5px', fontWeight: 800, color: '#f59e0b', background: 'rgba(245, 158, 11, 0.2)', padding: '1px 4px', borderRadius: '3px', flexShrink: 0 }}>
            ✦ CONCEPT
          </span>
          <span
            style={{
              fontSize: '11.5px',
              fontWeight: 700,
              color: '#fbbf24',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
            title={node.customLabel || node.tag}
          >
            {node.customLabel || node.tag}
          </span>
        </div>
      ) : (
        <div
          style={{
            fontSize: '12px',
            fontWeight: 700,
            color: '#ffffff',
            textShadow: '0 1px 3px rgba(0,0,0,0.9)',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            lineHeight: '1.2',
          }}
          title={node.tag}
        >
          {node.tag}
        </div>
      )}

      {/* Footer Info: Subcategory & Link count badge */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: '9.5px',
          color: 'rgba(255, 255, 255, 0.75)',
          textShadow: '0 1px 2px rgba(0,0,0,0.8)',
        }}
      >
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '115px' }}>
          {node.subcategory || node.category}
        </span>
        {((node.linkingCount !== undefined ? node.linkingCount : Object.keys(node.links_to || {}).length) > 0) && (
          <span
            style={{
              background: 'rgba(56, 189, 248, 0.3)',
              color: '#38bdf8',
              padding: '1px 5px',
              borderRadius: '4px',
              fontSize: '9px',
              fontWeight: 600,
            }}
            title={`${node.linkingCount ?? Object.keys(node.links_to || {}).length} total dependent nodes (down to leaves)`}
          >
            ➔ {node.linkingCount !== undefined ? node.linkingCount : Object.keys(node.links_to || {}).length}
          </span>
        )}
      </div>
    </div>
  );
};
