import { api } from './api';
import {
  HairColorModeRecord,
  HairColorRecord,
  HairState,
  HairColorMode,
  HairLength,
  HairTexture,
  HairBangs,
  HairFraming,
  HairAhoge,
  HAIR_LENGTH_ITEMS,
  HAIR_TEXTURE_ITEMS,
  HAIR_BANGS_ITEMS,
  HAIR_FRAMING_ITEMS,
  HAIR_AHOGE_ITEMS,
} from '../types/hair';
import { COLOR_PALETTE, resolveColor } from './colorExtractor';

export interface HairBootData {
  modes: HairColorModeRecord[];
  colors: HairColorRecord[];
}

export const FALLBACK_HAIR_MODES: HairColorModeRecord[] = [
  { id: 'HAIM01A100010001', code: 'single', name: 'One Color', category: 'single', color_inputs: 1, prompt_pattern: '{color1} hair', sort_order: 1 },
  { id: 'HAIM01A100010002', code: 'two_tone', name: 'Two-Tone', category: 'two_tone', color_inputs: 2, prompt_pattern: 'two-tone hair, {color1} hair, {color2} hair', sort_order: 2 },
  { id: 'HAIM01A100010003', code: 'split', name: 'Split-Color', category: 'two_tone', color_inputs: 2, prompt_pattern: 'two-tone hair, split-color hair, {color1} hair, {color2} hair', sort_order: 3 },
  { id: 'HAIM01A100010004', code: 'streaks', name: 'Streaks', category: 'two_tone', color_inputs: 2, prompt_pattern: 'two-tone hair, streaked hair, {color1} hair, {color2} streaks', sort_order: 4 },
  { id: 'HAIM01A100010005', code: 'striped', name: 'Striped', category: 'two_tone', color_inputs: 2, prompt_pattern: 'two-tone hair, striped hair, {color1} hair, {color2} stripes', sort_order: 5 },
  { id: 'HAIM01A100010006', code: 'inner_hair', name: 'Inner Hair', category: 'two_tone', color_inputs: 2, prompt_pattern: 'two-tone hair, colored inner hair, {color1} hair, {color2} inner hair', sort_order: 6 },
  { id: 'HAIM01A100010007', code: 'gradient', name: 'Gradient', category: 'gradient', color_inputs: 2, prompt_pattern: 'gradient hair, {color1} hair, {color2} hair', sort_order: 7 },
  { id: 'HAIM01A100010008', code: 'rainbow', name: 'Rainbow', category: 'gradient', color_inputs: 0, prompt_pattern: 'multicolored hair, rainbow hair, gradient hair', sort_order: 8 },
  { id: 'HAIM01A100010009', code: 'tips', name: 'Colored Tips', category: 'location', color_inputs: 2, prompt_pattern: 'colored tips, {color1} hair, {color2} tips', sort_order: 9 },
  { id: 'HAIM01A100010010', code: 'roots', name: 'Roots', category: 'location', color_inputs: 2, prompt_pattern: 'roots, {color1} hair, {color2} roots', sort_order: 10 },
];

export async function fetchHairBootData(): Promise<HairBootData> {
  const [modesRes, colorsRes] = await Promise.all([
    api.getRecords('hair_color_modes').catch(() => ({ records: [], count: 0 })),
    api.getRecords('hair_colors').catch(() => ({ records: [], count: 0 })),
  ]);

  const modes = (modesRes.records.length > 0 ? modesRes.records : FALLBACK_HAIR_MODES) as HairColorModeRecord[];
  const colors = (colorsRes.records || []) as HairColorRecord[];

  return { modes, colors };
}

/**
 * Dynamically compiles hair prompt tokens using the database table's prompt_pattern, length, and texture.
 */
