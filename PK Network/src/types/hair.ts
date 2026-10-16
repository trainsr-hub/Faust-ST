/**
 * Hair Trait Domain Types (Tier 1: Domain Schemas & Turso Records)
 */

export type HairColorCategory = 'single' | 'two_tone' | 'gradient' | 'location';

export type HairColorMode =
  | 'single'
  // Two-Tone Group (Non-merging)
  | 'two_tone'
  | 'split'
  | 'streaks'
  | 'striped'
  | 'inner_hair'
  // Gradient Group (Merging)
  | 'gradient'
  | 'rainbow'
  // Location Group (Tips / Roots)
  | 'tips'
  | 'roots';

// Tier 2: Foundation (Length & Texture)
export type HairLength =
  | 'none'
  | 'very_short'
  | 'short'
  | 'medium'
  | 'long'
  | 'very_long'
  | 'absurdly_long';

export type HairTexture =
  | 'none'
  | 'straight'
  | 'wavy'
  | 'curly'
  | 'fluffy'
  | 'messy'
  | 'spiky'
  | 'drill'
  | 'ringlets'
  | 'flipped';

export interface HairLengthItem {
  id: HairLength;
  name: string;
  promptToken: string;
  description: string;
}

export interface HairTextureItem {
  id: HairTexture;
  name: string;
  promptToken: string;
  description: string;
}

// Tier 3: Bangs & Crown Architecture
export type HairBangs =
  | 'none'
  | 'blunt'
  | 'parted'
  | 'double_parted'
  | 'swept'
  | 'wispy'
  | 'crossed'
  | 'fanged'
  | 'choppy'
  | 'asymmetrical'
  | 'center_flap'
  | 'short'
  | 'long'
  | 'pinned_back';

export type HairFraming =
  | 'none'
  | 'between_eyes'
  | 'over_one_eye'
  | 'over_eyes';

export type HairAhoge =
  | 'none'
  | 'ahoge'
  | 'huge_ahoge'
  | 'heart_ahoge'
  | 'antenna'
  | 'heart_antenna';

export interface HairBangsItem {
  id: HairBangs;
  name: string;
  promptToken: string;
  description: string;
}

export interface HairFramingItem {
  id: HairFraming;
  name: string;
  promptToken: string;
  description: string;
}

export interface HairAhogeItem {
  id: HairAhoge;
  name: string;
  promptToken: string;
  description: string;
}

export interface HairState {
  isEnabled: boolean;
  // Tier 1: Chromatics
  mode: HairColorMode;
  color1: string; // primary base color ID (e.g. 'black', 'blonde')
  color2: string; // secondary / accent color ID (e.g. 'blue', 'pink')
  blendStyle?: 'sharp' | 'gradient'; // for locations (tips & roots)
  // Tier 2: Foundation (Length & Texture)
  length?: HairLength;
  texture?: HairTexture;
  // Tier 3: Bangs & Crown
  bangs?: HairBangs;
  framing?: HairFraming;
  ahoge?: HairAhoge;
}

/**
 * Turso Database Record: hair_color_modes
 */
export interface HairColorModeRecord {
  id: string;
  code: HairColorMode;
  name: string;
  category: HairColorCategory;
  color_inputs: number;
  prompt_pattern: string;
  description?: string;
  sort_order: number;
  is_active?: number;
}

/**
 * Turso Database Record: hair_colors
 */
export interface HairColorRecord {
  id: string;
  code: string;
  name: string;
  hex_code: string;
  prompt_token: string;
  overlap_notes?: string;
  image_url?: string;
  sort_order: number;
  is_active?: number;
}

export interface HairColorModeItem {
  id: HairColorMode;
  name: string;
  category: HairColorCategory;
  colorInputs: number;
  promptPattern: string;
  description: string;
}

export interface HairColorItem {
  id: string;
  name: string;
  hex: string;
  promptToken: string;
  overlapNotes?: string;
}

export const HAIR_LENGTH_ITEMS: HairLengthItem[] = [
  { id: 'none', name: 'None', promptToken: '', description: 'Omit length token' },
  { id: 'very_short', name: 'Very Short', promptToken: 'very short hair', description: 'Above neck / chin (pixie cut)' },
  { id: 'short', name: 'Short', promptToken: 'short hair', description: 'Neck / jaw length (bob cut)' },
  { id: 'medium', name: 'Medium', promptToken: 'medium hair', description: 'Shoulder length' },
  { id: 'long', name: 'Long', promptToken: 'long hair', description: 'Chest to waist length' },
  { id: 'very_long', name: 'Very Long', promptToken: 'very long hair', description: 'Thigh to knee length' },
  { id: 'absurdly_long', name: 'Absurdly Long', promptToken: 'absurdly long hair', description: 'Trailing past calves to ground' },
];

