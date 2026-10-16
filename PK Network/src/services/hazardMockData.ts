/**
 * Hazard Trigger - Mock Data Engine & Tournament State Operations (Tier 3)
 * Modular, deterministic, immutable. Max 300 lines limit enforced.
 */

import { HazardContender, HazardMatch, HazardTournamentState } from '../types/hazard';

export const MATCH_SLOTS: Record<number, [string, string, string | null]> = {
  1: ['l1', 'l2', 'l9'], 2: ['l3', 'l4', 'l10'], 3: ['l5', 'l6', 'l11'], 4: ['l7', 'l8', 'l12'],
  5: ['r1', 'r2', 'r9'], 6: ['r3', 'r4', 'r10'], 7: ['r5', 'r6', 'r11'], 8: ['r7', 'r8', 'r12'],
  9: ['l9', 'l10', 'l13'], 10: ['l11', 'l12', 'l14'], 11: ['r9', 'r10', 'r13'], 12: ['r11', 'r12', 'r14'],
  13: ['l13', 'l14', 'l15'], 14: ['r13', 'r14', 'r15'], 15: ['l15', 'r15', null]
};

export const ALL_SLOTS = [
  'l1','l2','l3','l4','l5','l6','l7','l8',
  'l9','l10','l11','l12','l13','l14','l15',
  'r1','r2','r3','r4','r5','r6','r7','r8',
  'r9','r10','r11','r12','r13','r14','r15'
];

export function generateVectorPortrait(name: string, c1: string, c2: string, sym: string): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="100%" height="100%">
  <defs>
    <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${c1}" />
      <stop offset="100%" stop-color="${c2}" />
    </linearGradient>
    <radialGradient id="r" cx="50%" cy="50%" r="60%">
      <stop offset="0%" stop-color="${c1}" stop-opacity="0.45"/>
      <stop offset="100%" stop-color="#07090e" stop-opacity="0.95"/>
    </radialGradient>
  </defs>
  <rect width="400" height="400" fill="#0b0f19"/>
  <circle cx="200" cy="200" r="160" fill="url(#r)"/>
  <polygon points="200,50 330,125 330,275 200,350 70,275 70,125" fill="none" stroke="url(#g)" stroke-width="6"/>
  <circle cx="200" cy="180" r="70" fill="none" stroke="${c1}" stroke-width="4" stroke-dasharray="8 6"/>
  <text x="200" y="200" font-family="'Inter', sans-serif" font-weight="900" font-size="64" fill="#ffffff" text-anchor="middle" dominant-baseline="middle">${sym}</text>
  <text x="200" y="315" font-family="'Outfit', sans-serif" font-weight="700" font-size="20" fill="#e2e8f0" text-anchor="middle" letter-spacing="3">${name.toUpperCase()}</text>
</svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

