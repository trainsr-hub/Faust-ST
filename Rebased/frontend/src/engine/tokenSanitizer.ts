import { TargetEngine } from '../types/schema';

/**
 * Strips formatting brackets, parentheses, and arithmetic weights from token strings for clean comparison.
 */
export function cleanTokenForComparison(token: string): string {
  return String(token)
    .toLowerCase()
    .replace(/[()\[\]{}]/g, '')
    .replace(/:\d+(\.\d+)?/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Formats a token with weight according to the target engine syntax.
 */
export function formatTokenWithWeight(token: string, weight: number, engine: TargetEngine): string {
  const trimmed = token.trim();
  if (!trimmed) return '';

  // LoRA tags and specialized syntax should not be double-bracketed
  if (trimmed.startsWith('<lora:') || trimmed.startsWith('<embedding:')) {
    return trimmed;
  }

  // If weight is effectively neutral (1.0), output raw
  if (Math.abs(weight - 1.0) < 0.02) {
    return trimmed;
  }

  const roundedWeight = Math.round(weight * 100) / 100;

  switch (engine) {
    case 'ComfyUI':
    case 'SD_WebUI':
      return `(${trimmed}:${roundedWeight})`;

    case 'NovelAI':
      if (roundedWeight > 1.0) {
        const plusCount = Math.min(5, Math.round((roundedWeight - 1.0) / 0.05));
        return '{'.repeat(plusCount) + trimmed + '}'.repeat(plusCount);
      } else {
        const minusCount = Math.min(5, Math.round((1.0 - roundedWeight) / 0.05));
        return '['.repeat(minusCount) + trimmed + ']'.repeat(minusCount);
      }

    case 'Midjourney':
      return `${trimmed}::${roundedWeight}`;

    case 'Flux':
    default:
      // Flux prefers descriptive natural phrasing rather than numerical brackets
      return trimmed;
  }
}

/**
 * Normalizes, deduplicates, and formats a list of prompt chunks into a cohesive master prompt string.
 */
export function assembleCleanPrompt(
  chunks: { token: string; weight: number }[],
  engine: TargetEngine,
  forbiddenKeywords: string[] = []
): { prompt: string; tokenCount: number; loras: string[] } {
  const seenClean = new Set<string>();
  const outputTokens: string[] = [];
  const loras: string[] = [];

  const forbiddenSet = new Set(forbiddenKeywords.map((k) => k.toLowerCase().trim()));

  for (const chunk of chunks) {
    if (!chunk.token || !chunk.token.trim()) continue;

    // Split multiple comma-separated tokens if present in a single node
    const subTokens = chunk.token
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    for (const sub of subTokens) {
      // Check for LoRA
      if (sub.startsWith('<lora:')) {
        if (!loras.includes(sub)) {
          loras.push(sub);
        }
        continue;
      }

      const clean = cleanTokenForComparison(sub);
      if (!clean) continue;

      // Filter against forbidden blacklist
      if (forbiddenSet.has(clean)) continue;

      // Deduplicate
      if (seenClean.has(clean)) continue;
      seenClean.add(clean);

      const formatted = formatTokenWithWeight(sub, chunk.weight, engine);
      if (formatted) {
        outputTokens.push(formatted);
      }
    }
  }

  const prompt = outputTokens.join(', ');
  // Approximate CLIP token estimation (~1.3 tokens per word)
  const tokenCount = Math.round(prompt.split(/[\s,]+/).filter(Boolean).length * 1.3);

  return { prompt, tokenCount, loras };
}

/**
 * Merges global negatives, auto-injected negatives based on active tags, and custom user strings.
 */
export function assembleNegativePrompt(
  globalNegatives: string[],
  autoNegatives: Record<string, string[]>,
  activeTags: string[],
  customNegative: string
): string {
  const seen = new Set<string>();
  const result: string[] = [];

  const addToken = (token: string) => {
    const trimmed = token.trim();
    const clean = cleanTokenForComparison(trimmed);
    if (clean && !seen.has(clean)) {
      seen.add(clean);
      result.push(trimmed);
    }
  };

  // 1. Global Negatives
  for (const neg of globalNegatives) {
    addToken(neg);
  }

  // 2. Auto-Negatives from active tags
  for (const tag of activeTags) {
    const matchedList = autoNegatives[tag.toLowerCase()];
    if (Array.isArray(matchedList)) {
      for (const neg of matchedList) {
        addToken(neg);
      }
    }
  }

  // 3. Custom Negative string
  if (customNegative) {
    const customParts = customNegative.split(',').map((t) => t.trim());
    for (const part of customParts) {
      addToken(part);
    }
  }

  return result.join(', ');
}
