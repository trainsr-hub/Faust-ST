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
  played: number; // Tổng số lượng phần tử từ tất cả các trường score (score_3 -> score_7)
  timeblock: string | null;
  unlock_date: string | null;
  rankCategory: string;
}
