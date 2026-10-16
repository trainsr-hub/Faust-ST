import React, { useRef, useState, useMemo, useEffect, useCallback } from 'react';
import { HairCondition, PromptGroup } from '../../../types/conditionStudio';
import { layoutGroupConditionMindmap, checkEdgeIntersection, MindmapNode, MindmapEdge } from '../../../services/mindmapLayout';
import { HelpCircle, Layers, Zap, Info } from 'lucide-react';

interface GroupConditionMindmapProps {
  conditions: HairCondition[];
  groups: PromptGroup[];
  onAddRule: (sourceNode: MindmapNode, targetNode: MindmapNode) => void;
  onRemoveRule: (edge: MindmapEdge) => void;
  onEditCondition: (condition: HairCondition) => void;
  onEditGroup: (group: PromptGroup) => void;
}

export const GroupConditionMindmap: React.FC<GroupConditionMindmapProps> = ({
  conditions,
  groups,
  onAddRule,
  onRemoveRule,
  onEditCondition,
  onEditGroup,
}) => {
  const outerRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);

  // Drag state for connecting
  const [dragState, setDragState] = useState<{
    sourceNode: MindmapNode;
    currX: number;
    currY: number;
  } | null>(null);

  const [hoverNodeId, setHoverNodeId] = useState<string | null>(null);
  const [sliceLine, setSliceLine] = useState<{ startX: number; startY: number; endX: number; endY: number } | null>(null);
  const suppressContextMenuRef = useRef(false);

  const layout = useMemo(
    () => layoutGroupConditionMindmap(conditions, groups),
    [conditions, groups]
  );

  const getCanvasCoords = useCallback((clientX: number, clientY: number) => {
    if (!viewportRef.current) return { x: 0, y: 0 };
    const rect = viewportRef.current.getBoundingClientRect();
    return {
      x: clientX - rect.left + viewportRef.current.scrollLeft,
      y: clientY - rect.top + viewportRef.current.scrollTop,
    };
  }, []);

  const handleNodeMouseDown = (e: React.MouseEvent, node: MindmapNode) => {
    if (e.button === 0) {
      e.stopPropagation();
      const coords = getCanvasCoords(e.clientX, e.clientY);
      setDragState({
        sourceNode: node,
        currX: coords.x,
        currY: coords.y,
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
      if (dragState) {
        const coords = getCanvasCoords(e.clientX, e.clientY);
        setDragState((prev) => (prev ? { ...prev, currX: coords.x, currY: coords.y } : null));
      }
      if (sliceLine) {
        const coords = getCanvasCoords(e.clientX, e.clientY);
        setSliceLine((prev) => (prev ? { ...prev, endX: coords.x, endY: coords.y } : null));
      }
    };

    const handleWindowMouseUp = (e: MouseEvent) => {
      if (sliceLine) {
        suppressContextMenuRef.current = true;
        setTimeout(() => { suppressContextMenuRef.current = false; }, 350);

        layout.edges.forEach((edge) => {
          const hit = checkEdgeIntersection(
            { x: sliceLine.startX, y: sliceLine.startY },
            { x: sliceLine.endX, y: sliceLine.endY },
            { x: edge.fromX, y: edge.fromY },
            { x: edge.toX, y: edge.toY }
          );
          if (hit) {
            onRemoveRule(edge);
          }
        });
        setSliceLine(null);
      }

      if (dragState) {
        if (hoverNodeId && hoverNodeId !== dragState.sourceNode.id) {
          const targetNode = layout.nodes.find((n) => n.id === hoverNodeId);
          if (targetNode) {
            onAddRule(dragState.sourceNode, targetNode);
          }
        }
        setDragState(null);
        setHoverNodeId(null);
      }
    };

    window.addEventListener('mousemove', handleWindowMouseMove);
    window.addEventListener('mouseup', handleWindowMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleWindowMouseMove);
      window.removeEventListener('mouseup', handleWindowMouseUp);
    };
  }, [dragState, hoverNodeId, layout, onAddRule, onRemoveRule, sliceLine, getCanvasCoords]);

  return (
    <div ref={outerRef} style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}>
      {/* Subheader Toolbar */}
      <div style={{ padding: '8px 16px', background: 'rgba(10, 15, 30, 0.95)', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Zap size={16} color="#38bdf8" />
          <span style={{ fontSize: '13px', fontWeight: 800, color: '#f8fafc' }}>Mindmap 2: Groups ➔ Conditions</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', fontSize: '11px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '16px', height: '2px', background: '#38bdf8', display: 'inline-block' }}></span>
            <span style={{ color: '#38bdf8' }}>Cyan: Precondition (Condition ➔ Group)</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '16px', height: '2px', background: '#c084fc', borderTop: '2px dashed #c084fc', display: 'inline-block' }}></span>
            <span style={{ color: '#c084fc' }}>Purple: Postcondition (Group ➔ Condition)</span>
          </div>
          <span style={{ color: '#64748b' }}>| Right-drag laser slice cuts rules</span>
        </div>
      </div>

      {/* Mindmap Interactive Canvas Viewport */}
      <div
        ref={viewportRef}
        onMouseDown={handleViewportMouseDown}
        style={{ flex: 1, overflow: 'auto', position: 'relative', backgroundColor: '#030712', cursor: sliceLine ? 'crosshair' : 'default' }}
      >
        <div style={{ width: `${Math.max(layout.canvasWidth, 900)}px`, height: `${layout.canvasHeight}px`, position: 'relative' }}>
          {/* SVG Connector Edges */}
          <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 10 }}>
            {layout.edges.map((edge) => {
              const dx = (edge.toX - edge.fromX) * 0.45;
              const pathData = `M ${edge.fromX} ${edge.fromY} C ${edge.fromX + dx} ${edge.fromY}, ${edge.toX - dx} ${edge.toY}, ${edge.toX} ${edge.toY}`;
              const midX = (edge.fromX + edge.toX) / 2;
              const midY = (edge.fromY + edge.toY) / 2;
              return (
                <g key={edge.id}>
                  <path d={pathData} fill="none" stroke="rgba(0,0,0,0.5)" strokeWidth={6} />
                  <path d={pathData} fill="none" stroke={edge.color} strokeWidth={2} strokeDasharray={edge.isDashed ? '6,4' : 'none'} />
                  <circle cx={edge.toX} cy={edge.toY} r={3.5} fill={edge.color} />
                  {edge.label && (
                    <text x={midX} y={midY - 4} fill={edge.color} fontSize="9.5px" fontWeight="700" textAnchor="middle" style={{ textShadow: '0 2px 4px #000' }}>
                      {edge.label}
                    </text>
                  )}
                </g>
              );
            })}

            {/* Live Interactive Dragging Wire */}
            {dragState && (
              <line
                x1={dragState.sourceNode.x + dragState.sourceNode.w / 2}
                y1={dragState.sourceNode.y + dragState.sourceNode.h / 2}
                x2={dragState.currX}
                y2={dragState.currY}
                stroke="#34d399"
                strokeWidth={2.5}
                strokeDasharray="4,4"
              />
            )}

            {/* Live Laser Slice Line */}
            {sliceLine && (
              <line
                x1={sliceLine.startX}
                y1={sliceLine.startY}
                x2={sliceLine.endX}
                y2={sliceLine.endY}
                stroke="#ef4444"
                strokeWidth={3}
                strokeDasharray="3,3"
                style={{ filter: 'drop-shadow(0 0 6px #ef4444)' }}
              />
            )}
          </svg>

          {/* Node Cards */}
          {layout.nodes.map((node) => {
            const isHover = hoverNodeId === node.id;
            const isDragging = dragState?.sourceNode.id === node.id;
            const isCondition = node.type === 'condition';

            return (
              <div
                key={node.id}
                onMouseDown={(e) => handleNodeMouseDown(e, node)}
                onMouseEnter={() => setHoverNodeId(node.id)}
                onMouseLeave={() => setHoverNodeId(null)}
                onDoubleClick={() => (isCondition ? onEditCondition(node.data) : onEditGroup(node.data))}
                style={{
                  position: 'absolute',
                  left: `${node.x}px`,
                  top: `${node.y}px`,
                  width: `${node.w}px`,
                  height: `${node.h}px`,
                  borderRadius: '10px',
                  border: isHover ? '2px solid #34d399' : isCondition ? '1px solid rgba(56, 189, 248, 0.4)' : '1px solid rgba(192, 132, 252, 0.4)',
                  backgroundColor: isCondition ? 'rgba(10, 25, 45, 0.95)' : 'rgba(25, 15, 35, 0.95)',
                  boxShadow: isHover ? '0 0 16px rgba(52, 211, 153, 0.4)' : '0 4px 14px rgba(0,0,0,0.5)',
                  padding: '10px 14px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  gap: '4px',
                  cursor: 'grab',
                  userSelect: 'none',
                  zIndex: 20,
                  opacity: isDragging ? 0.6 : 1,
                  transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '12.5px', fontWeight: 800, color: isCondition ? '#38bdf8' : '#c084fc' }}>
                    {node.title}
                  </span>
                  <span style={{ fontSize: '9px', padding: '1px 5px', borderRadius: '3px', background: 'rgba(255,255,255,0.08)', color: '#94a3b8' }}>
                    {node.category}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '10px', color: '#94a3b8', fontFamily: 'monospace' }}>{node.id}</span>
                  <span style={{ fontSize: '9.5px', color: '#64748b' }}>
                    {isCondition ? 'Condition' : 'Group'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