export function compileDynamicHairPrompt(
  state: HairState,
  modes: HairColorModeRecord[]
): string {
  if (!state.isEnabled) return '';

  const activeModes = modes && modes.length > 0 ? modes : FALLBACK_HAIR_MODES;
  const modeDef = activeModes.find((m) => m.code === state.mode) || activeModes[0];

  const c1Def = resolveColor(state.color1);
  const c2Def = resolveColor(state.color2);

  const c1Name = (c1Def.id === 'yellow' ? 'blonde' : c1Def.id).toLowerCase();
  const c2Name = (c2Def.id === 'yellow' ? 'blonde' : c2Def.id).toLowerCase();

  let chromaticPart = '';
  if (state.mode === 'tips') {
    const blendPrefix = state.blendStyle === 'sharp' ? 'two-tone hair, ' : 'gradient hair, ';
    chromaticPart = `${blendPrefix}colored tips, ${c1Name} hair, ${c2Name} tips`;
  } else if (state.mode === 'roots') {
    const blendPrefix = state.blendStyle === 'sharp' ? 'two-tone hair, ' : 'gradient hair, ';
    chromaticPart = `${blendPrefix}roots, ${c1Name} hair, ${c2Name} roots`;
  } else {
    chromaticPart = (modeDef.prompt_pattern || '{color1} hair')
      .replace(/\{color1\}/g, c1Name)
      .replace(/\{color2\}/g, c2Name);
  }

  // Tier 2: Foundation (Length & Texture)
  const lengthDef = HAIR_LENGTH_ITEMS.find((l) => l.id === state.length);
  const lengthToken = lengthDef?.promptToken || '';

  const textureDef = HAIR_TEXTURE_ITEMS.find((t) => t.id === state.texture);
  const textureToken = textureDef?.promptToken || '';

  // Tier 3: Bangs & Crown Architecture
  const bangsDef = HAIR_BANGS_ITEMS.find((b) => b.id === state.bangs);
  const bangsToken = bangsDef?.promptToken || '';

  const framingDef = HAIR_FRAMING_ITEMS.find((f) => f.id === state.framing);
  const framingToken = framingDef?.promptToken || '';

  const ahogeDef = HAIR_AHOGE_ITEMS.find((a) => a.id === state.ahoge);
  const ahogeToken = ahogeDef?.promptToken || '';

  return [chromaticPart, lengthToken, textureToken, bangsToken, framingToken, ahogeToken].filter(Boolean).join(', ');
}

/**
 * Extracts hair color tokens in chronological order of appearance in prompt.
 */
function extractOrderedHairColors(promptText: string): string[] {
  if (!promptText) return [];
  const text = promptText.toLowerCase();
  const keywords = [
    'inner\\s+hair',
    'hair',
    'streaks',
    'stripes',
    'tips',
    'roots',
    'highlights',
    'locks',
    'braids',
    'ponytail',
    'twintails',
  ];
  const matches: { index: number; colorId: string }[] = [];

  for (const color of COLOR_PALETTE) {
    for (const alias of color.aliases) {
      for (const kw of keywords) {
        const regex = new RegExp(`\\b(${alias})\\s+${kw}\\b`, 'gi');
        let m: RegExpExecArray | null;
        while ((m = regex.exec(text)) !== null) {
          matches.push({ index: m.index, colorId: color.id });
        }
      }
    }
  }

  matches.sort((a, b) => a.index - b.index);

  const seen = new Set<string>();
  const ordered: string[] = [];
  for (const m of matches) {
    if (!seen.has(m.colorId)) {
      seen.add(m.colorId);
      ordered.push(m.colorId);
    }
  }
  return ordered;
}

/**
 * Reverse parses hair state from character prompt.
 */
