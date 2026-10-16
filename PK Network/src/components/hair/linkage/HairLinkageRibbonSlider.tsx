import React, { useRef, useState, useMemo, useEffect } from 'react';
import { ChevronDown, ChevronUp, ChevronLeft, ChevronRight, Search, Layers, Eye, EyeOff } from 'lucide-react';
import { LinkageNodeData } from '../../../services/linkageLayout';
import { HairLinkageRibbonCard } from './HairLinkageRibbonCard';
import { getAllTransitiveDependentCounts, getEntireBranchNodeIds } from '../../../services/hairLinkageService';

interface HairLinkageRibbonSliderProps {
  database: Record<string, LinkageNodeData>;
  dragSourceId: string | null;
  hoverNodeId: string | null;
  onNodeMouseDown: (e: React.MouseEvent, id: string) => void;
  onHoverNode: (id: string | null) => void;
  onSelectNode: (node: LinkageNodeData) => void;
}

export const HairLinkageRibbonSlider: React.FC<HairLinkageRibbonSliderProps> = ({
  database,
  dragSourceId,
  hoverNodeId,
  onNodeMouseDown,
  onHoverNode,
  onSelectNode,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [search, setSearch] = useState('');
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showExcluded, setShowExcluded] = useState(false);
  const [aspectMode, setAspectMode] = useState<'3:2' | '1:1'>(() => {
    try {
      const saved = localStorage.getItem('faust_hair_rail_aspect_v1');
      return saved === '1:1' ? '1:1' : '3:2';
    } catch {
      return '3:2';
    }
  });

  const toggleAspectMode = (mode: '3:2' | '1:1') => {
    setAspectMode(mode);
    try {
      localStorage.setItem('faust_hair_rail_aspect_v1', mode);
    } catch {}
  };

  const [excludedNodeIds, setExcludedNodeIds] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem('faust_hair_rail_excluded_nodes_v1');
      return saved ? new Set<string>(JSON.parse(saved)) : new Set<string>();
    } catch {
      return new Set<string>();
    }
  });

  // Dynamically compute effective excluded node IDs by expanding any hidden node
  // to its entire connected branch whenever database linkages change
  const effectiveExcludedNodeIds = useMemo(() => {
    if (excludedNodeIds.size === 0) return new Set<string>();
    const expanded = new Set<string>();
    for (const id of excludedNodeIds) {
      if (database[id] && !expanded.has(id)) {
        const branchIds = getEntireBranchNodeIds(database, id);
        branchIds.forEach((bId) => expanded.add(bId));
      }
    }
    return expanded;
  }, [database, excludedNodeIds]);

  useEffect(() => {
    try {
      localStorage.setItem('faust_hair_rail_excluded_nodes_v1', JSON.stringify(Array.from(effectiveExcludedNodeIds)));
    } catch {}
  }, [effectiveExcludedNodeIds]);

  const countMap = useMemo(() => getAllTransitiveDependentCounts(database), [database]);

  const handleToggleExcludeBranch = (nodeId: string) => {
    const branchIds = getEntireBranchNodeIds(database, nodeId);
    setExcludedNodeIds((prev) => {
      const next = new Set(prev);
      const isCurrentlyExcluded = branchIds.some((id) => effectiveExcludedNodeIds.has(id));
      if (isCurrentlyExcluded) {
        branchIds.forEach((id) => next.delete(id));
      } else {
        branchIds.forEach((id) => next.add(id));
      }
      return next;
    });
  };

  const handleUnhideAll = () => setExcludedNodeIds(new Set());

  // Sorted first by linking count (all nodes that depend on that node, including sub-nodes to leaves, excluding hidden), then alphabetically
  const activeNodes = useMemo(() => {
    const list = Object.values(database).filter((n) => !n.isDiscarded);
    const q = search.trim().toLowerCase();
    const filtered = list.filter((n) => {
      if (!showExcluded && effectiveExcludedNodeIds.has(n.id)) return false;
      if (!q) return true;
      return (
        (n.customLabel || n.tag).toLowerCase().includes(q) ||
        (n.subcategory || '').toLowerCase().includes(q)
      );
    });

    return [...filtered].sort((a, b) => {
      const countA = countMap.get(a.id) || 0;
      const countB = countMap.get(b.id) || 0;
      if (countB !== countA) return countB - countA;
      const nameA = a.customLabel || a.tag || '';
      const nameB = b.customLabel || b.tag || '';
      return nameA.localeCompare(nameB, undefined, { sensitivity: 'base' });
    });
  }, [database, search, countMap, effectiveExcludedNodeIds, showExcluded]);

  const handleScroll = (delta: number) => {
    if (scrollRef.current) scrollRef.current.scrollBy({ top: delta, behavior: 'smooth' });
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        width: isCollapsed ? '38px' : '245px',
        height: '100%',
        background: 'rgba(10, 15, 30, 0.96)',
        borderLeft: '1px solid rgba(56, 189, 248, 0.25)',
        boxShadow: '-4px 0 20px rgba(0, 0, 0, 0.5)',
        backdropFilter: 'blur(12px)',
        zIndex: 30,
        flexShrink: 0,
        transition: 'width 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {isCollapsed ? (
        <div
          onClick={() => setIsCollapsed(false)}
          style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '12px 0', cursor: 'pointer', userSelect: 'none' }}
          title="Click to expand Target Rail"
        >
          <button onClick={(e) => { e.stopPropagation(); setIsCollapsed(false); }} className="btn icon-only" style={{ width: '26px', height: '26px', padding: 0 }} title="Expand Target Rail">
            <ChevronLeft size={14} />
          </button>
          <div style={{ writingMode: 'vertical-rl', textOrientation: 'mixed', transform: 'rotate(180deg)', color: '#00ffff', fontWeight: 700, letterSpacing: '1px', fontSize: '11px', marginTop: '16px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Layers size={13} color="#00ffff" style={{ transform: 'rotate(90deg)' }} />
            <span>TARGET RAIL ({activeNodes.length})</span>
          </div>
        </div>
      ) : (
        <>
          {/* Rail Header */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', padding: '8px 10px', background: 'rgba(2, 6, 23, 0.85)', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', fontSize: '11px', flexShrink: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Layers size={13} color="#00ffff" />
                <span style={{ fontWeight: 700, color: '#00ffff', fontSize: '11px' }}>TARGET RAIL</span>
                <span style={{ background: 'rgba(56, 189, 248, 0.2)', color: '#38bdf8', padding: '0 5px', borderRadius: '3px', fontSize: '9.5px', fontWeight: 600 }}>
                  {activeNodes.length}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(15, 23, 42, 0.9)', borderRadius: '4px', border: '1px solid rgba(255, 255, 255, 0.12)', padding: '1px' }}>
                  {(['3:2', '1:1'] as const).map((mode) => (
                    <button
                      key={mode}
                      onClick={() => toggleAspectMode(mode)}
                      style={{
                        padding: '1px 5px',
                        fontSize: '8.5px',
                        fontWeight: 700,
                        background: aspectMode === mode ? 'rgba(56, 189, 248, 0.35)' : 'transparent',
                        color: aspectMode === mode ? '#38bdf8' : 'rgba(255, 255, 255, 0.5)',
                        border: 'none',
                        borderRadius: '3px',
                        cursor: 'pointer',
                      }}
                      title={`${mode} aspect ratio`}
                    >
                      {mode}
                    </button>
                  ))}
                </div>

                <button onClick={() => handleScroll(-250)} className="btn icon-only" style={{ width: '22px', height: '22px', padding: 0 }} title="Scroll Up">
                  <ChevronUp size={13} />
                </button>
                <button onClick={() => handleScroll(250)} className="btn icon-only" style={{ width: '22px', height: '22px', padding: 0 }} title="Scroll Down">
                  <ChevronDown size={13} />
                </button>
                <button onClick={() => setIsCollapsed(true)} className="btn icon-only" style={{ width: '22px', height: '22px', padding: 0 }} title="Collapse Target Rail">
                  <ChevronRight size={13} />
                </button>
              </div>
            </div>

            {/* Quick Search inside rail */}
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <Search size={11} color="var(--text-dim)" style={{ position: 'absolute', left: '7px' }} />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Filter target cards..."
                style={{
                  width: '100%',
                  boxSizing: 'border-box',
                  background: 'rgba(15, 23, 42, 0.8)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  borderRadius: '4px',
                  padding: '3px 8px 3px 22px',
                  fontSize: '10.5px',
                  color: '#ffffff',
                  outline: 'none',
                }}
              />
            </div>

            {/* Excluded Branches Toolbar (Shows when any branches are hidden) */}
            {effectiveExcludedNodeIds.size > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '4px' }}>
                <button
                  onClick={() => setShowExcluded((prev) => !prev)}
                  className="btn"
                  style={{
                    fontSize: '9px',
                    padding: '2px 5px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '3px',
                    color: showExcluded ? '#38bdf8' : '#fbbf24',
                    borderColor: showExcluded ? 'rgba(56, 189, 248, 0.4)' : 'rgba(245, 158, 11, 0.4)',
                    background: 'rgba(15, 23, 42, 0.7)',
                    cursor: 'pointer',
                  }}
                  title={showExcluded ? 'Hide excluded branches from rail' : 'Show excluded branches dimmed in rail'}
                >
                  {showExcluded ? <Eye size={10} /> : <EyeOff size={10} />}
                  <span>{effectiveExcludedNodeIds.size} Hidden ({showExcluded ? 'Showing' : 'Hidden'})</span>
                </button>
                <button
                  onClick={handleUnhideAll}
                  className="btn"
                  style={{ fontSize: '9px', padding: '2px 5px', color: 'var(--text-secondary)', cursor: 'pointer' }}
                  title="Restore all hidden branches back to Target Rail"
                >
                  Unhide All
                </button>
              </div>
            )}

            <div style={{ fontSize: '9.5px', color: 'var(--text-tertiary)', lineHeight: '1.2' }}>
              Drop arrows here ➔ Sorted by dependents then A–Z
            </div>
          </div>

          {/* Vertical Scrollable Rail */}
          <div
            ref={scrollRef}
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
              padding: '8px 10px',
              overflowY: 'auto',
              overflowX: 'hidden',
              scrollbarWidth: 'thin',
              boxSizing: 'border-box',
            }}
          >
            {activeNodes.map((node) => (
              <HairLinkageRibbonCard
                key={node.id}
                node={node}
                linkingCount={countMap.get(node.id) || 0}
                isDraggingThis={dragSourceId === node.id}
                isTargetHover={hoverNodeId === node.id && dragSourceId !== node.id}
                isExcluded={effectiveExcludedNodeIds.has(node.id)}
                aspectMode={aspectMode}
                onMouseDown={onNodeMouseDown}
                onMouseEnter={onHoverNode}
                onMouseLeave={() => onHoverNode(null)}
                onClick={() => onSelectNode(node)}
                onToggleExcludeBranch={handleToggleExcludeBranch}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};
