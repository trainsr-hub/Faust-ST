import React, { useRef, useState, useMemo, useEffect, useCallback } from 'react';
import { PromptGroup, ConditionPrompt } from '../../../types/conditionStudio';
import { layoutPromptGroupMindmap, checkEdgeIntersection, MindmapNode, MindmapEdge } from '../../../services/mindmapLayout';
import { ExternalLink, Layers, Sparkles, Plus, Image as ImageIcon } from 'lucide-react';

interface PromptGroupMindmapProps {
  groups: PromptGroup[];
  prompts: ConditionPrompt[];
  onAssignPromptToGroup: (promptId: string, targetGroupId: string) => void;
  onUnlinkPromptFromGroup: (promptId: string) => void;
  onEditPrompt: (prompt: ConditionPrompt) => void;
  onEditGroup: (group: PromptGroup) => void;
}

export const PromptGroupMindmap: React.FC<PromptGroupMindmapProps> = ({
  groups,
  prompts,
  onAssignPromptToGroup,
  onUnlinkPromptFromGroup,
  onEditPrompt,
  onEditGroup,
}) => {
  const outerRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Drag state for connecting (Left-drag from prompt to group or group to prompt)
  const [dragState, setDragState] = useState<{
    sourceNode: MindmapNode;
    currX: number;
    currY: number;
  } | null>(null);

  const [hoverNodeId, setHoverNodeId] = useState<string | null>(null);
  const [sliceLine, setSliceLine] = useState<{ startX: number; startY: number; endX: number; endY: number } | null>(null);
  const suppressContextMenuRef = useRef(false);

  const layout = useMemo(
    () => layoutPromptGroupMindmap(groups, prompts, searchQuery),
    [groups, prompts, searchQuery]
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
      // Left click drag: initiate connection
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
      // Right click drag: laser slice to disconnect
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
            onUnlinkPromptFromGroup(edge.targetId);
          }
        });
        setSliceLine(null);
      }

      if (dragState) {
        if (hoverNodeId && hoverNodeId !== dragState.sourceNode.id) {
          const targetNode = layout.nodes.find((n) => n.id === hoverNodeId);
          if (targetNode) {
            if (dragState.sourceNode.type === 'prompt' && targetNode.type === 'group') {
              onAssignPromptToGroup(dragState.sourceNode.id, targetNode.id);
            } else if (dragState.sourceNode.type === 'group' && targetNode.type === 'prompt') {
              onAssignPromptToGroup(targetNode.id, dragState.sourceNode.id);
            }
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
  }, [dragState, hoverNodeId, layout, onAssignPromptToGroup, onUnlinkPromptFromGroup, sliceLine, getCanvasCoords]);

  return (
    <div ref={outerRef} style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}>
      {/* Subheader Toolbar */}
      <div style={{ padding: '8px 16px', background: 'rgba(10, 15, 30, 0.95)', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Layers size={16} color="#c084fc" />
          <span style={{ fontSize: '13px', fontWeight: 800, color: '#f8fafc' }}>Mindmap 1: Prompts ➔ Groups</span>
          <span style={{ fontSize: '10px', background: 'rgba(192, 132, 252, 0.15)', color: '#c084fc', padding: '2px 8px', borderRadius: '4px' }}>
            Left-drag between nodes to map • Right-drag laser slice to unmap
          </span>
        </div>
        <input
          style={{ backgroundColor: '#020617', border: '1px solid rgba(255, 255, 255, 0.12)', borderRadius: '6px', padding: '4px 10px', fontSize: '11.5px', color: '#f8fafc', width: '220px', outline: 'none' }}
          placeholder="Filter prompts or tags..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
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
              const dx = (edge.toX - edge.fromX) * 0.5;
              const pathData = `M ${edge.fromX} ${edge.fromY} C ${edge.fromX + dx} ${edge.fromY}, ${edge.toX - dx} ${edge.toY}, ${edge.toX} ${edge.toY}`;
              return (
                <g key={edge.id}>
                  <path d={pathData} fill="none" stroke="rgba(192, 132, 252, 0.15)" strokeWidth={6} />
                  <path d={pathData} fill="none" stroke={edge.color} strokeWidth={2} strokeDasharray={edge.isDashed ? '5,5' : 'none'} />
                  <circle cx={edge.toX} cy={edge.toY} r={3.5} fill={edge.color} />
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
                stroke="#38bdf8"
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
            const isGroup = node.type === 'group';

            return (
              <div
                key={node.id}
                onMouseDown={(e) => handleNodeMouseDown(e, node)}
                onMouseEnter={() => setHoverNodeId(node.id)}
                onMouseLeave={() => setHoverNodeId(null)}
                onDoubleClick={() => (isGroup ? onEditGroup(node.data) : onEditPrompt(node.data))}
                style={{
                  position: 'absolute',
                  left: `${node.x}px`,
                  top: `${node.y}px`,
                  width: `${node.w}px`,
                  height: `${node.h}px`,
                  borderRadius: '10px',
                  border: isHover ? '2px solid #38bdf8' : isGroup ? '1px solid rgba(192, 132, 252, 0.4)' : '1px solid rgba(255, 255, 255, 0.12)',
                  backgroundColor: isGroup ? 'rgba(15, 23, 42, 0.95)' : 'rgba(2, 6, 23, 0.92)',
                  boxShadow: isHover ? '0 0 16px rgba(56, 189, 248, 0.4)' : '0 4px 14px rgba(0,0,0,0.5)',
                  padding: '8px 10px',
                  display: 'flex',
                  gap: '8px',
                  cursor: 'grab',
                  userSelect: 'none',
                  zIndex: 20,
                  opacity: isDragging ? 0.6 : 1,
                  transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
                }}
              >
                {/* Thumbnail if prompt */}
                {!isGroup && (
                  <div style={{ width: '56px', height: '100%', borderRadius: '6px', overflow: 'hidden', background: '#020617', flexShrink: 0 }}>
                    {node.imageUrl ? (
                      <img
                        src={node.imageUrl}
                        alt={node.title}
                        referrerPolicy="no-referrer"
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
                      />
                    ) : (
                      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#475569' }}>
                        <ImageIcon size={14} />
                      </div>
                    )}
                  </div>
                )}

                <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', flex: 1, minWidth: 0 }}>
                  <span style={{ fontSize: isGroup ? '13px' : '11.5px', fontWeight: 800, color: isGroup ? '#c084fc' : '#f8fafc', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {node.title}
                  </span>
                  {node.tag && <span style={{ fontSize: '10px', color: '#38bdf8', fontFamily: 'monospace' }}>{node.tag}</span>}
                  <span style={{ fontSize: '9.5px', color: '#64748b' }}>{node.subtitle || node.category}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
