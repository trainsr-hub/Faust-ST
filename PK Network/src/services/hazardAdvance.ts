import { HazardTournamentState } from '../types/hazard';
import { findNextPlayableMatch, simulateMatch } from './hazardMockData';
import { persistMatchAdvance } from './hazardLiveApi';

type NotifyFn = (type: 'saved' | 'changed' | 'error', title: string, details?: string) => void;

function syncMatchScore(state: HazardTournamentState, match: any, winner: any, isLiveDb: boolean) {
  if (!isLiveDb || !winner) return;
  const scores: Record<string, string> = {};
  Object.values(state.matches).forEach((m) => {
    if (m.status === 'completed') scores[String(m.id)] = `${m.score1}-${m.score2}`;
  });
  persistMatchAdvance(
    state.id,
    match.slotWinner,
    winner.id,
    match.id === 15,
    scores,
    state.status === 'completed'
  ).catch((err) => console.warn('Turso advance sync error:', err));
}

export function advanceTournamentNext(
  curr: HazardTournamentState,
  isLiveDb: boolean,
  onNotify?: NotifyFn
): HazardTournamentState {
  const nextMatch = findNextPlayableMatch(curr);
  if (!nextMatch) return curr;
  const updated = simulateMatch(curr, nextMatch.id);
  const winner = nextMatch.slotWinner ? updated.slots[nextMatch.slotWinner] : updated.champion;
  syncMatchScore(updated, nextMatch, winner, isLiveDb);

  if (winner && onNotify) {
    const isGF = nextMatch.id === 15;
    onNotify(
      'saved',
      isGF ? `👑 ${winner.name} Crowned Champion!` : `Match #${nextMatch.matchNumber} Won by ${winner.name}`,
      `Score: ${updated.matches[nextMatch.id].score1}-${updated.matches[nextMatch.id].score2} • Turso Background Sync`
    );
  }
  return updated;
}

export function advanceTournamentAll(
  curr: HazardTournamentState,
  isLiveDb: boolean,
  onNotify?: NotifyFn
): HazardTournamentState {
  let state = curr;
  let nextMatch = findNextPlayableMatch(state);
  let count = 0;
  while (nextMatch) {
    state = simulateMatch(state, nextMatch.id);
    const winner = nextMatch.slotWinner ? state.slots[nextMatch.slotWinner] : state.champion;
    syncMatchScore(state, nextMatch, winner, isLiveDb);
    nextMatch = findNextPlayableMatch(state);
    count++;
  }

  if (state.champion && onNotify) {
    onNotify(
      'saved',
      `👑 Tournament Champion: ${state.champion.name}`,
      `Simulated ${count} matches to Grand Finals • Turso Background Sync`
    );
  }
  return state;
}
