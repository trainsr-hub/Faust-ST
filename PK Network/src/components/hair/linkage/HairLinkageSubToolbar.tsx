import React from 'react';
import { Sparkles } from 'lucide-react';

interface HairLinkageSubToolbarProps {
  selectedSubcategory: string | null;
  onSelectSubcategory: (sub: string | null) => void;
  allSubcategories: string[];
  orientation: 'horizontal' | 'vertical';
  onToggleOrientation: () => void;
  onResetCanonical: () => void;
  discardedCount: number;
  onOpenDiscarded: () => void;
  onOpenCreateTagless: () => void;
  onSwitchToFacet?: () => void;
}

export const HairLinkageSubToolbar: React.FC<HairLinkageSubToolbarProps> = ({
  selectedSubcategory,
  onSelectSubcategory,
  allSubcategories,
  orientation,
  onToggleOrientation,
  onResetCanonical,
  discardedCount,
  onOpenDiscarded,
  onOpenCreateTagless,
  onSwitchToFacet,
}) => {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '6px 16px',
        background: 'rgba(15, 23, 42, 0.95)',
        borderBottom: '1px solid var(--border-light)',
        fontSize: '11.5px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span style={{ color: '#00ffff', fontWeight: 700 }}>✦ PROJECT-LINKAGE ENGINE</span>
        <span style={{ color: 'var(--text-dim)' }}>•</span>
        <span style={{ color: 'var(--text-secondary)' }}>
          Left-drag: connect (A =&gt; B)
        </span>
        <span style={{ color: 'var(--text-dim)' }}>•</span>
        <span style={{ color: '#fbbf24', fontWeight: 600 }}>
          Right-drag card: spawn Concept Parent ✦
        </span>
        <span style={{ color: 'var(--text-dim)' }}>•</span>
        <span style={{ color: 'var(--text-tertiary)' }}>Right-drag empty: laser slice</span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        {/* Switch to Facet Sandbox Button */}
        {onSwitchToFacet && (
          <button
            onClick={onSwitchToFacet}
            className="btn"
            style={{
              fontSize: '11px',
              padding: '3px 9px',
              background: 'rgba(168, 85, 247, 0.2)',
              borderColor: 'rgba(168, 85, 247, 0.5)',
              color: '#c084fc',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              cursor: 'pointer',
            }}
            title="Open isolated Faceted Subspace & Atomic Deconstructor Sandbox (?app=facet)"
          >
            <span>✦ Facet Sandbox</span>
          </button>
        )}

        {/* Create Tagless Concept Node Button */}
        <button
          onClick={onOpenCreateTagless}
          className="btn"
          style={{
            fontSize: '11px',
            padding: '3px 9px',

            background: 'rgba(245, 158, 11, 0.15)',
            borderColor: 'rgba(245, 158, 11, 0.5)',
            color: '#fbbf24',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            cursor: 'pointer',
          }}
          title="Create a structural, tagless concept node for grouping and organizing hierarchy"
        >
          <Sparkles size={12} color="#f59e0b" />
          <span>+ Concept Node</span>
        </button>

        {/* Subcategory Focus Selector to minimize rows */}
        <select
          value={selectedSubcategory || 'all'}
          onChange={(e) => onSelectSubcategory(e.target.value === 'all' ? null : e.target.value)}
          className="btn"
          style={{
            fontSize: '11px',
            padding: '3px 8px',
            background: 'rgba(2, 6, 23, 0.7)',
            color: selectedSubcategory ? '#38bdf8' : 'var(--text-secondary)',
            borderColor: selectedSubcategory ? 'rgba(56, 189, 248, 0.5)' : undefined,
            cursor: 'pointer',
          }}
          title="Focus on a specific hair subcategory to minimize rows"
        >
          <option value="all">🔍 All Subcategories (Compact Shelf)</option>
          {allSubcategories.map((sub) => (
            <option key={sub} value={sub}>{sub}</option>
          ))}
        </select>

        <button
          onClick={onToggleOrientation}
          className="btn"
          style={{
            fontSize: '11px',
            padding: '3px 8px',
            borderColor: 'rgba(56, 189, 248, 0.4)',
            color: '#38bdf8',
          }}
          title="Toggle Layout Orientation"
        >
          {orientation === 'horizontal' ? '⇄ Horizontal Flow' : '⇅ Vertical Flow'}
        </button>

        <button
          onClick={onResetCanonical}
          className="btn"
          style={{ fontSize: '11px', padding: '3px 8px' }}
          title="Reset to canonical Danbooru inheritance links"
        >
          Reset Canonical Links
        </button>

        <button
          onClick={onOpenDiscarded}
          className="btn"
          style={{
            fontSize: '11px',
            padding: '3px 8px',
            color: discardedCount > 0 ? '#f43f5e' : 'var(--text-secondary)',
            borderColor: discardedCount > 0 ? 'rgba(244, 63, 94, 0.4)' : undefined,
          }}
          title="Open Discarded / Hidden traits pool"
        >
          🗑️ Discarded ({discardedCount})
        </button>
      </div>
    </div>
  );
};
