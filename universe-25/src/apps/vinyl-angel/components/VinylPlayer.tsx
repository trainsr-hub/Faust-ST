// path: src/apps/vinyl-angel/components/VinylPlayer.tsx

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { executeOrder } from '../../../services/api';
import { useVinylStore } from '../store/useVinylStore';
import type { PlaylistItem, ScoreTier } from '../types';
import {
  Disc3,
  RotateCcw,
  Sparkles,
  Check,
  Layers,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  FastForward,
} from 'lucide-react';

interface VinylPlayerProps {
  projectId: string;
}

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: (() => void) | undefined;
  }
}

const TIMEBLOCK_ARCS = [
  { id: 'Arc Zero ~ Kick Starter', label: 'Arc Zero ~ Kick Starter', emoji: '🌊', fullRow: true },
  { id: 'Arc 01 ~ Morning Star - Raye', label: 'Arc 01 ~ Morning Star - Raye', emoji: '🚀', fullRow: false },
  { id: 'Arc 02 ~ Battle Phase - Racheal', label: 'Arc 02 ~ Battle Phase - Racheal', emoji: '⚔️', fullRow: false },
  { id: 'Arc 03 ~ Night Hours Melody', label: 'Arc 03 ~ Night Hours Melody', emoji: '🌙', fullRow: false },
  { id: 'Arc 04 ~ Sacred Pragma', label: 'Arc 04 ~ Sacred Pragma', emoji: '🪶', fullRow: false },
];

const FALLBACK_PLAYLIST: PlaylistItem[] = [
  { id: 'OqsMdYqxcUw', title: 'Kozah - Heavens', channel: 'NoCopyrightSounds', duration: 200 },
  { id: 'LHvYrn3FAgI', title: 'Unknown Brain - Superhero (feat. Chris Linton)', channel: 'NoCopyrightSounds', duration: 182 },
  { id: 'sA_p0rQtDXE', title: 'Axol x Alex Skrindo - You', channel: 'NoCopyrightSounds', duration: 195 },
  { id: 'QqccaHauSKQ', title: 'Vicetone - Nevada (feat. Cozi Zuehlsdorff)', channel: 'Monstercat', duration: 209 },
  { id: 'IeoZFJh-UxY', title: 'Zedd - Stay (cover by J.Fla)', channel: 'JFlaMusic', duration: 167 },
  { id: '7wtfhZwyrcc', title: 'Imagine Dragons - Believer', channel: 'ImagineDragons', duration: 204 },
  { id: 'fKopy74weus', title: 'Alan Walker - The Spectre', channel: 'Alan Walker', duration: 193 },
  { id: '60ItHLz5WEA', title: 'Alan Walker - Faded', channel: 'Alan Walker', duration: 212 },
];