export function parseHairStateFromPrompt(savedPrompt: string): HairState {
  if (!savedPrompt) {
    return {
      isEnabled: true,
      mode: 'single',
      color1: 'black',
      color2: 'blue',
      blendStyle: 'gradient',
      length: 'medium',
      texture: 'none',
    };
  }

  const text = savedPrompt.toLowerCase();

  let mode: HairColorMode = 'single';
  let blendStyle: 'sharp' | 'gradient' = 'gradient';

  if (text.includes('inner hair')) mode = 'inner_hair';
  else if (text.includes('colored tips') || text.includes('tips')) {
    mode = 'tips';
    if (text.includes('two-tone')) blendStyle = 'sharp';
  } else if (text.includes('roots')) {
    mode = 'roots';
    if (text.includes('two-tone')) blendStyle = 'sharp';
  } else if (text.includes('striped hair') || text.includes('striped')) {
    mode = 'striped';
  } else if (text.includes('rainbow hair') || text.includes('multicolored hair')) {
    mode = 'rainbow';
  } else if (text.includes('gradient hair')) {
    mode = 'gradient';
  } else if (text.includes('streaked hair') || text.includes('streaks')) {
    mode = 'streaks';
  } else if (text.includes('split-color hair')) {
    mode = 'split';
  } else if (text.includes('two-tone hair')) {
    mode = 'two_tone';
  }

  const detected = extractOrderedHairColors(savedPrompt);
  const color1 = detected[0] || 'black';
  const color2 = detected[1] || (color1 === 'black' ? 'blue' : 'black');

  // Tier 2: Length detection
  let length: HairLength = 'none';
  if (text.includes('absurdly long hair')) length = 'absurdly_long';
  else if (text.includes('very long hair')) length = 'very_long';
  else if (text.includes('very short hair')) length = 'very_short';
  else if (text.includes('short hair')) length = 'short';
  else if (text.includes('medium hair')) length = 'medium';
  else if (text.includes('long hair')) length = 'long';

  // Tier 2: Texture detection
  let texture: HairTexture = 'none';
  if (text.includes('straight hair')) texture = 'straight';
  else if (text.includes('wavy hair')) texture = 'wavy';
  else if (text.includes('curly hair')) texture = 'curly';
  else if (text.includes('fluffy hair')) texture = 'fluffy';
  else if (text.includes('messy hair')) texture = 'messy';
  else if (text.includes('spiked hair') || text.includes('spiky hair')) texture = 'spiky';
  else if (text.includes('drill hair')) texture = 'drill';
  else if (text.includes('ringlets')) texture = 'ringlets';
  else if (text.includes('flipped hair')) texture = 'flipped';

  // Tier 3: Bangs detection
  let bangs: HairBangs = 'none';
  if (text.includes('double-parted bangs')) bangs = 'double_parted';
  else if (text.includes('center-flap bangs')) bangs = 'center_flap';
  else if (text.includes('asymmetrical bangs')) bangs = 'asymmetrical';
  else if (text.includes('bangs pinned back')) bangs = 'pinned_back';
  else if (text.includes('blunt bangs')) bangs = 'blunt';
  else if (text.includes('parted bangs')) bangs = 'parted';
  else if (text.includes('swept bangs')) bangs = 'swept';
  else if (text.includes('wispy bangs')) bangs = 'wispy';
  else if (text.includes('crossed bangs')) bangs = 'crossed';
  else if (text.includes('fanged bangs')) bangs = 'fanged';
  else if (text.includes('choppy bangs')) bangs = 'choppy';
  else if (text.includes('short bangs')) bangs = 'short';
  else if (text.includes('long bangs')) bangs = 'long';

  // Tier 3: Facial Strands Framing detection
  let framing: HairFraming = 'none';
  if (text.includes('hair between eyes')) framing = 'between_eyes';
  else if (text.includes('hair over one eye')) framing = 'over_one_eye';
  else if (text.includes('hair over eyes')) framing = 'over_eyes';

  // Tier 3: Crown Ahoge / Antenna detection
  let ahoge: HairAhoge = 'none';
  if (text.includes('heart antenna hair')) ahoge = 'heart_antenna';
  else if (text.includes('antenna hair')) ahoge = 'antenna';
  else if (text.includes('heart ahoge')) ahoge = 'heart_ahoge';
  else if (text.includes('huge ahoge')) ahoge = 'huge_ahoge';
  else if (text.includes('ahoge')) ahoge = 'ahoge';

  return {
    isEnabled: true,
    mode,
    color1,
    color2,
    blendStyle,
    length,
    texture,
    bangs,
    framing,
    ahoge,
  };
}
