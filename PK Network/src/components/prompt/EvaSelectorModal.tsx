import React, { useState, useMemo } from 'react';
import { Search, X, User, ShieldAlert } from 'lucide-react';
import { PromptEva } from '../../types/prompt';

interface EvaSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  evasList: PromptEva[];
  selectedEvaId: string | null;
  onSelectEva: (eva: PromptEva) => void;
}

export const EvaSelectorModal: React.FC<EvaSelectorModalProps> = ({
  isOpen,
  onClose,
  evasList,
  selectedEvaId,
  onSelectEva,
}) => {
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return evasList;
    return evasList.filter((e) => {
      const matchName = e.fullName.toLowerCase().includes(q);
      const matchTourn = e.tournamentName.toLowerCase().includes(q);
      const matchCodex = (e.evaCodex || '').toLowerCase().includes(q);
      const matchAff = e.affiliateIds.some((a) => a.toLowerCase().includes(q));
      return matchName || matchTourn || matchCodex || matchAff;
    });
  }, [evasList, search]);

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 100,
        background: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '540px',
          maxHeight: '85vh',
          background: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-lg)',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
          overflow: 'hidden',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: '1rem 1.25rem',
            borderBottom: '1px solid var(--border-light)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <User size={18} color="#c084fc" />
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700 }}>Select Eva Contender</h3>
          </div>
          <button
            onClick={onClose}
            className="btn icon-only"
            style={{ width: '32px', height: '32px', padding: 0 }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Filter Input (Monolithic 48px hitbox) */}
        <div style={{ padding: '0.85rem 1.25rem', borderBottom: '1px solid var(--border-light)' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-md)',
              padding: '0 0.85rem',
              minHeight: '48px',
            }}
          >
            <Search size={16} color="var(--text-dim)" />
            <input
              type="text"
              placeholder="Search by name, tournament, or codex..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              autoFocus
              style={{
                flex: 1,
                border: 'none',
                background: 'transparent',
                color: 'var(--text-primary)',
                outline: 'none',
                fontSize: '14px',
              }}
            />
          </div>
        </div>

        {/* Eva List */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '0.75rem 1.25rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem',
          }}
        >
          {filtered.length === 0 ? (
            <div
              style={{
                padding: '2.5rem',
                textAlign: 'center',
                color: 'var(--text-dim)',
                fontSize: '13px',
              }}
            >
              No matching Evas found.
            </div>
          ) : (
            filtered.map((eva) => {
              const isSelected = eva.id === selectedEvaId;
              return (
                <div
                  key={eva.id}
                  onClick={() => {
                    onSelectEva(eva);
                    onClose();
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: '0.75rem 0.85rem',
                    minHeight: '56px',
                    borderRadius: 'var(--radius-sm)',
                    background: isSelected ? 'rgba(168, 85, 247, 0.15)' : 'var(--bg-surface)',
                    border: `1px solid ${isSelected ? '#a855f7' : 'var(--border-light)'}`,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {eva.avatarUrl ? (
                    <img
                      src={eva.avatarUrl}
                      alt={eva.name}
                      style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: 'var(--radius-sm)',
                        objectFit: 'cover',
                        border: '1px solid rgba(168, 85, 247, 0.3)',
                      }}
                    />
                  ) : (
                    <div
                      style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: 'var(--radius-sm)',
                        background: '#1e1b4b',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#c084fc',
                        fontWeight: 700,
                        fontSize: '13px',
                      }}
                    >
                      {eva.name.slice(0, 2).toUpperCase()}
                    </div>
                  )}

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        fontWeight: 600,
                        fontSize: '14px',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {eva.tournamentName}
                    </div>
                    <div
                      style={{
                        fontSize: '11.5px',
                        color: 'var(--text-secondary)',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {eva.fullName}
                    </div>
                  </div>

                  {eva.evaCodex && (
                    <span
                      style={{
                        padding: '0.15rem 0.45rem',
                        borderRadius: 'var(--radius-sm)',
                        background: 'rgba(56, 189, 248, 0.15)',
                        color: '#38bdf8',
                        fontFamily: 'var(--font-mono)',
                        fontSize: '11px',
                        fontWeight: 600,
                      }}
                    >
                      {eva.evaCodex}
                    </span>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
