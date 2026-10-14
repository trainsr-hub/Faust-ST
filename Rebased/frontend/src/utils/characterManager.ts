import { App, normalizePath } from 'obsidian';
import {
  CharacterDefinition,
  CharacterFileInfo,
  CharacterFileStructure,
  CharacterPhase1Dna,
  CharacterOutfit,
  CompiledCharacterPrompt,
} from '../types/character';

export const CHARACTERS_ROOT_DIR = 'Hazard_Trigger_Data/Identity/Characters';

function cleanPath(p: string): string {
  return normalizePath(p).replace(/\\/g, '/');
}

export class CharacterManager {
  /**
   * Scans the Characters directory and all batch subfolders (e.g. TT01) for character JSON files.
   * High performance: Indexes directory paths and filenames without reading 1500+ file bodies on mount.
   */
  public static async listCharacters(app: App): Promise<CharacterFileInfo[]> {
    const adapter = app.vault.adapter;
    const rootDir = cleanPath(CHARACTERS_ROOT_DIR);
    const results: CharacterFileInfo[] = [];

    try {
      if (!(await adapter.exists(rootDir))) {
        await adapter.mkdir(rootDir);
        return results;
      }

      const rootListing = await adapter.list(rootDir);

      // 1. Check folders in root (e.g. TT01, TT02, etc.)
      for (const folderPath of rootListing.folders) {
        const normFolder = cleanPath(folderPath);
        const folderName = normFolder.split('/').pop() || '';
        try {
          const subListing = await adapter.list(normFolder);
          for (const filePath of subListing.files) {
            if (filePath.toLowerCase().endsWith('.json') && !filePath.includes('_registry')) {
              const normFile = cleanPath(filePath);
              const fileName = normFile.split('/').pop() || '';
              const id = fileName.replace(/\.json$/i, '');

              results.push({
                fileName,
                batchDir: folderName,
                relPath: normFile,
                id,
                canonicalName: id,
                series: folderName,
              });
            }
          }
        } catch (err) {
          console.warn(`[CharacterManager] Error reading batch folder ${folderPath}:`, err);
        }
      }

      // 2. Also check direct files in root
      for (const filePath of rootListing.files) {
        if (filePath.toLowerCase().endsWith('.json') && !filePath.includes('_registry')) {
          const normFile = cleanPath(filePath);
          const fileName = normFile.split('/').pop() || '';
          const id = fileName.replace(/\.json$/i, '');

          results.push({
            fileName,
            batchDir: '',
            relPath: normFile,
            id,
            canonicalName: id,
            series: '',
          });
        }
      }
    } catch (err) {
      console.error('[CharacterManager] Error listing characters:', err);
    }

    // Sort naturally by ID
    results.sort((a, b) => a.id.localeCompare(b.id, undefined, { numeric: true, sensitivity: 'base' }));
    return results;
  }

  /**
   * Loads a character file and returns the CharacterFileStructure.
   */
  public static async loadCharacterFile(app: App, relPath: string): Promise<CharacterFileStructure | null> {
    const adapter = app.vault.adapter;
    const p = cleanPath(relPath);

    if (!(await adapter.exists(p))) {
      return null;
    }

    try {
      const raw = await adapter.read(p);
      const parsed = JSON.parse(raw);
      if (!parsed || !parsed.default) {
        return null;
      }
      return parsed as CharacterFileStructure;
    } catch (err) {
      console.error(`[CharacterManager] Error loading character file ${relPath}:`, err);
      return null;
    }
  }

  /**
   * Saves a character file structure back to disk atomically.
   */
  public static async saveCharacterFile(
    app: App,
    relPath: string,
    structure: CharacterFileStructure
  ): Promise<void> {
    const adapter = app.vault.adapter;
    const p = cleanPath(relPath);
    const content = JSON.stringify(structure, null, 2);
    await adapter.write(p, content);
  }

