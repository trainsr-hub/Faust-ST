// =============================================================================
// [VINYL ANGEL GALLERY COMPONENT WITH INSTANT 16-CARD PAGINATION]
// =============================================================================
import { useState, useEffect, useMemo, type MouseEvent, type FC } from 'react';
import {
  fetchEligibleTier4List,
  resolvePageMetadataOnDemand
} from '../services/engine';
import { formatDuration } from '../../../utils/time';
import { GLOBAL_RANKS } from '../../../utils/rank';
import { HazardBadge } from '../../../components/HazardBadge';
import { Pagination } from '../../../components/Pagination';
import type { VinylDisplayCard } from '../types';
import {
  Search,
  SlidersHorizontal,
  ArrowDown10,
  ArrowUp01,
  ArrowUpDown,
  Compass,
  Crown,
  Copy,
  Check,
  X,
  Clock,
  RefreshCw,
  Sparkles
} from 'lucide-react';

const PAGE_SIZE = 16;

export const VinylGallery: FC<{ projectId?: string }> = ({ projectId = 'music_app' }) => {
  const targetProjectId = !projectId || projectId === 'vinyl_angel' ? 'music_app' : projectId;

  const [allEligibleItems, setAllEligibleItems] = useState<VinylDisplayCard[]>([]);
  const [currentPageItems, setCurrentPageItems] = useState<VinylDisplayCard[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters & Sorting
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRank, setSelectedRank] = useState('ALL');
  const [hazardSort, setHazardSort] = useState<'desc' | 'asc' | 'none'>('desc');

  // Pagination State
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Inspection Modal & Clipboard
  const [inspectItem, setInspectItem] = useState<VinylDisplayCard | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const loadIndexList = async (forceRefresh = false) => {
    setLoading(true);
    try {
      const data = await fetchEligibleTier4List(targetProjectId, forceRefresh);
      setAllEligibleItems(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadIndexList(false);
  }, [targetProjectId]);

  const filteredItems = useMemo(() => {
    const res = allEligibleItems.filter((item) => {
      const matchQuery =
        item.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.timeblock && item.timeblock.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchRank = selectedRank === 'ALL' || item.rankCategory === selectedRank;
      return matchQuery && matchRank;
    });

    if (hazardSort === 'desc') return [...res].sort((a, b) => b.hazard_level - a.hazard_level);
    if (hazardSort === 'asc') return [...res].sort((a, b) => a.hazard_level - b.hazard_level);
    return res;
  }, [allEligibleItems, searchQuery, selectedRank, hazardSort]);

  const totalPages = Math.ceil(filteredItems.length / PAGE_SIZE) || 1;

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedRank, hazardSort]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [totalPages, currentPage]);

  useEffect(() => {
    let isCancelled = false;

    const resolveCurrentPageTracks = async () => {
      if (filteredItems.length === 0) {
        setCurrentPageItems([]);
        return;
      }

      const startIndex = (currentPage - 1) * PAGE_SIZE;
      const targetSlice = filteredItems.slice(startIndex, startIndex + PAGE_SIZE);

      // Render placeholder first so cards appear instantly
      setCurrentPageItems(targetSlice);

      try {
        const enrichedTracks = await resolvePageMetadataOnDemand(targetProjectId, targetSlice);
        if (!isCancelled) {
          setCurrentPageItems(enrichedTracks);
        }
      } catch (e) {
        console.error('Lỗi nạp metadata cho trang:', e);
      }
    };

    resolveCurrentPageTracks();

    return () => {
      isCancelled = true;
    };
  }, [filteredItems, currentPage, targetProjectId]);

  const toggleSort = () => {
    setHazardSort((prev) => (prev === 'desc' ? 'asc' : prev === 'asc' ? 'none' : 'desc'));
  };

  const copyId = (id: string, e: MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Search, Filter & Sort Bar */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 p-4 rounded-xl bg-[#100d16] border border-[#261d33] shadow-lg">
        <div className="relative flex-1 flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8c7a9e]" />
            <input
              type="text"
              placeholder="Search by Track ID, Arc..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#171320] border border-[#332842] focus:border-[#d4af37] rounded-lg pl-10 pr-4 py-2.5 text-xs md:text-sm text-white focus:outline-none transition placeholder-[#685c78]"
            />
          </div>

          <button
            type="button"
            onClick={() => loadIndexList(true)}
            disabled={loading}
            title="Đồng bộ lại từ Backend DB"
            className="p-2.5 rounded-lg bg-[#171320] hover:bg-[#251d33] border border-[#332842] hover:border-[#d4af37] text-[#8c7a9e] hover:text-[#ffd86b] transition active:scale-95 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-[#ffd86b]' : ''}`} />
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={toggleSort}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-mono font-bold transition border ${
              hazardSort === 'desc'
                ? 'bg-[#2d2208] text-[#ffd86b] border-[#d4af37] shadow-gold-sm'
                : hazardSort === 'asc'
                ? 'bg-[#0f291e] text-[#4ade80] border-[#166534]'
                : 'bg-[#171320] text-[#8c7a9e] border-[#2b2238] hover:text-white'
            }`}
          >
            {hazardSort === 'desc' && <ArrowDown10 className="w-4 h-4 text-[#ffd86b]" />}
            {hazardSort === 'asc' && <ArrowUp01 className="w-4 h-4 text-[#4ade80]" />}
            {hazardSort === 'none' && <ArrowUpDown className="w-4 h-4 text-[#8c7a9e]" />}
            <span>Hazard: {hazardSort === 'desc' ? 'High ➔ Low' : hazardSort === 'asc' ? 'Low ➔ High' : 'Default'}</span>
          </button>

          <div className="flex items-center gap-1 overflow-x-auto max-w-full pb-1 lg:pb-0 scrollbar-thin">
            <SlidersHorizontal className="w-3.5 h-3.5 text-[#d4af37] mr-1 hidden sm:inline flex-shrink-0" />
            <button
              key="ALL"
              onClick={() => setSelectedRank('ALL')}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-mono font-bold transition flex-shrink-0 ${
                selectedRank === 'ALL'
                  ? 'bg-[#d4af37] text-black shadow-gold-sm'
                  : 'bg-[#171320] text-[#8c7a9e] hover:text-white border border-[#2b2238]'
              }`}
            >
              ALL
            </button>
            {GLOBAL_RANKS.map((rank) => (
              <button
                key={rank}
                onClick={() => setSelectedRank(rank)}
                className={`px-2 py-1 rounded-lg text-xs font-mono font-bold transition flex-shrink-0 ${
                  selectedRank === rank
                    ? 'bg-[#d4af37] text-black shadow-gold-sm'
                    : 'bg-[#171320] text-[#8c7a9e] hover:text-white border border-[#2b2238]'
                }`}
              >
                {rank}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Gallery Cards View */}
      {loading && allEligibleItems.length === 0 ? (
        <div className="py-20 text-center text-[#ffd86b] font-cinzel flex flex-col items-center gap-3">
          <Sparkles className="w-8 h-8 animate-spin text-[#ffd86b]" />
          <span>Opening the Vault of Heroes...</span>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="py-16 text-center text-[#8c7a9e] p-8 rounded-2xl bg-[#120f18] border border-[#2b2238]">
          <p className="font-cinzel text-sm text-[#ffd86b]">No Qualified Relics Found</p>
          <p className="text-xs mt-1">Không có bài hát nào có điểm Hazard &gt; 3.0 thỏa mãn bộ lọc.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 relative">
          {currentPageItems.map((item) => (
            <div
              key={item.id}
              onClick={() => setInspectItem(item)}
              className="group relative bg-[#120f18] hover:bg-[#181422] rounded-xl golden-border-glow cursor-pointer flex flex-col justify-between overflow-hidden transition-all duration-300 shadow-md"
            >
              {/* Thumbnail Container 16:9 */}
              <div className="relative w-full aspect-video bg-[#0a080e] overflow-hidden border-b border-[#231b2e]">
                <img
                  src={`https://img.youtube.com/vi/${item.id}/mqdefault.jpg`}
                  alt={item.title}
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-500 opacity-90 group-hover:opacity-100"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#120f18] via-transparent to-black/60" />

                {/* Top Badge: Reusable HazardBadge & Copy Button */}
                <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between gap-1.5">
                  <HazardBadge
                    score={item.hazard_level}
                    rank={item.rankCategory}
                    size="md"
                  />

                  <button
                    onClick={(e) => copyId(item.id, e)}
                    title="Copy Video ID"
                    className="p-1 rounded bg-black/60 hover:bg-black/90 text-[#8c7a9e] hover:text-[#ffd86b] border border-white/10 backdrop-blur-sm transition"
                  >
                    {copiedId === item.id ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  </button>
                </div>

                {/* Bottom Overlay: Duration */}
                <div className="absolute bottom-2 right-2.5">
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-black/80 text-[#9c93a8] border border-white/10 flex items-center gap-1 backdrop-blur-sm">
                    <Clock className="w-2.5 h-2.5 text-[#8c7a9e]" />
                    {formatDuration(item.duration)}
                  </span>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-3.5 flex flex-col justify-between flex-1 space-y-2">
                <div>
                  <h3 className="font-semibold text-xs md:text-sm text-[#f5f0e8] group-hover:text-[#ffd86b] transition line-clamp-2 leading-snug mb-1.5">
                    {item.title}
                  </h3>

                  <p className="text-[11px] text-[#8c7a9e] truncate flex items-center gap-1">
                    <Compass className="w-3 h-3 text-[#524124] flex-shrink-0" />
                    <span className="truncate">{item.channel || 'Loading...'}</span>
                  </p>
                </div>

                {/* Footer: Timeblock & #Index */}
                <div className="pt-2 border-t border-[#1b1624] flex items-center justify-between text-[10px]">
                  {item.timeblock ? (
                    <span className="text-[10px] text-[#8c7a9e] bg-[#171320] px-2 py-0.5 rounded border border-[#2b2238] truncate max-w-[170px]" title={item.timeblock}>
                      {item.timeblock}
                    </span>
                  ) : (
                    <span className="text-[10px] text-[#554d61] italic">Unassigned Arc</span>
                  )}

                  <span className="font-mono text-xs font-bold text-[#685c78] group-hover:text-[#ffd86b] transition">
                    #{item.dbIndex}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Danbooru Pagination */}
      {filteredItems.length > PAGE_SIZE && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={filteredItems.length}
          pageSize={PAGE_SIZE}
          onPageChange={(p) => {
            setCurrentPage(p);
            window.scrollTo({ top: 120, behavior: 'smooth' });
          }}
        />
      )}

      {/* Inspection Modal */}
      {inspectItem && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#120f18] border border-[#d4af37] w-full max-w-xl rounded-2xl shadow-portal overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
            <div className="p-5 border-b border-[#292033] flex items-center justify-between bg-[#181422]">
              <div className="flex items-center gap-2.5">
                <Crown className="w-5 h-5 text-[#ffd86b]" />
                <h3 className="font-cinzel font-bold text-sm text-[#ffd86b]">Track Inspector (#{inspectItem.dbIndex})</h3>
              </div>
              <button onClick={() => setInspectItem(null)} className="p-1 text-[#8c7a9e] hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4 text-sm">
              <div>
                <span className="text-[10px] font-mono text-[#8c7a9e] uppercase block mb-1">Track Name</span>
                <p className="font-semibold text-[#f5f0e8] text-base">{inspectItem.title}</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-[#171320] border border-[#2b2238] rounded-xl flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-mono text-[#8c7a9e] uppercase block mb-1">Rank & Hazard Level</span>
                    <HazardBadge
                      score={inspectItem.hazard_level}
                      rank={inspectItem.rankCategory}
                      size="lg"
                      showDetails={true}
                    />
                  </div>
                </div>
                <div className="p-3 bg-[#171320] border border-[#2b2238] rounded-xl">
                  <span className="text-[10px] font-mono text-[#8c7a9e] uppercase block">Duration</span>
                  <p className="font-mono font-semibold text-[#ffd86b] text-base mt-1">{formatDuration(inspectItem.duration)}</p>
                </div>
              </div>

              <div className="p-3 bg-[#171320] border border-[#2b2238] rounded-xl">
                <span className="text-[10px] font-mono text-[#8c7a9e] uppercase block">Dominant Arc</span>
                <p className="text-xs font-semibold text-[#8c7a9e] mt-0.5">{inspectItem.timeblock || 'Unassigned'}</p>
              </div>

              <div className="relative w-full pb-[56.25%] h-0 rounded-xl overflow-hidden border border-[#2b2238]">
                <iframe
                  className="absolute top-0 left-0 w-full h-full"
                  src={`https://www.youtube.com/embed/${inspectItem.id}?autoplay=0&rel=0`}
                  title={inspectItem.title}
                  allowFullScreen
                />
              </div>
            </div>
            <div className="p-4 border-t border-[#292033] bg-[#0d0a12] flex justify-end">
              <button onClick={() => setInspectItem(null)} className="px-4 py-2 bg-[#1a1424] hover:bg-[#251d33] text-xs font-cinzel rounded-lg transition">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VinylGallery;
