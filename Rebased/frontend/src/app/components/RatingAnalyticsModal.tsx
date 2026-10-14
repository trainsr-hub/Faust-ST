import React, { useEffect, useState, useMemo } from 'react';
import { useTriggerStore } from '../../store/useTriggerStore';
import { RatingLogger } from '../../utils/ratingLogger';
import { PromptRatingRecord, ComponentPerformanceStats, RatingScore } from '../../types/schema';
import {
  BarChart3,
  X,
  RefreshCw,
  Award,
  AlertTriangle,
  Lock,
  Unlock,
  CheckCircle2,
  Calendar,
  Layers,
  Search,
  Filter,
} from 'lucide-react';

interface RatingAnalyticsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RatingAnalyticsModal: React.FC<RatingAnalyticsModalProps> = ({ isOpen, onClose }) => {
  const { app, toggleGlobalOptionLock, globalLockedKeys } = useTriggerStore();
  const [records, setRecords] = useState<PromptRatingRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'booster' | 'culprit' | 'neutral'>('all');

  const loadData = async () => {
    if (!app) return;
    setIsLoading(true);
    const data = await RatingLogger.readAllRatings(app);
    setRecords(data);
    setIsLoading(false);
  };

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen, app]);

  const stats = useMemo(() => {
    return RatingLogger.computeComponentPerformance(records);
  }, [records]);

  const totalBatches = records.length;
  const overallAvg = useMemo(() => {
    if (records.length === 0) return 0;
    const sum = records.reduce((acc, r) => acc + r.rating, 0);
    return Math.round((sum / records.length) * 100) / 100;
  }, [records]);

  const scoreDist = useMemo(() => {
    const dist: Record<RatingScore, number> = { 3: 0, 4: 0, 5: 0, 6: 0, 7: 0 };
    for (const r of records) {
      if (dist[r.rating] !== undefined) {
        dist[r.rating]++;
      }
    }
    return dist;
  }, [records]);

  const filteredStats = useMemo(() => {
    return stats.filter((s) => {
      const matchesSearch =
        s.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.key.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.relPath.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = statusFilter === 'all' || s.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [stats, searchQuery, statusFilter]);

  const boosters = useMemo(() => stats.filter((s) => s.status === 'booster'), [stats]);
  const culprits = useMemo(() => stats.filter((s) => s.status === 'culprit'), [stats]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/85 backdrop-blur-xl animate-fadeIn">
      <div className="flex flex-col w-full max-w-6xl h-[88vh] bg-hazard-card border-2 border-hazard-gold/60 rounded-3xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 p-5 border-b border-hazard-border bg-hazard-void shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-hazard-gold/10 border border-hazard-gold/30 text-hazard-gold">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold uppercase tracking-wider text-hazard-textBright">
                  Prompt Batch Telemetry & Component Ratings
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-hazard-gold/20 border border-hazard-gold/40 text-hazard-gold text-[10px] font-mono font-bold">
                  {totalBatches} Batches Evaluated
                </span>
              </div>
              <p className="text-xs text-hazard-textMuted font-mono mt-0.5">
                Parsed from <code className="text-hazard-cyan">Hazard_Trigger_Data/ratings.jsonl</code>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={loadData}
              title="Refresh Ratings from Disk"
              className="p-2 text-hazard-textMuted hover:text-hazard-gold bg-hazard-card border border-hazard-border rounded-xl transition hover:border-hazard-gold/50"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-hazard-gold' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-hazard-textMuted hover:text-white bg-hazard-card border border-hazard-border rounded-xl hover:border-hazard-gold/50 transition"
              title="Close (ESC)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Top Summary KPI Cards */}
        <div className="p-6 bg-hazard-void/60 border-b border-hazard-border/80 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 shrink-0">
          {/* Mean Rating */}
          <div className="p-4 rounded-2xl bg-hazard-card/80 border border-hazard-border flex flex-col gap-1">
            <span className="text-[11px] font-mono text-hazard-textMuted uppercase tracking-wider">
              Overall Average Score
            </span>
            <div className="flex items-baseline gap-2">
              <strong className="text-2xl font-bold text-hazard-gold">
                {overallAvg.toFixed(2)}
              </strong>
              <span className="text-xs text-hazard-textMuted font-mono">/ 7.00</span>
            </div>
          </div>

          {/* Boosters Count */}
          <div className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 flex flex-col gap-1">
            <span className="text-[11px] font-mono text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5" />
              <span>Booster Components</span>
            </span>
            <strong className="text-2xl font-bold text-emerald-300">
              {boosters.length}
            </strong>
            <span className="text-[10px] text-emerald-400/70 font-mono">Avg Score ≥ 5.80</span>
          </div>

          {/* Culprits Count */}
          <div className="p-4 rounded-2xl bg-rose-950/20 border border-rose-500/30 flex flex-col gap-1">
            <span className="text-[11px] font-mono text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Bad Influence Culprits</span>
            </span>
            <strong className="text-2xl font-bold text-rose-300">
              {culprits.length}
            </strong>
            <span className="text-[10px] text-rose-400/70 font-mono">Avg Score &lt; 4.80 (Candidates for Lock)</span>
          </div>

          {/* Score Distribution */}
          <div className="p-3.5 rounded-2xl bg-hazard-card/80 border border-hazard-border flex flex-col justify-between gap-1 text-[10px] font-mono">
            <span className="text-hazard-textMuted uppercase tracking-wider">Score Breakdown</span>
            <div className="flex items-center gap-1.5 justify-between">
              {([7, 6, 5, 4, 3] as RatingScore[]).map((score) => {
                const count = scoreDist[score] || 0;
                const pct = totalBatches > 0 ? Math.round((count / totalBatches) * 100) : 0;
                return (
                  <div key={score} className="flex flex-col items-center">
                    <span className="font-bold text-hazard-textBright">{score}★</span>
                    <span className="text-hazard-gold">{count}</span>
                    <span className="text-[9px] text-hazard-textMuted">{pct}%</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Filter Toolbar */}
        <div className="p-4 px-6 bg-hazard-card/40 border-b border-hazard-border flex flex-wrap items-center justify-between gap-4 shrink-0">
          <div className="relative flex-1 min-w-[240px]">
            <Search className="w-4 h-4 text-hazard-textMuted absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search components by name or folder..."
              className="w-full pl-10 pr-4 py-1.5 bg-hazard-void border border-hazard-border focus:border-hazard-gold focus:outline-none rounded-xl text-xs text-hazard-textBright placeholder:text-hazard-textMuted/40 transition"
            />
          </div>

          <div className="flex items-center gap-1.5 text-xs">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1.5 rounded-xl font-bold transition ${
                statusFilter === 'all'
                  ? 'bg-hazard-gold text-black'
                  : 'bg-hazard-void border border-hazard-border text-hazard-textMuted hover:text-white'
              }`}
            >
              All ({stats.length})
            </button>
            <button
              onClick={() => setStatusFilter('booster')}
              className={`px-3 py-1.5 rounded-xl font-bold transition flex items-center gap-1 ${
                statusFilter === 'booster'
                  ? 'bg-emerald-500 text-black'
                  : 'bg-hazard-void border border-emerald-500/40 text-emerald-400 hover:bg-emerald-950/40'
              }`}
            >
              <Award className="w-3.5 h-3.5" />
              <span>Boosters ({boosters.length})</span>
            </button>
            <button
              onClick={() => setStatusFilter('culprit')}
              className={`px-3 py-1.5 rounded-xl font-bold transition flex items-center gap-1 ${
                statusFilter === 'culprit'
                  ? 'bg-rose-600 text-white'
                  : 'bg-hazard-void border border-rose-500/40 text-rose-400 hover:bg-rose-950/40'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Culprits ({culprits.length})</span>
            </button>
          </div>
        </div>

        {/* Table Body */}
        <div className="flex-1 p-6 overflow-y-auto">
          {totalBatches === 0 ? (
            <div className="p-16 text-center border border-dashed border-hazard-border rounded-3xl bg-hazard-card/20 flex flex-col items-center justify-center gap-3">
              <BarChart3 className="w-10 h-10 text-hazard-textMuted/40" />
              <p className="text-sm text-hazard-textBright font-bold">No prompt ratings logged yet.</p>
              <p className="text-xs text-hazard-textMuted max-w-sm">
                Score your prompt generations (3, 4, 5, 6, 7) directly from the studio bottom bar to generate performance analytics.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="border-b border-hazard-border text-hazard-textMuted uppercase tracking-wider text-[10px]">
                    <th className="pb-3 pl-2">Component Name</th>
                    <th className="pb-3">Folder Path</th>
                    <th className="pb-3 text-center">Total Rolls</th>
                    <th className="pb-3 text-center">Avg Score</th>
                    <th className="pb-3 text-center">Score Dist (3-7)</th>
                    <th className="pb-3 text-center">Win Rate</th>
                    <th className="pb-3 text-center">Impact Status</th>
                    <th className="pb-3 pr-2 text-right">Quick Lock Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-hazard-border/50">
                  {filteredStats.map((item) => {
                    const isLocked = Boolean(
                      globalLockedKeys[`${item.relPath}:${item.key}`] ||
                      globalLockedKeys[item.key]
                    );

                    return (
                      <tr
                        key={`${item.relPath}::${item.key}`}
                        className="hover:bg-hazard-cardHover/60 transition-colors"
                      >
                        {/* Name */}
                        <td className="py-3 pl-2 font-bold text-hazard-textBright">
                          {item.displayName}
                        </td>

                        {/* Folder */}
                        <td className="py-3 text-hazard-textMuted text-[11px]">
                          {item.relPath.split('/')[0]}
                        </td>

                        {/* Rolls */}
                        <td className="py-3 text-center text-hazard-textBright font-bold">
                          {item.totalRolls}
                        </td>

                        {/* Avg Score */}
                        <td className="py-3 text-center">
                          <span
                            className={`px-2 py-0.5 rounded-md font-bold ${
                              item.avgRating >= 5.8
                                ? 'bg-emerald-950/80 border border-emerald-500/50 text-emerald-400'
                                : item.avgRating < 4.8
                                ? 'bg-rose-950/80 border border-rose-500/50 text-rose-400'
                                : 'bg-hazard-void border border-hazard-border text-hazard-gold'
                            }`}
                          >
                            {item.avgRating.toFixed(2)}★
                          </span>
                        </td>

                        {/* Score Dist */}
                        <td className="py-3 text-center text-[10px] text-hazard-textMuted">
                          <span className="text-rose-400">{item.ratingsCount[3]}</span>/
                          <span className="text-orange-400">{item.ratingsCount[4]}</span>/
                          <span className="text-yellow-400">{item.ratingsCount[5]}</span>/
                          <span className="text-emerald-400">{item.ratingsCount[6]}</span>/
                          <span className="text-hazard-gold font-bold">{item.ratingsCount[7]}</span>
                        </td>

                        {/* Win Rate */}
                        <td className="py-3 text-center font-bold text-hazard-cyan">
                          {item.winRate}%
                        </td>

                        {/* Status */}
                        <td className="py-3 text-center">
                          {item.status === 'booster' ? (
                            <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[9px] font-bold">
                              🟢 Booster
                            </span>
                          ) : item.status === 'culprit' ? (
                            <span className="px-2 py-0.5 rounded-full bg-rose-600/20 text-rose-300 border border-rose-600/40 text-[9px] font-bold">
                              🔴 Culprit (Risk)
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full bg-hazard-void text-hazard-textMuted border border-hazard-border text-[9px]">
                              ⚪ Stable
                            </span>
                          )}
                        </td>

                        {/* Lock Button */}
                        <td className="py-3 pr-2 text-right">
                          <button
                            onClick={() => toggleGlobalOptionLock(item.relPath, item.key)}
                            title={
                              isLocked
                                ? 'Unlock option for general gacha'
                                : 'Lock option out of general gacha draws'
                            }
                            className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition flex items-center gap-1 ml-auto active:scale-95 ${
                              isLocked
                                ? 'bg-amber-500/20 text-amber-300 border border-amber-400/50 hover:bg-amber-500 hover:text-black'
                                : 'bg-hazard-void text-hazard-textMuted border border-hazard-border hover:text-white hover:border-amber-400/40'
                            }`}
                          >
                            {isLocked ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
                            <span>{isLocked ? 'Locked' : 'Lock'}</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 border-t border-hazard-border bg-hazard-void text-xs text-hazard-textMuted font-mono shrink-0">
          <span>
            Telemetry Engine: Continuous batch scoring informs gacha optimization.
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-hazard-card hover:bg-hazard-cardHover text-hazard-textBright border border-hazard-border rounded-xl transition"
          >
            Close (ESC)
          </button>
        </div>
      </div>
    </div>
  );
};
