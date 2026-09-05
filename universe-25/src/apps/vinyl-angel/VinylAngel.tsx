// path: src/apps/vinyl-angel/VinylAngel.tsx

import { useState } from 'react';
import { useGlobalStore } from '../../store/useGlobalStore';
import { useVinylStore } from './store/useVinylStore';
import { VinylPlayer } from './components/VinylPlayer';
import { VinylShop } from './components/VinylShop';
import { VinylGallery } from './components/VinylGallery';
import { VinylConfig } from './components/VinylConfig';
import {
  Disc3,
  ShoppingBag,
  Trophy,
  Sliders,
  ArrowLeft,
  Ticket,
} from 'lucide-react';

const TARGET_PROJECT_ID = 'music_app';

type VinylTab = 'gameplay' | 'shop' | 'gallery' | 'config';

export function VinylAngel() {
  const setActiveApp = useGlobalStore((s) => s.setActiveApp);
  const { localTheme, discs, angelRollTickets } = useVinylStore();

  const [activeTab, setActiveTab] = useState<VinylTab>('gameplay');

  // Theme styling mapping for wrapper
  const themeClasses: Record<string, string> = {
    'celestial-gold': 'bg-[#0c0b0e] text-[#f5f0e8]',
    'obsidian-abyss': 'bg-[#050505] text-[#e2e8f0]',
    'crimson-void': 'bg-[#0d0406] text-[#fde8e8]',
    'emerald-sanctuary': 'bg-[#040d08] text-[#ecfdf5]',
    'cyber-neon': 'bg-[#070512] text-[#fdf4ff]',
  };

  return (
    <div className={`min-h-screen transition-colors duration-500 p-4 md:p-8 font-sans ${themeClasses[localTheme] || themeClasses['celestial-gold']}`}>
      <div className="max-w-7xl mx-auto w-full space-y-6">

        {/* Top Header: Symmetrical Navigation & Balance Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <button
            type="button"
            onClick={() => setActiveApp('hub')}
            className="flex items-center gap-2 text-xs font-cinzel font-bold px-4 py-2.5 rounded-xl bg-[#14101c] hover:bg-[#20192e] border border-[#2e2638] hover:border-[#d4af37] text-[#cbd5e1] hover:text-white transition shadow-sm cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" /> Return to Hub
          </button>

          {/* Centered Tab Navigation Pill */}
          <div className="flex items-center justify-center gap-1.5 bg-[#100d16] p-1.5 rounded-2xl border border-[#261d33] shadow-md overflow-x-auto max-w-full scrollbar-thin">
            <button
              type="button"
              onClick={() => setActiveTab('gameplay')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-cinzel font-bold transition flex-shrink-0 cursor-pointer ${
                activeTab === 'gameplay'
                  ? 'bg-gradient-to-r from-[#d4af37] to-[#aa8214] text-black shadow-gold-sm border border-[#ffd86b]'
                  : 'text-[#8c7a9e] hover:text-white hover:bg-[#1a1424]'
              }`}
            >
              <Disc3 className="w-3.5 h-3.5" />
              Gameplay
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('shop')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-cinzel font-bold transition flex-shrink-0 cursor-pointer ${
                activeTab === 'shop'
                  ? 'bg-gradient-to-r from-[#d4af37] to-[#aa8214] text-black shadow-gold-sm border border-[#ffd86b]'
                  : 'text-[#8c7a9e] hover:text-white hover:bg-[#1a1424]'
              }`}
            >
              <ShoppingBag className="w-3.5 h-3.5" /> Shop
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('gallery')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-cinzel font-bold transition flex-shrink-0 cursor-pointer ${
                activeTab === 'gallery'
                  ? 'bg-gradient-to-r from-[#d4af37] to-[#aa8214] text-black shadow-gold-sm border border-[#ffd86b]'
                  : 'text-[#8c7a9e] hover:text-white hover:bg-[#1a1424]'
              }`}
            >
              <Trophy className="w-3.5 h-3.5" /> Gallery & Sync
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('config')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-cinzel font-bold transition flex-shrink-0 cursor-pointer ${
                activeTab === 'config'
                  ? 'bg-gradient-to-r from-[#d4af37] to-[#aa8214] text-black shadow-gold-sm border border-[#ffd86b]'
                  : 'text-[#8c7a9e] hover:text-white hover:bg-[#1a1424]'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" /> Config
            </button>
          </div>

          {/* Discs & Tickets Balance Display */}
          <div className="flex items-center gap-2.5">
            <div className="flex items-center gap-2 bg-[#14101c] px-3.5 py-1.5 rounded-xl border border-[#2e2638] text-xs font-mono font-bold text-[#ffd86b] shadow-sm">
              <Disc3 className="w-4 h-4 text-[#ffd86b]" />
              <span>{discs} Discs</span>
            </div>
            {angelRollTickets > 0 && (
              <div className="flex items-center gap-2 bg-[#1c1424] px-3.5 py-1.5 rounded-xl border border-[#4a3461] text-xs font-mono font-bold text-[#c084fc] shadow-sm">
                <Ticket className="w-4 h-4 text-[#c084fc]" />
                <span>{angelRollTickets} Tickets</span>
              </div>
            )}
          </div>
        </div>

        {/* Hero Banner Header: Centered Symmetrical Brand Card */}
        <header className="p-6 rounded-2xl bg-[#120f18]/90 border border-[#2b2238] flex flex-col items-center justify-center text-center gap-3 shadow-xl backdrop-blur-md">
          <div className="flex items-center justify-center gap-3">
            <div className="p-2.5 rounded-2xl bg-gradient-to-br from-[#291e07] to-[#120f18] border border-[#524124] shadow-gold-sm flex-shrink-0">
              <Disc3 className="w-7 h-7 text-[#ffd86b]" />
            </div>
            <div className="flex items-center gap-2.5">
              <h1 className="font-cinzel text-2xl md:text-3xl font-black bg-gradient-to-r from-[#ffd86b] via-[#d4af37] to-[#f59e0b] bg-clip-text text-transparent">
                Vinyl Angel
              </h1>
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-[#291e07] text-[#ffd86b] border border-[#524124]">
                天界黑胶
              </span>
            </div>
          </div>
          <p className="text-xs text-[#8c7a9e] max-w-xl font-mono leading-relaxed">
            Autonomous Music Laboratory, Harmonic Hazard Scoring & Dynamic ETL Ingestion
          </p>
        </header>

        {/* Active Tab View - Persistent Containers to Keep Player Alive */}
        <main className="w-full">
          <div className={activeTab === 'gameplay' ? 'block' : 'hidden'}>
            <VinylPlayer projectId={TARGET_PROJECT_ID} />
          </div>

          <div className={activeTab === 'shop' ? 'block' : 'hidden'}>
            <VinylShop />
          </div>

          <div className={activeTab === 'gallery' ? 'block' : 'hidden'}>
            <VinylGallery projectId={TARGET_PROJECT_ID} />
          </div>

          <div className={activeTab === 'config' ? 'block' : 'hidden'}>
            <VinylConfig />
          </div>
        </main>

      </div>
    </div>
  );
}

export default VinylAngel;
