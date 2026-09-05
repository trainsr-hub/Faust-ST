// path: src/apps/vinyl-angel/types.ts

// =============================================================================
// [VINYL ANGEL SPECIFIC TYPES]
// =============================================================================

export interface Tier3StateRecord {
  id: string;
  score_3_count: string[];
  score_4_count: string[];
  score_5_count: string[];
  score_6_count: string[];
  score_7_count: string[];
  timeblock_arc0: number;
  timeblock_arc1: number;
  timeblock_arc2: number;
  timeblock_arc3: number;
  timeblock_arc4: number;
  unlock_date: string | null;
}

export interface Tier2EventEntry {
  id: string;
  action: string;
  timestamp: string;
  timeblock?: string | string[];
}

export interface VinylDisplayCard {
  id: string;
  dbIndex: number;
  title: string;
  channel: string;
  duration?: number | string | null;
  hazard_level: number;
  played: number;
  timeblock: string | null;
  unlock_date: string | null;
  rankCategory: string;
}

export interface PlaylistItem {
  id: string;
  title: string;
  channel: string;
  duration?: number | string | null;
}

export type ScoreTier = '3+' | '4+' | '5+' | '6+' | '7+';

export type VinylAction = ScoreTier | 'pass' | 'spin' | 'block' | 'cancel';

export type VinylLocalTheme =
  | 'celestial-gold'
  | 'crimson-void'
  | 'emerald-sanctuary'
  | 'cyber-neon'
  | 'obsidian-abyss';

export interface ShopItem {
  id: string;
  name: string;
  description: string;
  category: 'ticket' | 'cosmetic' | 'booster' | 'utility' | 'theme';
  priceDiscs?: number;
  priceTime?: number;
  rewardTicket?: string;
  isLocked?: boolean;
  lockReason?: string;
  iconName: string;
  color: string;
  perkEffect?: string;
  consumable?: boolean;
}

export interface VinylPlayerSettings {
  autoplay: boolean;
  defaultPassScore: ScoreTier;
  soundEffects: boolean;
  autoSync: boolean;
}

export interface VinylSessionStats {
  sessionRatingsCount: number;
  totalDiscsEarned: number;
  lastSyncTimestamp: string | null;
}