const RAW_CONTENDERS = [
  { name: 'Faust-01', title: 'The Analytical Core', origin: 'Neo-Zurich', seed: 1, c1: '#38bdf8', c2: '#1e40af', sym: 'Ψ', bio: 'Master of predictive algorithmic combat and quantum state foresight.' },
  { name: 'Valkyrie-X', title: 'Sky Sentinel', origin: 'Asgard Spire', seed: 2, c1: '#ec4899', c2: '#be185d', sym: 'ᚹ', bio: 'Supersonic aerial interceptor armed with dual high-frequency plasma blades.' },
  { name: 'Kurogane', title: 'Iron Shogun', origin: 'Neo-Kyoto Sector', seed: 3, c1: '#f59e0b', c2: '#b45309', sym: '斬', bio: 'Disciplined master of electromagnetic kinetic katana arts and micro-thrust dashes.' },
  { name: 'Aetheria', title: 'Void Weaver', origin: 'Olympus Station', seed: 4, c1: '#a855f7', c2: '#6b21a8', sym: 'Ω', bio: 'Manipulates localized gravity wells and spatial distortion lenses.' },
  { name: 'Boreas', title: 'Frost Titan', origin: 'Jovian Sub-Surface', seed: 5, c1: '#06b6d4', c2: '#0e7490', sym: '❄', bio: 'Cryogenic powerhouse clad in liquid nitrogen-chilled tungsten plating.' },
  { name: 'Ignis Rex', title: 'Solar Vanguard', origin: 'Solar Forge Titan', seed: 6, c1: '#ef4444', c2: '#991b1b', sym: '炎', bio: 'Harnesses miniature thermonuclear plasma fusion bursts in close-quarters.' },
  { name: 'Nyx Shadow', title: 'Ghost Infiltrator', origin: 'Lunar Trench', seed: 7, c1: '#6366f1', c2: '#312e81', sym: '◈', bio: 'Optic cloaking specialist with phase-shift daggers and tachyon sensors.' },
  { name: 'Zephyr Prime', title: 'Gale Prodigy', origin: 'Zealand Skyport', seed: 8, c1: '#10b981', c2: '#047857', sym: '🌀', bio: 'Extreme acceleration duellist operating at Mach 3 reflex frequencies.' },
  { name: 'Raptor-9', title: 'Apex Stalker', origin: 'Sector 7 Wastes', seed: 9, c1: '#84cc16', c2: '#4d7c0f', sym: '⚡', bio: 'Bio-cybernetic hunter with neuro-toxic carbon talons and acute thermal vision.' },
  { name: 'Siren Deep', title: 'Abyssal Siren', origin: 'Europa Ocean Base', seed: 10, c1: '#14b8a6', c2: '#0f766e', sym: '≋', bio: 'Deploys concussive sonic cavitation waves capable of rupturing reinforced alloy.' },
  { name: 'Goliath-V', title: 'Siege Engine', origin: 'Krakow Foundries', seed: 11, c1: '#f97316', c2: '#c2410c', sym: '⛊', bio: 'Heavy armored exoskeleton rated for orbital re-entry impact defense.' },
  { name: 'Mirage', title: 'Holo-Duellist', origin: 'Dubai Arcology', seed: 12, c1: '#eab308', c2: '#a16207', sym: '✦', bio: 'Projects quantum hard-light decoys that mirror offensive physical inertia.' },
  { name: 'Cinder', title: 'Ash Reaver', origin: 'Vulcan Caldera', seed: 13, c1: '#f43f5e', c2: '#9f1239', sym: '♨', bio: 'Combines thermite bursts with heavy kinetic flail techniques in high heat.' },
  { name: 'Tiberius', title: 'Centurion-0', origin: 'New Rome Orbital', seed: 14, c1: '#8b5cf6', c2: '#4c1d95', sym: '⚔', bio: 'Tactical combat coordinator equipped with active prismatic barrier arrays.' },
  { name: 'Pulse', title: 'Synapse Runner', origin: 'Seoul Grid', seed: 15, c1: '#0ea5e9', c2: '#0369a1', sym: '∿', bio: 'Overclocks neural pathways for bullet-time perceptual mastery and counter-hits.' },
  { name: 'Obsidian', title: 'Black Monolith', origin: 'Tartarus Deep Mine', seed: 16, c1: '#64748b', c2: '#1e293b', sym: '■', bio: 'Indestructible dark-matter carbon weave juggernaut absorbing kinetic strikes.' }
];

export function createMockContenders(): HazardContender[] {
  return RAW_CONTENDERS.map((c) => {
    const avatarUrl = generateVectorPortrait(c.name, c.c1, c.c2, c.sym);
    return {
      id: `CONT-${c.name.toUpperCase().replace(/[^A-Z0-9]/g, '_')}`,
      name: c.name,
      title: c.title,
      alias: c.title,
      codex: `C${String(c.seed).padStart(2, '0')}`,
      origin: c.origin,
      seed: c.seed,
      bio: c.bio,
      avatarUrl,
      colors: { c1: c.c1, c2: c.c2 },
      symbol: c.sym,
      album: [
        { id: `alb_p_${c.seed}`, url: avatarUrl, type: 'portrait', caption: `${c.name} Official Contender Dossier` },
        { id: `alb_s_${c.seed}`, url: avatarUrl, type: 'scene', caption: `Eva_Display_Ecstasy • Climax Activation` }
      ]
    };
  });
}

