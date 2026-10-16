export type FacetSubspaceId = 'condition_studio' | 'front' | 'coiffure' | 'foundation' | 'crown' | 'deconstructor';

export interface FacetSubspaceMeta {
  id: FacetSubspaceId;
  label: string;
  shortLabel: string;
  description: string;
  accentColor: string;
  iconName: string;
}

export type AtomicDimension =
  | 'parting'
  | 'fringe_cut'
  | 'length'
  | 'texture'
  | 'coiffure'
  | 'framing'
  | 'crown';

export interface AtomicCondition {
  dimension: AtomicDimension;
  dimensionLabel: string;
  value: string;
  impliedTag: string;
}

export interface CompositeHairstyleDeconstruction {
  tag: string;
  slug?: string;
  danbooruSlug?: string;
  imageUrl?: string;
  category: string;
  subcategory: string;
  description: string;
  atomicConditions: AtomicCondition[];
  synthesizedPrompt: string;
  wikiUrl: string;
}