  /**
   * Resolves a variant against the default definition by merging deltas.
   */
  public static resolveVariant(
    defaultDef: CharacterDefinition,
    variantPartial?: Partial<CharacterDefinition> | any
  ): CharacterDefinition {
    if (!variantPartial) return JSON.parse(JSON.stringify(defaultDef));

    const resolved: CharacterDefinition = JSON.parse(JSON.stringify(defaultDef));

    // Handle names (can be string[], CharacterNames object, or string)
    if (variantPartial.names !== undefined) {
      if (Array.isArray(variantPartial.names)) {
        resolved.names = [...variantPartial.names];
      } else if (typeof variantPartial.names === 'object' && variantPartial.names !== null) {
        resolved.names = {
          ...(typeof resolved.names === 'object' && !Array.isArray(resolved.names) ? resolved.names : {}),
          ...variantPartial.names,
        };
      } else {
        resolved.names = variantPartial.names;
      }
    }

    // Handle associate (can be string[], CharacterAssociate object, or string)
    if (variantPartial.associate !== undefined) {
      if (Array.isArray(variantPartial.associate)) {
        resolved.associate = [...variantPartial.associate];
      } else if (typeof variantPartial.associate === 'object' && variantPartial.associate !== null) {
        resolved.associate = {
          ...(typeof resolved.associate === 'object' && !Array.isArray(resolved.associate) ? resolved.associate : {}),
          ...variantPartial.associate,
        };
      } else {
        resolved.associate = variantPartial.associate;
      }
    }

    if (variantPartial.hazardLevel) {
      resolved.hazardLevel = {
        ...(resolved.hazardLevel || { hazardScore: 0 }),
        ...variantPartial.hazardLevel,
      };
    }
    if (variantPartial.taxonomy) {
      resolved.taxonomy = {
        ...(resolved.taxonomy || {}),
        ...variantPartial.taxonomy,
      };
    }
    if (variantPartial._prpt_ !== undefined) {
      resolved._prpt_ = variantPartial._prpt_;
    }
    if (variantPartial.prompt !== undefined) {
      resolved.prompt = variantPartial.prompt;
    }
    if (variantPartial.outfit !== undefined) {
      resolved.outfit = variantPartial.outfit;
    }
    if (variantPartial.dna_phase1) {
      resolved.dna_phase1 = {
        ...resolved.dna_phase1,
        ...variantPartial.dna_phase1,
        hair: {
          ...(resolved.dna_phase1?.hair || {}),
          ...(variantPartial.dna_phase1.hair || {}),
        },
        eyes: {
          ...(resolved.dna_phase1?.eyes || {}),
          ...(variantPartial.dna_phase1.eyes || {}),
        },
        physique: {
          ...(resolved.dna_phase1?.physique || {}),
          ...(variantPartial.dna_phase1.physique || {}),
        },
      };
    }
    if (variantPartial.outfits) {
      resolved.outfits = {
        ...(resolved.outfits || {}),
        ...(variantPartial.outfits || {}),
      };
    }

    return resolved;
  }

  /**
   * Returns a friendly display name for a variant.
   */
  public static getVariantDisplayName(variantDef: any, variantKey: string): string {
    if (!variantDef) return variantKey;

    if (variantKey === 'default') {
      if (typeof variantDef.names === 'string') return variantDef.names;
      if (Array.isArray(variantDef.names) && variantDef.names.length > 0) return variantDef.names[0];
      if (variantDef.names?.canonical) return variantDef.names.canonical;
      if (Array.isArray(variantDef.names?.names) && variantDef.names.names.length > 0) return variantDef.names.names[0];
      return 'Default';
    }

    if (typeof variantDef.names === 'string') return variantDef.names;
    if (Array.isArray(variantDef.names) && variantDef.names.length > 0) return variantDef.names[0];
    if (variantDef.names?.canonical) return variantDef.names.canonical;
    if (Array.isArray(variantDef.names?.names) && variantDef.names.names.length > 0) return variantDef.names.names[0];

    // Fallback: format ego_01 -> Ego 01
    if (variantKey.startsWith('ego_')) {
      return variantKey.replace('ego_', 'Ego ');
    }
    return variantKey;
  }

