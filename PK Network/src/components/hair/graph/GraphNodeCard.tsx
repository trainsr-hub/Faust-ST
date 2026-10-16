import React from 'react';
import { Copy, Maximize2, Trash2, ArrowRight } from 'lucide-react';
import { GraphNode } from '../../../types/hairGraph';

interface GraphNodeCardProps {
  node: GraphNode;
  isSelected?: boolean;
  isConnectTarget?: boolean;
  isConnecting?: boolean;
  onStartConnect: (nodeId: string, port: 'top' | 'bottom' | 'left' | 'right') => void;
  onCompleteConnect: (nodeId: string) => void;
  onSelectNode: (nodeId: string) => void;
  onDeleteNode: (nodeId: string) => void;
  onCopyTag: (tag: string) => void;
  onDragStart: (e: React.MouseEvent, nodeId: string) => void;
  onInspect: (node: GraphNode) => void;
}

export const GraphNodeCard: React.FC<GraphNodeCardProps> = ({
  node,
  isSelected,
  isConnectTarget,
  isConnecting,
  onStartConnect,
  onCompleteConnect,
  onSelectNode,
  onDeleteNode,
  onCopyTag,
  onDragStart,
  onInspect,
}) => {
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isConnecting) {
      onCompleteConnect(node.id);
    } else {
      onSelectNode(node.id);
    }
  };

  const handlePortMouseDown = (
    e: React.MouseEvent,
    port: 'top' | 'bottom' | 'left' | 'right'
  ) => {
    e.stopPropagation();
    onStartConnect(node.id, port);
  };

  return (
    <div
      className={`graph-node-card ${isSelected ? 'selected' : ''} ${
        isConnectTarget ? 'connect-target' : ''
      }`}
      style={{
        transform: `translate3d(${node.x}px, ${node.y}px, 0)`,
        width: `${node.width || 170}px`,
        height: `${node.height || 220}px`,
      }}
      onClick={handleClick}
    >
      {/* 4 Directional Connection Anchor Ports */}
      <div
        className="graph-port graph-port-top"
        title="Connect arrow from top"
        onMouseDown={(e) => handlePortMouseDown(e, 'top')}
      />
      <div
        className="graph-port graph-port-bottom"
        title="Connect arrow from bottom"
        onMouseDown={(e) => handlePortMouseDown(e, 'bottom')}
      />
      <div
        className="graph-port graph-port-left"
        title="Connect arrow from left"
        onMouseDown={(e) => handlePortMouseDown(e, 'left')}
      />
      <div
        className="graph-port graph-port-right"
        title="Connect arrow from right"
        onMouseDown={(e) => handlePortMouseDown(e, 'right')}
      />

      {/* Header / Drag Handle */}
      <div
        className="graph-node-header"
        onMouseDown={(e) => onDragStart(e, node.id)}
      >
        <span className="graph-node-tag" title={node.tag}>
          {node.tag}
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
          <button
            className="btn icon-only"
            style={{ width: '22px', height: '22px', padding: 0 }}
            title="Inspect Dossier"
            onClick={(e) => {
              e.stopPropagation();
              onInspect(node);
            }}
          >
            <Maximize2 size={11} />
          </button>
          <button
            className="btn icon-only"
            style={{ width: '22px', height: '22px', padding: 0 }}
            title="Remove from Canvas"
            onClick={(e) => {
              e.stopPropagation();
              onDeleteNode(node.id);
            }}
          >
            <Trash2 size={11} />
          </button>
        </div>
      </div>

      {/* Thumbnail */}
      <div
        className="graph-node-thumb-box"
        onMouseDown={(e) => onDragStart(e, node.id)}
      >
        {node.imageUrl ? (
          <img
            src={node.imageUrl}
            alt={node.tag}
            className="graph-node-img"
            loading="lazy"
            onError={(e) => {
              (e.target as HTMLElement).style.display = 'none';
            }}
          />
        ) : (
          <div style={{ fontSize: '11px', color: 'var(--text-dim)' }}>
            No Preview
          </div>
        )}
      </div>

      {/* Footer / Quick Actions */}
      <div className="graph-node-footer">
        <span className="graph-node-subcat">
          {node.subcategory || node.category}
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <button
            className="btn icon-only"
            style={{ width: '22px', height: '22px', padding: 0 }}
            title="Copy Prompt Tag"
            onClick={(e) => {
              e.stopPropagation();
              onCopyTag(node.tag);
            }}
          >
            <Copy size={11} />
          </button>
          <button
            className="btn icon-only"
            style={{
              width: '22px',
              height: '22px',
              padding: 0,
              background: 'rgba(56, 189, 248, 0.2)',
              color: '#38bdf8',
            }}
            title="Connect Arrow to..."
            onClick={(e) => {
              e.stopPropagation();
              onStartConnect(node.id, 'right');
            }}
          >
            <ArrowRight size={11} />
          </button>
        </div>
      </div>
    </div>
  );
};
