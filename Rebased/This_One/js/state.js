/* ==========================================================================
   HAZARD STUDIO — STATE STORE & DATA POOLS
   ========================================================================== */

const mockDatabase = {
  id: "A01",
  names: {
    primary: "Amelia Watson",
    nicknames: ["Ame", "Watson", "Detective"]
  },
  associate: "HoloMyth",
  _prpt_: "amelia watson, blonde hair, blue eyes, medium hair, twin low buns, short twin braids, bangs, ahoge, tareme, medium breasts",
  settings: {
    autoResolveEgo: true,
    stealthMode: true,
    enableTaxonomy: true,
    hardwareAccelerated: true,
    strictZeroLLM: false
  },
  selectedTreeNodeId: "node-archetype-1"
};

// Mode for TreeView / Future Section: 'select' (default) vs 'edit'
let treeViewMode = 'select';

// Collapse / Fold States for TreeView Zones
let isPastZoneCollapsed = false;
let isFutureZoneCollapsed = false;
let areAllBlocksCollapsed = false;

// 1. Persistent Faction Options Pool (Never wiped)
let availableFactions = ["HoloMyth", "HoloCouncil", "Promise", "Advent", "Justice", "Gamers", "ReGLOSS", "Dev_is"];

// 2. Persistent Tag Pool (Never wiped)
let availableTags = ["Ame", "Watson", "Detective", "Time Traveler", "Gremlin", "Tea Lover", "Bri'ish", "Investigator", "Smol Form", "Myth"];

// 3. Pre-Indexed Search Records
const allSearchRecords = [
  { id: "A01", name: "Amelia Watson", faction: "HoloMyth" },
  { id: "A02", name: "Gawr Gura", faction: "HoloMyth" },
  { id: "A03", name: "Ninomae Ina'nis", faction: "HoloMyth" },
  { id: "A04", name: "Takanashi Kiara", faction: "HoloMyth" },
  { id: "A05", name: "Mori Calliope", faction: "HoloMyth" }
];

// 4. Hierarchical Outliner Tree Data (H1 -> H2 -> H3 -> H4 -> H5 -> H6 -> H7)
let treeData = [
  {
    id: "root-1",
    label: "Hololive Production Taxonomy",
    icon: "🌐",
    depth: 0,
    children: [
      {
        id: "node-en-branch",
        label: "Hololive English Ecosystem",
        icon: "🇬🇧",
        depth: 1,
        children: [
          {
            id: "node-myth-branch",
            label: "Myth Generation (Origin Genesis)",
            icon: "⚡",
            depth: 2,
            children: [
              {
                id: "node-archetype-1",
                label: "Detective & Investigator Archetype",
                icon: "🔍",
                depth: 3,
                children: [
                  {
                    id: "node-tropes-1",
                    label: "Personality Tropes & Quirks",
                    icon: "🎭",
                    depth: 4,
                    children: [
                      {
                        id: "node-gremlin-sub",
                        label: "Gremlin Laugh & Desk Slam",
                        icon: "💥",
                        depth: 5,
                        children: [
                          {
                            id: "node-sound-clip",
                            label: "Audio Reaction Trigger Matrix",
                            icon: "🔊",
                            depth: 6,
                            children: []
                          }
                        ]
                      },
                      {
                        id: "node-tea-sub",
                        label: "British Tea & Concoction Master",
                        icon: "🍵",
                        depth: 5,
                        children: []
                      }
                    ]
                  },
                  {
                    id: "node-temporal-lore",
                    label: "Temporal Pocket Watch Mechanics",
                    icon: "⏳",
                    depth: 4,
                    children: [
                      {
                        id: "node-timeline-shift",
                        label: "Timeline Branching & Paradox Engine",
                        icon: "🌀",
                        depth: 5,
                        children: []
                      }
                    ]
                  }
                ]
              },
              {
                id: "node-archetype-2",
                label: "Apex Predator Shark Archetype",
                icon: "🦈",
                depth: 3,
                children: []
              },
              {
                id: "node-archetype-3",
                label: "Ancient One Priestess Archetype",
                icon: "🐙",
                depth: 3,
                children: []
              }
            ]
          },
          {
            id: "node-council-branch",
            label: "Council Generation (Concepts)",
            icon: "🌌",
            depth: 2,
            children: []
          }
        ]
      }
    ]
  }
];

let activeTreeNodeId = "node-archetype-1";

/* ==========================================================================
   STATE MUTATION HELPERS
   ========================================================================== */

function updateField(key, val) {
  mockDatabase[key] = val;
  renderLiveJSON();
}

function updateToggle(key, val) {
  mockDatabase.settings[key] = val;
  renderLiveJSON();
  fireToast(`Toggled ${key}: ${val ? 'ON' : 'OFF'}`);
}

function updateCheckFlag(key, val) {
  mockDatabase.settings[key] = val;
  renderLiveJSON();
  fireToast(`Flag ${key}: ${val ? 'ENABLED' : 'DISABLED'}`);
}

/* ==========================================================================
   TREE UTILITY FUNCTIONS
   ========================================================================== */

function getActivePath(nodes, targetId, currentPath = []) {
  for (const node of nodes) {
    const nextPath = [...currentPath, node];
    if (node.id === targetId) return nextPath;
    if (node.children && node.children.length > 0) {
      const res = getActivePath(node.children, targetId, nextPath);
      if (res) return res;
    }
  }
  return null;
}

function findNodeById(nodes, targetId) {
  for (const node of nodes) {
    if (node.id === targetId) return node;
    if (node.children && node.children.length > 0) {
      const res = findNodeById(node.children, targetId);
      if (res) return res;
    }
  }
  return null;
}

function countDescendants(node) {
  if (!node.children || node.children.length === 0) return 0;
  let count = node.children.length;
  node.children.forEach(c => {
    count += countDescendants(c);
  });
  return count;
}
