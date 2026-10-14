export interface CharacterNames {
  names?: string[];
  canonical?: string;
  native?: string;
  nicknames?: string[];
  aliases?: string[];
}

export interface CharacterAssociate {
  series?: string;
  branches?: string;
  organization?: string;
  role_title?: string;
}

export interface CharacterHazardLevel {
  hazardScore: number;
  hazardClass?: string;
}

export interface CharacterTaxonomy {
  archetype?: string[];
  personalityTropes?: string[];
  addressment?: string[];
}

export interface CharacterPhase1Dna {
  character_trigger?: string[];
  hair?: {
    color?: string[];
    style?: string[];
    accessories?: string[];
  };
  eyes?: {
    color?: string[];
    features?: string[];
  };
  physique?: {
    body?: string[];
    features?: string[];
  };
  [key: string]: any;
}

export interface CharacterOutfit {
  layers?: Record<string, string[]>;
  disabledLayers?: string[];
  [key: string]: any;
}

export interface CharacterDefinition {
  id?: string;
  names?: CharacterNames | string[];
  associate?: string[] | CharacterAssociate;
  hazardLevel?: CharacterHazardLevel;
  taxonomy?: CharacterTaxonomy;
  _prpt_?: string;
  prompt?: string;
  outfit?: string;
  dna_phase1?: CharacterPhase1Dna;
  outfits?: Record<string, CharacterOutfit>;
  [key: string]: any;
}

export interface CharacterFileStructure {
  default: CharacterDefinition;
  [variantKey: string]: Partial<CharacterDefinition> | any;
}

export interface CharacterFileInfo {
  fileName: string;
  batchDir: string; // e.g. "TT01"
  relPath: string; // e.g. "Hazard_Trigger_Data/Identity/Characters/TT01/A01.json"
  id: string;
  canonicalName: string;
  series: string;
}

export interface CompiledCharacterPrompt {
  phase1Tokens: string[];
  phase2Tokens: string[];
  combinedTokens: string[];
  phase1Prompt: string;
  phase2Prompt: string;
  masterPrompt: string;
  tokenCount: number;
}
