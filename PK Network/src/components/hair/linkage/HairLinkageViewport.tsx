import React, { useRef, useState, useMemo, useEffect, useCallback } from 'react';
import {
  LinkageNodeData,
  LinkageEdge,
  NODE_SIZE,
  calculateLinkageLayout,
  checkIntersection,
} from '../../../services/linkageLayout';
import { HairLinkageNodeCard } from './HairLinkageNodeCard';
import { HairLinkageRibbonSlider } from './HairLinkageRibbonSlider';

interface HairLinkageViewportProps {
  database: Record<string, LinkageNodeData>;
  orientation: 'horizontal' | 'vertical';
  searchQuery: string;
  subcategoryFilter?: string | null;
  onConnect: (sourceId: string, targetId: string) => void;
  onDisconnect: (sourceId: string, targetId: string) => void;
  onSelectNode: (node: LinkageNodeData) => void;
  onCopyTag: (tag: string) => void;
  onDiscardNode?: (id: string) => void;
  onSpawnConceptParent?: (childNodeId: string) => void;
}

export const HairLinkageViewport: React.FC<HairLinkageViewportProps> = ({
  database,
  orientation,
  searchQuery,
  subcategoryFilter = null,
  onConnect,
  onDisconnect,
  onSelectNode,
  onCopyTag,
  onSpawnConceptParent,
}) => {
  const outerRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const [dragState, setDragState] = useState<{
    sourceId: string;
    isRightClick: boolean;
    startX: number;
    startY: number;
    currX: number;
    currY: number;
    mouseStartX: number;
    mouseStartY: number;
  } | null>(null);
  const [hoverNodeId, setHoverNodeId] = useState<string | null>(null);
  const [sliceLine, setSliceLine] = useState<{ startX: number; startY: number; endX: number; endY: number } | null>(null);
  const suppressContextMenuRef = useRef(false);

  const layout = useMemo(
    () => calculateLinkageLayout(database, orientation, searchQuery, subcategoryFilter),
    [database, orientation, searchQuery, subcategoryFilter]
  );

  const getCanvasCoords = useCallback((clientX: number, clientY: number) => {
    if (!viewportRef.current) return { x: 0, y: 0 };
    const rect = viewportRef.current.getBoundingClientRect();
    return {
      x: clientX - rect.left + viewportRef.current.scrollLeft,
      y: clientY - rect.top + viewportRef.current.scrollTop,
    };
  }, []);

  const handleNodeMouseDown = (e: React.MouseEvent, nodeId: string) => {
    if (e.button === 0 || e.button === 2) {
      e.stopPropagation();
      if (e.button === 2) {
        e.preventDefault();
        suppressContextMenuRef.current = true;
      }
      const cardRect = (e.currentTarget as HTMLElement).getBoundingClientRect();
      const outerRect = outerRef.current?.getBoundingClientRect() || { left: 0, top: 0 };
      setDragState({
        sourceId: nodeId,
        isRightClick: e.button === 2,
        startX: cardRect.left + cardRect.width / 2 - outerRect.left,
        startY: cardRect.top + cardRect.height / 2 - outerRect.top,
        currX: e.clientX - outerRect.left,
        currY: e.clientY - outerRect.top,
        mouseStartX: e.clientX,
        mouseStartY: e.clientY,
      });
    }
  };

  const handleViewportMouseDown = (e: React.MouseEvent) => {
    if (e.button === 2) {
      e.preventDefault();
      suppressContextMenuRef.current = true;
      const coords = getCanvasCoords(e.clientX, e.clientY);
      setSliceLine({ startX: coords.x, startY: coords.y, endX: coords.x, endY: coords.y });
    }
  };

  useEffect(() => {
    const el = outerRef.current;
    if (!el) return;
    const prevent = (e: MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
    };
    el.addEventListener('contextmenu', prevent, true);
    return () => el.removeEventListener('contextmenu', prevent, true);
  }, []);

  useEffect(() => {
    const handleWindowMouseMove = (e: MouseEvent) => {
      if (dragState && outerRef.current) {
        const outerRect = outerRef.current.getBoundingClientRect();
        setDragState((prev) => (prev ? { ...prev, currX: e.clientX - outerRect.left, currY: e.clientY - outerRect.top } : null));

        if (viewportRef.current) {
          const r = viewportRef.current.getBoundingClientRect();
          if (e.clientY < r.top + 75) viewportRef.current.scrollTop -= 20;
          else if (e.clientY > r.bottom - 75) viewportRef.current.scrollTop += 20;
        }
      }

      if (sliceLine) {
        const coords = getCanvasCoords(e.clientX, e.clientY);
        setSliceLine((prev) => (prev ? { ...prev, endX: coords.x, endY: coords.y } : null));
      }
    };

    const handleWindowMouseUp = (e: MouseEvent) => {
      if (dragState?.isRightClick || sliceLine) {
        suppressContextMenuRef.current = true;
        setTimeout(() => { suppressContextMenuRef.current = false; }, 350);
      }

      if (dragState) {
        if (dragState.isRightClick) {
          const dist = Math.hypot(e.clientX - dragState.mouseStartX, e.clientY - dragState.mouseStartY);
          if (dist > 20) {
            onSpawnConceptParent?.(dragState.sourceId);
          } else {
            const node = database[dragState.sourceId];
            if (node && !node.isTagless && node.tag) {
              window.open(`https://danbooru.donmai.us/wiki_pages/${encodeURIComponent(node.tag)}`, '_blank', 'noopener,noreferrer');
            }
          }
        } else if (hoverNodeId && hoverNodeId !== dragState.sourceId) {
          onConnect(dragState.sourceId, hoverNodeId);
        }
        setDragState(null);
        setHoverNodeId(null);
      }

      if (sliceLine) {
        layout.edges.forEach((edge) => {
          const hit = checkIntersection(
            { x: sliceLine.startX, y: sliceLine.startY },
            { x: sliceLine.endX, y: sliceLine.endY },
            { x: edge.fromX, y: edge.fromY },
            { x: edge.toX, y: edge.toY }
          );
          if (hit) onDisconnect(edge.sourceId, edge.targetId);
        });
        setSliceLine(null);
      }
    };

    const handleGlobalContextMenu = (e: MouseEvent) => {
      if (suppressContextMenuRef.current || dragState?.isRightClick || sliceLine) {
        e.preventDefault();
        e.stopPropagation();
      }
    };

    window.addEventListener('mousemove', handleWindowMouseMove);
    window.addEventListener('mouseup', handleWindowMouseUp);
    window.addEventListener('contextmenu', handleGlobalContextMenu, true);
    return () => {
      window.removeEventListener('mousemove', handleWindowMouseMove);
      window.removeEventListener('mouseup', handleWindowMouseUp);
      window.removeEventListener('contextmenu', handleGlobalContextMenu, true);
    };
  }, [dragState, hoverNodeId, layout.edges, onConnect, onDisconnect, onSpawnConceptParent, sliceLine, getCanvasCoords, database]);

  return (
    <div
      ref={outerRef}
      onContextMenu={(e) => e.preventDefault()}
      style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', flexDirection: 'row', overflow: 'hidden', backgroundColor: '#05070f' }}
    >
      {/* Scrollable Canvas Viewport */}
      <div
        ref={viewportRef}
        onContextMenu={(e) => e.preventDefault()}
        onMouseDown={handleViewportMouseDown}
        style={{ flex: 1, position: 'relative', overflowY: 'auto', overflowX: dragState ? 'hidden' : 'auto', cursor: sliceLine || dragState ? 'crosshair' : 'default' }}
      >
        <div
          style={{
            position: 'absolute',
            width: `${layout.canvasWidth}px`,
            height: `${layout.canvasHeight}px`,
            backgroundImage: 'radial-gradient(rgba(255, 255, 255, 0.1) 1.2px, transparent 1.2px)',
            backgroundSize: '28px 28px',
            pointerEvents: 'none',
          }}
        />

        <svg style={{ position: 'absolute', width: `${layout.canvasWidth}px`, height: `${layout.canvasHeight}px`, top: 0, left: 0, pointerEvents: 'none', zIndex: 5 }}>
          <defs>
            <marker id="linkage-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 1 L 9 5 L 0 9 z" fill="rgba(56, 189, 248, 0.7)" />
            </marker>
          </defs>

          {layout.edges.map((edge) => {
            const dx = edge.toX - edge.fromX;
            const ctrl = Math.max(Math.abs(dx) * 0.45, 40);
            const d = orientation === 'horizontal'
              ? `M ${edge.fromX} ${edge.fromY} C ${edge.fromX + ctrl} ${edge.fromY}, ${edge.toX - ctrl} ${edge.toY}, ${edge.toX} ${edge.toY}`
              : `M ${edge.fromX} ${edge.fromY} C ${edge.fromX} ${edge.fromY + ctrl}, ${edge.toX} ${edge.toY - ctrl}, ${edge.toX} ${edge.toY}`;

            return (
              <path
                key={edge.id}
                d={d}
                fill="none"
                stroke="rgba(56, 189, 248, 0.45)"
                strokeWidth="2.5"
                markerEnd="url(#linkage-arrow)"
                style={{ pointerEvents: 'stroke', cursor: 'pointer' }}
                onClick={(e) => {
                  e.stopPropagation();
                  onDisconnect(edge.sourceId, edge.targetId);
                }}
              />
            );
          })}

          {sliceLine && (
            <line x1={sliceLine.startX} y1={sliceLine.startY} x2={sliceLine.endX} y2={sliceLine.endY} stroke="#f43f5e" strokeWidth="2.5" strokeDasharray="4 4" style={{ filter: 'drop-shadow(0 0 8px #f43f5e)' }} />
          )}
        </svg>

        {/* Structured Nodes Layer (Canvas Cards) */}
        {layout.nodes.map((node) => (
          <HairLinkageNodeCard
            key={node.id}
            node={node}
            isDraggingThis={dragState?.sourceId === node.id}
            isTargetHover={hoverNodeId === node.id && dragState?.sourceId !== node.id}
            onMouseDown={handleNodeMouseDown}
            onMouseEnter={(id) => dragState && dragState.sourceId !== id && setHoverNodeId(id)}
            onMouseLeave={(id) => hoverNodeId === id && setHoverNodeId(null)}
            onClick={() => onSelectNode(node)}
            onDoubleClick={() => onCopyTag(node.tag)}
          />
        ))}
      </div>

      {/* Pinned Right Vertical Target Rail */}
      <HairLinkageRibbonSlider
        database={database}
        dragSourceId={dragState?.sourceId || null}
        hoverNodeId={hoverNodeId}
        onNodeMouseDown={handleNodeMouseDown}
        onHoverNode={setHoverNodeId}
        onSelectNode={onSelectNode}
      />

      {/* Global Drag Arrow Overlay (Cyan for Left-Drag Connect, Amber for Right-Drag Spawn Parent) */}
      {dragState && (
        <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 100 }}>
          <defs>
            <marker id="global-drag-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
              <path d="M 0 1 L 9 5 L 0 9 z" fill={dragState.isRightClick ? '#fbbf24' : '#00ffff'} />
            </marker>
          </defs>
          <line
            x1={dragState.startX}
            y1={dragState.startY}
            x2={dragState.currX}
            y2={dragState.currY}
            stroke={dragState.isRightClick ? '#fbbf24' : '#00ffff'}
            strokeWidth="3"
            strokeDasharray={dragState.isRightClick ? '6 3' : '5 3'}
            markerEnd="url(#global-drag-arrow)"
            style={{ filter: dragState.isRightClick ? 'drop-shadow(0 0 8px rgba(245, 158, 11, 0.8))' : 'drop-shadow(0 0 6px #00ffff)' }}
          />
        </svg>
      )}
    </div>
  );
};
