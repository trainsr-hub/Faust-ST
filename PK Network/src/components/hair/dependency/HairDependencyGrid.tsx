import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { Copy, Maximize2, X, ArrowRight, CornerDownRight } from 'lucide-react';
import { HairDependencyEdge } from '../../../services/hairDependencyService';
import '../../../styles/hairDependency.css';

interface HairDependencyGridProps {
  items: any[];
  edges: HairDependencyEdge[];
  searchQuery: string;
  onAddDependency: (sourceId: string, targetId: string) => void;
  onRemoveDependency: (edgeId: string) => void;
  onCopyTag: (tag: string) => void;
  onInspect: (item: any) => void;
}

export const HairDependencyGrid: React.FC<HairDependencyGridProps> = ({
  items,
  edges,
  searchQuery,
  onAddDependency,
  onRemoveDependency,
  onCopyTag,
  onInspect,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dragSourceId, setDragSourceId] = useState<string | null>(null);
  const [hoverTargetId, setHoverTargetId] = useState<string | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [arrowCoords, setArrowCoords] = useState<Array<{ id: string; d: string }>>([]);

  // Filter items
  const filteredItems = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return items;
    return items.filter(
      (it) =>
        it.tag.toLowerCase().includes(q) ||
        (it.description && it.description.toLowerCase().includes(q))
    );
  }, [items, searchQuery]);

  // Group items by category / subcategory
  const categorizedSections = useMemo(() => {
    const map: Record<string, any[]> = {};
    filteredItems.forEach((it) => {
      const cat = it.subcategory || it.category || 'General';
      if (!map[cat]) map[cat] = [];
      map[cat].push(it);
    });
    return Object.entries(map);
  }, [filteredItems]);

  // Map of targets to their source parents (for badge display)
  const parentsByTarget = useMemo(() => {
    const map: Record<string, Array<{ edgeId: string; parentTag: string; parentId: string }>> = {};
    const itemMap = new Map(items.map((it) => [it.id || it.slug, it]));

    edges.forEach((edge) => {
      if (!map[edge.targetId]) map[edge.targetId] = [];
      const parentItem = itemMap.get(edge.sourceId);
      map[edge.targetId].push({
        edgeId: edge.id,
        parentId: edge.sourceId,
        parentTag: parentItem?.tag || edge.sourceId,
      });
    });
    return map;
  }, [edges, items]);

  // Update SVG arrow coordinates from actual DOM bounding boxes
  const updateArrows = useCallback(() => {
    if (!containerRef.current) return;
    const containerRect = containerRef.current.getBoundingClientRect();
    const scrollTop = containerRef.current.scrollTop;
    const scrollLeft = containerRef.current.scrollLeft;

    const coords: Array<{ id: string; d: string }> = [];

    edges.forEach((edge) => {
      const srcEl = document.getElementById(`hair-card-${edge.sourceId}`);
      const dstEl = document.getElementById(`hair-card-${edge.targetId}`);
      if (!srcEl || !dstEl) return;

      const srcRect = srcEl.getBoundingClientRect();
      const dstRect = dstEl.getBoundingClientRect();

      const sx = srcRect.left + srcRect.width / 2 - containerRect.left + scrollLeft;
      const sy = srcRect.bottom - containerRect.top + scrollTop;
      const tx = dstRect.left + dstRect.width / 2 - containerRect.left + scrollLeft;
      const ty = dstRect.top - containerRect.top + scrollTop;

      const dy = ty - sy;
      const d = `M ${sx} ${sy} C ${sx} ${sy + dy * 0.5}, ${tx} ${ty - dy * 0.5}, ${tx} ${ty}`;
      coords.push({ id: edge.id, d });
    });

    setArrowCoords(coords);
  }, [edges]);

  useEffect(() => {
    updateArrows();
    const timer = setTimeout(updateArrows, 150);
    window.addEventListener('resize', updateArrows);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', updateArrows);
    };
  }, [updateArrows, filteredItems]);

  // Mouse interaction for dragging arrows
  const handleMouseDownImage = (e: React.MouseEvent, itemId: string) => {
    e.preventDefault();
    setDragSourceId(itemId);
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    setMousePos({
      x: e.clientX - rect.left + containerRef.current.scrollLeft,
      y: e.clientY - rect.top + containerRef.current.scrollTop,
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!dragSourceId || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    setMousePos({
      x: e.clientX - rect.left + containerRef.current.scrollLeft,
      y: e.clientY - rect.top + containerRef.current.scrollTop,
    });
  };

  const handleMouseUp = () => {
    if (dragSourceId && hoverTargetId && dragSourceId !== hoverTargetId) {
      onAddDependency(dragSourceId, hoverTargetId);
    }
    setDragSourceId(null);
    setHoverTargetId(null);
  };

  // Live drag arrow curve
  const liveDragPath = useMemo(() => {
    if (!dragSourceId || !containerRef.current) return null;
    const srcEl = document.getElementById(`hair-card-${dragSourceId}`);
    if (!srcEl) return null;
    const cRect = containerRef.current.getBoundingClientRect();
    const sRect = srcEl.getBoundingClientRect();
    const sx = sRect.left + sRect.width / 2 - cRect.left + containerRef.current.scrollLeft;
    const sy = sRect.bottom - cRect.top + containerRef.current.scrollTop;
    return `M ${sx} ${sy} C ${sx} ${sy + (mousePos.y - sy) * 0.5}, ${mousePos.x} ${
      mousePos.y - (mousePos.y - sy) * 0.5
    }, ${mousePos.x} ${mousePos.y}`;
  }, [dragSourceId, mousePos]);

  return (
    <div
      ref={containerRef}
      className={`dep-view-container ${dragSourceId ? 'dragging-arrow' : ''}`}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onScroll={updateArrows}
    >
      {/* SVG Directed Arrows Layer */}
      <svg className="dep-svg-overlay" style={{ height: '3500px' }}>
        <defs>
          <marker
            id="dep-arrow"
            viewBox="0 0 10 10"
            refX="8"
            refY="5"
            markerWidth="7"
            markerHeight="7"
            orient="auto-start-reverse"
          >
            <path d="M 0 1 L 9 5 L 0 9 z" fill="#f43f5e" />
          </marker>
          <marker
            id="dep-arrow-drag"
            viewBox="0 0 10 10"
            refX="8"
            refY="5"
            markerWidth="8"
            markerHeight="8"
            orient="auto-start-reverse"
          >
            <path d="M 0 1 L 9 5 L 0 9 z" fill="#38bdf8" />
          </marker>
        </defs>

        {arrowCoords.map((arrow) => (
          <path
            key={arrow.id}
            d={arrow.d}
            className="dep-arrow-path"
            markerEnd="url(#dep-arrow)"
            onClick={() => onRemoveDependency(arrow.id)}
          />
        ))}

        {liveDragPath && (
          <path d={liveDragPath} className="dep-arrow-dragging" markerEnd="url(#dep-arrow-drag)" />
        )}
      </svg>

      {/* Structured Category Sections */}
      {categorizedSections.map(([category, catItems]) => (
        <section key={category} className="dep-category-section">
          <div className="dep-category-header">
            <div className="dep-category-title">
              <span style={{ color: '#ec4899' }}>✦</span>
              <span>{category.toUpperCase()}</span>
              <span style={{ fontSize: '11px', color: 'var(--text-dim)', fontWeight: 500 }}>
                ({catItems.length})
              </span>
            </div>
            <span style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>
              Drag image to link dependency (A ➔ B)
            </span>
          </div>

          <div className="dep-card-grid">
            {catItems.map((item) => {
              const itemId = item.id || item.slug;
              const isSource = dragSourceId === itemId;
              const isTarget = hoverTargetId === itemId && dragSourceId !== itemId;
              const parents = parentsByTarget[itemId] || [];

              return (
                <div
                  key={itemId}
                  id={`hair-card-${itemId}`}
                  className={`dep-hair-card ${isSource ? 'drag-source' : ''} ${
                    isTarget ? 'drop-target' : ''
                  }`}
                  onMouseEnter={() => {
                    if (dragSourceId) setHoverTargetId(itemId);
                  }}
                  onMouseLeave={() => {
                    if (hoverTargetId === itemId) setHoverTargetId(null);
                  }}
                >
                  {/* Header */}
                  <div className="dep-card-header">
                    <span className="dep-card-tag" title={item.tag}>
                      {item.tag}
                    </span>
                    <button
                      className="btn icon-only"
                      style={{ width: '22px', height: '22px', padding: 0 }}
                      title="Inspect Dossier"
                      onClick={() => onInspect(item)}
                    >
                      <Maximize2 size={11} />
                    </button>
                  </div>

                  {/* Thumbnail / Drag Handle */}
                  <div
                    className="dep-card-img-box"
                    onMouseDown={(e) => handleMouseDownImage(e, itemId)}
                    title="Click and drag to link arrow to another card"
                  >
                    {item.imageUrl ? (
                      <img src={item.imageUrl} alt={item.tag} className="dep-card-img" />
                    ) : (
                      <span style={{ fontSize: '11px', color: 'var(--text-dim)' }}>No Preview</span>
                    )}
                    <div className="dep-card-drag-hint">
                      <ArrowRight size={10} />
                      <span>Drag Arrow</span>
                    </div>
                  </div>

                  {/* Footer & Dependency Badges */}
                  <div className="dep-card-footer">
                    <div className="dep-badge-row">
                      {parents.map((p) => (
                        <span key={p.edgeId} className="dep-parent-badge" title={`Dependent on ${p.parentTag}`}>
                          <CornerDownRight size={10} />
                          <span>{p.parentTag}</span>
                          <span
                            className="dep-badge-close"
                            onClick={() => onRemoveDependency(p.edgeId)}
                            title="Disconnect dependency"
                          >
                            ×
                          </span>
                        </span>
                      ))}
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '9.5px', color: 'var(--text-tertiary)' }}>
                        {item.subcategory || item.category}
                      </span>
                      <button
                        className="btn icon-only"
                        style={{ width: '22px', height: '22px', padding: 0 }}
                        title="Copy Tag"
                        onClick={() => onCopyTag(item.tag)}
                      >
                        <Copy size={11} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
};
