import { LinkageNodeData } from './linkageLayout';
import { FacetSubspaceId, FacetSubspaceMeta } from '../types/facetOntology';

export const FACET_SUBSPACES_CONFIG: FacetSubspaceMeta[] = [
  {
    id: 'condition_studio',
    label: '★ 3-Table Condition Studio',
    shortLabel: 'Condition Studio',
    description: 'Relational 3-table rule engine: Conditions, Groups, and Prompts (Natural Language IF/ELSE)',
    accentColor: '#38bdf8',
    iconName: 'Database',
  },
  {
    id: 'front',
    label: '1. Front & Fringe Architecture',
    shortLabel: 'Front / Bangs',
    description: 'Bangs, Parting topology, Facial framing strands, Sidelocks, and Intakes',
    accentColor: '#38bdf8',
    iconName: 'Sparkles',
  },
  {
    id: 'coiffure',
    label: '2. Coiffure & Updos',
    shortLabel: 'Coiffure / Updos',
    description: 'Ponytails, Twintails, Braids, Hair Buns, and Traditional Nihongami',
    accentColor: '#ec4899',
    iconName: 'Layers',
  },
  {
    id: 'foundation',
    label: '3. Foundation & Texture',
    shortLabel: 'Length & Texture',
    description: 'Length tiers, Volume, and Fiber behavior (Straight, Curly, Drills, Spikes)',
    accentColor: '#10b981',
    iconName: 'Sliders',
  },
  {
    id: 'crown',
    label: '4. Crown & Top Accents',
    shortLabel: 'Crown / Ahoge',
    description: 'Ahoge cowlicks, Antenna hair, Slicked back, and Top partings',
    accentColor: '#f59e0b',
    iconName: 'Flame',
  },
  {
    id: 'deconstructor',
    label: '✦ Atomic Deconstructor & Synthesizer',
    shortLabel: 'Atomic Matrix',
    description: 'Deconstruct composite styles (e.g. center-flap bangs) into orthogonal atomic conditions',
    accentColor: '#a855f7',
    iconName: 'Cpu',
  },
];

export function isNodeInSubspace(node: LinkageNodeData, subspaceId: FacetSubspaceId): boolean {
  if (subspaceId === 'deconstructor' || subspaceId === 'condition_studio') return true;
  if (node.isTagless) {
    if (subspaceId === 'front' && node.id === 'concept_front') return true;
    if (subspaceId === 'coiffure' && ['concept_ponytails', 'concept_braids', 'concept_buns', 'concept_nihongami'].includes(node.id)) return true;
    if (subspaceId === 'foundation' && ['concept_length', 'concept_texture'].includes(node.id)) return true;
    if (subspaceId === 'crown' && node.id === 'concept_top') return true;
    return false;
  }

  const tag = (node.tag || '').toLowerCase();
  const sub = (node.subcategory || '').toLowerCase();
  const cat = (node.category || '').toLowerCase();

  if (subspaceId === 'front') {
    return /bang|parted|fringe|sidelock|intake|between eyes|over eye|over one eye|widow/.test(sub + ' ' + tag);
  }
  if (subspaceId === 'crown') {
    return /ahoge|antenna|pulled back|slicked back|comb over|mohawk|oseledets/.test(sub + ' ' + tag);
  }
  if (subspaceId === 'coiffure') {
    return /ponytail|twintail|tail|braid|bun|updo|knot|mage|nihongami|shimada|ring|yaji|feixianji/.test(sub + ' ' + tag + ' ' + cat);
  }
  if (subspaceId === 'foundation') {
    // If not in front, crown, or coiffure, belongs to length & texture
    const inFront = /bang|parted|fringe|sidelock|intake|between eyes|over eye|over one eye|widow/.test(sub + ' ' + tag);
    const inCrown = /ahoge|antenna|pulled back|slicked back|comb over|mohawk|oseledets/.test(sub + ' ' + tag);
    const inCoiffure = /ponytail|twintail|tail|braid|bun|updo|knot|mage|nihongami|shimada|ring|yaji|feixianji/.test(sub + ' ' + tag + ' ' + cat);
    return !inFront && !inCrown && !inCoiffure;
  }

  return true;
}

export function filterDatabaseForSubspace(
  fullDb: Record<string, LinkageNodeData>,
  subspaceId: FacetSubspaceId
): Record<string, LinkageNodeData> {
  const filtered: Record<string, LinkageNodeData> = {};

  Object.entries(fullDb).forEach(([id, node]) => {
    if (isNodeInSubspace(node, subspaceId)) {
      filtered[id] = {
        ...node,
        links_to: { ...node.links_to },
      };
    }
  });

  // Filter links_to so they only point to nodes existing within this subspace
  Object.values(filtered).forEach((node) => {
    const cleanedLinks: Record<string, boolean> = {};
    Object.keys(node.links_to || {}).forEach((targetId) => {
      if (filtered[targetId]) {
        cleanedLinks[targetId] = true;
      }
    });
    node.links_to = cleanedLinks;
  });

  return filtered;
}