  /**
   * Sets the display name for a variant in-place.
   */
  public static setVariantDisplayName(variantDef: any, newName: string): any {
    if (!variantDef) return variantDef;
    if (Array.isArray(variantDef.names)) {
      variantDef.names = [newName];
    } else if (typeof variantDef.names === 'object' && variantDef.names !== null) {
      if (variantDef.names.canonical !== undefined || variantDef.names.names !== undefined) {
        variantDef.names.canonical = newName;
        if (Array.isArray(variantDef.names.names)) {
          variantDef.names.names = [newName, ...variantDef.names.names.slice(1)];
        }
      } else {
        variantDef.names.canonical = newName;
      }
    } else {
      variantDef.names = [newName];
    }
    return variantDef;
  }

  /**
   * Creates a new variant (e.g. ego_01, ego_02) in the file structure.
   */
  public static createVariant(
    structure: CharacterFileStructure,
    baseVariantKey: string = 'default',
    initialName?: string
  ): { structure: CharacterFileStructure; newVariantKey: string } {
    const updated: CharacterFileStructure = JSON.parse(JSON.stringify(structure));

    // Find next available ego_## index
    let nextIndex = 1;
    while (updated[`ego_${String(nextIndex).padStart(2, '0')}`]) {
      nextIndex++;
    }
    const newVariantKey = `ego_${String(nextIndex).padStart(2, '0')}`;
    const name = initialName || `Variant ${nextIndex}`;

    const baseDef = baseVariantKey === 'default' ? updated.default : updated[baseVariantKey] || updated.default;

    updated[newVariantKey] = {
      names: [name],
      _prpt_: baseDef._prpt_ || baseDef.prompt || updated.default._prpt_ || updated.default.prompt || '',
      outfit: baseDef.outfit || updated.default.outfit || '',
    };

    return { structure: updated, newVariantKey };
  }

  /**
   * Deletes a variant from the file structure. (Safety: Cannot delete 'default').
   */
  public static deleteVariant(
    structure: CharacterFileStructure,
    variantKey: string
  ): CharacterFileStructure {
    if (variantKey === 'default') {
      console.warn('[CharacterManager] Cannot delete default variant.');
      return structure;
    }
    const updated: CharacterFileStructure = JSON.parse(JSON.stringify(structure));
    delete updated[variantKey];
    return updated;
  }

