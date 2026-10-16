import React, { useState, useMemo } from 'react';
import { Plus, X, GitBranch } from 'lucide-react';
import { HairCodexItem } from '../../../types/hairCodex';
import { LinkageNodeData } from '../../../services/linkageLayout';

interface HairLinkageQuickConnectProps {
  item: HairCodexItem;
  database: Record<string, LinkageNodeData>;
  onConnect: (sourceId: string, targetId: string) => void;
  onDisconnect: (sourceId: string, targetId: string) => void;
}

export const HairLinkageQuickConnect: React.FC<HairLinkageQuickConnectProps> = ({
  item,
  database,
  onConnect,
  onDisconnect,
}) => {
  const [search, setSearch] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  // Incoming links: parents that link to this item (P => item)
  const parents = useMemo(() => {
    return Object.values(database).filter(
      (node) => !node.isDiscarded && Boolean(node.links_to?.[item.id])
    );
  }, [database, item.id]);

  // Outgoing links: dependents that this item links to (item => D)
  const dependents = useMemo(() => {
    const directLinks = database[item.id]?.links_to || {};
    return Object.keys(directLinks)
      .filter((tid) => database[tid] && !database[tid].isDiscarded)
      .map((tid) => database[tid]);
  }, [database, item.id]);

  // Search candidates for new outgoing links
  const candidates = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return [];
    return Object.values(database)
      .filter(
        (node) =>
          !node.isDiscarded &&
          node.id !== item.id &&
          !database[item.id]?.links_to?.[node.id] &&
          node.tag.toLowerCase().includes(q)
      )
      .slice(0, 6);
  }, [database, item.id, search]);

  return (
    <div
      style={{
        background: 'rgba(15, 23, 42, 0.6)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: '10px',
        padding: '0.85rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.6rem',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 700, color: '#f8fafc' }}>
          <GitBranch size={14} color="#38bdf8" />
          <span>Inheritance Linkages (DAG Connections)</span>
        </div>
        <button
          onClick={() => setIsOpen((prev) => !prev)}
          className="btn"
          style={{ fontSize: '10.5px', padding: '2px 8px', color: '#00ffff', borderColor: 'rgba(0, 255, 255, 0.3)' }}
        >
          {isOpen ? 'Close Linker' : '+ Link Trait (No Drag)'}
        </button>
      </div>

      {/* Parents & Dependents List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '11px' }}>
        {parents.length > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
            <span style={{ color: 'var(--text-tertiary)' }}>Parent (Required):</span>
            {parents.map((p) => (
              <span
                key={p.id}
                style={{
                  background: 'rgba(168, 85, 247, 0.15)',
                  border: '1px solid rgba(168, 85, 247, 0.3)',
                  color: '#d8b4fe',
                  padding: '2px 6px',
                  borderRadius: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                {p.tag}
                <button
                  onClick={() => onDisconnect(p.id, item.id)}
                  title="Disconnect this dependency"
                  style={{ background: 'none', border: 'none', color: '#f43f5e', cursor: 'pointer', padding: 0 }}
                >
                  <X size={10} />
                </button>
              </span>
            ))}
          </div>
        )}

        {dependents.length > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
            <span style={{ color: 'var(--text-tertiary)' }}>Directs to:</span>
            {dependents.map((d) => (
              <span
                key={d.id}
                style={{
                  background: 'rgba(56, 189, 248, 0.15)',
                  border: '1px solid rgba(56, 189, 248, 0.3)',
                  color: '#38bdf8',
                  padding: '2px 6px',
                  borderRadius: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                ➔ {d.tag}
                <button
                  onClick={() => onDisconnect(item.id, d.id)}
                  title="Disconnect this dependency"
                  style={{ background: 'none', border: 'none', color: '#f43f5e', cursor: 'pointer', padding: 0 }}
                >
                  <X size={10} />
                </button>
              </span>
            ))}
          </div>
        )}

        {parents.length === 0 && dependents.length === 0 && (
          <div style={{ color: 'var(--text-dim)', fontStyle: 'italic', fontSize: '10.5px' }}>
            Currently isolated (no parent or dependent linkages).
          </div>
        )}
      </div>

      {/* Quick Search Linker Panel */}
      {isOpen && (
        <div style={{ marginTop: '4px', paddingTop: '6px', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
          <input
            type="text"
            placeholder="Type trait name to link as dependent (e.g. drill_hair, bob)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: '100%',
              boxSizing: 'border-box',
              background: '#090d16',
              border: '1px solid rgba(56, 189, 248, 0.3)',
              borderRadius: '6px',
              padding: '6px 10px',
              fontSize: '11.5px',
              color: '#ffffff',
              outline: 'none',
              marginBottom: '6px',
            }}
          />

          {candidates.length > 0 ? (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px' }}>
              {candidates.map((cand) => (
                <button
                  key={cand.id}
                  onClick={() => {
                    onConnect(item.id, cand.id);
                    setSearch('');
                  }}
                  className="btn"
                  style={{
                    fontSize: '11px',
                    padding: '4px 8px',
                    justifyContent: 'flex-start',
                    gap: '4px',
                    textAlign: 'left',
                    color: '#f8fafc',
                  }}
                  title={`Connect: ${item.tag} ➔ ${cand.tag}`}
                >
                  <Plus size={12} color="#00ffff" />
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {cand.tag}
                  </span>
                </button>
              ))}
            </div>
          ) : search ? (
            <div style={{ fontSize: '10.5px', color: 'var(--text-dim)', textAlign: 'center', padding: '4px 0' }}>
              No matching traits found
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
};
