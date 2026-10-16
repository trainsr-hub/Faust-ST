import { HairCodexItem, HairCodexFilter, HairRelationNode } from '../types/hairCodex';
import { HAIR_CODEX_ITEMS } from './hairCodexData';

export interface CategorySummary {
  name: string;
  count: number;
  subcategories: { name: string; count: number }[];
}

export function getCodexCategories(): CategorySummary[] {
  const map: Record<string, Record<string, number>> = {};

  for (const item of HAIR_CODEX_ITEMS) {
    if (!map[item.category]) {
      map[item.category] = {};
    }
    const sub = item.subcategory || 'General';
    map[item.category][sub] = (map[item.category][sub] || 0) + 1;
  }

  return Object.keys(map).map((catName) => {
    const subMap = map[catName];
    const subcategories = Object.keys(subMap).map((subName) => ({
      name: subName,
      count: subMap[subName],
    }));
    const totalCount = subcategories.reduce((sum, s) => sum + s.count, 0);
    return { name: catName, count: totalCount, subcategories };
  });
}

export function filterCodexItems(filter: HairCodexFilter): HairCodexItem[] {
  const query = filter.searchQuery.toLowerCase().trim();

  return HAIR_CODEX_ITEMS.filter((item) => {
    // 1. Search query
    if (query) {
      const matchTag = item.tag.toLowerCase().includes(query);
      const matchDanbooru = item.danbooruTag.toLowerCase().includes(query);
      const matchSub = item.subcategory.toLowerCase().includes(query);
      const matchParent = item.parentTag && item.parentTag.toLowerCase().includes(query);
      if (!matchTag && !matchDanbooru && !matchSub && !matchParent) {
        return false;
      }
    }

    // 2. Category filter
    if (filter.selectedCategory && item.category !== filter.selectedCategory) {
      return false;
    }

    // 3. Subcategory filter
    if (filter.selectedSubcategory && item.subcategory !== filter.selectedSubcategory) {
      return false;
    }

    // 4. Has image only filter
    if (filter.hasImageOnly && !item.imageUrl) {
      return false;
    }

    // 5. Has parent relationship only
    if (filter.hasParentOnly && !item.parentTag) {
      return false;
    }

    return true;
  });
}

/**
 * Filters and sorts items for the Grid Atlas view:
 * 1. Primary order: Transitive dependent linking count descending
 * 2. Secondary order: Alphabetical ascending (A to Z)
 * Includes active concept nodes and excludes hidden (discarded) traits.
 */
export function filterAndSortCodexGrid(
  filter: HairCodexFilter,
  linkageDb: Record<string, any>,
  transitiveCounts: Map<string, number>
): HairCodexItem[] {
  const base = filterCodexItems(filter);
  const query = filter.searchQuery.toLowerCase().trim();

  const taglessNodes: HairCodexItem[] = Object.values(linkageDb)
    .filter((n: any) => n.isTagless && !n.isDiscarded)
    .filter((n: any) => {
      if (query && !n.tag.toLowerCase().includes(query) && !(n.customLabel || '').toLowerCase().includes(query)) {
        return false;
      }
      if (filter.selectedCategory && n.category !== filter.selectedCategory) return false;
      if (filter.selectedSubcategory && n.subcategory !== filter.selectedSubcategory) return false;
      if (filter.hasImageOnly || filter.hasParentOnly) return false;
      return true;
    })
    .map((n: any) => ({
      id: n.id,
      category: n.category || 'Concept Hub',
      subcategory: n.subcategory || 'Concept Hub',
      tag: n.customLabel || n.tag,
      danbooruTag: n.tag,
      wikiUrl: '',
      isTagless: true,
      customLabel: n.customLabel,
    }));

  const activeItems = [...base.filter((it) => !linkageDb[it.id]?.isDiscarded), ...taglessNodes];

  return activeItems.sort((a, b) => {
    const countA = transitiveCounts.get(a.id) || 0;
    const countB = transitiveCounts.get(b.id) || 0;

    if (countB !== countA) {
      return countB - countA;
    }

    const nameA = (linkageDb[a.id]?.customLabel || a.tag || '').toLowerCase();
    const nameB = (linkageDb[b.id]?.customLabel || b.tag || '').toLowerCase();
    return nameA.localeCompare(nameB, undefined, { sensitivity: 'base' });
  });
}

export function buildRelationshipTree(): HairRelationNode[] {
  const byTag = new Map<string, HairCodexItem>();
  for (const item of HAIR_CODEX_ITEMS) {
    byTag.set(item.tag.toLowerCase(), item);
    byTag.set(item.danbooruTag.toLowerCase(), item);
  }

  // Find parents that have children
  const parentToChildren = new Map<string, HairCodexItem[]>();
  for (const item of HAIR_CODEX_ITEMS) {
    if (item.parentTag) {
      const pKey = item.parentTag.toLowerCase();
      if (!parentToChildren.has(pKey)) {
        parentToChildren.set(pKey, []);
      }
      parentToChildren.get(pKey)!.push(item);
    }
  }

  const roots: HairRelationNode[] = [];
  parentToChildren.forEach((children, parentTag) => {
    const parentItem = byTag.get(parentTag);
    roots.push({
      tag: parentItem?.tag || parentTag,
      item: parentItem,
      children: children.map((c) => ({
        tag: c.tag,
        item: c,
        children: [],
      })),
    });
  });

  return roots.sort((a, b) => b.children.length - a.children.length);
}
