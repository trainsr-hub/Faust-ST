/**
 * Hazard Trigger - Live Turso Cloud SQLite API Bridge (Tier 2/3)
 * Maps live rows from 'tournaments' and 'evas' into typed domain models.
 * Adheres strictly to Karpathy Simplicity (<200 lines).
 */

import { HazardContender, HazardMatch, HazardTournamentState, TournamentSummary } from '../types/hazard';
import { ALL_SLOTS, MATCH_SLOTS, generateVectorPortrait } from './hazardMockData';
import { getAuthKey } from './api';

const PALETTES = [
  ['#38bdf8', '#1e40af'], ['#ec4899', '#be185d'], ['#f59e0b', '#b45309'], ['#a855f7', '#6b21a8'],
  ['#06b6d4', '#0e7490'], ['#ef4444', '#991b1b'], ['#6366f1', '#312e81'], ['#10b981', '#047857'],
  ['#84cc16', '#4d7c0f'], ['#14b8a6', '#0f766e'], ['#f97316', '#c2410c'], ['#eab308', '#a16207'],
  ['#f43f5e', '#9f1239'], ['#8b5cf6', '#4c1d95'], ['#0ea5e9', '#0369a1'], ['#64748b', '#1e293b']
];

export function mapEvaToContender(eva: any, index: number, imageRecord?: any, selectedAvatarKey = 'default'): HazardContender {
  const rawName = Array.isArray(eva.name)
    ? eva.name[0]
    : (eva.tournament_name || (typeof eva.name === 'string' ? eva.name : `Eva #${index + 1}`));

  let firstAlias = '';
  if (Array.isArray(eva.alias) && eva.alias.length > 0) {
    firstAlias = typeof eva.alias[0] === 'string' ? eva.alias[0].trim() : '';
  } else if (typeof eva.alias === 'string' && eva.alias.trim()) {
    try {
      const parsed = JSON.parse(eva.alias);
      if (Array.isArray(parsed) && parsed.length > 0) {
        firstAlias = typeof parsed[0] === 'string' ? parsed[0].trim() : '';
      } else if (typeof parsed === 'string') {
        firstAlias = parsed.trim();
      }
    } catch {
      firstAlias = eva.alias.split(',')[0].trim();
    }
  }

  const title = eva.tournament_name || firstAlias || 'Hazard Fighter';
  const origin = Array.isArray(eva.affiliate) ? eva.affiliate[0] : (eva.affiliate || 'Neo-Zurich');
  const symbol = (rawName || 'Ψ').charAt(0).toUpperCase();

  const [c1, c2] = PALETTES[index % PALETTES.length];
  const vectorFallback = generateVectorPortrait(rawName, c1, c2, symbol);

  // Parse avatars map from character_images record
  const avatarsMap: Record<string, string[]> = {};
  if (imageRecord && imageRecord.avatars) {
    let raw = imageRecord.avatars;
    if (typeof raw === 'string') {
      try { raw = JSON.parse(raw); } catch {}
    }
    if (typeof raw === 'object' && raw !== null && !Array.isArray(raw)) {
      for (const [k, v] of Object.entries(raw)) {
        if (Array.isArray(v)) {
          avatarsMap[k] = v.map((item) => String(item).trim()).filter(Boolean);
        } else if (typeof v === 'string' && v.trim()) {
          avatarsMap[k] = [v.trim()];
        }
      }
    }
  }

  // Select key and pick randomly from the list
  const avatarList = avatarsMap[selectedAvatarKey] || avatarsMap['default'] || Object.values(avatarsMap)[0] || [];
  let chosenAvatarUrl = vectorFallback;
  if (Array.isArray(avatarList) && avatarList.length > 0) {
    const randIdx = Math.floor(Math.random() * avatarList.length);
    chosenAvatarUrl = avatarList[randIdx];
  }

  const codex = eva.eva_codex ? String(eva.eva_codex).trim() : '';

  // Assemble visual dossier albums from character_images
  const album: HazardContender['album'] = [];
  album.push({ id: `alb_${eva.id}_avatar`, url: chosenAvatarUrl, type: 'portrait', caption: `${rawName} Contender Avatar` });

  const parseUrlList = (val: any): string[] => {
    let parsed = val;
    if (typeof parsed === 'string') { try { parsed = JSON.parse(parsed); } catch {} }
    if (typeof parsed !== 'object' || !parsed) return [];
    return Object.values(parsed).flatMap((arr: any) => Array.isArray(arr) ? arr.map(String) : [String(arr)]);
  };

  if (imageRecord) {
    parseUrlList(imageRecord.portraits).forEach((url, i) => album.push({ id: `alb_p_${i}`, url, type: 'portrait', caption: `${rawName} Full Portrait` }));
    parseUrlList(imageRecord.cards).forEach((url, i) => album.push({ id: `alb_c_${i}`, url, type: 'combat', caption: `${rawName} Battle Card` }));
    parseUrlList(imageRecord.scenes).forEach((url, i) => album.push({ id: `alb_s_${i}`, url, type: 'scene', caption: `Climax Activation` }));
  }

  return {
    id: eva.id,
    name: rawName,
    title,
    alias: firstAlias,
    codex,
    origin,
    seed: index + 1,
    bio: eva.notes || `Rank: ${eva.hazard_rank || 'Standard'} • Level: ${eva.hazard_level ?? '1.0'}`,
    avatarUrl: chosenAvatarUrl,
    colors: { c1, c2 },
    symbol,
    album: album.length > 0 ? album : [
      { id: `alb_${eva.id}_1`, url: chosenAvatarUrl, type: 'portrait', caption: `${rawName} Contender Dossier` },
      { id: `alb_${eva.id}_2`, url: chosenAvatarUrl, type: 'scene', caption: `Eva_Display_Ecstasy • Climax Activation` }
    ],
    avatarsMap
  };
}

