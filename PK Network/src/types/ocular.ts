/**
 * Ocular Trait Domain Types (Tier 1: Domain & DB Models)
 */

export type EyeMode = 'single' | 'multi' | 'heterochromia';

export type IrisShape =
  | 'round'
  | 'slit'
  | 'heart'
  | 'star'
  | 'diamond'
  | 'cross'
  | 'glowing'
  | 'empty';

export interface EyeColorItem {
  id: string;
  name: string;
  hex: string;
  promptToken: string;
}

export interface IrisShapeItem {
  id: IrisShape;
  name: string;
  promptToken: string;
  iconSymbol: string;
}

export interface OcularState {
  isEnabled: boolean;
  mode: EyeMode;
  color1: string; // ID of primary / left color
  color2: string; // ID of secondary / right color
  irisShape: IrisShape;
  pupilColor: string; // ID of pupil color ('black', 'red', 'white', 'yellow', etc.)
  irisAccent?: string;
}

export interface EyeColorModeRecord {
  id: string;
  code: EyeMode;
  name: string;
  color_inputs: number;
  base_prompt: string;
  prompt_pattern: string;
  sort_order: number;
  notes?: string;
}

export interface PupilShapeRecord {
  id: string;
  code: IrisShape;
  name: string;
  icon_symbol: string;
  prompt_token: string;
  svg_path: string;
  image_url?: string;
  sort_order: number;
  is_active: number;
  notes?: string;
}

export interface EyeColorRecord {
  id: string;
  name: string;
  category: string;
  prompt: string;
  hex_code: string;
  image_url?: string;
  notes?: string;
}
