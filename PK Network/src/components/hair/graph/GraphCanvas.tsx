import React, { useRef, useState, useCallback, useEffect } from 'react';
import { GraphNode, GraphEdge, GraphViewport } from '../../../types/hairGraph';
import { GraphNodeCard } from './GraphNodeCard';

interface GraphCanvasProps {
  nodes: Record<string, GraphNode>;
  edges: GraphEdge[];
  viewport: GraphViewport;
  selectedNodeId: string | null;
  onUpdateViewport: (viewport: GraphViewport) => void;
  onUpdateNodePosition: (id: string, x: number, y: number) => void;
  onSelectNode: (id: string | null) => void;
  onDeleteNode: (id: string) => void;
  onAddEdge: (sourceId: string, targetId: string) => void;
  onDeleteEdge: (edgeId: string) => void;
  onCopyTag: (tag: string) => void;
  onInspectNode: (node: GraphNode) => void;
}

export const GraphCanvas: React.FC<GraphCanvasProps> = ({
  nodes,
  edges,
  viewport,
  selectedNodeId,
  onUpdateViewport,
  onUpdateNodePosition,
  onSelectNode,
  onDeleteNode,
  onAddEdge,
  onDeleteEdge,
  onCopyTag,
  onInspectNode,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [draggingNodeId, setDraggingNodeId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [connectingSource, setConnectingSource] = useState<string | null>(null);
  const [mouseCanvasPos, setMouseCanvasPos] = useState({ x: 0, y: 0 });

  const getCanvasCoords = useCallback(
    (clientX: number, clientY: number) => {
      if (!containerRef.current) return { x: 0, y: 0 };
      const rect = containerRef.current.getBoundingClientRect();
      const rawX = clientX - rect.left;
      const rawY = clientY - rect.top;
      return {
        x: (rawX - viewport.x) / viewport.zoom,
        y: (rawY - viewport.y) / viewport.zoom,
      };
    },
    [viewport]
  );

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button === 0 && e.target === containerRef.current) {
      setIsPanning(true);
      setPanStart({ x: e.clientX - viewport.x, y: e.clientY - viewport.y });
      onSelectNode(null);
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    const coords = getCanvasCoords(e.clientX, e.clientY);
    setMouseCanvasPos(coords);

    if (isPanning) {
      onUpdateViewport({
        ...viewport,
        x: e.clientX - panStart.x,
        y: e.clientY - panStart.y,
      });
    } else if (draggingNodeId && nodes[draggingNodeId]) {
      onUpdateNodePosition(
        draggingNodeId,
        coords.x - dragOffset.x,
        coords.y - dragOffset.y
      );
    }
  };

  const handleMouseUp = () => {
    setIsPanning(false);
    setDraggingNodeId(null);
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const zoomFactor = e.deltaY < 0 ? 1.12 : 0.88;
    const newZoom = Math.min(Math.max(viewport.zoom * zoomFactor, 0.15), 2.5);

    const newX = mouseX - (mouseX - viewport.x) * (newZoom / viewport.zoom);
    const newY = mouseY - (mouseY - viewport.y) * (newZoom / viewport.zoom);

    onUpdateViewport({ x: newX, y: newY, zoom: newZoom });
  };

  const handleDragStart = (e: React.MouseEvent, nodeId: string) => {
    e.stopPropagation();
    const node = nodes[nodeId];
    if (!node) return;
    const coords = getCanvasCoords(e.clientX, e.clientY);
    setDraggingNodeId(nodeId);
    setDragOffset({ x: coords.x - node.x, y: coords.y - node.y });
    onSelectNode(nodeId);
  };

  const handleStartConnect = (nodeId: string) => {
    setConnectingSource(nodeId);
  };

  const handleCompleteConnect = (targetId: string) => {
    if (connectingSource && connectingSource !== targetId) {
      onAddEdge(connectingSource, targetId);
    }
    setConnectingSource(null);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setConnectingSource(null);
        onSelectNode(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onSelectNode]);

  return (
    <div
      ref={containerRef}
      className={`graph-canvas-container ${isPanning ? 'panning' : ''} ${
        connectingSource ? 'connecting' : ''
      }`}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onWheel={handleWheel}
    >
      <div
        className="graph-transform-layer"
        style={{
          transform: `translate3d(${viewport.x}px, ${viewport.y}px, 0) scale(${viewport.zoom})`,
        }}
      >
        {/* SVG Directed Arrows Layer */}
        <svg className="graph-svg-layer" width="8000" height="8000">
          <defs>
            <marker
              id="arrow-default"
              viewBox="0 0 10 10"
              refX="8"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M 0 1 L 9 5 L 0 9 z" fill="rgba(148, 163, 184, 0.75)" />
            </marker>
            <marker
              id="arrow-hover"
              viewBox="0 0 10 10"
              refX="8"
              refY="5"
              markerWidth="7"
              markerHeight="7"
              orient="auto-start-reverse"
            >
              <path d="M 0 1 L 9 5 L 0 9 z" fill="#f43f5e" />
            </marker>
          </defs>

          {/* Render All Existing Edges */}
          {edges.map((edge) => {
            const src = nodes[edge.sourceId];
            const dst = nodes[edge.targetId];
            if (!src || !dst) return null;

            const sx = src.x + (src.width || 170) / 2;
            const sy = src.y + (src.height || 220) / 2;
            const tx = dst.x + (dst.width || 170) / 2;
            const ty = dst.y + (dst.height || 220) / 2;

            const dx = tx - sx;
            const d = `M ${sx} ${sy} C ${sx + dx * 0.45} ${sy}, ${tx - dx * 0.45} ${ty}, ${tx} ${ty}`;

            return (
              <g key={edge.id} className="graph-edge-group">
                <path
                  d={d}
                  className="graph-edge-path"
                  markerEnd="url(#arrow-default)"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (window.confirm(`Disconnect arrow between ${src.tag} and ${dst.tag}?`)) {
                      onDeleteEdge(edge.id);
                    }
                  }}
                />
              </g>
            );
          })}

          {/* Active Connecting Arrow Preview */}
          {connectingSource && nodes[connectingSource] && (
            <path
              d={`M ${nodes[connectingSource].x + 85} ${
                nodes[connectingSource].y + 110
              } L ${mouseCanvasPos.x} ${mouseCanvasPos.y}`}
              className="graph-edge-connecting"
              markerEnd="url(#arrow-hover)"
            />
          )}
        </svg>

        {/* HTML Draggable Nodes Layer */}
        {Object.values(nodes).map((node) => (
          <GraphNodeCard
            key={node.id}
            node={node}
            isSelected={selectedNodeId === node.id}
            isConnecting={Boolean(connectingSource)}
            isConnectTarget={Boolean(connectingSource && connectingSource !== node.id)}
            onStartConnect={handleStartConnect}
            onCompleteConnect={handleCompleteConnect}
            onSelectNode={onSelectNode}
            onDeleteNode={onDeleteNode}
            onCopyTag={onCopyTag}
            onDragStart={handleDragStart}
            onInspect={onInspectNode}
          />
        ))}
      </div>
    </div>
  );
};
