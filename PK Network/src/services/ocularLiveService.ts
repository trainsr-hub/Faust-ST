import { api } from './api';
import {
  EyeColorModeRecord,
  PupilShapeRecord,
  EyeColorRecord,
  OcularState,
} from '../types/ocular';
import { COLOR_PALETTE } from './colorExtractor';

export interface OcularBootData {
  modes: EyeColorModeRecord[];
  shapes: PupilShapeRecord[];
  colors: EyeColorRecord[];
}

export const FALLBACK_MODES: EyeColorModeRecord[] = [
  {
    id: 'EYEM01A100010001',
    code: 'single',
    name: 'One Color',
    color_inputs: 1,
    base_prompt: '',
    prompt_pattern: '{color1} eyes',
    sort_order: 1,
  },
  {
    id: 'EYEM01A100010002',
    code: 'multi',
    name: 'Multi-Color',
    color_inputs: 2,
    base_prompt: 'multicolored eyes, gradient eyes, two-tone eyes',
    prompt_pattern: 'multicolored eyes, gradient eyes, two-tone eyes, {color1} eyes, {color2} eyes',
    sort_order: 2,
  },
  {
    id: 'EYEM01A100010003',
    code: 'heterochromia',
    name: 'Heterochromia',
    color_inputs: 2,
    base_prompt: 'heterochromia',
    prompt_pattern: 'heterochromia, {color1} eye, {color2} eye',
    sort_order: 3,
  },
];

export async function fetchOcularBootData(): Promise<OcularBootData> {
  const [modesRes, shapesRes, colorsRes] = await Promise.all([
    api.getRecords('eye_color_modes').catch(() => ({ records: [], count: 0 })),
    api.getRecords('pupil_shapes').catch(() => ({ records: [], count: 0 })),
    api.getRecords('eyes').catch(() => ({ records: [], count: 0 })),
  ]);

  const modes = (modesRes.records.length > 0 ? modesRes.records : FALLBACK_MODES) as EyeColorModeRecord[];
  const shapes = (shapesRes.records || []) as PupilShapeRecord[];
  const colors = (colorsRes.records || []) as EyeColorRecord[];

  return { modes, shapes, colors };
}

/**
 * Dynamically compiles ocular prompt tokens using the database table's prompt_pattern.
 */
export function compileDynamicOcularPrompt(
  state: OcularState,
  modes: EyeColorModeRecord[],
  shapes: PupilShapeRecord[]
): string {
  if (!state.isEnabled) return '';

  const tokens: string[] = [];
  const activeMode = modes.find((m) => m.code === state.mode) || modes[0];

  const c1Name = state.color1.replace(/ eyes?$/i, '').trim();
  const c2Name = state.color2.replace(/ eyes?$/i, '').trim();

  if (activeMode && activeMode.prompt_pattern) {
    const formatted = activeMode.prompt_pattern
      .replace(/\{color1\}/g, c1Name)
      .replace(/\{color2\}/g, c2Name);
    if (formatted.trim()) tokens.push(formatted.trim());
  } else {
    tokens.push(`${c1Name} eyes`);
  }

  // Iris shape token from database row
  const activeShape = shapes.find((s) => s.code === state.irisShape);
  if (activeShape && activeShape.prompt_token && activeShape.prompt_token.trim()) {
    tokens.push(activeShape.prompt_token.trim());
  }

  // Pupil color token
  if (state.pupilColor && state.pupilColor !== 'black') {
    tokens.push(`${state.pupilColor} pupils`);
  }

  return tokens.filter(Boolean).join(', ');
}

/**
 * Extracts recognized colors in chronological order of appearance in the prompt string.
 */
function extractOrderedColors(promptText: string, targetContext: 'eyes' | 'pupils'): string[] {
  if (!promptText) return [];
  const text = promptText.toLowerCase();
  const targetKeywords = targetContext === 'eyes'
    ? ['eyes', 'eye', 'iris']
    : ['pupils', 'pupil'];

  const matches: { index: number; colorId: string }[] = [];

  for (const color of COLOR_PALETTE) {
    for (const alias of color.aliases) {
      for (const kw of targetKeywords) {
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
  const orderedIds: string[] = [];
  for (const m of matches) {
    if (!seen.has(m.colorId)) {
      seen.add(m.colorId);
      orderedIds.push(m.colorId);
    }
  }

  return orderedIds;
}

/**
 * Reverse-engineers OcularState from an existing saved prompt (e.g. from an Eva record).
 * Automatically detects mode (multi/hetero/single), up to 2 iris colors, pupil shape, and pupil color.
 */
export function parseOcularStateFromPrompt(
  savedPrompt: string,
  shapes: PupilShapeRecord[] = []
): OcularState {
  if (!savedPrompt) {
    return {
      isEnabled: true,
      mode: 'single',
      color1: 'blue',
      color2: 'red',
      irisShape: 'round',
      pupilColor: 'black',
    };
  }

  const text = savedPrompt.toLowerCase();

  // 1. Detect Mode
  let mode: 'single' | 'multi' | 'heterochromia' = 'single';
  if (text.includes('multicolored eyes') || text.includes('gradient eyes') || text.includes('two-tone eyes')) {
    mode = 'multi';
  } else if (text.includes('heterochromia') || text.includes('odd eyes')) {
    mode = 'heterochromia';
  }

  // 2. Detect Iris Colors in strict prompt appearance order
  const detectedEyeColors = extractOrderedColors(savedPrompt, 'eyes');
  const color1 = detectedEyeColors[0] || 'blue';
  const color2 = detectedEyeColors[1] || (mode !== 'single' ? 'red' : color1);

  // 3. Detect Pupil Shape from database records
  let irisShape: any = 'round';
  for (const s of shapes) {
    const tok = (s.prompt_token || '').toLowerCase().trim();
    if (tok && text.includes(tok)) {
      irisShape = s.code;
      break;
    }
  }

  // 4. Detect Pupil Color (strictly requires pupil keyword)
  const detectedPupilColors = extractOrderedColors(savedPrompt, 'pupils');
  const pupilColor = detectedPupilColors[0] || 'black';

  return {
    isEnabled: true,
    mode,
    color1,
    color2,
    irisShape,
    pupilColor,
  };
}
