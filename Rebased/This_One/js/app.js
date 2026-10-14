/* ==========================================================================
   HAZARD STUDIO — MASTER APPLICATION BOOTSTRAPPER
   Coordinates all 7 Data Entry Blocks, Tree Outliner & Live JSON Sync
   Universal Zero-Dead-Zone Delegation: All non-functional surfaces fold/expand
   ========================================================================== */

/* --------------------------------------------------------------------------
   GLOBAL DROPDOWN DISMISSAL ON OUTSIDE CLICK
   -------------------------------------------------------------------------- */
function closeAllDropdowns() {
  document.querySelectorAll('.notion-dropdown-menu').forEach(m => m.classList.remove('open'));
  document.querySelectorAll('.notion-combobox-trigger').forEach(t => t.classList.remove('active'));
  const tagBox = document.getElementById('multi-tag-box');
  if (tagBox) tagBox.classList.remove('active');
}

/* --------------------------------------------------------------------------
   SECTION EXPAND & FOLD CONTROLLERS (Full-Surface Hitbox Law)
   -------------------------------------------------------------------------- */
function toggleBlockCollapse(targetEl) {
  if (!targetEl) return;
  const block = (targetEl.classList && targetEl.classList.contains('entry-block'))
    ? targetEl
    : targetEl.closest('.entry-block');
  if (!block) return;

  // Debounce guard to prevent double-toggle within 80ms
  const now = Date.now();
  if (block._lastToggle && now - block._lastToggle < 80) return;
  block._lastToggle = now;

  block.classList.toggle('collapsed');
  const isCollapsed = block.classList.contains('collapsed');
  const titleEl = block.querySelector('.block-title');
  const title = titleEl ? titleEl.textContent.trim() : 'Section';
  fireToast(`${title}: ${isCollapsed ? 'Folded' : 'Expanded'}`);
}

function toggleInspectorCollapse(targetEl) {
  if (!targetEl) return;
  const inspector = (targetEl.classList && targetEl.classList.contains('inspector-sticky'))
    ? targetEl
    : targetEl.closest('.inspector-sticky');
  if (!inspector) return;

  // Debounce guard to prevent double-toggle within 80ms
  const now = Date.now();
  if (inspector._lastToggle && now - inspector._lastToggle < 80) return;
  inspector._lastToggle = now;

  inspector.classList.toggle('collapsed');
  const isCollapsed = inspector.classList.contains('collapsed');
  fireToast(`Live State Inspector: ${isCollapsed ? 'Folded' : 'Expanded'}`);
}

function toggleAllBlocks() {
  areAllBlocksCollapsed = !areAllBlocksCollapsed;
  const blocks = document.querySelectorAll('.entry-block');
  blocks.forEach(b => {
    if (areAllBlocksCollapsed) {
      b.classList.add('collapsed');
    } else {
      b.classList.remove('collapsed');
    }
  });

  const inspector = document.querySelector('.inspector-sticky');
  if (inspector) {
    if (areAllBlocksCollapsed) {
      inspector.classList.add('collapsed');
    } else {
      inspector.classList.remove('collapsed');
    }
  }

  const btn = document.getElementById('btn-toggle-all-blocks');
  if (btn) {
    btn.textContent = areAllBlocksCollapsed ? '📂 Expand All' : '🗂️ Fold All';
  }

  fireToast(`All Sections: ${areAllBlocksCollapsed ? 'Folded' : 'Expanded'}`);
}

/* --------------------------------------------------------------------------
   UNIVERSAL ZERO-DEAD-ZONE CLICK DELEGATION
   Transforms every non-functional surface (padding, background, label, banner,
   whitespace) into an immediate expand/fold trigger for its respective section.
   -------------------------------------------------------------------------- */
