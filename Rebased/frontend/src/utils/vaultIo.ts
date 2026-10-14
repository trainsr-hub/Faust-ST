import { App, normalizePath } from 'obsidian';
import {
  Category,
  PromptNode,
  GachaPool,
  WildcardRegistry,
  ExclusionConfig,
  Preset,
} from '../types/schema';
import {
  DEFAULT_CATEGORIES,
  DEFAULT_NODES,
  DEFAULT_GACHA_POOLS,
  DEFAULT_WILDCARDS,
  DEFAULT_EXCLUSIONS,
  DEFAULT_PRESETS,
} from '../engine/defaultData';

export const DATA_FOLDER_PATH = 'Hazard_Trigger_Data';

export interface HazardVaultData {
  categories: Category[];
  nodes: PromptNode[];
  gachaPools: GachaPool[];
  wildcards: WildcardRegistry;
  exclusions: ExclusionConfig;
  presets: Preset[];
}

export class VaultIoManager {
  private static getPath(filename: string): string {
    return normalizePath(`${DATA_FOLDER_PATH}/${filename}`);
  }

  /**
   * Initializes the vault data folder and creates default JSON files if missing.
   */
  public static async bootstrap(app: App): Promise<HazardVaultData> {
    const adapter = app.vault.adapter;
    const folderExists = await adapter.exists(DATA_FOLDER_PATH);

    if (!folderExists) {
      try {
        await adapter.mkdir(DATA_FOLDER_PATH);
      } catch (e) {
        console.warn('[Hazard Trigger] Folder creation note:', e);
      }
    }

    const filesToSeed: { name: string; data: any }[] = [
      { name: 'categories.json', data: DEFAULT_CATEGORIES },
      { name: 'prompt_nodes.json', data: DEFAULT_NODES },
      { name: 'gacha_pools.json', data: DEFAULT_GACHA_POOLS },
      { name: 'wildcards.json', data: DEFAULT_WILDCARDS },
      { name: 'exclusions.json', data: DEFAULT_EXCLUSIONS },
      { name: 'presets.json', data: DEFAULT_PRESETS },
    ];

    for (const file of filesToSeed) {
      const filePath = this.getPath(file.name);
      const exists = await adapter.exists(filePath);
      if (!exists) {
        await adapter.write(filePath, JSON.stringify(file.data, null, 2));
      }
    }

    return await this.loadAll(app);
  }

  /**
   * Loads all JSON configuration files from the vault data directory.
   */
  public static async loadAll(app: App): Promise<HazardVaultData> {
    const adapter = app.vault.adapter;

    async function readJson<T>(filename: string, fallback: T): Promise<T> {
      const filePath = normalizePath(`${DATA_FOLDER_PATH}/${filename}`);
      try {
        if (await adapter.exists(filePath)) {
          const raw = await adapter.read(filePath);
          return JSON.parse(raw);
        }
      } catch (err) {
        console.error(`[Hazard Trigger] Failed reading ${filename}, falling back to defaults:`, err);
      }
      return fallback;
    }

    const categories = await readJson<Category[]>('categories.json', DEFAULT_CATEGORIES);
    const nodes = await readJson<PromptNode[]>('prompt_nodes.json', DEFAULT_NODES);
    const gachaPools = await readJson<GachaPool[]>('gacha_pools.json', DEFAULT_GACHA_POOLS);
    const wildcards = await readJson<WildcardRegistry>('wildcards.json', DEFAULT_WILDCARDS);
    const exclusions = await readJson<ExclusionConfig>('exclusions.json', DEFAULT_EXCLUSIONS);
    const presets = await readJson<Preset[]>('presets.json', DEFAULT_PRESETS);

    return {
      categories,
      nodes,
      gachaPools,
      wildcards,
      exclusions,
      presets,
    };
  }

  /**
   * Writes a specific JSON dataset to the vault data folder.
   */
  public static async saveFile<T>(app: App, filename: string, data: T): Promise<void> {
    const adapter = app.vault.adapter;
    const filePath = this.getPath(filename);
    const folderExists = await adapter.exists(DATA_FOLDER_PATH);

    if (!folderExists) {
      await adapter.mkdir(DATA_FOLDER_PATH);
    }

    await adapter.write(filePath, JSON.stringify(data, null, 2));
  }
}
