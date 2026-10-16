/**
 * Hazard Trigger - Domain Types (Tier 1)
 * Adheres strictly to GEMINI.md: typed schemas, immutable models, no untyped dicts.
 */

export interface HazardAlbumItem {
  id: string;
  url: string;
  type: 'portrait' | 'combat' | 'lore' | 'scene';
  caption: string;
}

export interface HazardContender {
  id: string;
  name: string;
  title: string;
  alias?: string;
  codex?: string;
  origin: string;
  seed: number;
  bio: string;
  avatarUrl: string;
  colors: {
    c1: string;
    c2: string;
  };
  symbol: string;
  album: HazardAlbumItem[];
  avatarsMap?: Record<string, string[]>;
}

export type MatchStatus = 'pending' | 'in_progress' | 'completed';

export interface HazardMatch {
  id: number;
  round: number; // 1: Round of 16, 2: Quarterfinals, 3: Semifinals, 4: Grand Finals
  matchNumber: number;
  slotP1: string;
  slotP2: string;
  slotWinner: string | null;
  p1Id?: string | null;
  p2Id?: string | null;
  winnerId?: string | null;
  score1: number;
  score2: number;
  status: MatchStatus;
}

export interface TournamentSummary {
  id: string;
  title: string;
  status: 'open' | 'in_progress' | 'completed';
  created_at?: string;
}

export interface HazardTournamentState {
  id: string;
  title: string;
  status: 'open' | 'in_progress' | 'completed';
  slots: Record<string, HazardContender | null>;
  matches: Record<number, HazardMatch>;
  champion: HazardContender | null;
  activeRoundScrubber: string;
  tournamentsList?: TournamentSummary[];
}
