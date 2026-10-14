export type GenericTopologyRow = Record<string, any>;
export type GenericTopologyTable = Record<string, GenericTopologyRow>;

export interface TopologyFileInfo {
  fileName: string;
  relPath: string;
  subdir: 'tree' | 'table';
}

export interface TagGroupEntry {
  zone: string;
  prompts: string[];
}

export type TagGroupsTable = Record<string, TagGroupEntry>;

export interface ConditionGroupEntry {
  emits: string[];
}

export type ConditionGroupsTable = Record<string, ConditionGroupEntry>;

export interface ConditionCompositionEntry {
  composed_of: string[];
}

export type ConditionCompositionTable = Record<string, ConditionCompositionEntry>;

export interface ClothingLayerEntry {
  description: string;
  groups: string[];
  covers: string[];
}

export type ClothingLayersTable = Record<string, ClothingLayerEntry>;

export interface TopologyData {
  tagGroups: TagGroupsTable;
  conditionGroups: ConditionGroupsTable;
  conditionComposition: ConditionCompositionTable;
  clothingLayers: ClothingLayersTable;
}

export type TopologySubTable = 'tag_groups' | 'condition_groups' | 'condition_composition' | 'clothing_layers';
