import React from 'react';
import { Globe, GitBranch, ArrowDown, Edit3, Check } from 'lucide-react';
import { WorldRouteStep, WorldNode } from '../../types/prompt';

interface WorldRouteSpineProps {
  route: WorldRouteStep[];
  availableAffiliateNodes: WorldNode[];
  selectedWorldId: string | null;
  onSelectWorld: (worldId: string) => void;
  onUpdateWorldPrompt: (worldId: string, promptText: string) => void;
  originPrompt: string;
}

export const WorldRouteSpine: React.FC<WorldRouteSpineProps> = ({
  route,
  availableAffiliateNodes,
  selectedWorldId,
  onSelectWorld,
  onUpdateWorldPrompt,
  originPrompt,
}) => {
  return (
    <div className="prompt-card">
      <div className="prompt-card-header">
        <div className="prompt-card-title">
          <GitBranch size={16} color="#c084fc" />
          <span>2 ~ World Tree (Origin Prompt)</span>
        </div>
        <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
          {route.length} Depth Level{route.length === 1 ? '' : 's'}
        </span>
      </div>

      {/* Multiple Affiliates Switcher */}
      {availableAffiliateNodes.length > 1 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
          <span style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 600 }}>
            Multiple Affiliates Detected:
          </span>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
            {availableAffiliateNodes.map((w) => {
              const isActive = w.id === selectedWorldId;
              return (
                <button
                  key={w.id}
                  onClick={() => onSelectWorld(w.id)}
                  className={`prompt-tag-chip ${isActive ? 'active' : ''}`}
                  style={{
                    background: isActive ? '#9333ea' : 'var(--bg-surface)',
                    color: isActive ? '#fff' : 'var(--text-primary)',
                    borderColor: isActive ? '#a855f7' : 'var(--border-light)',
                    fontWeight: isActive ? 600 : 400,
                  }}
                >
                  <Globe size={12} style={{ display: 'inline', marginRight: '4px' }} />
                  {w.name}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Tree Route Steps Spine */}
      <div className="prompt-spine-container">
        {route.length === 0 ? (
          <div style={{ fontSize: '12px', color: 'var(--text-dim)', fontStyle: 'italic' }}>
            No affiliate world linked to this Eva. Assign an affiliate in PK Network to trace ancestry.
          </div>
        ) : (
          route.map((step, idx) => {
            const isLast = idx === route.length - 1;
            return (
              <React.Fragment key={step.node.id}>
                <div className={`prompt-route-step ${step.isLeaf ? 'is-leaf' : ''}`}>
                  <div className="prompt-route-node-head">
                    <span className="prompt-route-node-name">
                      <Globe size={13} color={step.isLeaf ? '#c084fc' : '#38bdf8'} />
                      <span>{step.node.name}</span>
                    </span>
                    <span
                      style={{
                        fontSize: '10px',
                        fontFamily: 'var(--font-mono)',
                        padding: '0.1rem 0.35rem',
                        borderRadius: '3px',
                        background: step.isRoot
                          ? 'rgba(56, 189, 248, 0.15)'
                          : 'rgba(168, 85, 247, 0.15)',
                        color: step.isRoot ? '#38bdf8' : '#c084fc',
                      }}
                    >
                      {step.isRoot ? 'ROOT' : step.isLeaf ? 'TARGET' : `L${step.depth}`}
                    </span>
                  </div>

                  {/* World In-Place Prompt Input */}
                  <input
                    type="text"
                    className="prompt-world-input"
                    placeholder={`Prompt contribution for "${step.node.name}" (e.g. style, world tags)...`}
                    value={step.node.prompt || ''}
                    onChange={(e) => onUpdateWorldPrompt(step.node.id, e.target.value)}
                  />
                </div>

                {!isLast && (
                  <div className="prompt-route-connector">
                    <ArrowDown size={14} />
                  </div>
                )}
              </React.Fragment>
            );
          })
        )}
      </div>

      {/* Accumulated Origin Prompt Display */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', marginTop: '0.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '12px', fontWeight: 600, color: '#c084fc' }}>
            Accumulated Origin Prompt:
          </span>
          <span style={{ fontSize: '11px', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>
            {originPrompt ? `${originPrompt.split(',').length} tags` : 'Empty'}
          </span>
        </div>
        <div className="prompt-origin-box">
          {originPrompt || 'No origin prompt tags found along this world route. Type prompt tokens into any world node above.'}
        </div>
      </div>
    </div>
  );
};