export function initializeTournamentState(contenders: HazardContender[]): HazardTournamentState {
  const slots: Record<string, HazardContender | null> = {};
  ALL_SLOTS.forEach((s) => { slots[s] = null; });

  // Place 16 contenders in Round of 16 (l1..l8 and r1..r8)
  slots['l1'] = contenders[0] || null;  // Seed 1
  slots['l2'] = contenders[15] || null; // Seed 16
  slots['l3'] = contenders[7] || null;  // Seed 8
  slots['l4'] = contenders[8] || null;  // Seed 9
  slots['l5'] = contenders[3] || null;  // Seed 4
  slots['l6'] = contenders[12] || null; // Seed 13
  slots['l7'] = contenders[4] || null;  // Seed 5
  slots['l8'] = contenders[11] || null; // Seed 12

  slots['r1'] = contenders[1] || null;  // Seed 2
  slots['r2'] = contenders[14] || null; // Seed 15
  slots['r3'] = contenders[6] || null;  // Seed 7
  slots['r4'] = contenders[9] || null;  // Seed 10
  slots['r5'] = contenders[2] || null;  // Seed 3
  slots['r6'] = contenders[13] || null; // Seed 14
  slots['r7'] = contenders[5] || null;  // Seed 6
  slots['r8'] = contenders[10] || null; // Seed 11

  const matches: Record<number, HazardMatch> = {};
  for (let i = 1; i <= 15; i++) {
    const [s1, s2, sw] = MATCH_SLOTS[i];
    const round = i <= 8 ? 1 : i <= 12 ? 2 : i <= 14 ? 3 : 4;
    matches[i] = {
      id: i,
      round,
      matchNumber: i,
      slotP1: s1,
      slotP2: s2,
      slotWinner: sw,
      p1Id: slots[s1]?.id || null,
      p2Id: slots[s2]?.id || null,
      winnerId: null,
      score1: 0,
      score2: 0,
      status: 'pending'
    };
  }

  return {
    id: 'HAZARD-MOCK-2026',
    title: 'HAZARD ALL-STARS 2026',
    status: 'open',
    slots,
    matches,
    champion: null,
    activeRoundScrubber: 'all'
  };
}

export function findNextPlayableMatch(state: HazardTournamentState): HazardMatch | null {
  for (let i = 1; i <= 15; i++) {
    const m = state.matches[i];
    if (m.status !== 'completed') {
      const p1 = state.slots[m.slotP1];
      const p2 = state.slots[m.slotP2];
      if (p1 && p2) return m;
    }
  }
  return null;
}

export function simulateMatch(
  state: HazardTournamentState,
  matchId: number,
  forcedWinnerSlot?: string
): HazardTournamentState {
  const match = state.matches[matchId];
  if (!match || match.status === 'completed') return state;

  const p1 = state.slots[match.slotP1];
  const p2 = state.slots[match.slotP2];
  if (!p1 || !p2) return state;

  let winnerSlot: string;
  let winner: HazardContender;
  let score1 = 2;
  let score2 = 1;

  if (forcedWinnerSlot) {
    winnerSlot = forcedWinnerSlot;
    winner = winnerSlot === match.slotP1 ? p1 : p2;
    score1 = winnerSlot === match.slotP1 ? 2 : 0;
    score2 = winnerSlot === match.slotP1 ? 0 : 2;
  } else {
    // Weighted deterministic probability based on seeds
    const seed1 = p1.seed;
    const seed2 = p2.seed;
    const p1Weight = (17 - seed1) + Math.random() * 8;
    const p2Weight = (17 - seed2) + Math.random() * 8;
    if (p1Weight >= p2Weight) {
      winnerSlot = match.slotP1;
      winner = p1;
      score1 = 2;
      score2 = Math.random() > 0.4 ? 1 : 0;
    } else {
      winnerSlot = match.slotP2;
      winner = p2;
      score2 = 2;
      score1 = Math.random() > 0.4 ? 1 : 0;
    }
  }

  const nextSlots = { ...state.slots };
  const nextMatches = { ...state.matches };
  let champion = state.champion;

  if (match.slotWinner) {
    nextSlots[match.slotWinner] = winner;
  } else if (match.id === 15) {
    champion = winner;
  }

  nextMatches[matchId] = {
    ...match,
    winnerId: winner.id,
    score1,
    score2,
    status: 'completed'
  };

  const isCompleted = Object.values(nextMatches).every((m) => m.status === 'completed');

  return {
    ...state,
    status: isCompleted ? 'completed' : 'in_progress',
    slots: nextSlots,
    matches: nextMatches,
    champion
  };
}
