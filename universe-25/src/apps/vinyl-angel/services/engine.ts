// =============================================================================
// [VINYL ANGEL MATHEMATICAL & ULTRA HIGH-PERFORMANCE ETL ENGINE]
// =============================================================================
import { executeOrder } from '../../../services/api';
import { getRankFromScore } from '../../../utils/rank';
import type { Tier3StateRecord, Tier2EventEntry, VinylDisplayCard } from '../types';

export const ARC_METADATA: Record<string, { title: string; emoji: string }> = {
  timeblock_arc0: { title: 'Arc Zero ~ Kick Starter', emoji: '🌊' },
  timeblock_arc1: { title: 'Arc 01 ~ Morning Star - Raye', emoji: '🚀' },
  timeblock_arc2: { title: 'Arc 02 ~ Battle Phase - Racheal', emoji: '⚔️' },
  timeblock_arc3: { title: 'Arc 03 ~ Night Hours Melody', emoji: '🌙' },
  timeblock_arc4: { title: 'Arc 04 ~ Sacred Pragma', emoji: '🪶' },
};

interface Tier1StaticItem {
  title?: string;
  channel_name?: string;
  channel?: string;
  artist?: string;
  duration?: number | string;
}

const tier1MemoryCache: Record<string, Tier1StaticItem> = {};
let cachedEligibleTier4List: VinylDisplayCard[] | null = null;

export function invalidateVinylCache(projectId?: string) {
  cachedEligibleTier4List = null;
  if (!projectId) {
    for (const k in tier1MemoryCache) delete tier1MemoryCache[k];
  }
}

export function calculateHazardLevel(record: Tier3StateRecord): number {
  const s3 = record.score_3_count.length;
  const s4 = record.score_4_count.length;
  const s5 = record.score_5_count.length;
  const s6 = record.score_6_count.length;
  const s7 = record.score_7_count.length;

  const rawXP = 10 * s5 + 65 * s6 + 200 * s7 - 70 * s3 - 3 * s4;
  if (rawXP === 0) return 3.0;

  const sgn = rawXP >= 0 ? 1 : -1;
  const scalingCoefficient = 5.0 / Math.log(51);
  const score = 3.0 + sgn * scalingCoefficient * Math.log(1 + Math.abs(rawXP) / 300);

  return Math.round(score * 100) / 100;
}

export function calculateTotalPlayed(record: Tier3StateRecord): number {
  return (
    record.score_3_count.length +
    record.score_4_count.length +
    record.score_5_count.length +
    record.score_6_count.length +
    record.score_7_count.length
  );
}

export function getDominantTimeblock(record: Tier3StateRecord): string | null {
  const arcCounts = [
    { key: 'timeblock_arc0', count: record.timeblock_arc0 },
    { key: 'timeblock_arc1', count: record.timeblock_arc1 },
    { key: 'timeblock_arc2', count: record.timeblock_arc2 },
    { key: 'timeblock_arc3', count: record.timeblock_arc3 },
    { key: 'timeblock_arc4', count: record.timeblock_arc4 },
  ];
  arcCounts.sort((a, b) => b.count - a.count);
  const highest = arcCounts[0];
  return highest && highest.count > 0 ? ARC_METADATA[highest.key]?.title || null : null;
}

