import React, { useState, useCallback, useEffect, useMemo } from 'react';
import '../../styles/hazard.css';
import { HazardContender, HazardTournamentState, TournamentSummary } from '../../types/hazard';
import { createMockContenders, initializeTournamentState } from '../../services/hazardMockData';
import {
  fetchLiveTournament, persistTournamentReset, persistSlotContender,
  persistTournamentTitle, createNewTournament
} from '../../services/hazardLiveApi';
import { advanceTournamentNext, advanceTournamentAll } from '../../services/hazardAdvance';
import { createNotification, ActionNotification, NotificationActionType } from '../../services/notificationManager';
import { ActionToast } from '../ActionToast';
import { HazardHeader } from './HazardHeader';
import { HazardScrubber } from './HazardScrubber';
import { HazardArena } from './HazardArena';
import { HazardDossierModal } from './HazardDossierModal';
import { HazardSlotPickerModal } from './HazardSlotPickerModal';

interface HazardTriggerAppProps {
  onSwitchToPk: () => void;
  onSwitchToPrompt?: () => void;
  onSwitchToHair?: () => void;
  theme?: 'dark' | 'light';
  onToggleTheme?: () => void;
}

export const HazardTriggerApp: React.FC<HazardTriggerAppProps> = ({
  onSwitchToPk,
  onSwitchToPrompt,
  onSwitchToHair,
  theme = 'dark',
  onToggleTheme
}) => {
  const defaultContenders = useMemo(() => createMockContenders(), []);
  const [tournament, setTournament] = useState<HazardTournamentState>(() =>
    initializeTournamentState(defaultContenders)
  );
  const [allContenders, setAllContenders] = useState<HazardContender[]>(defaultContenders);
  const [tournamentsList, setTournamentsList] = useState<TournamentSummary[]>([]);
  const [selectedContender, setSelectedContender] = useState<HazardContender | null>(null);
  const [pickerSlot, setPickerSlot] = useState<string | null>(null);
  const [activeRound, setActiveRound] = useState<string>('all');
  const [localTheme, setLocalTheme] = useState<'dark' | 'light'>(theme);
  const [isLiveDb, setIsLiveDb] = useState<boolean>(false);
  const [avatarTheme, setAvatarTheme] = useState<string>(() => localStorage.getItem('hazard_avatar_theme') || 'default');
  const [avatarSeed, setAvatarSeed] = useState<number>(0);
  const [notifications, setNotifications] = useState<ActionNotification[]>([]);

  const dismissNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const notify = useCallback((type: NotificationActionType, title: string, details?: string) => {
    const notif = createNotification(type, title, details);
    setNotifications((prev) => [notif, ...prev.slice(0, 2)]);
    setTimeout(() => setNotifications((prev) => prev.filter((n) => n.id !== notif.id)), 3200);
  }, []);

  // Sync with live Turso Cloud SQLite database (Initial load or deliberate tournament switch only)
  const syncWithTurso = useCallback(async (targetId?: string) => {
    try {
      const live = await fetchLiveTournament(targetId, avatarTheme);
      setTournament(live.state);
      setAllContenders(live.contenders);
      setTournamentsList(live.tournamentsList);
      setIsLiveDb(live.isLive);
    } catch (e) {
      console.warn('Fallback to mock tournament state:', e);
      setIsLiveDb(false);
    }
  }, [avatarTheme]);

  useEffect(() => {
    syncWithTurso();
  }, [syncWithTurso]);

  const toggleTheme = useCallback(() => {
    const next = localTheme === 'dark' ? 'light' : 'dark';
    setLocalTheme(next);
    document.documentElement.setAttribute('data-theme', next);
    if (onToggleTheme) onToggleTheme();
  }, [localTheme, onToggleTheme]);

  // Discover available avatar keys across contenders
  const availableAvatarThemes = useMemo(() => {
    const set = new Set<string>();
    allContenders.forEach((c) => {
      if (c.avatarsMap) Object.keys(c.avatarsMap).forEach((k) => set.add(k));
    });
    const list = Array.from(set);
    return list.includes('default') ? ['default', ...list.filter((k) => k !== 'default')] : list;
  }, [allContenders]);

  // Resolve random avatar from candidate list
  const resolveContenderAvatar = useCallback((c: HazardContender, themeKey: string): HazardContender => {
    if (!c.avatarsMap) return c;
    const list = c.avatarsMap[themeKey] || c.avatarsMap['default'] || Object.values(c.avatarsMap)[0] || [];
    if (Array.isArray(list) && list.length > 0) {
      return { ...c, avatarUrl: list[Math.floor(Math.random() * list.length)] };
    }
    return c;
  }, []);

  const handleSelectAvatarTheme = useCallback((newTheme: string) => {
    setAvatarTheme(newTheme);
    localStorage.setItem('hazard_avatar_theme', newTheme);
    setAvatarSeed((s) => s + 1);
    notify('changed', `Switched Avatar Style to "${newTheme}"`, 'RAM Reseeded • Instant');
  }, [notify]);

  const handleRerollAvatars = useCallback(() => {
    setAvatarSeed((s) => s + 1);
    notify('changed', 'Rerolled Random Avatars', 'New random candidates selected');
  }, [notify]);

  // Update contenders and active slots in RAM immediately
  useEffect(() => {
    setAllContenders((prev) => prev.map((c) => resolveContenderAvatar(c, avatarTheme)));
    setTournament((curr) => {
      const updatedSlots: Record<string, HazardContender | null> = {};
      Object.entries(curr.slots).forEach(([slot, c]) => {
        updatedSlots[slot] = c ? resolveContenderAvatar(c, avatarTheme) : null;
      });
      const updatedChamp = curr.champion ? resolveContenderAvatar(curr.champion, avatarTheme) : null;
      return { ...curr, slots: updatedSlots, champion: updatedChamp };
    });
  }, [avatarTheme, avatarSeed, resolveContenderAvatar]);

  // 0ms RAM Slot contender assignment with silent background Turso save
  const handleSlotSelect = useCallback((slotId: string, evaId: string | null) => {
    const contender = evaId ? allContenders.find((c) => c.id === evaId) || null : null;
    setTournament((curr) => ({
      ...curr,
      slots: { ...curr.slots, [slotId]: contender },
      champion: slotId === 'champion' ? contender : curr.champion
    }));

    if (contender) {
      notify('saved', `Assigned ${contender.name}`, `Slot: ${slotId.toUpperCase()} • Turso Background Sync`);
    } else {
      notify('changed', `Cleared Slot ${slotId.toUpperCase()}`, 'Turso Background Sync');
    }

    if (isLiveDb) {
      persistSlotContender(tournament.id, slotId, evaId).catch((err) => notify('error', 'Turso Sync Failed', err.message));
    }
  }, [allContenders, isLiveDb, tournament.id, notify]);

  const handleSelectTournament = useCallback((id: string) => {
    notify('changed', 'Loading Tournament', `#${id}`);
    syncWithTurso(id);
  }, [syncWithTurso, notify]);

  // 0ms RAM Tournament title edit with silent background Turso save
  const handleUpdateTitle = useCallback((newTitle: string) => {
    setTournament((curr) => ({ ...curr, title: newTitle }));
    setTournamentsList((list) =>
      list.map((t) => (t.id === tournament.id ? { ...t, title: newTitle } : t))
    );
    notify('saved', 'Updated Tournament Title', `"${newTitle}" • Turso Background Sync`);

    if (isLiveDb) {
      persistTournamentTitle(tournament.id, newTitle).catch((err) => notify('error', 'Title Sync Failed', err.message));
    }
  }, [isLiveDb, tournament.id, notify]);

  const handleCreateTournament = useCallback(async () => {
    if (isLiveDb) {
      try {
        const res = await createNewTournament();
        notify('saved', 'Created Tournament', `#${res.id} • Turso Cloud`);
        await syncWithTurso(res.id);
      } catch (err: any) {
        notify('error', 'Creation Failed', err.message);
      }
    } else {
      const newId = `TRN-LOCAL-${Date.now().toString(16)}`;
      const newTitle = `Tournament #${tournamentsList.length + 1}`;
      const fresh = initializeTournamentState(defaultContenders);
      fresh.id = newId;
      fresh.title = newTitle;
      setTournament(fresh);
      setTournamentsList((l) => [{ id: newId, title: newTitle, status: 'open' }, ...l]);
      notify('saved', 'Created Local Tournament', `#${newId}`);
    }
  }, [isLiveDb, syncWithTurso, tournamentsList.length, defaultContenders, notify]);

  // 0ms Deterministic Next Simulation with silent background sync
  const handleSimulateNext = useCallback(() => {
    setTournament((curr) => advanceTournamentNext(curr, isLiveDb, notify));
  }, [isLiveDb, notify]);

  // 0ms Auto-Simulate Full Tournament with silent background sync
  const handleSimulateAll = useCallback(() => {
    setTournament((curr) => advanceTournamentAll(curr, isLiveDb, notify));
  }, [isLiveDb, notify]);

  // 0ms RAM Reset with silent background sync
  const handleReset = useCallback(() => {
    setTournament(initializeTournamentState(defaultContenders));
    notify('changed', 'Bracket Reset', 'All slots and matches reset • Turso Background Sync');

    if (isLiveDb) {
      persistTournamentReset(tournament.id).catch((e) => notify('error', 'Turso Reset Failed', e.message));
    }
  }, [isLiveDb, tournament.id, defaultContenders, notify]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.code === 'Space') {
        e.preventDefault();
        handleSimulateNext();
      } else if (e.key === 'r' || e.key === 'R') {
        if (!e.ctrlKey && !e.metaKey) {
          e.preventDefault();
          handleReset();
        }
      } else if (e.key === 'Escape') {
        setSelectedContender(null);
        setPickerSlot(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleSimulateNext, handleReset]);

  const statusText = useMemo(() => {
    const dbLabel = isLiveDb ? 'Turso Cloud SQLite (Live: tournaments)' : 'Mock In-Memory';
    if (tournament.champion) {
      return `👑 Champion: ${tournament.champion.name} (#${tournament.champion.seed}) • ${dbLabel}`;
    }
    const completedCount = Object.values(tournament.matches).filter((m) => m.status === 'completed').length;
    return `${dbLabel} • Match ${completedCount}/15 • ${allContenders.length} Evas`;
  }, [tournament, isLiveDb, allContenders.length]);

  return (
    <div className="hazard-root">
      <HazardHeader
        currentTournamentId={tournament.id}
        currentTitle={tournament.title}
        tournamentsList={tournamentsList}
        onSelectTournament={handleSelectTournament}
        onUpdateTitle={handleUpdateTitle}
        onCreateTournament={handleCreateTournament}
        onSimulateNext={handleSimulateNext}
        onSimulateAll={handleSimulateAll}
        onReset={handleReset}
        onSwitchToPk={onSwitchToPk}
        onSwitchToPrompt={onSwitchToPrompt}
        onSwitchToHair={onSwitchToHair}
        isCompleted={!!tournament.champion}
        theme={localTheme}
        onToggleTheme={toggleTheme}
        avatarTheme={avatarTheme}
        availableAvatarThemes={availableAvatarThemes}
        onSelectAvatarTheme={handleSelectAvatarTheme}
        onRerollAvatars={handleRerollAvatars}
      />

      <HazardScrubber
        activeRound={activeRound}
        onSelectRound={setActiveRound}
        statusText={statusText}
      />

      <HazardArena
        tournament={tournament}
        activeRound={activeRound}
        onSelectContender={setSelectedContender}
        onSlotClick={(slot) => setPickerSlot(slot)}
      />

      {pickerSlot && (
        <HazardSlotPickerModal
          slotId={pickerSlot}
          tournament={tournament}
          allContenders={allContenders}
          onSelect={handleSlotSelect}
          onOpenDossier={(contender) => {
            setSelectedContender(contender);
            setPickerSlot(null);
          }}
          onClose={() => setPickerSlot(null)}
        />
      )}

      <HazardDossierModal
        contender={selectedContender}
        onClose={() => setSelectedContender(null)}
      />

      {/* Non-intrusive bottom-right Action Toast Notifications */}
      <ActionToast notifications={notifications} onDismiss={dismissNotification} />
    </div>
  );
};
