import { App, normalizePath } from 'obsidian';

export interface EmotionStateDefinition {
  id: string;
  label: string;
  emoji: string;
  color: string;
  borderColor: string;
  bgColor: string;
  activeBadgeClass: string;
  description: string;
  basePrompt: string;
}

export const EMOTION_MATRIX_FILE_PATH = 'Hazard_Trigger_Data/Emotion_Matrix.json';

function cleanPath(p: string): string {
  return normalizePath(p).replace(/\\/g, '/');
}

export const DEFAULT_EMOTION_STATES: EmotionStateDefinition[] = [
  {
    id: 'happy',
    label: 'Happy / Joyful',
    emoji: '💛',
    color: 'text-amber-400',
    borderColor: 'border-amber-400/50',
    bgColor: 'bg-amber-400/10',
    activeBadgeClass: 'bg-amber-400/20 text-amber-300 border-amber-400/60 shadow-amber-500/20',
    description: 'Warm smiles, cheerful grins, joyous laughter',
    basePrompt: 'happy, cheerful',
  },
  {
    id: 'embarrassed',
    label: 'Embarrassed / Shy',
    emoji: '🌸',
    color: 'text-pink-400',
    borderColor: 'border-pink-400/50',
    bgColor: 'bg-pink-400/10',
    activeBadgeClass: 'bg-pink-400/20 text-pink-300 border-pink-400/60 shadow-pink-500/20',
    description: 'Bashful blushes, shy smiles, averted gaze',
    basePrompt: 'blush, embarrassed, bashful',
  },
  {
    id: 'nervous',
    label: 'Nervous / Flustered',
    emoji: '⚡',
    color: 'text-cyan-400',
    borderColor: 'border-cyan-400/50',
    bgColor: 'bg-cyan-400/10',
    activeBadgeClass: 'bg-cyan-400/20 text-cyan-300 border-cyan-400/60 shadow-cyan-500/20',
    description: 'Awkward smiles, sweatdrops, trembling tension',
    basePrompt: 'nervous, flustered',
  },
  {
    id: 'smug',
    label: 'Smug / Teasing',
    emoji: '😼',
    color: 'text-purple-400',
    borderColor: 'border-purple-400/50',
    bgColor: 'bg-purple-400/10',
    activeBadgeClass: 'bg-purple-400/20 text-purple-300 border-purple-400/60 shadow-purple-500/20',
    description: 'Playful smirks, single fang, teasing glances',
    basePrompt: 'smug, smirk, teasing',
  },
  {
    id: 'seductive',
    label: 'Seductive / Alluring',
    emoji: '💋',
    color: 'text-rose-400',
    borderColor: 'border-rose-400/50',
    bgColor: 'bg-rose-400/10',
    activeBadgeClass: 'bg-rose-400/20 text-rose-300 border-rose-400/60 shadow-rose-500/20',
    description: 'Bedroom eyes, parted lips, seductive gaze',
    basePrompt: 'seductive, alluring, bedroom eyes',
  },
  {
    id: 'tsundere',
    label: 'Tsundere / Pouty',
    emoji: '💢',
    color: 'text-orange-400',
    borderColor: 'border-orange-400/50',
    bgColor: 'bg-orange-400/10',
    activeBadgeClass: 'bg-orange-400/20 text-orange-300 border-orange-400/60 shadow-orange-500/20',
    description: 'Pouting, blushing glares, averted frowns',
    basePrompt: 'tsundere, blush, pout',
  },
  {
    id: 'angry',
    label: 'Angry / Fierce',
    emoji: '🔥',
    color: 'text-red-500',
    borderColor: 'border-red-500/50',
    bgColor: 'bg-red-500/10',
    activeBadgeClass: 'bg-red-500/20 text-red-300 border-red-500/60 shadow-red-500/20',
    description: 'Furrowed brows, intense glares, clenched teeth',
    basePrompt: 'angry, glare, irritated',
  },
  {
    id: 'sad',
    label: 'Sad / Tearful',
    emoji: '💧',
    color: 'text-blue-400',
    borderColor: 'border-blue-400/50',
    bgColor: 'bg-blue-400/10',
    activeBadgeClass: 'bg-blue-400/20 text-blue-300 border-blue-400/60 shadow-blue-500/20',
    description: 'Crying tears, melancholy, sorrowful smiles',
    basePrompt: 'sad, tearful, melancholy',
  },
  {
    id: 'ecstasy',
    label: 'Ecstasy / Afterglow',
    emoji: '💖',
    color: 'text-fuchsia-400',
    borderColor: 'border-fuchsia-400/50',
    bgColor: 'bg-fuchsia-400/10',
    activeBadgeClass: 'bg-fuchsia-400/20 text-fuchsia-300 border-fuchsia-400/60 shadow-fuchsia-500/20',
    description: 'Afterglow, heavy blush, breathless bliss',
    basePrompt: 'afterglow, flushed face, breathless, blissful',
  },
  {
    id: 'ahegao',
    label: 'Ahegao / Mindbreak',
    emoji: '🌀',
    color: 'text-pink-500',
    borderColor: 'border-pink-500/50',
    bgColor: 'bg-pink-500/10',
    activeBadgeClass: 'bg-pink-500/20 text-pink-300 border-pink-500/60 shadow-pink-500/20',
    description: 'Rolled-back eyes, tongue out, intense pleasure',
    basePrompt: 'ahegao, rolled eyes, tongue out, drooling',
  },
  {
    id: 'serious',
    label: 'Serious / Focused',
    emoji: '🎯',
    color: 'text-emerald-400',
    borderColor: 'border-emerald-400/50',
    bgColor: 'bg-emerald-400/10',
    activeBadgeClass: 'bg-emerald-400/20 text-emerald-300 border-emerald-400/60 shadow-emerald-500/20',
    description: 'Focused gaze, sharp eyes, stern composure',
    basePrompt: 'serious, focused, intense gaze',
  },
  {
    id: 'deadpan',
    label: 'Deadpan / Kuudere',
    emoji: '🗿',
    color: 'text-slate-400',
    borderColor: 'border-slate-400/50',
    bgColor: 'bg-slate-400/10',
    activeBadgeClass: 'bg-slate-400/20 text-slate-300 border-slate-400/60 shadow-slate-500/20',
    description: 'Expressionless, cool composure, blank stare',
    basePrompt: 'expressionless, deadpan, empty eyes',
  },
  {
    id: 'shocked',
    label: 'Shocked / Surprised',
    emoji: '❗',
    color: 'text-yellow-400',
    borderColor: 'border-yellow-400/50',
    bgColor: 'bg-yellow-400/10',
    activeBadgeClass: 'bg-yellow-400/20 text-yellow-300 border-yellow-400/60 shadow-yellow-500/20',
    description: 'Startled gasps, wide eyes, open mouth',
    basePrompt: 'shocked, surprised, wide eyes',
  },
];

export class EmotionRegistry {
  /**
   * Loads Emotion Matrix definitions dynamically from Hazard_Trigger_Data/Emotion_Matrix.json.
   * Seeds default JSON file if not found.
   */
  public static async load(app: App): Promise<EmotionStateDefinition[]> {
    const adapter = app.vault.adapter;
    const filePath = cleanPath(EMOTION_MATRIX_FILE_PATH);

    try {
      if (await adapter.exists(filePath)) {
        const raw = await adapter.read(filePath);
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed as EmotionStateDefinition[];
        }
      } else {
        // Seed default file
        await adapter.write(filePath, JSON.stringify(DEFAULT_EMOTION_STATES, null, 2));
      }
    } catch (err) {
      console.warn('[EmotionRegistry] Error reading Emotion_Matrix.json:', err);
    }

    return DEFAULT_EMOTION_STATES;
  }
}
