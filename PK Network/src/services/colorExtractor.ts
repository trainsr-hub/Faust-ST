/**
 * Universal Prompt Color Recognition & Palette Extraction Engine
 * Identifies color tokens from phrases like "blue eyes", "crimson hair", "gold highlights".
 */

export interface ColorDefinition {
  id: string;
  name: string;
  hex: string;
  darkHex: string;
  highlightHex: string;
  aliases: string[];
}

export interface RecognizedPromptColor {
  color: ColorDefinition;
  matchedPhrase: string;
  context: 'eyes' | 'pupils' | 'hair' | 'general';
}

export const COLOR_PALETTE: ColorDefinition[] = [
  { id: 'blue', name: 'Blue', hex: '#2563eb', darkHex: '#1d4ed8', highlightHex: '#60a5fa', aliases: ['blue', 'sapphire', 'azure', 'navy', 'cobalt'] },
  { id: 'aqua', name: 'Aqua / Cyan', hex: '#06b6d4', darkHex: '#0e7490', highlightHex: '#67e8f9', aliases: ['aqua', 'cyan', 'turquoise', 'teal'] },
  { id: 'red', name: 'Red', hex: '#dc2626', darkHex: '#991b1b', highlightHex: '#f87171', aliases: ['red', 'crimson', 'ruby', 'scarlet'] },
  { id: 'green', name: 'Green', hex: '#16a34a', darkHex: '#15803d', highlightHex: '#4ade80', aliases: ['green', 'emerald', 'forest', 'jade'] },
  { id: 'purple', name: 'Purple', hex: '#9333ea', darkHex: '#7e22ce', highlightHex: '#c084fc', aliases: ['purple', 'violet', 'amethyst', 'plum', 'magenta'] },
  { id: 'pink', name: 'Pink', hex: '#ec4899', darkHex: '#be185d', highlightHex: '#f472b6', aliases: ['pink', 'rose'] },
  { id: 'yellow', name: 'Yellow / Blonde', hex: '#eab308', darkHex: '#ca8a04', highlightHex: '#fde047', aliases: ['yellow', 'gold', 'golden', 'blonde', 'blond'] },
  { id: 'orange', name: 'Orange', hex: '#ea580c', darkHex: '#c2410c', highlightHex: '#fb923c', aliases: ['orange', 'amber'] },
  { id: 'brown', name: 'Brown', hex: '#92400e', darkHex: '#78350f', highlightHex: '#b45309', aliases: ['brown', 'hazel', 'chestnut'] },
  { id: 'grey', name: 'Grey', hex: '#64748b', darkHex: '#475569', highlightHex: '#94a3b8', aliases: ['grey', 'gray', 'silver', 'slate'] },
  { id: 'white', name: 'White', hex: '#f8fafc', darkHex: '#cbd5e1', highlightHex: '#ffffff', aliases: ['white', 'pearl', 'pale'] },
  { id: 'black', name: 'Black', hex: '#0f172a', darkHex: '#020617', highlightHex: '#334155', aliases: ['black', 'dark', 'obsidian', 'onyx'] },
];

/**
 * Resolves a color definition by ID or name alias.
 */
export function resolveColor(input: string): ColorDefinition {
  const norm = input.toLowerCase().trim();
  const direct = COLOR_PALETTE.find((c) => c.id === norm || c.name.toLowerCase() === norm);
  if (direct) return direct;

  const aliased = COLOR_PALETTE.find((c) => c.aliases.some((a) => a === norm));
  if (aliased) return aliased;

  return COLOR_PALETTE[0]; // fallback Blue
}

/**
 * Scans a prompt string and extracts targeted context-aware colors (e.g. "blue eyes", "silver hair").
 */
export function extractTargetedColors(
  promptText: string,
  targetContext: 'eyes' | 'pupils' | 'hair' | 'general' = 'eyes'
): RecognizedPromptColor[] {
  if (!promptText) return [];
  const text = promptText.toLowerCase();
  const results: RecognizedPromptColor[] = [];
  const seenColors = new Set<string>();

  const targetKeywords = targetContext === 'eyes'
    ? ['eyes', 'eye', 'iris']
    : targetContext === 'pupils'
    ? ['pupils', 'pupil']
    : targetContext === 'hair'
    ? ['hair', 'locks', 'braids', 'ponytail']
    : [];

  // Match alias + context keyword (e.g. "blue eyes", "crimson iris")
  for (const color of COLOR_PALETTE) {
    for (const alias of color.aliases) {
      for (const kw of targetKeywords) {
        const phraseRegex = new RegExp(`\\b${alias}\\s+${kw}\\b`, 'i');
        if (phraseRegex.test(text) && !seenColors.has(color.id)) {
          seenColors.add(color.id);
          results.push({
            color,
            matchedPhrase: `${alias} ${kw}`,
            context: targetContext,
          });
        }
      }
    }
  }

  // Fallback: match standalone color tokens if no targeted combo matched
  if (results.length === 0) {
    for (const color of COLOR_PALETTE) {
      for (const alias of color.aliases) {
        const wordRegex = new RegExp(`\\b${alias}\\b`, 'i');
        if (wordRegex.test(text) && !seenColors.has(color.id)) {
          seenColors.add(color.id);
          results.push({
            color,
            matchedPhrase: alias,
            context: 'general',
          });
        }
      }
    }
  }

  return results;
}

/**
 * Scans a prompt string (e.g. "blue eyes, long silver hair") and extracts all recognized colors.
 */
export function extractColorsFromPrompt(promptText: string): ColorDefinition[] {
  return extractTargetedColors(promptText, 'general').map((r) => r.color);
}
