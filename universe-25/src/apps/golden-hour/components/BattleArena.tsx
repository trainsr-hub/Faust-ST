// path: src/apps/golden-hour/components/BattleArena.tsx

import React from 'react';
import { useGoldenHourStore, RARITY_TABLE, calculateHazardFromTime } from '../store/useGoldenHourStore';
import { useCurrencyStore } from '../../../store/useCurrencyStore';
import { HazardBadge } from '../../../components/HazardBadge';
import {
  Swords,
  Shield,
  Zap,
  TrendingUp,
  AlertTriangle,
  Sparkles,
  Lock,
  X,
  Flame,
  Activity,
} from 'lucide-react';

export const BattleArena: React.FC = () => {
  const { arenaSlots, unequipRelic } = useGoldenHourStore();
  const timeBalance = useCurrencyStore((s) => s.timeBalance);
  const { hazardLevel } = calculateHazardFromTime(timeBalance);

  // Aggregate stats across all 4 equipped slots
  const equippedItems = arenaSlots.map((s) => s.equippedItem).filter(Boolean);

  const aggregateStats = {
    ATK: 0,
    DEF: 0,
    SPD: 0,
    LUCK: 0,
  };

  const activeBuffs: { name: string; description: string; source: string }[] = [];
  const activeCurses: { name: string; description: string; source: string }[] = [];

  for (const item of equippedItems) {
    if (!item) continue;
    if (item.stats) {
      for (const s of item.stats) {
        if (s.name in aggregateStats) {
          aggregateStats[s.name as keyof typeof aggregateStats] += s.value;
        }
      }
    }
    if (item.buffs) {
      for (const b of item.buffs) {
        activeBuffs.push({ ...b, source: item.name });
      }
    }
    if (item.downsides) {
      for (const d of item.downsides) {
        activeCurses.push({ ...d, source: item.name });
      }
    }
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto w-full">
      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-[#120f18] border border-[#2b2238] flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-lg">
        <div className="flex items-center gap-3.5">
          <div className="p-3 rounded-xl bg-gradient-to-br from-[#291e07] to-[#120f18] border border-[#524124]">
            <Swords className="w-7 h-7 text-[#ffd86b]" />
          </div>
          <div>
            <h2 className="font-cinzel text-xl font-bold text-[#ffd86b] flex items-center gap-2">
              Tactical Battle Arena (Babylonian Altar)
            </h2>
            <p className="text-xs text-[#8c7a9e]">
              Deploy and adapt your random double-edged treasures. Form tactical synergies around buffs and curses.
            </p>
          </div>
        </div>

        {/* Hazard Level & Synergy Indicator */}
        <div className="flex items-center gap-3 self-stretch md:self-auto text-xs font-mono">
          <div className="flex items-center gap-2 bg-[#171320] px-4 py-2 rounded-xl border border-[#3d304f]">
            <Activity className="w-4 h-4 text-[#ffd86b]" />
            <span className="text-[#8c7a9e]">Hazard Level:</span>
            <strong className="text-white text-sm">{hazardLevel.toFixed(2)}</strong>
          </div>
          <div className="flex items-center gap-2 bg-[#171320] px-4 py-2 rounded-xl border border-[#3d304f]">
            <Shield className="w-4 h-4 text-[#4ade80]" />
            <span className="text-[#8c7a9e]">Equipped:</span>
            <strong className="text-[#ffd86b]">{equippedItems.length}/4</strong>
          </div>
        </div>
      </div>

      {/* Tab 1 Locked Notice Banner */}
      <div className="p-4 rounded-2xl bg-[#1c1408] border border-[#d4af37]/40 flex items-center justify-between gap-3 text-xs shadow-md">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-[#2b1e0a] text-[#ffd86b] border border-[#d4af37]/50">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-cinzel font-bold text-[#ffd86b]">
              Babylonian Combat Trials — Locked for Phase 1
            </h4>
            <p className="text-[11px] text-[#cbd5e1]/80">
              Active weapon loadout & synergy inspection is active. Real-time combat encounters unlock in Phase 2.
            </p>
          </div>
        </div>
        <span className="text-[10px] font-mono px-2.5 py-1 rounded bg-[#2b1e0a] text-[#ffd86b] border border-[#d4af37]/40 shrink-0 font-bold">
          STAGE LOCKED
        </span>
      </div>

      {/* 4-Slot Relic Loadout Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#ffd86b]" />
            <h3 className="font-cinzel text-sm font-bold text-white uppercase tracking-wider">
              Equipped Relic Arsenal (4 Tactical Slots)
            </h3>
          </div>
          <span className="text-[11px] font-mono text-[#8c7a9e]">
            Manage items from Tab 3: Tactical Arsenal
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {arenaSlots.map((slot) => {
            const item = slot.equippedItem;
            const rarityMeta = item ? RARITY_TABLE[item.rarity] : null;

            return (
              <div
                key={slot.slotIndex}
                className={`p-5 rounded-2xl border min-h-[220px] flex flex-col justify-between transition-all duration-300 relative overflow-hidden ${
                  item
                    ? 'bg-[#181322] border-[#ffd86b] shadow-gold-sm'
                    : 'bg-[#120f18]/60 border-[#2b2238] border-dashed'
                }`}
              >
                {/* Slot Number Badge */}
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-[#171320] text-[#8c7a9e] border border-[#2b2238]">
                    SLOT {slot.slotIndex + 1}
                  </span>

                  {item && (
                    <button
                      type="button"
                      onClick={() => unequipRelic(slot.slotIndex)}
                      className="p-1 rounded-lg bg-[#2b1722] text-rose-400 hover:bg-rose-900/60 border border-rose-800 transition cursor-pointer"
                      title="Unequip Relic"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {item ? (
                  <div className="space-y-2 my-2">
                    <div className="flex items-center justify-between gap-1">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{item.iconEmoji}</span>
                        <span
                          className="text-[9px] font-mono uppercase px-1.5 py-0.5 rounded font-bold"
                          style={{
                            backgroundColor: rarityMeta?.bgColor,
                            color: rarityMeta?.color,
                          }}
                        >
                          {rarityMeta?.label}
                        </span>
                      </div>
                      <HazardBadge score={item.score} rank={item.rank} size="sm" />
                    </div>

                    <h4 className="font-cinzel font-bold text-xs text-white line-clamp-1">
                      {item.name}
                    </h4>

                    {/* Quick Stats */}
                    {item.stats && (
                      <div className="flex flex-wrap gap-1 text-[10px] font-mono">
                        {item.stats.map((s) => (
                          <span
                            key={s.name}
                            className={`px-1.5 py-0.5 rounded ${
                              s.value >= 0 ? 'text-emerald-400 bg-emerald-950/40' : 'text-rose-400 bg-rose-950/40'
                            }`}
                          >
                            {s.name}:{s.value >= 0 ? `+${s.value}` : s.value}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center my-auto py-6 text-center space-y-1 text-[#685c78]">
                    <Shield className="w-8 h-8 opacity-40 mb-1" />
                    <span className="text-xs font-cinzel font-bold">Empty Slot</span>
                    <p className="text-[10px] max-w-[140px]">Equip from Tab 3 (Vault Gallery)</p>
                  </div>
                )}

                <div className="pt-2 border-t border-white/5 text-[10px] font-mono text-[#8c7a9e] flex justify-between">
                  <span>Type: {item ? 'Relic Armament' : 'Unassigned'}</span>
                  <span>{item ? 'Active' : 'Standby'}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Aggregate Combat Synergies & Tactical Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Total Aggregate Stats */}
        <div className="p-6 rounded-2xl bg-[#120f18] border border-[#2b2238] space-y-4">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-[#ffd86b]" />
            <h3 className="font-cinzel text-sm font-bold text-white">
              Tactical Aggregate Power
            </h3>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs font-mono">
            <div className="p-3 rounded-xl bg-[#171320] border border-[#2b2238] flex flex-col">
              <span className="text-[10px] text-[#8c7a9e] uppercase">Attack Power (ATK)</span>
              <strong className="text-lg text-emerald-400 font-bold mt-1">
                {aggregateStats.ATK >= 0 ? `+${aggregateStats.ATK}` : aggregateStats.ATK}
              </strong>
            </div>

            <div className="p-3 rounded-xl bg-[#171320] border border-[#2b2238] flex flex-col">
              <span className="text-[10px] text-[#8c7a9e] uppercase">Defense (DEF)</span>
              <strong className="text-lg text-sky-400 font-bold mt-1">
                {aggregateStats.DEF >= 0 ? `+${aggregateStats.DEF}` : aggregateStats.DEF}
              </strong>
            </div>

            <div className="p-3 rounded-xl bg-[#171320] border border-[#2b2238] flex flex-col">
              <span className="text-[10px] text-[#8c7a9e] uppercase">Speed / Agility (SPD)</span>
              <strong className="text-lg text-amber-400 font-bold mt-1">
                {aggregateStats.SPD >= 0 ? `+${aggregateStats.SPD}` : aggregateStats.SPD}
              </strong>
            </div>

            <div className="p-3 rounded-xl bg-[#171320] border border-[#2b2238] flex flex-col">
              <span className="text-[10px] text-[#8c7a9e] uppercase">Fortune / Luck (LUCK)</span>
              <strong className="text-lg text-purple-400 font-bold mt-1">
                {aggregateStats.LUCK >= 0 ? `+${aggregateStats.LUCK}` : aggregateStats.LUCK}
              </strong>
            </div>
          </div>
        </div>

        {/* Active Synergy Buffs */}
        <div className="p-6 rounded-2xl bg-[#120f18] border border-[#2b2238] space-y-3">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            <h3 className="font-cinzel text-sm font-bold text-white">
              Active Double-Edged Buffs ({activeBuffs.length})
            </h3>
          </div>

          {activeBuffs.length === 0 ? (
            <p className="text-xs text-[#685c78] italic py-4">No active buffs. Equip relics to activate.</p>
          ) : (
            <div className="space-y-2 max-h-48 overflow-y-auto scrollbar-thin text-xs">
              {activeBuffs.map((b, i) => (
                <div key={i} className="p-2.5 rounded-xl bg-[#082015] border border-[#16a34a]/40 space-y-0.5">
                  <div className="flex justify-between items-center">
                    <strong className="text-emerald-300 font-bold">{b.name}</strong>
                    <span className="text-[9px] font-mono text-[#8c7a9e] truncate max-w-[120px]">{b.source}</span>
                  </div>
                  <p className="text-[10px] text-[#9c93a8]">{b.description}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Active Curses / Downsides */}
        <div className="p-6 rounded-2xl bg-[#120f18] border border-[#2b2238] space-y-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-400" />
            <h3 className="font-cinzel text-sm font-bold text-white">
              Active Relic Curses ({activeCurses.length})
            </h3>
          </div>

          {activeCurses.length === 0 ? (
            <p className="text-xs text-[#685c78] italic py-4">No active penalties.</p>
          ) : (
            <div className="space-y-2 max-h-48 overflow-y-auto scrollbar-thin text-xs">
              {activeCurses.map((c, i) => (
                <div key={i} className="p-2.5 rounded-xl bg-[#3b080f]/40 border border-[#841822] space-y-0.5">
                  <div className="flex justify-between items-center">
                    <strong className="text-rose-300 font-bold">{c.name}</strong>
                    <span className="text-[9px] font-mono text-[#8c7a9e] truncate max-w-[120px]">{c.source}</span>
                  </div>
                  <p className="text-[10px] text-[#9c93a8]">{c.description}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Simulated Combat Engine Chamber (Shell / Standby) */}
      <div className="p-8 rounded-3xl bg-gradient-to-r from-[#171320] via-[#120f18] to-[#14101c] border border-[#2b2238] text-center space-y-4 shadow-xl">
        <div className="inline-flex p-4 rounded-2xl bg-[#1a1424] border border-[#3d304f] text-[#ffd86b]">
          <Flame className="w-8 h-8" />
        </div>
        <div className="space-y-1">
          <h3 className="font-cinzel text-lg font-bold text-white">
            Combat Encounter Protocol — Standby
          </h3>
          <p className="text-xs text-[#8c7a9e] max-w-xl mx-auto leading-relaxed">
            The automated tactical battle simulator awaits initial Gate of Babylon relic synchronization. Summon weapons from Tab 2, equip them into your 4 loadout slots, and prepare for multi-dimensional adversary trials.
          </p>
        </div>

        <div className="pt-2 flex items-center justify-center gap-3">
          <span className="text-xs font-mono px-3 py-1.5 rounded-xl bg-[#14101c] border border-[#261d33] text-[#685c78] flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5" /> Babylon Trials Phase 2 (Coming with Gate of Babylon Expansion)
          </span>
        </div>
      </div>
    </div>
  );
};

export default BattleArena;