export const HAIR_TEXTURE_ITEMS: HairTextureItem[] = [
  { id: 'none', name: 'None', promptToken: '', description: 'Omit texture token' },
  { id: 'straight', name: 'Straight', promptToken: 'straight hair', description: 'Sleek, smooth uniform strands' },
  { id: 'wavy', name: 'Wavy', promptToken: 'wavy hair', description: 'Gentle flowing s-curves' },
  { id: 'curly', name: 'Curly', promptToken: 'curly hair', description: 'Defined spring curls and coils' },
  { id: 'fluffy', name: 'Fluffy', promptToken: 'fluffy hair', description: 'High-volume, airy anime fluff' },
  { id: 'messy', name: 'Messy', promptToken: 'messy hair', description: 'Tousled, bedhead, disheveled strands' },
  { id: 'spiky', name: 'Spiky', promptToken: 'spiked hair', description: 'Sharp, angular anime spikes' },
  { id: 'drill', name: 'Drill', promptToken: 'drill hair', description: 'Spiral drill curls' },
  { id: 'ringlets', name: 'Ringlets', promptToken: 'ringlets', description: 'Victorian spiral drop ringlets' },
  { id: 'flipped', name: 'Flipped', promptToken: 'flipped hair', description: 'Tips flicked outwards' },
];

export const HAIR_BANGS_ITEMS: HairBangsItem[] = [
  { id: 'none', name: 'None', promptToken: '', description: 'Omit bangs token' },
  { id: 'blunt', name: 'Blunt Bangs', promptToken: 'blunt bangs', description: 'Straight-across hime fringe' },
  { id: 'parted', name: 'Parted Bangs', promptToken: 'parted bangs', description: 'Parted center/side fringe' },
  { id: 'double_parted', name: 'Double-Parted', promptToken: 'double-parted bangs', description: 'Dual temple parts (Miyu / Rin style)' },
  { id: 'swept', name: 'Swept Bangs', promptToken: 'swept bangs', description: 'Side-swept diagonal fringe' },
  { id: 'wispy', name: 'Wispy Bangs', promptToken: 'wispy bangs', description: 'Light, see-through airy strands' },
  { id: 'crossed', name: 'Crossed Bangs', promptToken: 'crossed bangs', description: 'X-crossing overlapping strands' },
  { id: 'fanged', name: 'Fanged Bangs', promptToken: 'fanged bangs', description: 'V-shaped angular anime fangs' },
  { id: 'choppy', name: 'Choppy Bangs', promptToken: 'choppy bangs', description: 'Uneven textured cut' },
  { id: 'asymmetrical', name: 'Asymmetrical', promptToken: 'asymmetrical bangs', description: 'Slanted uneven length' },
  { id: 'center_flap', name: 'Center-Flap', promptToken: 'center-flap bangs', description: 'Center strand flapped outward' },
  { id: 'short', name: 'Short Bangs', promptToken: 'short bangs', description: 'Micro bangs above eyebrows' },
  { id: 'long', name: 'Long Bangs', promptToken: 'long bangs', description: 'Fringe reaching cheeks/jaw' },
  { id: 'pinned_back', name: 'Pinned Back', promptToken: 'bangs pinned back', description: 'Held back with clips/pins' },
];

export const HAIR_FRAMING_ITEMS: HairFramingItem[] = [
  { id: 'none', name: 'None', promptToken: '', description: 'No facial strand framing' },
  { id: 'between_eyes', name: 'Between Eyes', promptToken: 'hair between eyes', description: 'Center drop strand framing eyes' },
  { id: 'over_one_eye', name: 'Over One Eye', promptToken: 'hair over one eye', description: 'Peekaboo covering one eye' },
  { id: 'over_eyes', name: 'Over Eyes', promptToken: 'hair over eyes', description: 'Fringe concealing both eyes' },
];

export const HAIR_AHOGE_ITEMS: HairAhogeItem[] = [
  { id: 'none', name: 'None', promptToken: '', description: 'No ahoge or antenna' },
  { id: 'ahoge', name: 'Ahoge', promptToken: 'ahoge', description: 'Single curved anime cowlick' },
  { id: 'huge_ahoge', name: 'Huge Ahoge', promptToken: 'huge ahoge', description: 'Oversized expressive cowlick' },
  { id: 'heart_ahoge', name: 'Heart Ahoge', promptToken: 'heart ahoge', description: 'Cowlick curled into a heart shape' },
  { id: 'antenna', name: 'Antenna Hair', promptToken: 'antenna hair', description: 'Dual twin antennae cowlicks' },
  { id: 'heart_antenna', name: 'Heart Antenna', promptToken: 'heart antenna hair', description: 'Twin antennae forming a heart shape' },
];