function parseJsonArray(val: unknown): string[] {
  if (Array.isArray(val)) return val;
  if (typeof val === 'string' && val.trim() !== '') {
    try {
      const parsed = JSON.parse(val);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return [];
}

export async function fetchEligibleTier4List(
  projectId: string,
  forceRefresh = false
): Promise<VinylDisplayCard[]> {
  if (!forceRefresh && cachedEligibleTier4List) {
    return cachedEligibleTier4List;
  }

  const t4Res = await executeOrder<Record<string, Record<string, unknown>>>({
    project_id: projectId,
    tier: '4',
    order: { action: 'read_all' },
  });
  const t4Data = t4Res.data || {};

  const list: VinylDisplayCard[] = [];
  let indexCounter = 1;

  for (const [id, rawT4] of Object.entries(t4Data)) {
    const t4Item = (rawT4 as Record<string, unknown>) || {};
    const rawHazard = t4Item.hazard_level;
    const hazard =
      rawHazard !== undefined && rawHazard !== null && !isNaN(Number(rawHazard))
        ? Number(rawHazard)
        : 3.0;

    if (hazard <= 3.0) continue;

    const rawPlayed = t4Item.played;
    const played =
      rawPlayed !== undefined && rawPlayed !== null && !isNaN(Number(rawPlayed))
        ? Number(rawPlayed)
        : 0;

    list.push({
      id,
      dbIndex: indexCounter++,
      title: `Track ${id}`,
      channel: '',
      duration: null,
      hazard_level: hazard,
      played,
      timeblock: (t4Item.timeblock as string) || null,
      unlock_date: (t4Item.unlock_date as string) || null,
      rankCategory: getRankFromScore(hazard),
    });
  }

  cachedEligibleTier4List = list;
  return list;
}

// =============================================================================
// [SINGLE-REQUEST BATCH READ FOR 16 PAGE ITEMS]
// =============================================================================
export async function resolvePageMetadataOnDemand(
  projectId: string,
  pageTracks: VinylDisplayCard[]
): Promise<VinylDisplayCard[]> {
  if (pageTracks.length === 0) return [];

  const missingIds = pageTracks
    .map((t) => t.id)
    .filter((id) => !tier1MemoryCache[id]);

  if (missingIds.length > 0) {
    try {
      const res = await executeOrder<Record<string, Tier1StaticItem>>({
        project_id: projectId,
        tier: '1',
        order: { action: 'batch_read', data: missingIds },
      });
      const dataMap = res.data || {};
      for (const [id, staticInfo] of Object.entries(dataMap)) {
        tier1MemoryCache[id] = staticInfo;
      }
    } catch (e) {
      console.warn(`[LazyTier1 Batch] Lỗi tải batch ${missingIds.length} items:`, e);
    }
  }

  return pageTracks.map((item) => {
    const staticInfo = tier1MemoryCache[item.id];
    return {
      ...item,
      title: staticInfo?.title || item.title,
      channel:
        staticInfo?.channel_name ||
        staticInfo?.channel ||
        staticInfo?.artist ||
        'Unknown Origin',
      duration: staticInfo?.duration ?? null,
    };
  });
}

export async function fetchTier3State(projectId: string): Promise<Tier3StateRecord[]> {
  const result = await executeOrder<Record<string, Record<string, unknown>>>({
    project_id: projectId,
    tier: '3',
    order: { action: 'read_all' },
  });

  const rawData = result.data || {};
  return Object.entries(rawData).map(([id, row]) => ({
    id,
    score_3_count: parseJsonArray(row.score_3_count),
    score_4_count: parseJsonArray(row.score_4_count),
    score_5_count: parseJsonArray(row.score_5_count),
    score_6_count: parseJsonArray(row.score_6_count),
    score_7_count: parseJsonArray(row.score_7_count),
    timeblock_arc0: Number(row.timeblock_arc0) || 0,
    timeblock_arc1: Number(row.timeblock_arc1) || 0,
    timeblock_arc2: Number(row.timeblock_arc2) || 0,
    timeblock_arc3: Number(row.timeblock_arc3) || 0,
    timeblock_arc4: Number(row.timeblock_arc4) || 0,
    unlock_date: (row.unlock_date as string) || null,
  }));
}

export async function syncRawinfoMinusBlacklistToTier1(projectId: string): Promise<{
  totalActive: number;
  excludedCount: number;
}> {
  await executeOrder({
    project_id: projectId,
    tier: 'rawinfo',
    order: { action: 'seed_if_missing', data: { source_tier: '1' } },
  });

  const [blacklistRes, badKpiRes] = await Promise.all([
    executeOrder<Record<string, Record<string, unknown>>>({
      project_id: projectId,
      tier: 'blacklist',
      order: { action: 'read_all' },
    }),
    executeOrder<Record<string, Record<string, unknown>>>({
      project_id: projectId,
      tier: 'bad_kpi',
      order: { action: 'read_all' },
    }),
  ]);

  const excludedIds = Array.from(
    new Set([
      ...Object.keys(blacklistRes.data || {}),
      ...Object.keys(badKpiRes.data || {}),
    ])
  );

  if (excludedIds.length > 0) {
    await executeOrder({
      project_id: projectId,
      tier: '1',
      order: {
        action: 'batch_delete',
        data: excludedIds,
      },
    });
  }

  for (const k in tier1MemoryCache) delete tier1MemoryCache[k];
  invalidateVinylCache(projectId);

  return {
    totalActive: 0,
    excludedCount: excludedIds.length,
  };
}

export async function syncTier2ToTier3(projectId: string) {
  const tier2Res = await executeOrder<Tier2EventEntry[]>({
    project_id: projectId,
    tier: '2',
    order: { action: 'read_all' },
  });
  const rawEvents = Array.isArray(tier2Res.data) ? tier2Res.data : [];
  if (rawEvents.length === 0) {
    return { eventsProcessed: 0, updatedTracksCount: 0, blockedCount: 0, staticSynced: false };
  }

  const currentT3 = await fetchTier3State(projectId);
  const stateMap: Record<string, Tier3StateRecord> = {};
  currentT3.forEach((r) => {
    stateMap[r.id] = r;
  });

  const modifiedStateIds = new Set<string>();
  const blockedPayloadMap: Record<string, { id: string; blocked_at: string }> = {};

  for (const evt of rawEvents) {
    if (!evt || !evt.id) continue;
    const act = (evt.action || '').toLowerCase().trim();

    if (act === 'block') {
      blockedPayloadMap[evt.id] = {
        id: evt.id,
        blocked_at: evt.timestamp || new Date().toISOString(),
      };
      continue;
    }

    if (!stateMap[evt.id]) {
      stateMap[evt.id] = {
        id: evt.id,
        score_3_count: [],
        score_4_count: [],
        score_5_count: [],
        score_6_count: [],
        score_7_count: [],
        timeblock_arc0: 0,
        timeblock_arc1: 0,
        timeblock_arc2: 0,
        timeblock_arc3: 0,
        timeblock_arc4: 0,
        unlock_date: null,
      };
    }
    const r = stateMap[evt.id];

    if (act === '3+' || act === 'cancel' || act === 'downvote') {
      r.score_3_count.push(evt.timestamp);
    } else if (act === '4+') {
      r.score_4_count.push(evt.timestamp);
    } else if (act === '5+' || act === 'continue') {
      r.score_5_count.push(evt.timestamp);
    } else if (act === '6+' || act === 'upvote') {
      r.score_6_count.push(evt.timestamp);
    } else if (act === '7+' || act === 'overflow') {
      r.score_7_count.push(evt.timestamp);
    }

    if (evt.timeblock) {
      const blocks = Array.isArray(evt.timeblock) ? evt.timeblock : [evt.timeblock];
      blocks.forEach((b) => {
        if (/arc\s*zero|kick/i.test(b)) r.timeblock_arc0++;
        else if (/arc\s*0?1|morning/i.test(b)) r.timeblock_arc1++;
        else if (/arc\s*0?2|battle/i.test(b)) r.timeblock_arc2++;
        else if (/arc\s*0?3|night/i.test(b)) r.timeblock_arc3++;
        else if (/arc\s*0?4|sacred/i.test(b)) r.timeblock_arc4++;
      });
    }
    modifiedStateIds.add(evt.id);
  }

  if (Object.keys(blockedPayloadMap).length > 0) {
    await executeOrder({
      project_id: projectId,
      tier: 'blacklist',
      order: {
        action: 'batch_upsert',
        data: blockedPayloadMap,
      },
    });
  }

  let staticSynced = false;
  if (Object.keys(blockedPayloadMap).length > 0) {
    try {
      await syncRawinfoMinusBlacklistToTier1(projectId);
      staticSynced = true;
    } catch (e) {
      console.error('[Blacklist->Static] Lỗi trừ ID khỏi _1_static.db:', e);
    }
  }

  if (modifiedStateIds.size > 0) {
    const t3BatchData: Record<string, Record<string, unknown>> = {};
    for (const id of modifiedStateIds) {
      const r = stateMap[id];
      t3BatchData[id] = {
        score_3_count: JSON.stringify(r.score_3_count),
        score_4_count: JSON.stringify(r.score_4_count),
        score_5_count: JSON.stringify(r.score_5_count),
        score_6_count: JSON.stringify(r.score_6_count),
        score_7_count: JSON.stringify(r.score_7_count),
        timeblock_arc0: r.timeblock_arc0,
        timeblock_arc1: r.timeblock_arc1,
        timeblock_arc2: r.timeblock_arc2,
        timeblock_arc3: r.timeblock_arc3,
        timeblock_arc4: r.timeblock_arc4,
        unlock_date: r.unlock_date,
      };
    }

    await executeOrder({
      project_id: projectId,
      tier: '3',
      order: {
        action: 'batch_upsert',
        data: t3BatchData,
      },
    });
  }

  await executeOrder({ project_id: projectId, tier: '2', order: { action: 'clear' } });

  return {
    eventsProcessed: rawEvents.length,
    updatedTracksCount: modifiedStateIds.size,
    blockedCount: Object.keys(blockedPayloadMap).length,
    staticSynced,
  };
}

export async function syncTier3ToTier4(projectId: string) {
  const t3Records = await fetchTier3State(projectId);
  const badKpiMap: Record<string, { id: string; hazard_level: number; purged_at: string }> = {};
  const t4ValidBatchMap: Record<string, Record<string, unknown>> = {};

  for (const t3 of t3Records) {
    const hazard = calculateHazardLevel(t3);

    if (hazard < 2.0) {
      badKpiMap[t3.id] = {
        id: t3.id,
        hazard_level: hazard,
        purged_at: new Date().toISOString(),
      };
      continue;
    }

    t4ValidBatchMap[t3.id] = {
      id: t3.id,
      hazard_level: hazard,
      played: calculateTotalPlayed(t3),
      timeblock: getDominantTimeblock(t3),
      unlock_date: t3.unlock_date,
    };
  }

  if (Object.keys(t4ValidBatchMap).length > 0) {
    await executeOrder({
      project_id: projectId,
      tier: '4',
      order: {
        action: 'batch_upsert',
        data: t4ValidBatchMap,
      },
    });
  }

  const badKpiIds = Object.keys(badKpiMap);
  if (badKpiIds.length > 0) {
    await Promise.all([
      executeOrder({
        project_id: projectId,
        tier: '4',
        order: { action: 'batch_delete', data: badKpiIds },
      }),
      executeOrder({
        project_id: projectId,
        tier: '3',
        order: { action: 'batch_delete', data: badKpiIds },
      }),
      executeOrder({
        project_id: projectId,
        tier: 'bad_kpi',
        order: { action: 'batch_upsert', data: badKpiMap },
      }),
    ]);

    try {
      await syncRawinfoMinusBlacklistToTier1(projectId);
    } catch (e) {
      console.error('[BadKPI->Static] Lỗi lọc ID khỏi _1_static.db:', e);
    }
  }

  invalidateVinylCache(projectId);
  return {
    syncedCount: Object.keys(t4ValidBatchMap).length,
    purgedCount: badKpiIds.length,
    badKpiIds,
  };
}
