// path: src/apps/golden-hour/GoldenHour.tsx

import React, { useState } from 'react';
import { BattleArena } from './components/BattleArena';
import { GachaAltar } from './components/GachaAltar';
import { VaultGalleries } from './components/VaultGalleries';
import { GoldenHourConfig } from './components/GoldenHourConfig';
import { calculateHazardFromTime } from './store/useGoldenHourStore';
import { useCurrencyStore } from '../../store/useCurrencyStore';
import {
  Swords,
  Sparkles,
  Archive,
  Wrench,
  Clock,
  Activity,
  Lock,
} from 'lucide-react';

type GoldenHourTab = 'arena' | 'gacha' | 'vault' | 'config';

export const GoldenHour: React.FC = () => {
  // Default to Tab 2 (Summoning Altar) as Tab 1 is in Phase 1 lock
  const [activeTab, setActiveTab] = useState<GoldenHourTab>('gacha');

  const timeBalance = useCurrencyStore((s) => s.timeBalance);
  const { goldenHours, hazardLevel } = calculateHazardFromTime(timeBalance);

  return (
    <div className="flex-1 flex flex-col h-full bg-[#0a080f] text-[#cbd5e1] overflow-y-auto">
      {/* Top Main App Navigation & Odometer Bar */}
      <header className="sticky top-0 z-30 bg-[#0f0d14]/95 backdrop-blur-md border-b border-[#2b2238] px-6 py-4 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* App Title & Dynamic Personal Hazard Level Odometer */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#ffd86b] via-[#d4af37] to-[#f97316] p-0.5 shadow-gold-md flex items-center justify-center">
              <div className="w-full h-full bg-[#120f18] rounded-[14px] flex items-center justify-center text-lg">
                ✨
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-cinzel text-xl font-bold tracking-wider text-white">
                  Golden Hour
                </h1>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#ffd86b]/10 text-[#ffd86b] border border-[#ffd86b]/30">
                  MASTER GAME
                </span>
              </div>
              <p className="text-[11px] text-[#8c7a9e]">
                Universal Stake Nexus • Babylonian Altar
              </p>
            </div>
          </div>

          {/* Personal Hazard Level Decimal Display (<a.b> odometer) */}
          <div className="hidden sm:flex items-center gap-3 pl-4 border-l border-[#2b2238]">
            <div className="flex items-center gap-2 bg-[#171320] px-3.5 py-1.5 rounded-xl border border-[#ffd86b]/30 shadow-inner">
              <Activity className="w-4 h-4 text-[#ffd86b]" />
              <div className="flex flex-col leading-none">
                <span className="text-[9px] font-mono uppercase text-[#8c7a9e] tracking-wider">
                  Hazard Level
                </span>
                <span className="text-sm font-mono font-black text-[#ffd86b]">
                  {hazardLevel.toFixed(2)}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 bg-[#171320] px-3.5 py-1.5 rounded-xl border border-[#2b2238]">
              <Clock className="w-4 h-4 text-[#38bdf8]" />
              <div className="flex flex-col leading-none">
                <span className="text-[9px] font-mono uppercase text-[#8c7a9e] tracking-wider">
                  Universal Time
                </span>
                <span className="text-sm font-mono font-bold text-white">
                  {goldenHours.toFixed(1)} hrs
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 4 App Tabs Navigation Pills */}
        <nav className="flex items-center gap-1.5 bg-[#171320] p-1.5 rounded-2xl border border-[#2b2238] shadow-inner text-xs">
          {/* Tab 1: Battle Arena (Phase 1 Locked badge) */}
          <button
            type="button"
            onClick={() => setActiveTab('arena')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl font-cinzel font-bold transition cursor-pointer relative ${
              activeTab === 'arena'
                ? 'bg-[#ffd86b] text-black shadow-gold-sm'
                : 'text-[#8c7a9e] hover:text-white hover:bg-white/5'
            }`}
          >
            <Swords className="w-4 h-4" />
            <span>Tab 1: Battle Arena</span>
            <span className="flex items-center gap-0.5 text-[9px] font-mono px-1.5 py-0.2 rounded bg-[#2b1e0a] text-[#ffd86b] border border-[#ffd86b]/40">
              <Lock className="w-2.5 h-2.5" />
              Locked
            </span>
          </button>

          {/* Tab 2: Summoning Altar (Default) */}
          <button
            type="button"
            onClick={() => setActiveTab('gacha')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl font-cinzel font-bold transition cursor-pointer ${
              activeTab === 'gacha'
                ? 'bg-[#ffd86b] text-black shadow-gold-sm'
                : 'text-[#8c7a9e] hover:text-white hover:bg-white/5'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>Tab 2: Card Packs</span>
          </button>

          {/* Tab 3: Vault Collection */}
          <button
            type="button"
            onClick={() => setActiveTab('vault')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl font-cinzel font-bold transition cursor-pointer ${
              activeTab === 'vault'
                ? 'bg-[#ffd86b] text-black shadow-gold-sm'
                : 'text-[#8c7a9e] hover:text-white hover:bg-white/5'
            }`}
          >
            <Archive className="w-4 h-4" />
            <span>Tab 3: Vault</span>
          </button>

          {/* Tab 4: Dev Sandbox / Cheat Suite */}
          <button
            type="button"
            onClick={() => setActiveTab('config')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl font-cinzel font-bold transition cursor-pointer ${
              activeTab === 'config'
                ? 'bg-[#ffd86b] text-black shadow-gold-sm'
                : 'text-[#8c7a9e] hover:text-white hover:bg-white/5'
            }`}
          >
            <Wrench className="w-4 h-4" />
            <span>Dev Sandbox</span>
          </button>
        </nav>
      </header>

      {/* Main Content Viewport */}
      <main className="flex-1 p-6 md:p-8">
        {activeTab === 'arena' && <BattleArena />}
        {activeTab === 'gacha' && <GachaAltar />}
        {activeTab === 'vault' && <VaultGalleries />}
        {activeTab === 'config' && <GoldenHourConfig />}
      </main>
    </div>
  );
};

export default GoldenHour;
