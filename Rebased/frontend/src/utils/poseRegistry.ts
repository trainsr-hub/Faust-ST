import { App, normalizePath } from 'obsidian';

export interface PoseStateDefinition {
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

export const POSE_MATRIX_FILE_PATH = 'Hazard_Trigger_Data/Pose_Matrix.json';

function cleanPath(p: string): string {
  return normalizePath(p).replace(/\\/g, '/');
}

export const DEFAULT_POSE_STATES: PoseStateDefinition[] = [
  {
    id: 'standing',
    label: 'Standing',
    emoji: '🧍',
    color: 'text-emerald-400',
    borderColor: 'border-emerald-400/50',
    bgColor: 'bg-emerald-400/10',
    activeBadgeClass: 'bg-emerald-400/20 text-emerald-300 border-emerald-400/60 shadow-emerald-500/20',
    description: 'Upright standing stance, leaning, walking, active arm gestures',
    basePrompt: 'standing',
  },
  {
    id: 'sitting',
    label: 'Sitting (Ground)',
    emoji: '🧘',
    color: 'text-amber-400',
    borderColor: 'border-amber-400/50',
    bgColor: 'bg-amber-400/10',
    activeBadgeClass: 'bg-amber-400/20 text-amber-300 border-amber-400/60 shadow-amber-500/20',
    description: 'Floor sitting, lotus, legs crossed, ground relaxed pose',
    basePrompt: 'sitting, on ground',
  },
  {
    id: 'chair',
    label: 'Sitting (Chair)',
    emoji: '🪑',
    color: 'text-sky-400',
    borderColor: 'border-sky-400/50',
    bgColor: 'bg-sky-400/10',
    activeBadgeClass: 'bg-sky-400/20 text-sky-300 border-sky-400/60 shadow-sky-500/20',
    description: 'Chair, stool, armchair, bench, seated posture',
    basePrompt: 'sitting, chair',
  },
  {
    id: 'kneeling',
    label: 'Kneeling / Seiza',
    emoji: '🧎',
    color: 'text-indigo-400',
    borderColor: 'border-indigo-400/50',
    bgColor: 'bg-indigo-400/10',
    activeBadgeClass: 'bg-indigo-400/20 text-indigo-300 border-indigo-400/60 shadow-indigo-500/20',
    description: 'Formal seiza, on knees, w-sitting floor pose',
    basePrompt: 'kneeling',
  },
  {
    id: 'lying',
    label: 'Lying / Recumbent',
    emoji: '🛌',
    color: 'text-fuchsia-400',
    borderColor: 'border-fuchsia-400/50',
    bgColor: 'bg-fuchsia-400/10',
    activeBadgeClass: 'bg-fuchsia-400/20 text-fuchsia-300 border-fuchsia-400/60 shadow-fuchsia-500/20',
    description: 'Lying on back, stomach, or side, propped on elbows',
    basePrompt: 'lying',
  },
  {
    id: 'all_fours',
    label: 'All Fours',
    emoji: '🐾',
    color: 'text-rose-400',
    borderColor: 'border-rose-400/50',
    bgColor: 'bg-rose-400/10',
    activeBadgeClass: 'bg-rose-400/20 text-rose-300 border-rose-400/60 shadow-rose-500/20',
    description: 'On hands and knees, crawling, arched back',
    basePrompt: 'all fours, on hands and knees',
  },
  {
    id: 'squatting',
    label: 'Squatting / Crouched',
    emoji: '👟',
    color: 'text-teal-400',
    borderColor: 'border-teal-400/50',
    bgColor: 'bg-teal-400/10',
    activeBadgeClass: 'bg-teal-400/20 text-teal-300 border-teal-400/60 shadow-teal-500/20',
    description: 'Squatting on heels, low crouch stance',
    basePrompt: 'squatting',
  },
  {
    id: 'floating',
    label: 'Floating / Weightless',
    emoji: '✨',
    color: 'text-purple-400',
    borderColor: 'border-purple-400/50',
    bgColor: 'bg-purple-400/10',
    activeBadgeClass: 'bg-purple-400/20 text-purple-300 border-purple-400/60 shadow-purple-500/20',
    description: 'Zero gravity, levitation, mid-air suspended pose',
    basePrompt: 'floating, levitation, mid-air',
  },
];

export class PoseRegistry {
  /**
   * Loads Pose Matrix definitions dynamically from Hazard_Trigger_Data/Pose_Matrix.json.
   * Seeds default JSON file if not found.
   */
  public static async load(app: App): Promise<PoseStateDefinition[]> {
    const adapter = app.vault.adapter;
    const filePath = cleanPath(POSE_MATRIX_FILE_PATH);

    try {
      if (await adapter.exists(filePath)) {
        const raw = await adapter.read(filePath);
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed as PoseStateDefinition[];
        }
      } else {
        // Seed default file
        await adapter.write(filePath, JSON.stringify(DEFAULT_POSE_STATES, null, 2));
      }
    } catch (err) {
      console.warn('[PoseRegistry] Error reading Pose_Matrix.json:', err);
    }

    return DEFAULT_POSE_STATES;
  }
}