const INTERACTIVE_ELEMENTS_SELECTOR = [
  'input',
  'textarea',
  'button',
  'select',
  'option',
  'a',
  '.raw-input-box',
  '.raw-textarea-box',
  '.searcher-input',
  '.searcher-clear',
  '.searcher-icon',
  '.search-result-item',
  '.full-toggle-card',
  '.switch-pill',
  '.switch-thumb',
  '.full-checkbox-row',
  '.custom-checkbox',
  '.notion-combobox-wrap',
  '.notion-dropdown-menu',
  '.dropdown-option',
  '.dropdown-create-row',
  '.dropdown-search-input',
  '.multi-select-host',
  '.multi-tag-box',
  '.tag-chip',
  '.tag-chip-remove',
  '.tag-inline-input',
  '.tree-toolbar-actions',
  '.tree-toolbar-btn',
  '.tree-breadcrumb-bar',
  '.tree-crumb-item',
  '.tree-mode-pill-toggle',
  '.tree-mode-toggle-btn',
  '.tree-ghost-btn',
  '.tree-ghost-input',
  '.tree-add-pathway-btn',
  '.tree-past-row',
  '.tree-past-step-anchor',
  '.tree-pathway-card',
  '.tree-subpathway-row',
  '.tree-pathway-badge-count',
  '.subtray-fold-icon',
  '.tree-section-header'
].join(', ');

document.addEventListener('click', (e) => {
  // 1. Global dropdown dismissal when clicking outside
  if (!e.target.closest('#single-combo-wrap') && !e.target.closest('#multi-select-host')) {
    closeAllDropdowns();
  }

  // 2. Active Functional Control Check:
  // If the click landed on an active control, let the control execute naturally
  if (e.target.closest(INTERACTIVE_ELEMENTS_SELECTOR)) {
    return;
  }

  // 3. TreeView Zone Dead-Zones:
  // Dead space in Zone 1 (Past timeline background outside rows)
  const pastZone = e.target.closest('.tree-past-zone');
  if (pastZone) {
    if (typeof toggleTreePastZone === 'function') toggleTreePastZone();
    return;
  }

  // Dead space in Zone 2 (Forward pathways background outside cards)
  const futureZone = e.target.closest('.tree-future-zone');
  if (futureZone) {
    if (typeof toggleTreeFutureZone === 'function') toggleTreeFutureZone();
    return;
  }

  // Dead space in TreeView root container
  const treeContainer = e.target.closest('.treeview-container');
  if (treeContainer) {
    const block7 = treeContainer.closest('.entry-block');
    if (block7) toggleBlockCollapse(block7);
    return;
  }

  // 4. Entry Block Dead-Zones:
  // Header, body padding, field labels, field hints, active target banners
  const entryBlock = e.target.closest('.entry-block');
  if (entryBlock) {
    toggleBlockCollapse(entryBlock);
    return;
  }

  // 5. Inspector Dead-Zones:
  // Header, background, padding (unless user is actively selecting text)
  const inspector = e.target.closest('.inspector-sticky');
  if (inspector) {
    const selection = window.getSelection();
    if (selection && selection.toString().length > 0) return;
    toggleInspectorCollapse(inspector);
    return;
  }

  // 6. Header Title Stack Dead-Zone:
  const titleStack = e.target.closest('.title-stack');
  if (titleStack) {
    toggleAllBlocks();
    return;
  }
});

/* --------------------------------------------------------------------------
   GLOBAL THEME TOGGLE & STATE RESET
   -------------------------------------------------------------------------- */
function toggleTheme() {
  const root = document.documentElement;
  const current = root.getAttribute('data-theme') || 'dark';
  const next = current === 'dark' ? 'light' : 'dark';
  root.setAttribute('data-theme', next);
  fireToast("Theme: " + next);
}

function resetMockData() {
  location.reload();
}

/* --------------------------------------------------------------------------
   APPLICATION INITIALIZATION LIFECYCLE
   -------------------------------------------------------------------------- */
function initApp() {
  // 1. Raw Text & Prompt Area
  if (typeof initRawText === 'function') initRawText();

  // 2. Raw Searcher
  if (typeof handleSearch === 'function') handleSearch("");

  // 3. Notion Single Select
  if (typeof initSingleSelect === 'function') initSingleSelect();

  // 4. Notion Multi Select
  if (typeof initMultiSelect === 'function') initMultiSelect();

  // 5 & 6. Full-Surface Toggles & Checkboxes
  if (typeof initTogglesAndCheckboxes === 'function') initTogglesAndCheckboxes();

  // 7. TreeView Outliner
  if (typeof renderTreeView === 'function') renderTreeView();

  // 8. Live State Output
  if (typeof renderLiveJSON === 'function') renderLiveJSON();
}

// Auto-run on DOM ready or immediate if already parsed
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}