export async function fetchLiveTournament(targetId?: string, avatarKey = 'default'): Promise<{
  state: HazardTournamentState;
  contenders: HazardContender[];
  tournamentsList: TournamentSummary[];
  isLive: boolean;
}> {
  try {
    const authKey = getAuthKey();
    const url = targetId ? `/api/hazard/tournament?id=${encodeURIComponent(targetId)}` : '/api/hazard/tournament';
    const res = await fetch(url, {
      headers: authKey ? { 'X-App-Key': authKey } : {}
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (!data.success || !data.tournament) throw new Error(data.error || 'No tournament returned');

    const rawTrn = data.tournament;
    const evasList = data.evas || [];
    const imagesList = data.images || [];
    const tournamentsList: TournamentSummary[] = data.tournaments || [];

    // Map character_images by eva foreign ID and codex
    const imagesByEva: Record<string, any> = {};
    imagesList.forEach((img: any) => {
      if (img.eva) imagesByEva[img.eva] = img;
      if (img.code) imagesByEva[img.code] = img;
    });

    const contendersMap: Record<string, HazardContender> = {};
    const contenders: HazardContender[] = evasList.map((e: any, idx: number) => {
      const imgRec = imagesByEva[e.id] || imagesByEva[e.eva_codex];
      const c = mapEvaToContender(e, idx, imgRec, avatarKey);
      contendersMap[c.id] = c;
      return c;
    });

    const slots: Record<string, HazardContender | null> = {};
    ALL_SLOTS.forEach((s) => {
      const val = rawTrn[s];
      slots[s] = val && contendersMap[val] ? contendersMap[val] : null;
    });

    const rawScores = typeof rawTrn.scores_json === 'object' && rawTrn.scores_json ? rawTrn.scores_json : {};
    const matches: Record<number, HazardMatch> = {};
    for (let i = 1; i <= 15; i++) {
      const [s1, s2, sw] = MATCH_SLOTS[i];
      const p1 = slots[s1];
      const p2 = slots[s2];
      const winner = sw && slots[sw] ? slots[sw] : (i === 15 && rawTrn.champion ? contendersMap[rawTrn.champion] : null);
      const scoreStr = rawScores[String(i)] || (winner ? '2-1' : '0-0');
      const [sc1, sc2] = scoreStr.split('-').map((v: string) => parseInt(v, 10) || 0);

      matches[i] = {
        id: i,
        round: i <= 8 ? 1 : i <= 12 ? 2 : i <= 14 ? 3 : 4,
        matchNumber: i,
        slotP1: s1,
        slotP2: s2,
        slotWinner: sw,
        p1Id: p1?.id || null,
        p2Id: p2?.id || null,
        winnerId: winner?.id || null,
        score1: sc1,
        score2: sc2,
        status: winner ? 'completed' : 'pending'
      };
    }

    const champion = rawTrn.champion && contendersMap[rawTrn.champion] ? contendersMap[rawTrn.champion] : null;

    return {
      isLive: true,
      contenders,
      tournamentsList,
      state: {
        id: rawTrn.id,
        title: rawTrn.title || 'Hazard Championship Arena',
        status: rawTrn.status || 'open',
        slots,
        matches,
        champion,
        activeRoundScrubber: 'all',
        tournamentsList
      }
    };
  } catch (err) {
    console.warn('Live tournament fetch failed, fallback to mock:', err);
    throw err;
  }
}

export async function persistSlotContender(
  tournamentId: string,
  slot: string,
  evaId: string | null
): Promise<void> {
  const authKey = getAuthKey();
  const res = await fetch('/api/hazard/tournament/slot', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(authKey ? { 'X-App-Key': authKey } : {})
    },
    body: JSON.stringify({ tournamentId, slot, evaId })
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
}

export async function persistTournamentTitle(
  tournamentId: string,
  title: string
): Promise<void> {
  const authKey = getAuthKey();
  const res = await fetch('/api/hazard/tournament/title', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(authKey ? { 'X-App-Key': authKey } : {})
    },
    body: JSON.stringify({ tournamentId, title })
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
}

export async function createNewTournament(title?: string): Promise<{ id: string; title: string }> {
  const authKey = getAuthKey();
  const res = await fetch('/api/hazard/tournament/create', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(authKey ? { 'X-App-Key': authKey } : {})
    },
    body: JSON.stringify({ title })
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return await res.json();
}

export async function persistMatchAdvance(
  tournamentId: string,
  targetSlot: string | null,
  winnerId: string,
  isGrandFinals: boolean,
  scoresJson: Record<string, string>,
  isCompleted: boolean
): Promise<void> {
  const authKey = getAuthKey();
  await fetch('/api/hazard/tournament/advance', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(authKey ? { 'X-App-Key': authKey } : {})
    },
    body: JSON.stringify({
      tournamentId,
      targetSlot,
      winnerId,
      isGrandFinals,
      scoresJson,
      isCompleted
    })
  });
}

export async function persistTournamentReset(tournamentId: string): Promise<void> {
  const authKey = getAuthKey();
  await fetch('/api/hazard/tournament/reset', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(authKey ? { 'X-App-Key': authKey } : {})
    },
    body: JSON.stringify({ tournamentId })
  });
}
