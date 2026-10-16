/**
 * Hair Codex Domain Types (Visual Relationship Atlas)
 */

export interface HairCodexItem {
  id: string;
  category: string;
  subcategory: string;
  tag: string;
  danbooruTag: string;
  wikiUrl: string;
  parentTag?: string | null;
  imageUrl?: string | null;
  postUrl?: string | null;
  notes?: string;
  isTagless?: boolean;
  customLabel?: string;
}

export type HairViewMode = 'graph' | 'grid' | 'tree' | 'compact';

export interface HairCodexFilter {
  searchQuery: string;
  selectedCategory: string | null;
  selectedSubcategory: string | null;
  hasImageOnly: boolean;
  hasParentOnly: boolean;
}

export interface HairRelationNode {
  tag: string;
  item?: HairCodexItem;
  children: HairRelationNode[];
}