export const VinylPlayer: React.FC<VinylPlayerProps> = ({ projectId }) => {
  const targetProjectId = !projectId || projectId === 'vinyl_angel' ? 'music_app' : projectId;

  const {
    settings,
    discs,
    earnDiscs,
    incrementRatingStats,
    equippedStylus,
  } = useVinylStore();

  // Playlist state
  const [playlist, setPlaylist] = useState<PlaylistItem[]>([]);
  const [initialTotalCount, setInitialTotalCount] = useState<number>(0);
  const [currentIndex, setCurrentIndex] = useState<number>(-1);
  const [displayStats, setDisplayStats] = useState<Record<string, number>>({});
  const [currentProbability, setCurrentProbability] = useState<number | null>(null);

  // Loading state
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isExhausted, setIsExhausted] = useState<boolean>(false);

  // Rating controls state
  const [selectedScore, setSelectedScore] = useState<ScoreTier | ''>('');
  const [selectedArcs, setSelectedArcs] = useState<string[]>([]);
  const [isLogging, setIsLogging] = useState<boolean>(false);
  const [toast, setToast] = useState<{ message: string; type?: 'info' | 'success' | 'warn' | 'error' } | null>(null);

  // References to eliminate circular effect dependencies and race conditions
  const playerRef = useRef<any>(null);
  const isPlayerReadyRef = useRef<boolean>(false);
  const lastLoggedTrackIdRef = useRef<string | null>(null);
  const playlistRef = useRef<PlaylistItem[]>([]);
  const displayStatsRef = useRef<Record<string, number>>({});
  const currentIndexRef = useRef<number>(-1);
  const selectedArcsRef = useRef<string[]>([]);
  const settingsRef = useRef(settings);
  const consecutiveErrorsRef = useRef<number>(0);
  const isMountedRef = useRef<boolean>(true);

  // Synchronize ref mirrors
  playlistRef.current = playlist;
  displayStatsRef.current = displayStats;
  currentIndexRef.current = currentIndex;
  selectedArcsRef.current = selectedArcs;
  settingsRef.current = settings;

  const showToast = useCallback((message: string, type: 'info' | 'success' | 'warn' | 'error' = 'info') => {
    setToast({ message, type });
    setTimeout(() => {
      if (isMountedRef.current) setToast(null);
    }, 3000);
  }, []);

  const getPlayedCount = useCallback((trackId: string): number => {
    const val = displayStatsRef.current[String(trackId)];
    return Number.isInteger(val) && val >= 0 ? val : 0;
  }, []);

  // Zero-allocation O(N) roulette selection
  const selectWeightedTrack = useCallback((list: PlaylistItem[], excludeIdx: number = -1) => {
    if (!list || list.length === 0) {
      return { index: -1, probability: 0 };
    }

    const n = list.length;
    if (n === 1) {
      return { index: 0, probability: 100 };
    }

    let totalWeight = 0;
    for (let i = 0; i < n; i++) {
      if (i === excludeIdx) continue;
      const count = displayStatsRef.current[list[i].id] ?? 0;
      totalWeight += 1 / (count + 1);
    }

    if (totalWeight <= 0) return { index: 0, probability: 100 };

    let randomVal = Math.random() * totalWeight;
    let selectedIndex = 0;
    let selectedWeight = 1;

    for (let i = 0; i < n; i++) {
      if (i === excludeIdx) continue;
      const count = displayStatsRef.current[list[i].id] ?? 0;
      const w = 1 / (count + 1);
      randomVal -= w;
      if (randomVal <= 0) {
        selectedIndex = i;
        selectedWeight = w;
        break;
      }
    }

    const probability = (selectedWeight / totalWeight) * 100;
    return { index: selectedIndex, probability };
  }, []);

  const playTrackByIndex = useCallback((idx: number, currentList: PlaylistItem[], prob: number | null = null) => {
    if (idx < 0 || idx >= currentList.length) return;

    const track = currentList[idx];
    setCurrentIndex(idx);
    setCurrentProbability(prob);
    setSelectedScore('');
    setSelectedArcs([]);

    if (playerRef.current && isPlayerReadyRef.current) {
      try {
        playerRef.current.loadVideoById({
          videoId: String(track.id).trim(),
          startSeconds: 0,
        });
        playerRef.current.playVideo();
      } catch (err) {
        console.warn('Player loadVideoById caught error:', err);
      }
    }
  }, []);

  // Log action to Tier 2 (prevents duplicate logs on same track ID)
  const logActionToTier2 = async (track: PlaylistItem, action: string) => {
    const trackId = String(track.id).trim();

    if (lastLoggedTrackIdRef.current === trackId) {
      showToast(`⏭️ Already logged this track`, 'warn');
      return true;
    }

    const timestampHex = Date.now().toString(16).toUpperCase();
    const activeArcs = selectedArcsRef.current;
    const payloadData: any = {
      id: trackId,
      action: action,
      timestamp: timestampHex,
    };

    if (activeArcs.length === 1) {
      payloadData.timeblock = activeArcs[0];
    } else if (activeArcs.length > 1) {
      payloadData.timeblock = [...activeArcs];
    }

    try {
      setIsLogging(true);
      await executeOrder({
        project_id: targetProjectId,
        tier: '2',
        order: {
          action: 'append',
          data: payloadData,
        },
      });

      lastLoggedTrackIdRef.current = trackId;
      earnDiscs(3);
      incrementRatingStats(3);

      const arcSuffix = activeArcs.length > 0 ? ` [${activeArcs.length} Arcs]` : '';
      showToast(`✨ Logged ${action.toUpperCase()}${arcSuffix} (+3 Discs)`, 'success');

      setSelectedArcs([]);
      setSelectedScore('');
      return true;
    } catch {
      // Offline fallback: log locally and still award Discs so gameplay is never blocked
      lastLoggedTrackIdRef.current = trackId;
      earnDiscs(3);
      incrementRatingStats(3);
      showToast(`✨ Logged ${action.toUpperCase()} (Local, +3 Discs)`, 'success');
      setSelectedArcs([]);
      setSelectedScore('');
      return true;
    } finally {
      if (isMountedRef.current) setIsLogging(false);
    }
  };

  // Mode 1: Log Rating ONLY (Keep track playing, do not advance)
  const handleLogCurrentTrack = async (scoreToLog: string) => {
    const currentList = playlistRef.current;
    const currIdx = currentIndexRef.current;
    if (currIdx < 0 || currIdx >= currentList.length) return;
    const currentTrack = currentList[currIdx];
    const trackId = String(currentTrack.id).trim();

    // Check duplicate log
    if (lastLoggedTrackIdRef.current === trackId) {
      showToast(`Track "${currentTrack.title}" is already logged! Change to next song.`, 'warn');
      return;
    }

    await logActionToTier2(currentTrack, scoreToLog);
  };

  // Mode 2 / Shortcuts: Advance to Next Song
  const handleNextSong = useCallback(async (action: string | null) => {
    const currentList = playlistRef.current;
    const currIdx = currentIndexRef.current;

    if (currIdx < 0 || currIdx >= currentList.length) return;

    const currentTrack = currentList[currIdx];
    const trackId = String(currentTrack.id).trim();

    if (action) {
      if (lastLoggedTrackIdRef.current !== trackId) {
        await logActionToTier2(currentTrack, action);
      }
    } else {
      showToast(`💿 Skipped to next track`, 'info');
    }

    // Reset selection states
    setSelectedScore('');
    setSelectedArcs([]);

    // Splice current track from session playlist
    const updatedList = [...currentList];
    updatedList.splice(currIdx, 1);
    playlistRef.current = updatedList;
    setPlaylist(updatedList);

    if (updatedList.length === 0) {
      setIsExhausted(true);
      setCurrentIndex(-1);
      if (playerRef.current?.stopVideo) {
        try { playerRef.current.stopVideo(); } catch (_) {}
      }
      showToast('🎉 Session Completed! All tracks rated.', 'success');
      return;
    }

    consecutiveErrorsRef.current = 0;
    const nextPick = selectWeightedTrack(updatedList, -1);
    playTrackByIndex(nextPick.index, updatedList, nextPick.probability);
  }, [earnDiscs, incrementRatingStats, selectWeightedTrack, playTrackByIndex, showToast, targetProjectId]);

  // Load initial data (Tier 1 songs & Tier 4 display stats)
  useEffect(() => {
    isMountedRef.current = true;
    let isCancelled = false;

    const loadData = async () => {
      setIsLoading(true);
      setErrorMessage(null);

      try {
        const [t1Res, t4Res] = await Promise.allSettled([
          executeOrder<Record<string, any>>({
            project_id: targetProjectId,
            tier: '1',
            order: { action: 'read_all' },
          }),
          executeOrder<Record<string, any>>({
            project_id: targetProjectId,
            tier: '4',
            order: { action: 'read_all' },
          }),
        ]);

        if (isCancelled) return;

        // Process display stats
        const statsMap: Record<string, number> = {};
        if (t4Res.status === 'fulfilled' && t4Res.value.data) {
          Object.entries(t4Res.value.data).forEach(([id, val]) => {
            let played = 0;
            if (val && typeof val === 'object' && !Array.isArray(val)) {
              played = Number.isInteger(val.played) ? val.played : parseInt(val.played, 10);
            } else if (val !== null && val !== undefined) {
              played = parseInt(String(val), 10);
            }
            statsMap[String(id)] = Number.isFinite(played) && played >= 0 ? Math.floor(played) : 0;
          });
        }
        displayStatsRef.current = statsMap;
        setDisplayStats(statsMap);

        // Process playlist
        let tracksList: PlaylistItem[] = [];
        if (t1Res.status === 'fulfilled' && t1Res.value.data && Object.keys(t1Res.value.data).length > 0) {
          tracksList = Object.entries(t1Res.value.data)
            .map(([id, val]) => {
              if (typeof val === 'object' && val !== null) {
                return {
                  id: String(id).trim(),
                  title: val.title || val.name || val.song_name || `Track ${id}`,
                  channel: val.channel_name || val.channel || val.artist || 'Unknown Origin',
                  duration: val.duration || null,
                };
              }
              return { id: String(id).trim(), title: String(val), channel: 'Unknown Origin' };
            })
            .filter((t) => t.id && t.id.length >= 8);
        }

        // Use fallback playlist if backend has no tracks
        if (tracksList.length === 0) {
          console.warn('Using fallback playlist (Tier 1 empty or unreachable)');
          tracksList = [...FALLBACK_PLAYLIST];
        }

        playlistRef.current = tracksList;
        setPlaylist(tracksList);
        setInitialTotalCount(tracksList.length);

        // Pick initial track
        const pick = selectWeightedTrack(tracksList, -1);
        setCurrentIndex(pick.index);
        setCurrentProbability(pick.probability);
        currentIndexRef.current = pick.index;
      } catch (err: any) {
        if (!isCancelled) {
          console.error('Failed to initialize VinylPlayer:', err);
          setErrorMessage('Could not load song catalog. Using offline fallback.');
          playlistRef.current = [...FALLBACK_PLAYLIST];
          setPlaylist([...FALLBACK_PLAYLIST]);
          setInitialTotalCount(FALLBACK_PLAYLIST.length);
          const pick = selectWeightedTrack(FALLBACK_PLAYLIST, -1);
          setCurrentIndex(pick.index);
          setCurrentProbability(pick.probability);
          currentIndexRef.current = pick.index;
        }
      } finally {
        if (!isCancelled) setIsLoading(false);
      }
    };

    loadData();

    return () => {
      isCancelled = true;
      isMountedRef.current = false;
    };
  }, [targetProjectId, selectWeightedTrack]);

  // Initialize YouTube IFrame API once
  useEffect(() => {
    let checkInterval: any = null;

    const initYT = () => {
      const initialIdx = currentIndexRef.current >= 0 ? currentIndexRef.current : 0;
      const initialTrack = playlistRef.current[initialIdx] || FALLBACK_PLAYLIST[0];
      const videoId = initialTrack?.id ? String(initialTrack.id).trim() : 'OqsMdYqxcUw';

      const container = document.getElementById('vinyl-yt-player');
      if (!container) return;

      if (playerRef.current) {
        try { playerRef.current.destroy(); } catch (_) {}
      }

      try {
        playerRef.current = new window.YT.Player('vinyl-yt-player', {
          height: '100%',
          width: '100%',
          videoId: videoId,
          playerVars: {
            autoplay: 1,
            controls: 1,
            modestbranding: 1,
            rel: 0,
            enablejsapi: 1,
            origin: window.location.origin,
          },
          events: {
            onReady: () => {
              isPlayerReadyRef.current = true;
              try {
                playerRef.current.playVideo();
              } catch (_) {}
            },
            onStateChange: (event: any) => {
              // Auto-advance when video finishes
              if (event.data === window.YT.PlayerState.ENDED) {
                if (settingsRef.current.autoplay) {
                  const currList = playlistRef.current;
                  const cIdx = currentIndexRef.current;
                  if (cIdx >= 0 && cIdx < currList.length) {
                    const track = currList[cIdx];
                    // Auto-log default score if not already logged
                    if (lastLoggedTrackIdRef.current !== track.id) {
                      const defaultScore = settingsRef.current.defaultPassScore || '4+';
                      logActionToTier2(track, defaultScore);
                    }
                  }
                  handleNextSong(null);
                }
              }
            },
            onError: (e: any) => {
              console.warn('YouTube player error code:', e?.data);
              consecutiveErrorsRef.current += 1;
              if (consecutiveErrorsRef.current <= 3) {
                setTimeout(() => {
                  if (isMountedRef.current) {
                    handleNextSong(null);
                  }
                }, 1500);
              }
            },
          },
        });
      } catch (err) {
        console.error('Failed to construct YT.Player:', err);
      }
    };

    if (!window.YT || !window.YT.Player) {
      if (!document.getElementById('yt-iframe-api-script')) {
        const tag = document.createElement('script');
        tag.id = 'yt-iframe-api-script';
        tag.src = 'https://www.youtube.com/iframe_api';
        const firstScriptTag = document.getElementsByTagName('script')[0];
        firstScriptTag?.parentNode?.insertBefore(tag, firstScriptTag);
      }

      window.onYouTubeIframeAPIReady = () => {
        initYT();
      };

      checkInterval = setInterval(() => {
        if (window.YT && window.YT.Player) {
          clearInterval(checkInterval);
          initYT();
        }
      }, 500);
    } else {
      initYT();
    }

    return () => {
      if (checkInterval) clearInterval(checkInterval);
    };
  }, [handleNextSong]);

  const toggleArc = (arcId: string) => {
    setSelectedArcs((prev) =>
      prev.includes(arcId) ? prev.filter((id) => id !== arcId) : [...prev, arcId]
    );
  };

  const currentTrack = currentIndex >= 0 && currentIndex < playlist.length ? playlist[currentIndex] : null;
  const completedCount = initialTotalCount - playlist.length;
  const progressPercent = initialTotalCount > 0 ? Math.round((completedCount / initialTotalCount) * 100) : 0;

  return (
    <div className="space-y-6 max-w-7xl mx-auto w-full">
      {/* Toast Overlay */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-6 py-3.5 rounded-2xl bg-[#171320] border border-[#d4af37] text-xs font-semibold shadow-2xl flex items-center justify-center gap-2 animate-in fade-in slide-in-from-bottom-2 text-[#ffd86b]">
          {toast.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
          {toast.type === 'error' && <AlertCircle className="w-4 h-4 text-rose-400" />}
          {toast.type === 'warn' && <AlertCircle className="w-4 h-4 text-amber-400" />}
          {toast.type === 'info' && <Sparkles className="w-4 h-4 text-[#ffd86b]" />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Symmetrical Session Progress Header */}
      <div className="p-5 rounded-2xl bg-[#120f18] border border-[#2b2238] shadow-md space-y-2.5">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-[#8c7a9e] font-cinzel font-bold">
            <TrendingUp className="w-4 h-4 text-[#ffd86b]" />
            <span>SESSION PROGRESS</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 text-[11px] font-mono font-bold px-2.5 py-1 rounded-lg bg-[#1a1424] border border-[#3d304f] text-[#ffd86b]">
              <Disc3 className="w-3.5 h-3.5 text-[#ffd86b]" /> {discs} Discs
            </span>
            <span className="font-mono text-xs font-bold text-[#ffd86b]">
              {progressPercent}% ({completedCount}/{initialTotalCount} rated)
            </span>
          </div>
        </div>
        <div className="w-full h-3 bg-[#1a1424] rounded-full overflow-hidden border border-[#2b2238]">
          <div
            className="h-full bg-gradient-to-r from-[#d4af37] via-[#ffd86b] to-[#f59e0b] rounded-full transition-all duration-500 shadow-gold-sm"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Two-Column Responsive Workstation Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: YouTube Video & Track Metadata */}
        <div
          className={`lg:col-span-7 xl:col-span-7 p-6 md:p-7 rounded-2xl bg-[#120f18] border shadow-2xl backdrop-blur-md space-y-5 transition-all duration-300 ${
            equippedStylus === 'golden-stylus'
              ? 'border-[#d4af37] shadow-[0_0_24px_rgba(212,175,55,0.2)]'
              : 'border-[#2b2238]'
          }`}
        >
          {/* Track Title & Header */}
          <div className="flex flex-col items-center justify-center space-y-2 text-center">
            <div className="flex items-center justify-center gap-2">
              <span className="font-mono text-xs font-bold px-3 py-1 rounded-full bg-[#1c1626] border border-[#3d304f] text-[#ffd86b] shadow-inner">
                {isExhausted ? 'TRACK 0/0' : `TRACK ${currentIndex + 1}/${playlist.length}`}
              </span>
            </div>

            <h2 className="text-lg md:text-2xl font-bold text-[#f5f0e8] leading-tight flex items-center justify-center gap-2.5 max-w-2xl mx-auto">
              <Disc3 className="w-6 h-6 text-[#ffd86b] flex-shrink-0" />
              <span className="truncate">{isLoading ? '⏳ Loading playlist...' : isExhausted ? '🎉 Session Completed!' : currentTrack?.title || 'No Track Selected'}</span>
            </h2>

            {currentTrack && (
              <p className="text-xs text-[#8c7a9e] flex flex-wrap items-center justify-center gap-2 font-mono">
                <span className="text-[#ffd86b] font-semibold">{currentTrack.channel}</span>
                <span>•</span>
                <span>ID: {currentTrack.id}</span>
                <span>•</span>
                <span>Played: {getPlayedCount(currentTrack.id)} times</span>
                {currentProbability !== null && (
                  <>
                    <span>•</span>
                    <span className="text-emerald-400 font-semibold">Pick Chance: {currentProbability.toFixed(3)}%</span>
                  </>
                )}
              </p>
            )}

            {errorMessage && (
              <p className="text-xs text-rose-400 font-mono">⚠️ {errorMessage}</p>
            )}
          </div>

          {/* YouTube Video Viewport 16:9 */}
          <div className="relative w-full aspect-video bg-black rounded-2xl overflow-hidden border border-[#2b2238] shadow-2xl">
            <div id="vinyl-yt-player" className="w-full h-full" />
          </div>
        </div>

        {/* Right Column: Interactive Rating & Control Deck */}
        <div className="lg:col-span-5 xl:col-span-5 p-6 md:p-7 rounded-2xl bg-[#120f18] border border-[#2b2238] shadow-2xl backdrop-blur-md space-y-5">
          <div className="flex items-center justify-between border-b border-[#261d33] pb-3">
            <span className="font-cinzel text-sm font-bold text-[#ffd86b] flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#ffd86b]" /> Harmonic Rating Deck
            </span>
            <span className="text-[11px] font-mono text-[#8c7a9e]">
              Selected: <strong className="text-white">{selectedScore || 'None'}</strong>
            </span>
          </div>

          {/* Top Quick Action Row (Cancel, Spin, Pass) */}
          <div className="grid grid-cols-3 gap-2.5 md:gap-3">
            {/* Cancel Button */}
            <button
              type="button"
              disabled={isLogging || isExhausted}
              onClick={() => handleNextSong('3+')}
              className="py-4 md:py-5 px-3 min-h-[58px] md:min-h-[64px] rounded-2xl bg-gradient-to-r from-[#5a1019] to-[#841822] hover:from-[#731320] hover:to-[#a1202d] text-white font-bold text-xs sm:text-sm flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 border border-[#a82431] shadow-lg transition active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              <span className="text-base">🥀</span>
              <span className="text-center">Cancel (3+)</span>
            </button>

            {/* Spin / Skip Button */}
            <button
              type="button"
              disabled={isLogging || isExhausted}
              onClick={() => handleNextSong(null)}
              className="py-4 md:py-5 px-3 min-h-[58px] md:min-h-[64px] rounded-2xl bg-[#1c1824] hover:bg-[#282133] text-[#f5f0e8] hover:text-white font-bold text-xs sm:text-sm flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 border border-[#383045] shadow-lg transition active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4 text-[#ffd86b]" />
              <span className="text-center">Spin (Skip)</span>
            </button>

            {/* 2-Mode Pass Button: Log Rating if selected, Skip to Next if none */}
            {selectedScore ? (
              <button
                type="button"
                disabled={isLogging || isExhausted}
                onClick={() => handleLogCurrentTrack(selectedScore)}
                className="py-4 md:py-5 px-3 min-h-[58px] md:min-h-[64px] rounded-2xl bg-gradient-to-r from-[#d4af37] via-[#ffd86b] to-[#c4962c] hover:brightness-110 text-black font-black text-xs sm:text-sm flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 border border-[#ffd86b] shadow-gold-md transition active:scale-95 disabled:opacity-50 cursor-pointer"
              >
                <Check className="w-4 h-4 text-black" />
                <span className="text-center">Log {selectedScore} (+3 💿)</span>
              </button>
            ) : (
              <button
                type="button"
                disabled={isLogging || isExhausted}
                onClick={() => handleNextSong(null)}
                className="py-4 md:py-5 px-3 min-h-[58px] md:min-h-[64px] rounded-2xl bg-gradient-to-r from-[#20192b] via-[#2d223d] to-[#1c1426] hover:border-[#d4af37] text-[#f5f0e8] hover:text-[#ffd86b] font-bold text-xs sm:text-sm flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 border border-[#3d304f] shadow-lg transition active:scale-95 disabled:opacity-50 cursor-pointer"
              >
                <FastForward className="w-4 h-4 text-[#ffd86b]" />
                <span className="text-center">Pass (Next)</span>
              </button>
            )}
          </div>

          {/* Rating Scores (3+ to 7+) */}
          <div className="grid grid-cols-5 gap-2">
            {(['3+', '4+', '5+', '6+', '7+'] as ScoreTier[]).map((score) => {
              const isSelected = selectedScore === score;
              const labels: Record<ScoreTier, { label: string; icon: string }> = {
                '3+': { label: 'Seedling', icon: '🌱' },
                '4+': { label: 'Melody', icon: '🎵' },
                '5+': { label: 'Sparkle', icon: '✨' },
                '6+': { label: 'Blaze', icon: '🔥' },
                '7+': { label: 'Crown', icon: '👑' },
              };
              return (
                <button
                  key={score}
                  type="button"
                  onClick={() => setSelectedScore(selectedScore === score ? '' : score)}
                  className={`py-3 px-1.5 min-h-[58px] md:min-h-[64px] rounded-2xl text-xs md:text-sm font-mono font-black flex flex-col items-center justify-center gap-1 transition border cursor-pointer active:scale-95 ${
                    isSelected
                      ? 'bg-gradient-to-b from-[#ffd86b] to-[#d4af37] text-black border-[#fff0a8] shadow-gold-md scale-105 z-10'
                      : 'bg-[#171320] hover:bg-[#221b2e] text-[#cbd5e1] hover:text-white border-[#2e2638] hover:border-[#524124]'
                  }`}
                >
                  <span className="text-base md:text-lg">{labels[score].icon}</span>
                  <span className="font-bold">{score}</span>
                </button>
              );
            })}
          </div>

          {/* Timeblock Arc Selection Accordion */}
          <div className="p-4 rounded-2xl bg-[#0f0d14] border border-[#2b2238] space-y-3 text-left">
            <div className="flex items-center justify-between text-xs">
              <span className="text-[#8c7a9e] font-cinzel font-bold flex items-center gap-2">
                <Layers className="w-4 h-4 text-[#d4af37]" /> TIMEBLOCK ARC TAGS
              </span>
              <span
                className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-lg border ${
                  selectedArcs.length > 0
                    ? 'bg-amber-950/60 text-[#ffd86b] border-[#d4af37] shadow-gold-sm'
                    : 'bg-[#171320] text-[#685c78] border-[#2b2238]'
                }`}
              >
                {selectedArcs.length === 0 ? 'None' : `${selectedArcs.length} Active`}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {TIMEBLOCK_ARCS.map((arc) => {
                const isActive = selectedArcs.includes(arc.id);
                return (
                  <button
                    key={arc.id}
                    type="button"
                    onClick={() => toggleArc(arc.id)}
                    className={`py-2.5 px-3 min-h-[44px] rounded-xl text-xs font-sans flex items-center justify-center gap-2 text-center transition border cursor-pointer relative ${
                      arc.fullRow ? 'sm:col-span-2' : ''
                    } ${
                      isActive
                        ? 'bg-gradient-to-r from-[#291e07] to-[#3d2b09] text-white border-[#d4af37] shadow-gold-sm'
                        : 'bg-[#171320] hover:bg-[#20192b] text-[#9c93a8] hover:text-white border-[#2e2638] hover:border-[#3f324f]'
                    }`}
                  >
                    <span className="text-base flex-shrink-0">{arc.emoji}</span>
                    <span className="font-semibold text-[11px] md:text-xs text-center">{arc.label}</span>
                    {isActive && <Check className="w-3.5 h-3.5 text-[#ffd86b] absolute right-3 flex-shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Block Song Button */}
          <button
            type="button"
            disabled={isLogging || isExhausted}
            onClick={() => handleNextSong('block')}
            className="w-full py-3.5 px-4 min-h-[52px] rounded-2xl bg-gradient-to-r from-[#26090e] via-[#350c13] to-[#1c080b] hover:from-[#3b0d15] hover:to-[#2b0c10] text-[#ff8a93] font-bold text-xs md:text-sm flex items-center justify-center gap-2 border border-[#7a1b26] shadow-lg transition active:scale-95 disabled:opacity-50 cursor-pointer tracking-wider"
          >
            <span>🚫 Block & Blacklist Track</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default VinylPlayer;
