// path: src/apps/artifact-codex/ArtifactCodex.tsx

import { useState, type FC } from 'react';
import { useGlobalStore } from '../../store/useGlobalStore';
import { HazardBadge } from '../../components/HazardBadge';
import {
  GLOBAL_RANKS,
  RANK_THEMATIC_REGISTRY,
  getRankFromScore,
} from '../../utils/rank';
import type { GlobalRankTier } from '../../utils/rank';
import {
  BookOpen,
  Sparkles,
  Sliders,
  Shield,
  Layers,
  Compass,
  Cpu,
  ArrowLeft,
} from 'lucide-react';

interface MockArtifact {
  id: string;
  name: string;
  origin: string;
  targetScore: number;
  expectedRank: GlobalRankTier;
  category: string;
}

const MOCK_ARTIFACTS: MockArtifact[] = [
  { id: 'CODEX-800', name: 'Cosmic Stellar Core — The Prime Origin', origin: 'Nebula Sector 0', targetScore: 8.45, expectedRank: '✦', category: 'Cosmic' },
  { id: 'CODEX-750', name: 'Singularity Lens — Event Horizon Void', origin: 'Black Hole Cygnus', targetScore: 7.72, expectedRank: 'Ø', category: 'Cosmic' },
  { id: 'CODEX-700', name: 'Unfrozen Abyssal Siren — Tidal Sovereign', origin: 'Glacial Mariana', targetScore: 7.18, expectedRank: 'Ψ', category: 'Abyssal' },
  { id: 'CODEX-675', name: 'Astral Crucible — Phase IV Apex Transmutation', origin: 'Solar Forge V', targetScore: 6.88, expectedRank: 'S₄', category: 'Evolution' },
  { id: 'CODEX-650', name: 'Plasma Burst Cannon — Phase III Molten Radiance', origin: 'Ionized Core', targetScore: 6.62, expectedRank: 'S₃', category: 'Evolution' },
  { id: 'CODEX-625', name: 'Overcharged Coil — Phase II Resonant Sweep', origin: 'Magnetic Rift', targetScore: 6.38, expectedRank: 'S₂', category: 'Evolution' },
  { id: 'CODEX-600', name: 'Gold Ignition Spark — Phase I Gold Ignition', origin: 'Aureus Forge', targetScore: 6.08, expectedRank: 'S₁', category: 'Evolution' },
  { id: 'CODEX-550', name: 'Jade Vanguard Aegis — Master Armament', origin: 'Emerald Bastion', targetScore: 5.75, expectedRank: 'A+', category: 'Standard' },
  { id: 'CODEX-500', name: 'Emerald Standard Relic — High Knight Blade', origin: 'Sylvan Shrine', targetScore: 5.25, expectedRank: 'A', category: 'Standard' },
  { id: 'CODEX-450', name: 'Cobalt Surge Crystal — Choice Conduit', origin: 'Azure Cavern', targetScore: 4.65, expectedRank: 'B+', category: 'Standard' },
  { id: 'CODEX-400', name: 'Azure Matrix Plate — Solid Infusion', origin: 'Cobalt Foundry', targetScore: 4.15, expectedRank: 'B', category: 'Standard' },
  { id: 'CODEX-350', name: 'Iron Slate Fragment — Adept Inscription', origin: 'Ferrous Quarry', targetScore: 3.65, expectedRank: 'C+', category: 'Standard' },
  { id: 'CODEX-300', name: 'Neutral Base Claymore — Uncarved Core', origin: 'Stone Plateau', targetScore: 3.00, expectedRank: 'C', category: 'Standard' },
  { id: 'CODEX-250', name: 'Decaying Cursed Rune — Warning Sector', origin: 'Blighted Mire', targetScore: 2.65, expectedRank: 'D+', category: 'Decay' },
  { id: 'CODEX-200', name: 'Abyssal Decay Shard — Severe Penalty', origin: 'Tartarus Rift', targetScore: 2.10, expectedRank: 'D', category: 'Decay' },
];

