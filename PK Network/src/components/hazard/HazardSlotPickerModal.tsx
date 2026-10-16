import React, { useState, useMemo } from 'react';
import { X, Search, Check, Trash2, BookOpen, AlertCircle, Trophy, ArrowRight } from 'lucide-react';
import { HazardContender, HazardTournamentState } from '../../types/hazard';

const FEEDER_MAP: Record<string, [string, string]> = {
  l9: ['l1', 'l2'],
  l10: ['l3', 'l4'],
  l11: ['l5', 'l6'],
  l12: ['l7', 'l8'],
  l13: ['l9', 'l10'],
  l14: ['l11', 'l12'],
  l15: ['l13', 'l14'],
  r9: ['r1', 'r2'],
  r10: ['r3', 'r4'],
  r11: ['r5', 'r6'],
  r12: ['r7', 'r8'],
  r13: ['r9', 'r10'],
  r14: ['r11', 'r12'],
  r15: ['r13', 'r14'],
  champion: ['l15', 'r15']
};

const STARTING_SLOTS = [
  'l1', 'l2', 'l3', 'l4', 'l5', 'l6', 'l7', 'l8',
  'r1', 'r2', 'r3', 'r4', 'r5', 'r6', 'r7', 'r8'
];

function formatSubline(codex?: string, alias?: string): string {
  const c = codex?.trim() || '';
  const a = alias?.trim() || '';
  if (c && a) return `${c} ~ ${a}`;
  if (c) return c;
  if (a) return a;
  return '';
}

interface HazardSlotPickerModalProps {
  slotId: string | null;
  tournament: HazardTournamentState;
  allContenders: HazardContender[];
  onSelect: (slotId: string, evaId: string | null) => void;
  onOpenDossier: (contender: HazardContender) => void;
  onClose: () => void;
}

