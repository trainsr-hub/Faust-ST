// path: src/apps/golden-hour/components/GoldenHourConfig.tsx

import React, { useState } from 'react';
import { useGoldenHourStore, calculateHazardFromTime } from '../store/useGoldenHourStore';
import { useCurrencyStore } from '../../../store/useCurrencyStore';
import { useInventoryStore } from '../../../store/useInventoryStore';
import {
  Wrench,
  Clock,
  Ticket,
  Sparkles,
  Zap,
  Trash2,
  Database,
  CheckCircle2,
  AlertCircle,
  Server,
} from 'lucide-react';

export const GoldenHourConfig: React.FC = () => {
  const {
    injectSampleRelics,
    injectEnergyReserves,
    clearVault,
    resetEnergyReserves,
    vault,
    energyReserves,
    arenaSlots,
  } = useGoldenHourStore();

  const {
    timeBalance,
    earnTime,
    spendTime,
    setTimeBalance,
  } = useCurrencyStore();

  const {
    angelRollTickets,
    solarRollTickets,
    codexRollTickets,
    addAngelTickets,
    addSolarTickets,
    addCodexTickets,
    clearTickets,
  } = useInventoryStore();

  const { goldenHours, hazardLevel } = calculateHazardFromTime(timeBalance);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto w-full">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-xl bg-[#171320] border border-[#d4af37] text-xs font-semibold shadow-2xl flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2 text-[#ffd86b]">
          {toast.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-400" />
          )}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-[#120f18] border border-[#2b2238] flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-lg">
        <div className="flex items-center gap-3.5">
          <div className="p-3 rounded-xl bg-gradient-to-br from-[#291e07] to-[#120f18] border border-[#524124]">
            <Wrench className="w-7 h-7 text-[#ffd86b]" />
          </div>
          <div>
            <h2 className="font-cinzel text-xl font-bold text-[#ffd86b] flex items-center gap-2">
              Golden Hour Developer Sandbox & Config
            </h2>
            <p className="text-xs text-[#8c7a9e]">
              Dev cheat codes, currency overrides, ticket injectors, and authoritative multi-tier backend storage inspector.
            </p>
          </div>
        </div>

        <span className="px-3 py-1.5 rounded-xl bg-[#2b1e0a] text-[#ffd86b] border border-[#d4af37]/40 text-xs font-mono font-bold">
          DEV SANDBOX MODE ACTIVE
        </span>
      </div>

      {/* Grid of Sandbox Cheat Modules */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Module 1: Universal Time & Hazard Level Cheat */}
        <div className="p-6 rounded-2xl bg-[#120f18] border border-[#2b2238] space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-[#ffd86b]" />
              <h3 className="font-cinzel text-sm font-bold text-white">
                Universal Time & Hazard Stake
              </h3>
            </div>
            <div className="text-xs font-mono text-[#8c7a9e]">
              Hazard: <strong className="text-[#ffd86b]">{hazardLevel.toFixed(2)}</strong> ({goldenHours.toFixed(1)} hrs)
            </div>
          </div>

          <p className="text-xs text-[#8c7a9e]">
            Universal Time operates as your live Golden Hours balance (x = time / 3600). Adding time increases your Hazard Level; spending time reduces it.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
            <button
              type="button"
              onClick={() => {
                earnTime(3600);
                showToast('Injected +1 Universal Hour (+3,600s)!');
              }}
              className="p-2.5 rounded-xl bg-[#171320] hover:bg-[#ffd86b] text-[#cbd5e1] hover:text-black border border-[#2b2238] font-bold transition cursor-pointer text-center"
            >
              +1 Hour
            </button>

            <button
              type="button"
              onClick={() => {
                earnTime(36000);
                showToast('Injected +10 Universal Hours (+36,000s)!');
              }}
              className="p-2.5 rounded-xl bg-[#171320] hover:bg-[#ffd86b] text-[#cbd5e1] hover:text-black border border-[#2b2238] font-bold transition cursor-pointer text-center"
            >
              +10 Hours
            </button>

            <button
              type="button"
              onClick={() => {
                spendTime(3600);
                showToast('Deducted -1 Universal Hour (-3,600s).');
              }}
              className="p-2.5 rounded-xl bg-[#2b1722] hover:bg-rose-900/60 text-rose-300 border border-rose-800 font-bold transition cursor-pointer text-center"
            >
              -1 Hour
            </button>

            <button
              type="button"
              onClick={() => {
                setTimeBalance(0);
                showToast('Reset Universal Time to 0.');
              }}
              className="p-2.5 rounded-xl bg-[#171320] hover:bg-rose-950 text-[#8c7a9e] hover:text-rose-300 border border-[#2b2238] font-bold transition cursor-pointer text-center"
            >
              Reset 0
            </button>
          </div>
        </div>

        {/* Module 2: Dimensional Tickets Injector */}
        <div className="p-6 rounded-2xl bg-[#120f18] border border-[#2b2238] space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Ticket className="w-5 h-5 text-[#ffd86b]" />
              <h3 className="font-cinzel text-sm font-bold text-white">
                Dimensional Tickets Cheat
              </h3>
            </div>
            <div className="text-xs font-mono text-[#8c7a9e]">
              A:{angelRollTickets} | S:{solarRollTickets} | C:{codexRollTickets}
            </div>
          </div>

          <p className="text-xs text-[#8c7a9e]">
            Inject batches of dimensional proof-of-effort tickets directly into backend storage to summon gacha card packs.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
            <button
              type="button"
              onClick={() => {
                addAngelTickets(10);
                showToast('Injected +10 Angel Roll Tickets!');
              }}
              className="p-2.5 rounded-xl bg-[#171320] hover:bg-[#ffd86b] text-[#ffd86b] hover:text-black border border-[#d4af37]/40 font-bold transition cursor-pointer text-center"
            >
              +10 Angel
            </button>

            <button
              type="button"
              onClick={() => {
                addSolarTickets(10);
                showToast('Injected +10 Solar Roll Tickets!');
              }}
              className="p-2.5 rounded-xl bg-[#171320] hover:bg-[#f97316] text-[#f97316] hover:text-black border border-[#f97316]/40 font-bold transition cursor-pointer text-center"
            >
              +10 Solar
            </button>

            <button
              type="button"
              onClick={() => {
                addCodexTickets(10);
                showToast('Injected +10 Codex Roll Tickets!');
              }}
              className="p-2.5 rounded-xl bg-[#171320] hover:bg-[#38bdf8] text-[#38bdf8] hover:text-black border border-[#38bdf8]/40 font-bold transition cursor-pointer text-center"
            >
              +10 Codex
            </button>

            <button
              type="button"
              onClick={() => {
                clearTickets();
                showToast('Reset all tickets to 0.');
              }}
              className="p-2.5 rounded-xl bg-[#171320] hover:bg-rose-950 text-[#8c7a9e] hover:text-rose-300 border border-[#2b2238] font-bold transition cursor-pointer text-center"
            >
              Clear All
            </button>
          </div>
        </div>

        {/* Module 3: Instant Legendary Relics & Collectibles Injector */}
        <div className="p-6 rounded-2xl bg-[#120f18] border border-[#2b2238] space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#ffd86b]" />
              <h3 className="font-cinzel text-sm font-bold text-white">
                Relics & Lore Arsenal Injection
              </h3>
            </div>
            <div className="text-xs font-mono text-[#8c7a9e]">
              Vault Items: <strong className="text-white">{vault.length}</strong>
            </div>
          </div>

          <p className="text-xs text-[#8c7a9e]">
            Instantly inject high-tier Babylonian, Solar Plasma, and Void relics (✦, Ψ, S₄) directly into your Vault to test equipment loadouts.
          </p>

          <div className="flex flex-wrap gap-2 text-xs font-mono">
            <button
              type="button"
              onClick={() => {
                injectSampleRelics();
                showToast('Injected 4 Curated High-Tier Relics & Tablets into Vault!');
              }}
              className="px-4 py-2.5 rounded-xl bg-[#ffd86b] text-black font-bold shadow-gold-sm hover:brightness-110 transition cursor-pointer flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>Inject Curated Relic Set</span>
            </button>

            <button
              type="button"
              onClick={() => {
                clearVault();
                showToast('Cleared Vault and unequipped all loadouts.');
              }}
              className="px-4 py-2.5 rounded-xl bg-[#2b1722] hover:bg-rose-900/60 text-rose-300 border border-rose-800 font-bold transition cursor-pointer flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              <span>Purge Vault</span>
            </button>
          </div>
        </div>

        {/* Module 4: IoT Multi-Attribute Energy Fuel Injector */}
        <div className="p-6 rounded-2xl bg-[#120f18] border border-[#2b2238] space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-[#ffd86b]" />
              <h3 className="font-cinzel text-sm font-bold text-white">
                IoT Energy Fuel Reserves
              </h3>
            </div>
            <div className="text-xs font-mono text-[#8c7a9e]">
              Total Fuel: <strong className="text-white">{Object.values(energyReserves).reduce((a, b) => a + b, 0)}u</strong>
            </div>
          </div>

          <p className="text-xs text-[#8c7a9e]">
            Charge elemental energy reservoirs (Solar, Void, Verdant, Celestial, Aether) used for hardware telemetry and peripheral devices.
          </p>

          <div className="flex flex-wrap gap-2 text-xs font-mono">
            <button
              type="button"
              onClick={() => {
                injectEnergyReserves('solar', 50);
                injectEnergyReserves('void', 50);
                injectEnergyReserves('verdant', 50);
                injectEnergyReserves('celestial', 50);
                injectEnergyReserves('aether', 50);
                showToast('Injected +50u to all 5 elemental fuel reserves!');
              }}
              className="px-4 py-2.5 rounded-xl bg-[#171320] hover:bg-[#ffd86b] text-[#ffd86b] hover:text-black border border-[#d4af37]/40 font-bold transition cursor-pointer flex items-center gap-2"
            >
              <Zap className="w-4 h-4" />
              <span>+50u All Elements</span>
            </button>

            <button
              type="button"
              onClick={() => {
                resetEnergyReserves();
                showToast('Reset all energy reserves to 100u.');
              }}
              className="px-4 py-2.5 rounded-xl bg-[#171320] hover:bg-rose-950 text-[#8c7a9e] hover:text-rose-300 border border-[#2b2238] font-bold transition cursor-pointer"
            >
              Reset 100u Baseline
            </button>
          </div>
        </div>
      </div>

      {/* Architecture & Backend Storage Blueprint Inspector */}
      <div className="p-6 rounded-2xl bg-[#120f18] border border-[#2b2238] space-y-4 shadow-lg">
        <div className="flex items-center gap-2">
          <Database className="w-5 h-5 text-[#ffd86b]" />
          <h3 className="font-cinzel text-sm font-bold text-white">
            Architecture Blueprint: Authoritative Blue Rose FastAPI Backend Engine
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-[#171320] border border-[#2b2238] space-y-2">
            <div className="flex items-center gap-2 text-[#ffd86b] font-bold">
              <Server className="w-4 h-4" />
              <span>1. Authoritative Backend Storage Tiers</span>
            </div>
            <p className="text-[#8c7a9e] leading-relaxed">
              All durable game resources are persisted directly to the backend storage files in <code className="text-white">backend/data/projects/universe_25/app_data/</code>:
            </p>
            <ul className="list-disc list-inside text-[#cbd5e1] font-mono space-y-1">
              <li><code className="text-[#ffd86b]">state.json</code>: Universal Time ({timeBalance}s) & User Profile</li>
              <li><code className="text-[#ffd86b]">inventory.json</code>: Dimensional Roll Tickets & Currencies</li>
              <li><code className="text-[#ffd86b]">vault.json</code>: Relics, Arena Loadouts ({arenaSlots.filter(s => s.equippedItem).length}/4), Energy Cores</li>
              <li><code className="text-[#ffd86b]">farms.json</code>: Agrarian Plot Lifecycle States</li>
              <li><code className="text-[#ffd86b]">events.jsonl</code>: Transactional Audit Ledger</li>
            </ul>
          </div>

          <div className="p-4 rounded-xl bg-[#171320] border border-[#2b2238] space-y-2">
            <div className="flex items-center gap-2 text-[#38bdf8] font-bold">
              <Server className="w-4 h-4" />
              <span>2. Anti-Silent Fail-Loudly Policy</span>
            </div>
            <p className="text-[#8c7a9e] leading-relaxed">
              Zero silent fallback policy:
            </p>
            <ul className="list-disc list-inside text-[#cbd5e1] font-mono space-y-1">
              <li>Engine Endpoint: <code className="text-[#38bdf8]">POST http://localhost:8080/api/v1/execute</code></li>
              <li>RAM restriction: Transient UI state only (active tabs, animations)</li>
              <li>Connection losses trigger high-visibility alerts & block phantom states</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GoldenHourConfig;