  /**
   * Compiles the full character prompt deconstructed into Phase 1 (Physical DNA) and Phase 2 (Outfit).
   */
  public static compilePrompt(
    phase1Dna?: CharacterPhase1Dna,
    outfit?: CharacterOutfit,
    layerToggles: Record<string, boolean> = {},
    customWeights: Record<string, number> = {}
  ): CompiledCharacterPrompt {
    const phase1Tokens: string[] = [];
    const phase2Tokens: string[] = [];

    // Format single token with weight if !== 1
    const formatToken = (tok: string): string => {
      const clean = tok.trim();
      if (!clean) return '';
      const weight = customWeights[clean];
      if (weight !== undefined && weight !== 1.0) {
        return `(${clean}:${weight.toFixed(2)})`;
      }
      return clean;
    };

    // 1. Phase 1: Invariant Physical DNA
    if (phase1Dna) {
      // Character Trigger
      if (phase1Dna.character_trigger?.length) {
        phase1Dna.character_trigger.forEach((t) => {
          const formatted = formatToken(t);
          if (formatted) phase1Tokens.push(formatted);
        });
      }

      // Hair
      if (phase1Dna.hair?.color?.length) {
        phase1Dna.hair.color.forEach((t) => {
          const formatted = formatToken(t);
          if (formatted) phase1Tokens.push(formatted);
        });
      }
      if (phase1Dna.hair?.style?.length) {
        phase1Dna.hair.style.forEach((t) => {
          const formatted = formatToken(t);
          if (formatted) phase1Tokens.push(formatted);
        });
      }
      if (phase1Dna.hair?.accessories?.length) {
        phase1Dna.hair.accessories.forEach((t) => {
          const formatted = formatToken(t);
          if (formatted) phase1Tokens.push(formatted);
        });
      }

      // Eyes
      if (phase1Dna.eyes?.color?.length) {
        phase1Dna.eyes.color.forEach((t) => {
          const formatted = formatToken(t);
          if (formatted) phase1Tokens.push(formatted);
        });
      }
      if (phase1Dna.eyes?.features?.length) {
        phase1Dna.eyes.features.forEach((t) => {
          const formatted = formatToken(t);
          if (formatted) phase1Tokens.push(formatted);
        });
      }

      // Physique & Facial Marks
      if (phase1Dna.physique?.body?.length) {
        phase1Dna.physique.body.forEach((t) => {
          const formatted = formatToken(t);
          if (formatted) phase1Tokens.push(formatted);
        });
      }
      if (phase1Dna.physique?.features?.length) {
        phase1Dna.physique.features.forEach((t) => {
          const formatted = formatToken(t);
          if (formatted) phase1Tokens.push(formatted);
        });
      }
    }

    // 2. Phase 2: Costume / Outfit Layer Matrix
    if (outfit?.layers) {
      const layerOrder = [
        'headwear',
        'neckwear',
        'outerwear',
        'tops',
        'bottoms',
        'legwear',
        'footwear',
        'props',
      ];

      // Standard layers
      for (const layerKey of layerOrder) {
        // Check if layer is enabled (default is true unless disabledLayers has it or toggle is false)
        const isLayerDisabledInOutfit = outfit.disabledLayers?.includes(layerKey);
        const isToggleActive = layerToggles[layerKey] !== undefined ? layerToggles[layerKey] : !isLayerDisabledInOutfit;

        if (isToggleActive) {
          const tags = outfit.layers[layerKey as keyof typeof outfit.layers];
          if (Array.isArray(tags)) {
            tags.forEach((t) => {
              const formatted = formatToken(t);
              if (formatted) phase2Tokens.push(formatted);
            });
          }
        }
      }

      // Custom additional layers
      for (const [layerKey, tags] of Object.entries(outfit.layers)) {
        if (!layerOrder.includes(layerKey) && Array.isArray(tags)) {
          const isToggleActive = layerToggles[layerKey] !== undefined ? layerToggles[layerKey] : true;
          if (isToggleActive) {
            tags.forEach((t) => {
              const formatted = formatToken(t);
              if (formatted) phase2Tokens.push(formatted);
            });
          }
        }
      }
    }

    // Deduplicate while preserving order
    const p1Unique = Array.from(new Set(phase1Tokens.filter(Boolean)));
    const p2Unique = Array.from(new Set(phase2Tokens.filter(Boolean)));
    const combined = Array.from(new Set([...p1Unique, ...p2Unique]));

    const phase1Prompt = p1Unique.join(', ');
    const phase2Prompt = p2Unique.join(', ');
    const masterPrompt = combined.join(', ');

    return {
      phase1Tokens: p1Unique,
      phase2Tokens: p2Unique,
      combinedTokens: combined,
      phase1Prompt,
      phase2Prompt,
      masterPrompt,
      tokenCount: combined.length,
    };
  }

  /**
   * Recursively crawls a JSON tree or table structure to collect all string prompt tokens for autosuggest.
   */
  public static extractAllSuggestions(node: any): string[] {
    const tokens: Set<string> = new Set();

    function crawl(val: any) {
      if (!val) return;
      if (typeof val === 'string') {
        const clean = val.trim();
        if (clean && clean.length > 1 && !clean.startsWith('#')) {
          tokens.add(clean);
        }
      } else if (Array.isArray(val)) {
        for (const item of val) {
          crawl(item);
        }
      } else if (typeof val === 'object') {
        for (const v of Object.values(val)) {
          crawl(v);
        }
      }
    }

    crawl(node);
    return Array.from(tokens).sort();
  }
}
