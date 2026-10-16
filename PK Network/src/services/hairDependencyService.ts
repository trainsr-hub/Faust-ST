import { GraphEdge } from '../types/hairGraph';
import { DANBOORU_HAIR_ITEMS } from './hairGraphData';

const STORAGE_KEY = 'faust_hair_dependencies_v2';

export interface HairDependencyEdge {
  id: string;
  sourceId: string; // Parent (e.g. bob cut)
  targetId: string; // Child dependent on parent (e.g. inverted bob)
}

// Canonical Danbooru inheritance dependencies (A => B: B is dependent on A)
export const CANONICAL_DEPENDENCY_EDGES: HairDependencyEdge[] = [
  // Bob & Cuts
  { id: 'c_bob_inverted', sourceId: 'bob_cut', targetId: 'inverted_bob' },
  { id: 'c_short_bob', sourceId: 'short_hair', targetId: 'bob_cut' },
  { id: 'c_short_pixie', sourceId: 'short_hair', targetId: 'pixie_cut' },
  { id: 'c_veryshort_buzz', sourceId: 'very_short_hair', targetId: 'buzz_cut' },
  { id: 'c_veryshort_crew', sourceId: 'very_short_hair', targetId: 'crew_cut' },
  { id: 'c_straight_hime', sourceId: 'straight_hair', targetId: 'hime_cut' },
  { id: 'c_straight_kishimen', sourceId: 'straight_hair', targetId: 'kishimen_hair' },
  // Texture
  { id: 'c_curly_drill', sourceId: 'curly_hair', targetId: 'drill_hair' },
  { id: 'c_drill_twindrills', sourceId: 'drill_hair', targetId: 'twin_drills' },
  { id: 'c_curly_ringlets', sourceId: 'curly_hair', targetId: 'ringlets' },
  // Bangs
  { id: 'c_parted_middle', sourceId: 'parted_bangs', targetId: 'middle_part' },
  { id: 'c_parted_side', sourceId: 'parted_bangs', targetId: 'side_part' },
  { id: 'c_parted_diagonal', sourceId: 'parted_bangs', targetId: 'diagonal_bangs' },
  { id: 'c_parted_double', sourceId: 'parted_bangs', targetId: 'double_parted_bangs' },
  // Ahoge & Crown
  { id: 'c_ahoge_huge', sourceId: 'ahoge', targetId: 'huge_ahoge' },
  { id: 'c_ahoge_heart', sourceId: 'ahoge', targetId: 'heart_ahoge' },
  { id: 'c_ahoge_antenna', sourceId: 'ahoge', targetId: 'antenna_hair' },
  { id: 'c_antenna_heart', sourceId: 'antenna_hair', targetId: 'heart_antenna' },
  // Ponytails & Twintails
  { id: 'c_ponytail_high', sourceId: 'ponytail', targetId: 'high_ponytail' },
  { id: 'c_ponytail_low', sourceId: 'ponytail', targetId: 'low_ponytail' },
  { id: 'c_ponytail_side', sourceId: 'ponytail', targetId: 'side_ponytail' },
  { id: 'c_ponytail_short', sourceId: 'ponytail', targetId: 'short_ponytail' },
  { id: 'c_ponytail_folded', sourceId: 'ponytail', targetId: 'folded_ponytail' },
  { id: 'c_ponytail_front', sourceId: 'ponytail', targetId: 'front_ponytail' },
  { id: 'c_ponytail_twintails', sourceId: 'ponytail', targetId: 'twintails' },
  { id: 'c_twintails_high', sourceId: 'twintails', targetId: 'high_twintails' },
  { id: 'c_twintails_low', sourceId: 'twintails', targetId: 'low_twintails' },
  { id: 'c_twintails_short', sourceId: 'twintails', targetId: 'short_twintails' },
  { id: 'c_twintails_uneven', sourceId: 'twintails', targetId: 'uneven_twintails' },
  { id: 'c_halfupdo_oneside', sourceId: 'half_updo', targetId: 'one_side_up' },
  { id: 'c_halfupdo_twoside', sourceId: 'half_updo', targetId: 'two_side_up' },
  // Braids
  { id: 'c_braid_single', sourceId: 'braid', targetId: 'single_braid' },
  { id: 'c_braid_twin', sourceId: 'braid', targetId: 'twin_braids' },
  { id: 'c_braid_side', sourceId: 'braid', targetId: 'side_braid' },
  { id: 'c_braid_crown', sourceId: 'braid', targetId: 'crown_braid' },
  { id: 'c_crown_halfcrown', sourceId: 'crown_braid', targetId: 'half_crown_braid' },
  { id: 'c_braid_french', sourceId: 'braid', targetId: 'french_braid' },
  { id: 'c_braid_rope', sourceId: 'braid', targetId: 'rope_braid' },
  { id: 'c_braid_cornrows', sourceId: 'braid', targetId: 'cornrows' },
  { id: 'c_braid_dreadlocks', sourceId: 'braid', targetId: 'dreadlocks' },
  { id: 'c_braid_ponytail', sourceId: 'ponytail', targetId: 'braided_ponytail' },
  // Buns
  { id: 'c_bun_single', sourceId: 'hair_bun', targetId: 'single_hair_bun' },
  { id: 'c_bun_double', sourceId: 'hair_bun', targetId: 'double_bun' },
  { id: 'c_bun_triple', sourceId: 'hair_bun', targetId: 'triple_bun' },
  { id: 'c_bun_cone', sourceId: 'hair_bun', targetId: 'cone_hair_bun' },
  { id: 'c_bun_donut', sourceId: 'hair_bun', targetId: 'donut_hair_bun' },
  { id: 'c_bun_heart', sourceId: 'hair_bun', targetId: 'heart_hair_bun' },
  { id: 'c_bun_rings', sourceId: 'hair_bun', targetId: 'hair_rings' },
  { id: 'c_rings_single', sourceId: 'hair_rings', targetId: 'single_hair_ring' },
  { id: 'c_rings_tri', sourceId: 'hair_rings', targetId: 'tri_hair_rings' },
  { id: 'c_rings_quad', sourceId: 'hair_rings', targetId: 'quad_hair_rings' },
  { id: 'c_bun_braided', sourceId: 'hair_bun', targetId: 'braided_bun' },
  // Nihongami (Traditional Japanese)
  { id: 'c_nihon_bow', sourceId: 'nihongami', targetId: 'bow_shimada' },
  { id: 'c_nihon_katsu', sourceId: 'nihongami', targetId: 'katsuyamamage' },
  { id: 'c_nihon_maru', sourceId: 'nihongami', targetId: 'marumage' },
  { id: 'c_nihon_tachi', sourceId: 'nihongami', targetId: 'tachihyogo' },
  { id: 'c_nihon_tsubushi', sourceId: 'nihongami', targetId: 'tsubushi_shimada' },
  { id: 'c_nihon_yoko', sourceId: 'nihongami', targetId: 'yoko_hyogo' },
];

export function loadSavedDependencies(): HairDependencyEdge[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {
    console.warn('Failed to load dependencies, using canonical:', e);
  }
  return [...CANONICAL_DEPENDENCY_EDGES];
}

export function saveDependencies(edges: HairDependencyEdge[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(edges));
  } catch (e) {
    console.warn('Failed to save dependencies:', e);
  }
}