const RankMatrixShowcaseView: FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  const filteredMock = MOCK_ARTIFACTS.filter(
    (item) => selectedCategory === 'ALL' || item.category === selectedCategory
  );

  return (
    <div className="space-y-8">
      <div className="p-6 rounded-2xl bg-[#0b1320] border border-[#1e3a5f] shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 mb-1.5">
            <Sparkles className="w-5 h-5 text-[#38bdf8] animate-pulse" />
            <h2 className="font-cinzel text-lg font-bold text-[#e0f2fe]">
              Rank System Thematic Matrix
            </h2>
          </div>
          <p className="text-xs text-[#94a3b8] max-w-2xl leading-relaxed">
            Khu vực giám định và kiểm thử trực quan toàn bộ 15 phân bậc Rank (từ <strong className="text-red-400">D</strong> đến <strong className="text-amber-300">✦ The Star</strong>) thông qua Component tái sử dụng <code className="text-[#38bdf8]">&lt;HazardBadge/&gt;</code>.
          </p>
        </div>

        <div className="flex items-center gap-1.5 bg-[#070d18] p-1 rounded-xl border border-[#172e4d]">
          {['ALL', 'Cosmic', 'Evolution', 'Standard', 'Decay'].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition ${
                selectedCategory === cat
                  ? 'bg-[#38bdf8] text-black shadow-[0_0_10px_rgba(56,189,248,0.4)]'
                  : 'text-[#94a3b8] hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredMock.map((item) => {
          const meta = RANK_THEMATIC_REGISTRY[item.expectedRank];
          return (
            <div
              key={item.id}
              className="p-5 rounded-xl bg-[#09111e] border border-[#172e4d] hover:border-[#38bdf8]/60 transition-all duration-300 shadow-md flex flex-col justify-between group space-y-4"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <HazardBadge
                    score={item.targetScore}
                    rank={item.expectedRank}
                    size="md"
                    showDetails={false}
                  />
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#070d18] text-[#94a3b8] border border-[#172e4d]">
                    {item.id}
                  </span>
                </div>

                <h3 className="font-semibold text-sm text-[#f1f5f9] group-hover:text-[#38bdf8] transition line-clamp-1 mb-1">
                  {item.name}
                </h3>

                <p className="text-[11px] text-[#64748b] flex items-center gap-1 mb-3">
                  <Compass className="w-3 h-3 text-[#38bdf8]/70" />
                  <span>{item.origin}</span>
                </p>

                <div className="p-2.5 rounded-lg bg-[#060c16] border border-[#142640] text-[11px] space-y-1">
                  <div className="font-semibold text-[#cbd5e1] flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#38bdf8]" />
                    <span>{meta.themeTitle}</span>
                  </div>
                  <p className="text-[10px] text-[#94a3b8] leading-normal">{meta.description}</p>
                </div>
              </div>

              <div className="pt-3 border-t border-[#142640] flex items-center justify-between text-[10px] font-mono text-[#64748b]">
                <span>Threshold: <strong className="text-slate-300">≥ {meta.minScore.toFixed(2)}</strong></span>
                <span className="text-[#38bdf8]">Test Value: {item.targetScore.toFixed(2)}</span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="p-6 rounded-2xl bg-[#09111e] border border-[#172e4d] space-y-4">
        <h3 className="font-cinzel text-sm font-bold text-[#e0f2fe] flex items-center gap-2">
          <Layers className="w-4 h-4 text-[#38bdf8]" />
          Full Rank Thematic Specifications Table
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-[#172e4d] text-[#64748b]">
                <th className="py-2.5 px-3">Rank & Badge</th>
                <th className="py-2.5 px-3">Min Score</th>
                <th className="py-2.5 px-3">Thematic Name</th>
                <th className="py-2.5 px-3">Visual FX Profile</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#12233b]">
              {GLOBAL_RANKS.map((r) => {
                const meta = RANK_THEMATIC_REGISTRY[r];
                return (
                  <tr key={r} className="hover:bg-[#0d1a2d] transition">
                    <td className="py-3 px-3">
                      <HazardBadge score={meta.minScore} rank={r} size="sm" />
                    </td>
                    <td className="py-3 px-3 text-[#38bdf8] font-bold">
                      ≥ {meta.minScore.toFixed(2)}
                    </td>
                    <td className="py-3 px-3 text-[#f1f5f9] font-sans font-medium">
                      {meta.themeTitle}
                    </td>
                    <td className="py-3 px-3 text-[#94a3b8] font-sans text-[11px]">
                      {meta.description}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const ScoreSandboxTesterView: FC = () => {
  const [testScore, setTestScore] = useState<number>(6.85);

  const calculatedRank = getRankFromScore(testScore);
  const meta = RANK_THEMATIC_REGISTRY[calculatedRank];

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="p-8 rounded-2xl bg-[#09111e] border border-[#1e3a5f] shadow-2xl space-y-6">
        <div className="flex items-center justify-between border-b border-[#172e4d] pb-4">
          <div className="flex items-center gap-2.5">
            <Sliders className="w-5 h-5 text-[#38bdf8]" />
            <h2 className="font-cinzel text-base font-bold text-white">
              Dynamic Hazard Score Sandbox
            </h2>
          </div>
          <span className="text-xs font-mono px-2.5 py-1 rounded bg-[#060c16] text-[#38bdf8] border border-[#172e4d]">
            Live Inspector Mode
          </span>
        </div>

        <div className="p-8 rounded-2xl bg-[#060c16] border border-[#142640] text-center space-y-4">
          <span className="text-[11px] font-mono text-[#64748b] uppercase tracking-wider block">
            Real-Time Rendered Component
          </span>

          <div className="flex justify-center">
            <HazardBadge
              score={testScore}
              size="lg"
              showDetails={true}
              className="shadow-2xl scale-125 my-3"
            />
          </div>

          <div className="pt-3 border-t border-[#142640] flex flex-wrap items-center justify-center gap-6 text-xs text-[#94a3b8]">
            <div>Active Rank: <strong className="text-white font-mono">{calculatedRank}</strong></div>
            <div>Score Value: <strong className="text-[#38bdf8] font-mono">{testScore.toFixed(2)}</strong></div>
            <div>Theme: <strong className="text-white">{meta.themeTitle}</strong></div>
          </div>
        </div>

        <div className="space-y-3 pt-2">
          <div className="flex justify-between text-xs font-mono">
            <span className="text-[#64748b]">Min Range: 1.00</span>
            <span className="text-[#38bdf8] font-bold text-sm">Score Slider: {testScore.toFixed(2)}</span>
            <span className="text-[#64748b]">Max Range: 9.00</span>
          </div>

          <input
            type="range"
            min="1.00"
            max="9.00"
            step="0.05"
            value={testScore}
            onChange={(e) => setTestScore(parseFloat(e.target.value))}
            className="w-full h-2 bg-[#060c16] rounded-lg appearance-none cursor-pointer accent-[#38bdf8] border border-[#172e4d]"
          />
        </div>

        <div className="space-y-2 pt-2">
          <span className="text-[10px] font-mono text-[#64748b] uppercase tracking-wider block">
            Quick Jump to Key Thresholds:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {[
              { label: '✦ Star (8.20)', val: 8.20 },
              { label: 'Ø Singularity (7.65)', val: 7.65 },
              { label: 'Ψ Tides (7.15)', val: 7.15 },
              { label: 'S₄ Apex (6.85)', val: 6.85 },
              { label: 'S₃ Molten (6.60)', val: 6.60 },
              { label: 'S₂ Resonant (6.35)', val: 6.35 },
              { label: 'S₁ Awakening (6.10)', val: 6.10 },
              { label: 'A+ Master (5.65)', val: 5.65 },
              { label: 'B Solid (4.20)', val: 4.20 },
              { label: 'C Base (3.00)', val: 3.00 },
              { label: 'D Penalty (2.10)', val: 2.10 },
            ].map((btn) => (
              <button
                key={btn.label}
                onClick={() => setTestScore(btn.val)}
                className="px-2.5 py-1 rounded bg-[#060c16] hover:bg-[#142640] border border-[#172e4d] text-[11px] font-mono text-[#cbd5e1] hover:text-[#38bdf8] transition"
              >
                {btn.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export function ArtifactCodex() {
  const setActiveApp = useGlobalStore((s) => s.setActiveApp);
  const [activeTab, setActiveTab] = useState<'matrix' | 'sandbox' | 'architecture'>('matrix');

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
          <div className="flex items-center gap-1.5 bg-[#0b1320] p-1.5 rounded-xl border border-[#1e3a5f] self-start sm:self-auto">
            <button
              onClick={() => setActiveTab('matrix')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-cinzel font-bold transition ${
                activeTab === 'matrix'
                  ? 'bg-gradient-to-r from-[#38bdf8] to-[#0284c7] text-black shadow-[0_0_12px_rgba(56,189,248,0.4)] border border-[#7dd3fc]'
                  : 'text-[#94a3b8] hover:text-white hover:bg-[#13233a]'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" /> Rank Matrix Gallery
            </button>
            <button
              onClick={() => setActiveTab('sandbox')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-cinzel font-bold transition ${
                activeTab === 'sandbox'
                  ? 'bg-gradient-to-r from-[#38bdf8] to-[#0284c7] text-black shadow-[0_0_12px_rgba(56,189,248,0.4)] border border-[#7dd3fc]'
                  : 'text-[#94a3b8] hover:text-white hover:bg-[#13233a]'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" /> Live Score Sandbox
            </button>
            <button
              onClick={() => setActiveTab('architecture')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-cinzel font-bold transition ${
                activeTab === 'architecture'
                  ? 'bg-gradient-to-r from-[#38bdf8] to-[#0284c7] text-black shadow-[0_0_12px_rgba(56,189,248,0.4)] border border-[#7dd3fc]'
                  : 'text-[#94a3b8] hover:text-white hover:bg-[#13233a]'
              }`}
            >
              <Shield className="w-3.5 h-3.5" /> Runic Architecture
            </button>
          </div>
        </div>

        {/* Hero Banner */}
        <header className="p-6 rounded-2xl bg-[#09111e] border border-[#172e4d] flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-lg">
          <div className="flex items-center gap-4">
            <div className="p-3.5 rounded-2xl bg-gradient-to-br from-[#0e243f] to-[#060c16] border border-[#1e3a5f] shadow-[0_0_12px_rgba(56,189,248,0.2)]">
              <BookOpen className="w-8 h-8 text-[#38bdf8]" />
            </div>
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h1 className="font-cinzel text-2xl md:text-3xl font-black text-[#e0f2fe]">
                  Artifact Codex
                </h1>
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-[#0e243f] text-[#38bdf8] border border-[#1e3a5f]">
                  原初典籍
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-sky-950 text-sky-400 border border-sky-800">
                  15-TIER MATRIX
                </span>
              </div>
              <p className="text-xs text-[#94a3b8] max-w-xl">
                Global Hazard Matrix & Thematic Rank Visualizer Sandbox — Procedural SVGs, Hawking Radiation, Unfrozen Tides & Solar Flares.
              </p>
            </div>
          </div>
        </header>

        {/* Tab Views */}
        {activeTab === 'matrix' && (
          <RankMatrixShowcaseView />
        )}

        {activeTab === 'sandbox' && (
          <ScoreSandboxTesterView />
        )}

        {activeTab === 'architecture' && (
          <div className="p-12 rounded-2xl bg-[#09111e] border border-[#172e4d] text-center space-y-4 max-w-2xl mx-auto shadow-lg">
            <Cpu className="w-12 h-12 text-[#38bdf8] mx-auto mb-2 opacity-80" />
            <h3 className="text-white font-cinzel font-bold text-lg">Dynamic Micro-Frontend Protocol</h3>
            <p className="text-xs text-[#94a3b8] max-w-md mx-auto leading-relaxed">
              Module tự kích hoạt và chia sẻ toàn bộ tài nguyên CSS/Rank Utility với toàn hệ thống Gate of Babylon và Universe 25.
            </p>
            <div className="p-4 rounded-xl bg-[#060c16] border border-[#142640] font-mono text-xs text-left space-y-2 text-[#cbd5e1]">
              <div>Component Export: <code className="text-[#38bdf8]">&lt;HazardBadge score=&#123;number&#125; /&gt;</code></div>
              <div>Procedural Underlays: <code className="text-[#38bdf8]">UnfrozenTides (Ψ), EventHorizon (Ø), TheStar (✦)</code></div>
              <div>CSS Keyframe Shaders: <code className="text-[#38bdf8]">10+ procedural animations in index.css</code></div>
              <div>Pagination Engine: <code className="text-emerald-400">&lt;Pagination /&gt; Danbooru-style</code></div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

export default ArtifactCodex;
