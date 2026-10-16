import React from 'react';
import {
  Sparkles,
  LayoutGrid,
  GitBranch,
  Sun,
  Moon,
  Search,
  SlidersHorizontal,
  Table,
  Swords,
  Layers,
  Network,
} from 'lucide-react';
import { HairViewMode } from '../../types/hairCodex';

interface HairCodexHeaderProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  viewMode: HairViewMode;
  onViewModeChange: (m: HairViewMode) => void;
  hasImageOnly: boolean;
  onToggleImageOnly: () => void;
  hasParentOnly: boolean;
  onToggleParentOnly: () => void;
  totalCount: number;
  filteredCount: number;
  onSwitchToPk: () => void;
  onSwitchToHazard: () => void;
  onSwitchToPrompt: () => void;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
}

export const HairCodexHeader: React.FC<HairCodexHeaderProps> = ({
  searchQuery,
  onSearchChange,
  viewMode,
  onViewModeChange,
  hasImageOnly,
  onToggleImageOnly,
  hasParentOnly,
  onToggleParentOnly,
  totalCount,
  filteredCount,
  onSwitchToPk,
  onSwitchToHazard,
  onSwitchToPrompt,
  theme,
  onToggleTheme,
}) => {
  return (
    <header className="hair-codex-header">
      {/* Brand Title & Trait Stats */}
      <div className="hair-codex-title-group">
        <div className="hair-codex-title">
          <Sparkles size={18} color="#ec4899" />
          <span>HAIR VISUAL CODEX</span>
        </div>
        <span
          style={{
            fontSize: '11px',
            fontFamily: 'var(--font-mono)',
            padding: '2px 8px',
            borderRadius: '999px',
            background: 'rgba(236, 72, 153, 0.15)',
            border: '1px solid rgba(236, 72, 153, 0.3)',
            color: '#f472b6',
            fontWeight: 600,
          }}
        >
          {filteredCount === totalCount ? `${totalCount} TRAITS` : `${filteredCount} / ${totalCount}`}
        </span>
      </div>

      {/* Center Search Bar */}
      <div className="hair-codex-search-bar">
        <Search size={15} color="var(--text-dim, #64748b)" />
        <input
          type="text"
          placeholder="Search hair traits, tags, parents, subcategories... (e.g. 'kishimen', 'braid')"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="hair-codex-search-input"
        />
        {searchQuery && (
          <button
            onClick={() => onSearchChange('')}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-dim)',
              cursor: 'pointer',
              fontSize: '12px',
              padding: '0 4px',
            }}
          >
            ✕
          </button>
        )}
      </div>

      {/* View Switchers & Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        {/* Toggle Filters */}
        <button
          onClick={onToggleImageOnly}
          className="btn icon-only"
          title="Filter to items with images only"
          style={{
            padding: '0 8px',
            height: '32px',
            fontSize: '11px',
            background: hasImageOnly ? 'rgba(56, 189, 248, 0.2)' : 'transparent',
            borderColor: hasImageOnly ? '#38bdf8' : 'var(--border-light)',
            color: hasImageOnly ? '#38bdf8' : 'var(--text-secondary)',
          }}
        >
          <span>With Image</span>
        </button>

        <button
          onClick={onToggleParentOnly}
          className="btn icon-only"
          title="Filter to items with parent relationships"
          style={{
            padding: '0 8px',
            height: '32px',
            fontSize: '11px',
            background: hasParentOnly ? 'rgba(168, 85, 247, 0.2)' : 'transparent',
            borderColor: hasParentOnly ? '#a855f7' : 'var(--border-light)',
            color: hasParentOnly ? '#a855f7' : 'var(--text-secondary)',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
          }}
        >
          <GitBranch size={13} />
          <span>Has Parent</span>
        </button>

        <div style={{ width: '1px', height: '20px', background: 'var(--border-light)', margin: '0 2px' }} />

        {/* View Mode Switcher */}
        <div style={{ display: 'flex', background: 'var(--bg-surface, #131d31)', borderRadius: '6px', padding: '2px', border: '1px solid var(--border-light)' }}>
          <button
            onClick={() => onViewModeChange('graph')}
            title="Interactive Mindmap Graph with Directed Arrows"
            style={{
              padding: '4px 8px',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '11px',
              background: viewMode === 'graph' ? 'rgba(56, 189, 248, 0.25)' : 'transparent',
              color: viewMode === 'graph' ? '#38bdf8' : 'var(--text-dim)',
            }}
          >
            <Network size={13} />
            <span>Mindmap</span>
          </button>
          <button
            onClick={() => onViewModeChange('grid')}
            title="Visual Grid Matrix"
            style={{
              padding: '4px 8px',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '11px',
              background: viewMode === 'grid' ? 'rgba(236, 72, 153, 0.25)' : 'transparent',
              color: viewMode === 'grid' ? '#ec4899' : 'var(--text-dim)',
            }}
          >
            <LayoutGrid size={13} />
            <span>Grid</span>
          </button>
          <button
            onClick={() => onViewModeChange('tree')}
            title="Relationship Tree Outliner"
            style={{
              padding: '4px 8px',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '11px',
              background: viewMode === 'tree' ? 'rgba(168, 85, 247, 0.25)' : 'transparent',
              color: viewMode === 'tree' ? '#a855f7' : 'var(--text-dim)',
            }}
          >
            <GitBranch size={13} />
            <span>Tree</span>
          </button>
        </div>

        <div style={{ width: '1px', height: '20px', background: 'var(--border-light)', margin: '0 2px' }} />

        {/* Domain Navigation Buttons */}
        <button
          onClick={onSwitchToPrompt}
          className="btn icon-only"
          title="Switch to Prompt Studio"
          style={{ height: '32px', padding: '0 8px', fontSize: '11.5px', color: '#38bdf8', borderColor: 'rgba(56, 189, 248, 0.3)', display: 'flex', alignItems: 'center', gap: '4px' }}
        >
          <Layers size={13} />
          <span>Studio</span>
        </button>

        <button
          onClick={onSwitchToHazard}
          className="btn icon-only"
          title="Switch to Hazard Trigger Arena"
          style={{ height: '32px', padding: '0 8px', fontSize: '11.5px', color: '#f59e0b', borderColor: 'rgba(245, 158, 11, 0.3)', display: 'flex', alignItems: 'center', gap: '4px' }}
        >
          <Swords size={13} />
          <span>Hazard</span>
        </button>

        <button
          onClick={onSwitchToPk}
          className="btn icon-only"
          title="Switch to PK Network Grid"
          style={{ height: '32px', padding: '0 8px', fontSize: '11.5px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px' }}
        >
          <Table size={13} />
          <span>Grid</span>
        </button>

        {/* Theme Toggle */}
        <button
          onClick={onToggleTheme}
          className="btn icon-only"
          title="Toggle Theme"
          style={{ width: '32px', height: '32px' }}
        >
          {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
        </button>
      </div>
    </header>
  );
};
