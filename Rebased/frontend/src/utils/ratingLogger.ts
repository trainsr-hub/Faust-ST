import { App, normalizePath } from 'obsidian';
import {
  PromptRatingRecord,
  RatingScore,
  ComponentPerformanceStats,
} from '../types/schema';

export const RATINGS_JSONL_PATH = 'Hazard_Trigger_Data/ratings.jsonl';

function cleanPath(p: string): string {
  return normalizePath(p).replace(/\\/g, '/');
}

export class RatingLogger {
  /**
   * Appends a new prompt rating record to Hazard_Trigger_Data/ratings.jsonl.
   */
  public static async appendRating(app: App, record: PromptRatingRecord): Promise<void> {
    const adapter = app.vault.adapter;
    const filePath = cleanPath(RATINGS_JSONL_PATH);
    const folderPath = cleanPath('Hazard_Trigger_Data');

    if (!(await adapter.exists(folderPath))) {
      try {
        await adapter.mkdir(folderPath);
      } catch (e) {
        console.warn('[RatingLogger] Folder creation:', e);
      }
    }

    const line = JSON.stringify(record) + '\n';

    try {
      if (await adapter.exists(filePath)) {
        const existing = await adapter.read(filePath);
        await adapter.write(filePath, existing + line);
      } else {
        await adapter.write(filePath, line);
      }
    } catch (err) {
      console.error('[RatingLogger] Failed to append rating to JSONL:', err);
    }
  }

  /**
   * Reads all rating records from Hazard_Trigger_Data/ratings.jsonl.
   */
  public static async readAllRatings(app: App): Promise<PromptRatingRecord[]> {
    const adapter = app.vault.adapter;
    const filePath = cleanPath(RATINGS_JSONL_PATH);
    const records: PromptRatingRecord[] = [];

    try {
      if (await adapter.exists(filePath)) {
        const content = await adapter.read(filePath);
        const lines = content.split('\n');

        for (const line of lines) {
          const trimmed = line.trim();
          if (trimmed) {
            try {
              const parsed = JSON.parse(trimmed);
              if (parsed && parsed.id && parsed.rating) {
                records.push(parsed as PromptRatingRecord);
              }
            } catch (err) {
              console.warn('[RatingLogger] Skipping malformed JSONL line:', err);
            }
          }
        }
      }
    } catch (err) {
      console.error('[RatingLogger] Error reading ratings.jsonl:', err);
    }

    return records;
  }

  /**
   * Computes component-level historical performance statistics from rating records.
   */
  public static computeComponentPerformance(
    records: PromptRatingRecord[]
  ): ComponentPerformanceStats[] {
    const map = new Map<
      string,
      {
        relPath: string;
        key: string;
        displayName: string;
        scores: number[];
        ratingsCount: Record<RatingScore, number>;
      }
    >();

    for (const record of records) {
      const score = record.rating;
      if (![3, 4, 5, 6, 7].includes(score)) continue;

      for (const comp of record.resolvedComponents) {
        const compId = `${comp.relPath}::${comp.key}`;
        if (!map.has(compId)) {
          map.set(compId, {
            relPath: comp.relPath,
            key: comp.key,
            displayName: comp.displayName || comp.key,
            scores: [],
            ratingsCount: { 3: 0, 4: 0, 5: 0, 6: 0, 7: 0 },
          });
        }

        const data = map.get(compId)!;
        data.scores.push(score);
        data.ratingsCount[score as RatingScore]++;
      }
    }

    const results: ComponentPerformanceStats[] = [];

    for (const data of map.values()) {
      const totalRolls = data.scores.length;
      if (totalRolls === 0) continue;

      const sum = data.scores.reduce((a, b) => a + b, 0);
      const avgRating = Math.round((sum / totalRolls) * 100) / 100;
      const positiveCount = data.ratingsCount[5] + data.ratingsCount[6] + data.ratingsCount[7];
      const winRate = Math.round((positiveCount / totalRolls) * 100);

      let status: 'booster' | 'neutral' | 'culprit' = 'neutral';
      if (avgRating >= 5.8 && totalRolls >= 2) {
        status = 'booster';
      } else if (avgRating < 4.8 && totalRolls >= 2) {
        status = 'culprit';
      }

      results.push({
        relPath: data.relPath,
        key: data.key,
        displayName: data.displayName,
        totalRolls,
        avgRating,
        ratingsCount: data.ratingsCount,
        winRate,
        status,
      });
    }

    // Sort by total rolls descending, then avgRating
    results.sort((a, b) => {
      if (b.totalRolls !== a.totalRolls) return b.totalRolls - a.totalRolls;
      return a.avgRating - b.avgRating;
    });

    return results;
  }
}
