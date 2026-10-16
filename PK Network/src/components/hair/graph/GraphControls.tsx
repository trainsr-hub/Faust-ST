import React from 'react';
import { ZoomIn, ZoomOut, Maximize, GitFork, LayoutGrid, RotateCcw, Plus, Download } from 'lucide-react';
import { GraphLayoutPreset } from '../../../types/hairGraph';

interface GraphControlsProps {
  zoom: number;
  nodeCount: number;
  edgeCount: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetZoom: () => void;
  onFitView: () => void;
  onApplyLayout: (preset: GraphLayoutPreset) => void;
  onTogglePalette: () => void;
  onExportJson: () => void;
}

export const GraphControls: React.FC<GraphControlsProps> = ({
  zoom,
  nodeCount,
  edgeCount,
  onZoomIn,
  onZoomOut,
  onResetZoom,
  onFitView,
  onApplyLayout,
  onTogglePalette,
  onExportJson,
}) => {
  return (
    <>
      {/* Top-Left Live Status Badge */}
      <div className="graph-status-badge">
        <span style={{ color: '#f43f5e', fontWeight: 700 }}>MINDMAP GRAPH</span>
        <span>•</span>
        <span>{nodeCount} Nodes</span>
        <span>•</span>
        <span style={{ color: '#38bdf8' }}>{edgeCount} Arrows</span>
        <span>•</span>
        <span>{Math.round(zoom * 100)}%</span>
      </div>

      {/* Floating Bottom-Right Controls HUD */}
      <div className="graph-controls-hud">
        <button
          className="graph-hud-btn"
          onClick={onTogglePalette}
          title="Add / Spawn Hair Traits on Canvas"
          style={{ background: 'rgba(244, 63, 94, 0.25)', borderColor: '#f43f5e', color: '#fb7185' }}
        >
          <Plus size={14} />
          <span>Add Trait</span>
        </button>

        <div style={{ width: '1px', height: '18px', background: 'rgba(255, 255, 255, 0.15)' }} />

        <button
          className="graph-hud-btn"
          onClick={() => onApplyLayout('tree')}
          title="Auto-arrange connected nodes in Hierarchical Tree"
        >
          <GitFork size={14} />
          <span>Tree Layout</span>
        </button>

        <button
          className="graph-hud-btn"
          onClick={() => onApplyLayout('cluster')}
          title="Arrange nodes into Category Island Clusters"
        >
          <LayoutGrid size={14} />
          <span>Cluster Layout</span>
        </button>

        <button
          className="graph-hud-btn"
          onClick={() => onApplyLayout('reset')}
          title="Reset to Initial Canonical Mindmap"
        >
          <RotateCcw size={14} />
          <span>Reset</span>
        </button>

        <div style={{ width: '1px', height: '18px', background: 'rgba(255, 255, 255, 0.15)' }} />

        <button className="graph-hud-btn" onClick={onZoomOut} title="Zoom Out">
          <ZoomOut size={14} />
        </button>

        <button className="graph-hud-btn" onClick={onResetZoom} title="Reset Zoom to 100%">
          <span>100%</span>
        </button>

        <button className="graph-hud-btn" onClick={onZoomIn} title="Zoom In">
          <ZoomIn size={14} />
        </button>

        <button className="graph-hud-btn" onClick={onFitView} title="Center & Fit View">
          <Maximize size={14} />
        </button>

        <button className="graph-hud-btn" onClick={onExportJson} title="Export Mindmap Graph JSON">
          <Download size={14} />
        </button>
      </div>
    </>
  );
};