export const HazardSlotPickerModal: React.FC<HazardSlotPickerModalProps> = ({
  slotId,
  tournament,
  allContenders,
  onSelect,
  onOpenDossier,
  onClose
}) => {
  const [search, setSearch] = useState('');

  const currentContender = slotId
    ? tournament.slots[slotId] || (slotId === 'champion' ? tournament.champion : null)
    : null;
  const isStartingRound = slotId ? STARTING_SLOTS.includes(slotId) : false;
  const feeders = slotId ? FEEDER_MAP[slotId] : undefined;

  // Starting slots exclusion: exclude contenders in any OTHER starting slot of this tournament
  const occupiedContenderIds = useMemo(() => {
    const ids = new Set<string>();
    if (!slotId) return ids;
    STARTING_SLOTS.forEach((s) => {
      if (s !== slotId && tournament.slots[s]) {
        ids.add(tournament.slots[s]!.id);
      }
    });
    return ids;
  }, [tournament.slots, slotId]);

  const availableContenders = useMemo(() => {
    if (!isStartingRound) return [];
    return allContenders
      .filter((c) => !occupiedContenderIds.has(c.id))
      .filter((c) => {
        if (!search.trim()) return true;
        const q = search.toLowerCase();
        return (
          c.name.toLowerCase().includes(q) ||
          (c.codex ? c.codex.toLowerCase().includes(q) : false) ||
          (c.alias ? c.alias.toLowerCase().includes(q) : false) ||
          c.title.toLowerCase().includes(q)
        );
      });
  }, [allContenders, occupiedContenderIds, search, isStartingRound, slotId]);

  // For advanced rounds: exactly 2 options from feeder slots
  const feederContenders = useMemo(() => {
    if (!feeders) return [];
    const [s1, s2] = feeders;
    return [
      { slot: s1, contender: tournament.slots[s1] || null },
      { slot: s2, contender: tournament.slots[s2] || null }
    ];
  }, [feeders, tournament.slots]);

  if (!slotId) return null;

  return (
    <div className="hazard-modal-overlay" onClick={onClose}>
      <div className="hazard-picker-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="hazard-picker-header">
          <div className="hazard-picker-title">
            <span className="hazard-slot-badge">
              {slotId === 'champion' ? <Trophy size={14} className="text-amber-400" /> : slotId.toUpperCase()}
            </span>
            <div>
              <h3>{slotId === 'champion' ? 'Crown Tournament Champion' : `Slot Selection: ${slotId.toUpperCase()}`}</h3>
              <p>
                {isStartingRound
                  ? 'Round of 16 Starting Contender (Unique Per Tournament)'
                  : 'Advanced Elimination • 2 Feeder Pathways'}
              </p>
            </div>
          </div>
          <button className="hazard-modal-close" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* Current Slot Info Bar */}
        <div className="hazard-picker-status-bar">
          <div className="hazard-picker-curr-eva">
            <span className="text-xs text-slate-400">Current Assignment:</span>
            {currentContender ? (
              <div className="flex items-center gap-2 mt-1">
                <img src={currentContender.avatarUrl} alt={currentContender.name} className="w-6 h-6 rounded-full" />
                <span className="font-semibold text-slate-100">{currentContender.name}</span>
              </div>
            ) : (
              <span className="text-sm text-slate-500 italic mt-1 block">Empty / Unassigned</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {currentContender && (
              <>
                <button
                  className="hazard-btn hazard-btn-secondary text-xs"
                  onClick={() => onOpenDossier(currentContender)}
                  title="View full lore and combat dossier"
                >
                  <BookOpen size={13} />
                  <span>Dossier</span>
                </button>
                <button
                  className="hazard-btn hazard-btn-danger text-xs"
                  onClick={() => {
                    onSelect(slotId, null);
                    onClose();
                  }}
                  title="Clear this slot"
                >
                  <Trash2 size={13} />
                  <span>Clear</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* Mode A: Round of 16 (Full Roster with Exclusion) */}
        {isStartingRound && (
          <div className="hazard-picker-body">
            <div className="hazard-search-box">
              <Search size={15} className="text-slate-400" />
              <input
                type="text"
                placeholder="Filter available Evas by name, rank, or title..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                autoFocus
              />
              {search && (
                <button onClick={() => setSearch('')} className="text-xs text-slate-400 hover:text-white">
                  Clear
                </button>
              )}
            </div>

            <div className="hazard-picker-list">
              {availableContenders.map((c) => {
                const isCurrent = currentContender?.id === c.id;
                return (
                  <div
                    key={c.id}
                    className={`hazard-picker-item ${isCurrent ? 'is-selected' : ''}`}
                    onClick={() => {
                      onSelect(slotId, c.id);
                      onClose();
                    }}
                  >
                    <img src={c.avatarUrl} alt={c.name} className="hazard-picker-avatar" />
                    <div className="hazard-picker-info">
                      <div className="font-bold text-slate-100 flex items-center gap-2">
                        <span>{c.name}</span>
                        {isCurrent && <span className="hazard-badge-assigned">Assigned</span>}
                      </div>
                      <div className="hazard-picker-subline">
                        {formatSubline(c.codex, c.alias)}
                      </div>
                    </div>
                    <button className="hazard-btn-item-action">
                      {isCurrent ? <Check size={16} /> : <ArrowRight size={16} />}
                    </button>
                  </div>
                );
              })}
              {availableContenders.length === 0 && (
                <div className="hazard-empty-search">
                  <AlertCircle size={20} className="text-slate-500 mb-1" />
                  <span>No available Evas found matching your query.</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Mode B: Advanced Elimination (Strictly 2 Feeder Options) */}
        {!isStartingRound && (
          <div className="hazard-feeder-options-container">
            <p className="text-sm text-slate-300 mb-3">
              Select the victorious contender from the feeder bracket:
            </p>
            <div className="hazard-feeder-grid">
              {feederContenders.map(({ slot: fSlot, contender: fContender }, idx) => {
                const isChosen = currentContender && fContender && currentContender.id === fContender.id;
                return (
                  <div
                    key={fSlot}
                    className={`hazard-feeder-card ${!fContender ? 'is-disabled' : ''} ${isChosen ? 'is-active-winner' : ''}`}
                    onClick={() => {
                      if (fContender) {
                        onSelect(slotId, fContender.id);
                        onClose();
                      }
                    }}
                  >
                    <div className="hazard-feeder-badge">Feeder: {fSlot.toUpperCase()}</div>
                    {fContender ? (
                      <>
                        <img src={fContender.avatarUrl} alt={fContender.name} className="hazard-feeder-avatar" />
                        <h4 className="font-bold text-slate-100 mt-2">{fContender.name}</h4>
                        <span className="hazard-picker-subline min-h-[1.1rem]">
                          {formatSubline(fContender.codex, fContender.alias)}
                        </span>
                        <button className="hazard-feeder-select-btn mt-3">
                          {isChosen ? '👑 Currently Selected' : 'Advance To This Slot'}
                        </button>
                      </>
                    ) : (
                      <div className="hazard-feeder-empty">
                        <AlertCircle size={24} className="text-slate-600 mb-2" />
                        <span className="text-xs text-slate-500">Slot {fSlot.toUpperCase()} Undecided</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
