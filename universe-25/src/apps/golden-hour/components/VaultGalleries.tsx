// path: src/apps/golden-hour/components/VaultGalleries.tsx

import React, { useState } from 'react';
import { useGoldenHourStore, RARITY_TABLE, ELEMENT_REGISTRY } from '../store/useGoldenHourStore';
import { HazardBadge } from '../../../components/HazardBadge';
import type { VaultCategory, ElementalAttribute } from '../types';
import {
  Archive,
  Shield,
  BookOpen,
  Zap,
  Swords,
  TrendingUp,
  AlertTriangle,
  Layers,
  ChevronRight,
  Check,
} from 'lucide-react';

export const VaultGalleries: React.FC = () => {
  const {
    vault,
    arenaSlots,
    equipRelic,
    unequipRelic,
    energyReserves,
    getVaultByCategory,
  } = useGoldenHourStore();

  const [activeTab, setActiveTab] = useState<VaultCategory>('tactical');
  const [selectedSlotForEquip, setSelectedSlotForEquip] = useState<number>(0);

  const tacticalItems = getVaultByCategory('tactical');
  const collectionItems = getVaultByCategory('collection');
  const energyItems = getVaultByCategory('energy');

  const isEquippedInAnySlot = (itemId: string): number | null => {
    const slot = arenaSlots.find((s) => s.equippedItem?.id === itemId);
    return slot ? slot.slotIndex : null;
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto w-full">
      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-[#120f18] border border-[#2b2238] flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-lg">
        <div className="flex items-center gap-3.5">
          <div className="p-3 rounded-xl bg-gradient-to-br from-[#291e07] to-[#120f18] border border-[#524124]">
            <Archive className="w-7 h-7 text-[#ffd86b]" />
          </div>
          <div>
            <h2 className="font-cinzel text-xl font-bold text-[#ffd86b] flex items-center gap-2">
              Vault Collection Galleries
            </h2>
            <p className="text-xs text-[#8c7a9e]">
              Curated repository of dimensionally summoned artifacts, tactical armaments, and energy cores.
            </p>
          </div>
        </div>

        {/* Global Summary Pill */}
        <div className="flex items-center gap-3 self-stretch md:self-auto text-xs font-mono">
          <div className="flex items-center gap-1.5 bg-[#171320] px-3 py-1.5 rounded-xl border border-[#3d304f]">
            <Layers className="w-3.5 h-3.5 text-[#ffd86b]" />
            <span className="text-[#8c7a9e]">Total Items:</span>
            <strong className="text-white">{vault.length}</strong>
          </div>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-[#2b2238] pb-3">
        <button
          type="button"
          onClick={() => setActiveTab('tactical')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-cinzel text-xs font-bold transition cursor-pointer ${
            activeTab === 'tactical'
              ? 'bg-[#ffd86b] text-black shadow-gold-sm'
              : 'bg-[#171320] text-[#8c7a9e] hover:text-white border border-[#2b2238]'
          }`}
        >
          <Swords className="w-4 h-4" />
          <span>Tactical Arsenal ({tacticalItems.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('collection')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-cinzel text-xs font-bold transition cursor-pointer ${
            activeTab === 'collection'
              ? 'bg-[#ffd86b] text-black shadow-gold-sm'
              : 'bg-[#171320] text-[#8c7a9e] hover:text-white border border-[#2b2238]'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Cultural Lore ({collectionItems.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('energy')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-cinzel text-xs font-bold transition cursor-pointer ${
            activeTab === 'energy'
              ? 'bg-[#ffd86b] text-black shadow-gold-sm'
              : 'bg-[#171320] text-[#8c7a9e] hover:text-white border border-[#2b2238]'
          }`}
        >
          <Zap className="w-4 h-4" />
          <span>IoT Energy Reserves ({energyItems.length})</span>
        </button>
      </div>

      {/* --------------------------------------------------------------------- */}
      {/* TAB 1: TACTICAL ARSENAL (Relics) */}
      {/* --------------------------------------------------------------------- */}
      {activeTab === 'tactical' && (
        <div className="space-y-4">
          {/* Target Slot Selector for Quick-Equipping */}
          <div className="p-4 rounded-xl bg-[#120f18] border border-[#2b2238] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 font-mono text-[#cbd5e1]">
              <Shield className="w-4 h-4 text-[#ffd86b]" />
              <span>Target Arena Loadout Slot:</span>
            </div>

            <div className="flex items-center gap-2">
              {[0, 1, 2, 3].map((slotIdx) => {
                const isSelected = selectedSlotForEquip === slotIdx;
                const slotItem = arenaSlots[slotIdx]?.equippedItem;

                return (
                  <button
                    key={slotIdx}
                    type="button"
                    onClick={() => setSelectedSlotForEquip(slotIdx)}
                    className={`px-3 py-1.5 rounded-xl font-mono text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                      isSelected
                        ? 'bg-[#ffd86b] text-black ring-2 ring-[#d4af37]'
                        : 'bg-[#171320] text-[#8c7a9e] hover:text-white border border-[#2b2238]'
                    }`}
                  >
                    <span>Slot {slotIdx + 1}</span>
                    {slotItem && (
                      <span className="text-[10px] opacity-80 truncate max-w-[60px]">
                        ({slotItem.name.split(' ')[0]})
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {tacticalItems.length === 0 ? (
            <div className="p-12 text-center bg-[#120f18] rounded-2xl border border-[#2b2238] space-y-2">
              <Swords className="w-10 h-10 text-[#685c78] mx-auto" />
              <h4 className="font-cinzel text-base font-bold text-[#8c7a9e]">No Tactical Relics Found</h4>
              <p className="text-xs text-[#685c78]">Summon packs in Tab 2 (Summoning Altar) or inject dev cheat relics.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {tacticalItems.map((item) => {
                const rarityMeta = RARITY_TABLE[item.rarity];
                const equippedSlot = isEquippedInAnySlot(item.id);

                return (
                  <div
                    key={item.id}
                    className={`p-5 rounded-2xl border bg-[#120f18] transition-all duration-300 flex flex-col justify-between space-y-4 relative overflow-hidden ${
                      equippedSlot !== null
                        ? 'border-[#ffd86b] shadow-gold-sm ring-1 ring-[#ffd86b]/40'
                        : 'border-[#2b2238] hover:border-[#4a3a5e]'
                    }`}
                  >
                    {/* Top Row: Rarity & Score Rank */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{item.iconEmoji}</span>
                        <span
                          className="text-[10px] font-mono uppercase px-2 py-0.5 rounded font-bold"
                          style={{
                            backgroundColor: rarityMeta.bgColor,
                            color: rarityMeta.color,
                            borderColor: rarityMeta.borderColor,
                          }}
                        >
                          {rarityMeta.label}
                        </span>
                      </div>

                      <HazardBadge score={item.score} rank={item.rank} size="sm" />
                    </div>

                    {/* Name & Origin */}
                    <div>
                      <h4 className="font-cinzel text-sm font-bold text-white leading-snug">
                        {item.name}
                      </h4>
                      <p className="text-[11px] text-[#8c7a9e] mt-1 line-clamp-2">
                        {item.description}
                      </p>
                    </div>

                    {/* Stats Grid */}
                    {item.stats && item.stats.length > 0 && (
                      <div className="grid grid-cols-2 gap-2 text-[11px] font-mono p-2.5 rounded-xl bg-[#171320] border border-[#2b2238]">
                        {item.stats.map((s) => (
                          <div key={s.name} className="flex justify-between">
                            <span className="text-[#8c7a9e]">{s.name}:</span>
                            <strong className={s.value >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                              {s.value >= 0 ? `+${s.value}` : s.value}
                            </strong>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Buffs & Downsides summary */}
                    <div className="space-y-1 text-[10px]">
                      {item.buffs?.map((b) => (
                        <div key={b.name} className="text-emerald-400 flex items-center gap-1">
                          <TrendingUp className="w-3 h-3 shrink-0" />
                          <span className="truncate">{b.name}: {b.description}</span>
                        </div>
                      ))}
                      {item.downsides?.map((d) => (
                        <div key={d.name} className="text-rose-400 flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3 shrink-0" />
                          <span className="truncate">{d.name}: {d.description}</span>
                        </div>
                      ))}
                    </div>

                    {/* Equip Action Button */}
                    <div className="pt-2 border-t border-white/5 flex items-center justify-between">
                      <span className="text-[10px] font-mono text-[#685c78]">
                        Pulled: {new Date(item.pulledAt).toLocaleDateString()}
                      </span>

                      {equippedSlot !== null ? (
                        <button
                          type="button"
                          onClick={() => unequipRelic(equippedSlot)}
                          className="px-3 py-1.5 rounded-xl text-xs font-mono font-bold bg-[#2b1722] text-rose-300 hover:bg-rose-900/60 border border-rose-800 transition cursor-pointer flex items-center gap-1"
                        >
                          <Check className="w-3.5 h-3.5" /> Slot {equippedSlot + 1} (Unequip)
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => equipRelic(selectedSlotForEquip, item.id)}
                          className="px-3 py-1.5 rounded-xl text-xs font-mono font-bold bg-[#171320] hover:bg-[#ffd86b] text-[#ffd86b] hover:text-black border border-[#ffd86b]/40 hover:border-[#ffd86b] transition cursor-pointer flex items-center gap-1"
                        >
                          <span>Equip to Slot {selectedSlotForEquip + 1}</span>
                          <ChevronRight className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* --------------------------------------------------------------------- */}
      {/* TAB 2: CULTURAL LORE (Collectibles) */}
      {/* --------------------------------------------------------------------- */}
      {activeTab === 'collection' && (
        <div className="space-y-4">
          {collectionItems.length === 0 ? (
            <div className="p-12 text-center bg-[#120f18] rounded-2xl border border-[#2b2238] space-y-2">
              <BookOpen className="w-10 h-10 text-[#685c78] mx-auto" />
              <h4 className="font-cinzel text-base font-bold text-[#8c7a9e]">No Collectibles Unlocked</h4>
              <p className="text-xs text-[#685c78]">Historical records and cuneiform artifacts will appear here upon summoning.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {collectionItems.map((item) => {
                const rarityMeta = RARITY_TABLE[item.rarity];

                return (
                  <div
                    key={item.id}
                    className="p-5 rounded-2xl border border-[#2b2238] bg-[#120f18] flex flex-col justify-between space-y-4 relative overflow-hidden"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{item.iconEmoji}</span>
                        <span
                          className="text-[10px] font-mono uppercase px-2 py-0.5 rounded font-bold"
                          style={{
                            backgroundColor: rarityMeta.bgColor,
                            color: rarityMeta.color,
                          }}
                        >
                          {rarityMeta.label}
                        </span>
                      </div>
                      <HazardBadge score={item.score} rank={item.rank} size="sm" />
                    </div>

                    <div>
                      <span className="text-[10px] font-mono uppercase text-[#ffd86b] block">
                        Series: {item.seriesName || 'Historical Archive'}
                      </span>
                      <h4 className="font-cinzel text-sm font-bold text-white mt-0.5">
                        {item.name}
                      </h4>
                      <p className="text-xs text-[#cbd5e1] mt-2 font-serif italic bg-[#171320] p-3 rounded-xl border border-[#2b2238]">
                        "{item.loreText || item.description}"
                      </p>
                    </div>

                    <div className="text-[10px] font-mono text-[#685c78] pt-2 border-t border-white/5 flex justify-between">
                      <span>Origin: {item.origin}</span>
                      <span>{new Date(item.pulledAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* --------------------------------------------------------------------- */}
      {/* TAB 3: IOT ENERGY RESERVES */}
      {/* --------------------------------------------------------------------- */}
      {activeTab === 'energy' && (
        <div className="space-y-6">
          {/* Elemental Reserve Gauges */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {(Object.keys(ELEMENT_REGISTRY) as ElementalAttribute[]).map((attr) => {
              const element = ELEMENT_REGISTRY[attr];
              const value = energyReserves[attr] || 0;

              return (
                <div
                  key={attr}
                  className="p-4 rounded-2xl bg-[#120f18] border border-[#2b2238] space-y-2 relative overflow-hidden"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xl">{element.icon}</span>
                    <span
                      className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded"
                      style={{ color: element.color, backgroundColor: `${element.color}15` }}
                    >
                      {attr}
                    </span>
                  </div>

                  <div>
                    <h5 className="font-cinzel text-xs font-bold text-white">{element.name}</h5>
                    <strong className="text-lg font-mono font-bold" style={{ color: element.color }}>
                      {value}u
                    </strong>
                  </div>

                  {/* Visual Energy Bar */}
                  <div className="w-full bg-[#1c1424] h-1.5 rounded-full overflow-hidden">
                    <div
                      className="h-full transition-all duration-500 rounded-full"
                      style={{
                        width: `${Math.min(100, (value / 250) * 100)}%`,
                        backgroundColor: element.color,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Harvested Core History */}
          <div className="p-6 rounded-2xl bg-[#120f18] border border-[#2b2238] space-y-3">
            <h4 className="font-cinzel text-sm font-bold text-white flex items-center gap-2">
              <Zap className="w-4 h-4 text-[#ffd86b]" />
              Harvested Energy Cores ({energyItems.length})
            </h4>

            {energyItems.length === 0 ? (
              <p className="text-xs text-[#685c78] italic">No individual energy cores logged in history.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {energyItems.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 rounded-xl bg-[#171320] border border-[#2b2238] flex items-center justify-between text-xs font-mono"
                  >
                    <div className="flex items-center gap-2">
                      <span>{item.iconEmoji}</span>
                      <span className="text-[#cbd5e1] font-bold">{item.name}</span>
                    </div>
                    <span className="text-[10px] text-[#8c7a9e]">
                      {new Date(item.pulledAt).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default VaultGalleries;
