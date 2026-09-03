// path: src/apps/vinyl-angel/VinylAngel.tsx

import { useState } from 'react';
import { useGlobalStore } from '../../store/useGlobalStore';
import { VinylGallery } from './components/VinylGallery';
import { VinylPipeline } from './components/VinylPipeline';
import { Disc3, Sparkles, Database, Sliders, ArrowLeft } from 'lucide-react';

const TARGET_PROJECT_ID = 'music_app';

export function VinylAngel() {
  const setActiveApp = useGlobalStore((s) => s.setActiveApp);
  const [activeTab, setActiveTab] = useState<'gallery' | 'pipeline' | 'config'>('gallery');

  return (
    <div className="min-h-screen portal-backdrop text-[#f5f0e8] p-4 md:p-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Navigation & Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <button
            onClick={() => setActiveApp('hub')}
            className="btn-secondary flex items-center gap-2 self-start text-xs font-cinzel px-4 py-2"
          >
            <ArrowLeft className="w-4 h-4" /> Return to Hub
          </button>

          {/* Sub-view Navigation Tabs */}
          <div className="flex items-center gap-1.5 bg-[#100d16] p-1.5 rounded-xl border border-[#261d33] self-start sm:self-auto">
            <button
              onClick={() => setActiveTab('gallery')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-cinzel font-bold transition ${
                activeTab === 'gallery'
                  ? 'bg-gradient-to-r from-[#d4af37] to-[#aa8214] text-black shadow-gold-sm border border-[#ffd86b]'
                  : 'text-[#8c7a9e] hover:text-white hover:bg-[#1a1424]'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" /> Treasury Vault
            </button>
            <button
              onClick={() => setActiveTab('pipeline')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-cinzel font-bold transition ${
                activeTab === 'pipeline'
                  ? 'bg-gradient-to-r from-[#d4af37] to-[#aa8214] text-black shadow-gold-sm border border-[#ffd86b]'
                  : 'text-[#8c7a9e] hover:text-white hover:bg-[#1a1424]'
              }`}
            >
              <Database className="w-3.5 h-3.5" /> ETL Pipeline
            </button>
            <button
              onClick={() => setActiveTab('config')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-cinzel font-bold transition ${
                activeTab === 'config'
                  ? 'bg-gradient-to-r from-[#d4af37] to-[#aa8214] text-black shadow-gold-sm border border-[#ffd86b]'
                  : 'text-[#8c7a9e] hover:text-white hover:bg-[#1a1424]'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" /> Destiny Config
            </button>
          </div>
        </div>

        {/* Hero Banner */}
        <header className="p-6 rounded-2xl bg-[#120f18] border border-[#2b2238] flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-lg">
          <div className="flex items-center gap-4">
            <div className="p-3.5 rounded-2xl bg-gradient-to-br from-[#291e07] to-[#120f18] border border-[#524124] shadow-gold-sm">
              <Disc3 className="w-8 h-8 text-[#ffd86b] animate-spin" style={{ animationDuration: '8s' }} />
            </div>
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h1 className="font-cinzel text-2xl md:text-3xl font-black gold-text-gradient">
                  Vinyl Angel
                </h1>
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-[#291e07] text-[#ffd86b] border border-[#524124]">
                  天界黑胶
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800">
                  AUTONOMOUS
                </span>
              </div>
              <p className="text-xs text-[#8c7a9e] max-w-xl">
                Autonomous Music Laboratory, Harmonic Hazard & KPI Pipeline — Connected to Storage Engine (<code className="text-[#ffd86b]">project_id: {TARGET_PROJECT_ID}</code>)
              </p>
            </div>
          </div>
        </header>

        {/* Tab Views */}
        {activeTab === 'gallery' && (
          <VinylGallery projectId={TARGET_PROJECT_ID} />
        )}

        {activeTab === 'pipeline' && (
          <VinylPipeline projectId={TARGET_PROJECT_ID} />
        )}

        {activeTab === 'config' && (
          <div className="p-12 rounded-2xl bg-[#120f18] border border-[#2b2238] text-center text-[#8c7a9e] space-y-4 max-w-2xl mx-auto shadow-lg">
            <Sliders className="w-12 h-12 mx-auto text-[#ffd86b] opacity-80" />
            <h3 className="font-cinzel text-lg text-white font-bold">Autonomous Weight Configuration</h3>
            <p className="text-xs leading-relaxed text-[#9c93a8]">
              Cấu hình trọng số và các tham số toán học cho mô hình tính điểm Hazard Scoring Engine:
            </p>
            <div className="p-4 rounded-xl bg-[#171320] border border-[#2b2238] font-mono text-xs text-left space-y-2 text-[#cbd5e1]">
              <div>Raw XP Formula: <code className="text-[#ffd86b]">10*s5 + 65*s6 + 200*s7 - 70*s3 - 3*s4</code></div>
              <div>Scaling Coefficient: <code className="text-[#ffd86b]">5.0 / ln(51) ≈ 1.2717</code></div>
              <div>Score Mapping: <code className="text-[#ffd86b]">3.0 + sgn(XP) * c * ln(1 + |XP| / 300)</code></div>
              <div>Threshold: <code className="text-emerald-400">Score &gt; 3.0 → Vault Eligible (59 Active Tracks)</code></div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

export default VinylAngel;
