/* ==========================================================================
   BLOCK 7: TREEVIEW & HIERARCHICAL TAXONOMY OUTLINER
   Single-Active-Branch Outliner (RAW_RULE.md: Past Spine & Future Pathways)
   Supports: Select Mode (Default, 100% Clickable Hitbox) vs Edit Mode
   ========================================================================== */

function setTreeViewMode(mode) {
  treeViewMode = mode;
  renderTreeView();
  fireToast(`Tree Mode: ${mode === 'select' ? '🎯 Select Mode' : '✏️ Edit Mode'}`);
}

function toggleTreePastZone() {
  const now = Date.now();
  if (window._lastPastToggle && now - window._lastPastToggle < 80) return;
  window._lastPastToggle = now;
  isPastZoneCollapsed = !isPastZoneCollapsed;
  renderTreeView();
  fireToast(`Past Timeline: ${isPastZoneCollapsed ? 'Folded' : 'Expanded'}`);
}

function toggleTreeFutureZone() {
  const now = Date.now();
  if (window._lastFutureToggle && now - window._lastFutureToggle < 80) return;
  window._lastFutureToggle = now;
  isFutureZoneCollapsed = !isFutureZoneCollapsed;
  renderTreeView();
  fireToast(`Forward Pathways: ${isFutureZoneCollapsed ? 'Folded' : 'Expanded'}`);
}

function jumpToParentNode() {
  const activePath = getActivePath(treeData, activeTreeNodeId) || [];
  if (activePath.length > 1) {
    const parentNode = activePath[activePath.length - 2];
    selectTreeNode(parentNode.id);
  }
}

function renderBreadcrumbs() {
  const container = document.getElementById('tree-breadcrumb-bar');
  if (!container) return;
  const path = getActivePath(treeData, activeTreeNodeId) || [];
  const hint = document.getElementById('tree-active-level-hint');
  const jumpBtn = document.getElementById('tree-btn-jump-parent');

  if (jumpBtn) {
    jumpBtn.disabled = path.length <= 1;
  }

  if (path.length > 0) {
    const activeNode = path[path.length - 1];
    if (hint) hint.textContent = `Focused: H${activeNode.depth + 1} (${activeNode.label})`;
  } else {
    if (hint) hint.textContent = `No node selected`;
  }

  container.innerHTML = path.map((node, index) => {
    const isLast = index === path.length - 1;
    const hLevel = "H" + (node.depth + 1);
    return `
      <span class="tree-crumb-item ${isLast ? 'active' : ''}" onclick="selectTreeNode('${node.id}')">
        <span style="font-family:'JetBrains Mono';font-size:0.7rem;">${hLevel}</span>
        <span>${node.label}</span>
      </span>
      ${!isLast ? '<span class="tree-crumb-sep">/</span>' : ''}
    `;
  }).join('');
}

function renderTreeView() {
  const container = document.getElementById('treeview-root');
  if (!container) return;
  container.innerHTML = "";

  if (!treeData || treeData.length === 0) {
    container.innerHTML = `<div style="padding:2rem;color:var(--text-dim);text-align:center;">Tree is empty. Click "+ New Root (H1)" to begin.</div>`;
    renderBreadcrumbs();
    return;
  }

  // Ensure activeTreeNodeId is valid
  let activePath = getActivePath(treeData, activeTreeNodeId);
  if (!activePath || activePath.length === 0) {
    activeTreeNodeId = treeData[0].id;
    mockDatabase.selectedTreeNodeId = activeTreeNodeId;
    activePath = getActivePath(treeData, activeTreeNodeId) || [treeData[0]];
  }

  renderBreadcrumbs();

  const activeNode = activePath[activePath.length - 1];
  const maxAllowedDepth = activeNode.depth + 3; // (n+3) depth boundary
  const ancestors = activePath.slice(0, -1);

  // =========================================================================
  // 1. ZONE 1: STRUCTURED PAST TIMELINE (Linear Single-Path Ancestor Spine)
  // =========================================================================
  const pastZone = document.createElement('div');
  pastZone.className = `tree-past-zone ${isPastZoneCollapsed ? 'collapsed' : ''}`;

  const pastHeader = document.createElement('div');
  pastHeader.className = 'tree-section-header tree-collapsible-header';
  pastHeader.onclick = () => toggleTreePastZone();
  pastHeader.innerHTML = `
    <div class="tree-section-title past-title">
      <span class="tree-section-chevron">${isPastZoneCollapsed ? '▶' : '▼'}</span>
      <span>🔒</span>
      <span>Determined Past &amp; Active Focal</span>
    </div>
    <span class="tree-section-meta">${ancestors.length} Ancestor Step${ancestors.length !== 1 ? 's' : ''} to H${activeNode.depth + 1}</span>
  `;
  pastZone.appendChild(pastHeader);

  const pastTimeline = document.createElement('div');
  pastTimeline.className = 'tree-past-timeline';

  if (!isPastZoneCollapsed) {
    // Render determined ancestor steps
    ancestors.forEach((ancNode, idx) => {
      const row = createTimelineRow(ancNode, false, idx, ancestors.length);
      pastTimeline.appendChild(row);
    });

    // Render active focal node at apex of the past
    const focalRow = createTimelineRow(activeNode, true, ancestors.length, ancestors.length);
    pastTimeline.appendChild(focalRow);
  }

  pastZone.appendChild(pastTimeline);
  container.appendChild(pastZone);

  // =========================================================================
  // 2. ZONE 2: FORWARD CHOICE PATHWAYS (Redesigned Future Zone)
  // =========================================================================
  const futureZone = document.createElement('div');
  futureZone.className = `tree-future-zone ${isFutureZoneCollapsed ? 'collapsed' : ''}`;

  const futureHeader = document.createElement('div');
  futureHeader.className = 'tree-section-header future-section-header tree-collapsible-header';
  const childCount = activeNode.children ? activeNode.children.length : 0;

  futureHeader.onclick = (e) => {
    if (!e.target.closest('.tree-mode-pill-toggle')) {
      toggleTreeFutureZone();
    }
  };

  futureHeader.innerHTML = `
    <div class="tree-section-title future-title">
      <span class="tree-section-chevron">${isFutureZoneCollapsed ? '▶' : '▼'}</span>
      <span>🌿</span>
      <span>Forward Choice Pathways</span>
      <span class="future-count-badge">${childCount} Available</span>
    </div>
    <div class="tree-mode-pill-toggle" onclick="event.stopPropagation()">
      <button class="tree-mode-toggle-btn ${treeViewMode === 'select' ? 'active' : ''}" onclick="event.stopPropagation(); setTreeViewMode('select')" title="Select Mode: 100% clickable cards, clean reading">
        🎯 Select Mode
      </button>
      <button class="tree-mode-toggle-btn ${treeViewMode === 'edit' ? 'active' : ''}" onclick="event.stopPropagation(); setTreeViewMode('edit')" title="Edit Mode: Rename nodes and modify tree structure">
        ✏️ Edit Mode
      </button>
    </div>
  `;
  futureZone.appendChild(futureHeader);

  if (!isFutureZoneCollapsed) {
    if (childCount > 0) {
      const pathwayList = document.createElement('div');
      pathwayList.className = `tree-pathway-list ${treeViewMode === 'select' ? 'mode-select' : 'mode-edit'}`;

      activeNode.children.forEach((childNode) => {
        renderPathwayCard(childNode, activeNode.depth + 1, pathwayList, maxAllowedDepth);
      });

      // In Edit Mode (or accessible at bottom), allow adding new pathway option
      if (treeViewMode === 'edit') {
        const addPathwayBtn = document.createElement('button');
        addPathwayBtn.className = 'tree-add-pathway-btn';
        addPathwayBtn.innerHTML = `<span>+</span><span>Add New Pathway Option (H${activeNode.depth + 2})</span>`;
        addPathwayBtn.onclick = () => addChildToActiveNode();
        pathwayList.appendChild(addPathwayBtn);
      }

      futureZone.appendChild(pathwayList);
    } else {
      const emptyDiv = document.createElement('div');
      emptyDiv.className = 'tree-empty-future';
      emptyDiv.innerHTML = `
        <div style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 0.75rem;">
          No sub-items branched from <strong>${activeNode.label}</strong> (H${activeNode.depth + 1}) yet.
        </div>
        <button class="tree-add-pathway-btn" onclick="addChildToActiveNode()">
          <span>+</span><span>Add First Child Pathway (H${activeNode.depth + 2})</span>
        </button>
      `;
      futureZone.appendChild(emptyDiv);
    }
  }

  container.appendChild(futureZone);
}

/* Helper: Create a row in the Structured Past timeline */
function createTimelineRow(node, isFocal, stepIdx, totalAncestors) {
  const stepWrapper = document.createElement('div');
  stepWrapper.className = `tree-past-step ${isFocal ? 'active-focal' : ''}`;

  // 1. Spine Node Anchor
  const anchor = document.createElement('div');
  anchor.className = `tree-past-step-anchor ${isFocal ? 'focal' : ''}`;
  const hLevel = node.depth + 1;
  anchor.textContent = isFocal ? '🎯' : `H${hLevel}`;
  anchor.title = isFocal ? `Active Focal Node (H${hLevel})` : `Ancestor Step ${stepIdx + 1} (H${hLevel})`;
  anchor.onclick = (e) => {
    e.stopPropagation();
    selectTreeNode(node.id);
  };
  stepWrapper.appendChild(anchor);

  // 2. Horizontal Connector Arm
  const arm = document.createElement('div');
  arm.className = 'tree-past-step-arm';
  stepWrapper.appendChild(arm);

  // 3. Past Row Card
  const row = document.createElement('div');
  row.className = `tree-past-row ${isFocal ? 'active-focal' : ''} ${treeViewMode === 'select' ? 'clickable-card' : ''}`;

  const hBadge = document.createElement('span');
  hBadge.className = `tree-heading-badge h-level-${Math.min(hLevel, 7)}`;
  hBadge.textContent = "H" + hLevel;
  row.appendChild(hBadge);

  const icon = document.createElement('span');
  icon.className = 'tree-node-icon';
  icon.textContent = node.icon || (node.children && node.children.length > 0 ? '📁' : '📄');
  row.appendChild(icon);

  const labelZone = document.createElement('div');
  labelZone.className = 'tree-node-label-zone';

  if (treeViewMode === 'edit') {
    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'tree-ghost-input';
    input.value = node.label;
    if (isFocal) input.style.fontWeight = '700';
    input.oninput = (e) => {
      node.label = e.target.value;
      renderBreadcrumbs();
      renderLiveJSON();
    };
    input.onclick = (e) => {
      e.stopPropagation();
      selectTreeNode(node.id);
    };
    labelZone.appendChild(input);
  } else {
    // Select Mode: Clean typography label
    const titleText = document.createElement('span');
    titleText.className = `tree-node-title-text ${isFocal ? 'focal-title' : ''}`;
    titleText.textContent = node.label;
    labelZone.appendChild(titleText);
  }
  row.appendChild(labelZone);

  // Step Tag
  const tag = document.createElement('span');
  if (isFocal) {
    tag.className = 'tree-past-tag focal';
    tag.innerHTML = `<span>🎯</span><span>ACTIVE FOCAL NEXUS</span>`;
  } else {
    tag.className = 'tree-past-tag ancestor';
    tag.textContent = `🔗 Step ${stepIdx + 1} of ${totalAncestors}`;
  }
  row.appendChild(tag);

  // Action buttons on hover (Only in Edit Mode)
  if (treeViewMode === 'edit') {
    const actionRail = document.createElement('div');
    actionRail.className = 'tree-action-rail';

    const addBtn = document.createElement('button');
    addBtn.className = 'tree-ghost-btn';
    addBtn.title = `Add Child (H${node.depth + 2})`;
    addBtn.textContent = '+';
    addBtn.onclick = (e) => {
      e.stopPropagation();
      addChildNode(node);
    };
    actionRail.appendChild(addBtn);

    const delBtn = document.createElement('button');
    delBtn.className = 'tree-ghost-btn delete';
    delBtn.title = 'Delete Node';
    delBtn.textContent = '✕';
    delBtn.onclick = (e) => {
      e.stopPropagation();
      deleteTreeNode(node.id);
    };
    actionRail.appendChild(delBtn);

    row.appendChild(actionRail);
  }

  row.onclick = () => {
    selectTreeNode(node.id);
  };

  stepWrapper.appendChild(row);
  return stepWrapper;
}

/* Helper: Render a clean Choice Card for an immediate H_{n+1} pathway */
function renderPathwayCard(node, depth, container, maxAllowedDepth) {
  node.depth = depth;
  const hLevel = depth + 1;
  const card = document.createElement('div');
  card.className = `tree-pathway-card ${treeViewMode === 'select' ? 'select-mode-card' : 'edit-mode-card'}`;

  // 1. Header (Immediate Choice H_{n+1})
  const header = document.createElement('div');
  header.className = 'tree-pathway-header';

  const hBadge = document.createElement('span');
  hBadge.className = `tree-heading-badge h-level-${Math.min(hLevel, 7)}`;
  hBadge.textContent = "H" + hLevel;
  header.appendChild(hBadge);

  const icon = document.createElement('span');
  icon.className = 'tree-node-icon';
  icon.textContent = node.icon || (node.children && node.children.length > 0 ? '📁' : '🌿');
  header.appendChild(icon);

  const labelZone = document.createElement('div');
  labelZone.className = 'tree-node-label-zone';

  if (treeViewMode === 'edit') {
    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'tree-ghost-input tree-pathway-title-input';
    input.value = node.label;
    input.oninput = (e) => {
      node.label = e.target.value;
      renderBreadcrumbs();
      renderLiveJSON();
    };
    input.onclick = (e) => {
      e.stopPropagation();
    };
    labelZone.appendChild(input);
  } else {
    // Select Mode: Crisp typography without editable input
    const titleText = document.createElement('span');
    titleText.className = 'tree-node-title-text pathway-heading';
    titleText.textContent = node.label;
    labelZone.appendChild(titleText);
  }
  header.appendChild(labelZone);

  // Sub-items badge or leaf indicator
  const descCount = countDescendants(node);
  if (descCount > 0) {
    const countBadge = document.createElement('span');
    countBadge.className = 'tree-pathway-badge-count';
    countBadge.innerHTML = `<span>${descCount} sub-branch${descCount > 1 ? 'es' : ''}</span> <span class="subtray-fold-icon">▼</span>`;
    countBadge.title = "Click to fold/expand sub-branches";
    countBadge.onclick = (e) => {
      e.stopPropagation();
      const subtray = card.querySelector('.tree-pathway-subtray');
      if (subtray) {
        const isHidden = subtray.style.display === 'none';
        subtray.style.display = isHidden ? 'flex' : 'none';
        const foldIcon = countBadge.querySelector('.subtray-fold-icon');
        if (foldIcon) foldIcon.textContent = isHidden ? '▼' : '▶';
      }
    };
    header.appendChild(countBadge);
  } else {
    const leafBadge = document.createElement('span');
    leafBadge.className = 'tree-pathway-badge-leaf';
    leafBadge.textContent = 'Leaf Option';
    header.appendChild(leafBadge);
  }

  // Edit Mode Actions
  if (treeViewMode === 'edit') {
    const actionRail = document.createElement('div');
    actionRail.className = 'tree-action-rail';

    const addBtn = document.createElement('button');
    addBtn.className = 'tree-ghost-btn';
    addBtn.title = `Add Sub-Item (H${node.depth + 2})`;
    addBtn.textContent = '+';
    addBtn.onclick = (e) => {
      e.stopPropagation();
      addChildNode(node);
    };
    actionRail.appendChild(addBtn);

    const delBtn = document.createElement('button');
    delBtn.className = 'tree-ghost-btn delete';
    delBtn.title = 'Delete Option';
    delBtn.textContent = '✕';
    delBtn.onclick = (e) => {
      e.stopPropagation();
      deleteTreeNode(node.id);
    };
    actionRail.appendChild(delBtn);
    header.appendChild(actionRail);
  } else {
    // In Select Mode: sleek subtle indicator arrow
    const navArrow = document.createElement('span');
    navArrow.className = 'tree-select-arrow';
    navArrow.innerHTML = '➔';
    header.appendChild(navArrow);
  }

  card.appendChild(header);

  // 2. Sub-pathway Tray for H_{n+2} and H_{n+3}
  if (node.children && node.children.length > 0) {
    const subtray = document.createElement('div');
    subtray.className = 'tree-pathway-subtray';

    node.children.forEach(subChild => {
      renderSubPathwayRows(subChild, depth + 1, subtray, maxAllowedDepth, 1);
    });

    card.appendChild(subtray);
  }

  // 100% Card Hitbox Click in Select Mode
  card.onclick = () => {
    selectTreeNode(node.id);
  };

  container.appendChild(card);
}

/* Helper: Render nested sub-pathway rows inside a choice card tray */
function renderSubPathwayRows(node, depth, container, maxAllowedDepth, relativeIndent) {
  node.depth = depth;
  const hLevel = depth + 1;

  const row = document.createElement('div');
  row.className = `tree-subpathway-row ${treeViewMode === 'select' ? 'clickable-subrow' : ''}`;
  if (relativeIndent > 1) {
    row.style.marginLeft = `${(relativeIndent - 1) * 0.9}rem`;
  }

  const connector = document.createElement('span');
  connector.className = 'tree-subpathway-connector';
  connector.textContent = '↳';
  row.appendChild(connector);

  const hBadge = document.createElement('span');
  hBadge.className = `tree-heading-badge h-level-${Math.min(hLevel, 7)}`;
  hBadge.textContent = "H" + hLevel;
  row.appendChild(hBadge);

  const icon = document.createElement('span');
  icon.className = 'tree-node-icon';
  icon.textContent = node.icon || (node.children && node.children.length > 0 ? '📁' : '📄');
  row.appendChild(icon);

  const labelZone = document.createElement('div');
  labelZone.className = 'tree-node-label-zone';

  if (treeViewMode === 'edit') {
    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'tree-ghost-input';
    input.value = node.label;
    input.oninput = (e) => {
      node.label = e.target.value;
      renderBreadcrumbs();
      renderLiveJSON();
    };
    input.onclick = (e) => {
      e.stopPropagation();
    };
    labelZone.appendChild(input);
  } else {
    // Select Mode: Crisp label text
    const titleText = document.createElement('span');
    titleText.className = 'tree-node-title-text subpathway-heading';
    titleText.textContent = node.label;
    labelZone.appendChild(titleText);
  }
  row.appendChild(labelZone);

  // Edit Mode Actions
  if (treeViewMode === 'edit') {
    const actionRail = document.createElement('div');
    actionRail.className = 'tree-action-rail';

    const addBtn = document.createElement('button');
    addBtn.className = 'tree-ghost-btn';
    addBtn.title = `Add Child (H${node.depth + 2})`;
    addBtn.textContent = '+';
    addBtn.onclick = (e) => {
      e.stopPropagation();
      addChildNode(node);
    };
    actionRail.appendChild(addBtn);

    const delBtn = document.createElement('button');
    delBtn.className = 'tree-ghost-btn delete';
    delBtn.title = 'Delete Node';
    delBtn.textContent = '✕';
    delBtn.onclick = (e) => {
      e.stopPropagation();
      deleteTreeNode(node.id);
    };
    actionRail.appendChild(delBtn);
    row.appendChild(actionRail);
  }

  // Row selection handler
  row.onclick = (e) => {
    e.stopPropagation();
    selectTreeNode(node.id);
  };

  container.appendChild(row);

  // Render deeper children if within (n+3) depth limit
  if (node.children && node.children.length > 0) {
    if (depth < maxAllowedDepth) {
      node.children.forEach(c => {
        renderSubPathwayRows(c, depth + 1, container, maxAllowedDepth, relativeIndent + 1);
      });
    } else {
      const pruneDiv = document.createElement('div');
      pruneDiv.className = 'tree-pruned-indicator';
      pruneDiv.innerHTML = `
        <span>⚡</span>
        <span>${node.children.length} deeper item${node.children.length > 1 ? 's' : ''} (H${depth + 2}+) hidden by depth limit. Click to expand.</span>
      `;
      pruneDiv.onclick = (e) => {
        e.stopPropagation();
        selectTreeNode(node.id);
      };
      container.appendChild(pruneDiv);
    }
  }
}

function selectTreeNode(id) {
  activeTreeNodeId = id;
  mockDatabase.selectedTreeNodeId = id;
  renderTreeView();
  renderLiveJSON();
  const node = findNodeById(treeData, id);
  if (node) {
    fireToast(`Focused H${node.depth + 1}: ${node.label}`);
  }
}

function addChildNode(parentNode) {
  const newChild = {
    id: "node-" + Date.now().toString(36),
    label: "New H" + (parentNode.depth + 2) + " Sub-Item",
    icon: "🏷️",
    depth: parentNode.depth + 1,
    children: []
  };
  parentNode.children = parentNode.children || [];
  parentNode.children.push(newChild);
  activeTreeNodeId = newChild.id;
  mockDatabase.selectedTreeNodeId = newChild.id;
  renderTreeView();
  renderLiveJSON();
  fireToast("Added Child to " + parentNode.label);
}

function addChildToActiveNode() {
  const active = findNodeById(treeData, activeTreeNodeId);
  if (active) {
    addChildNode(active);
  } else {
    addRootTreeNode();
  }
}

function addRootTreeNode() {
  const newRoot = {
    id: "root-" + Date.now().toString(36),
    label: "New H1 Category Branch",
    icon: "📁",
    depth: 0,
    children: []
  };
  treeData.push(newRoot);
  activeTreeNodeId = newRoot.id;
  mockDatabase.selectedTreeNodeId = newRoot.id;
  renderTreeView();
  renderLiveJSON();
  fireToast("Added New Root Branch (H1)");
}

function deleteTreeNode(id) {
  function removeRecursive(arr) {
    return arr.filter(item => {
      if (item.id === id) return false;
      if (item.children) item.children = removeRecursive(item.children);
      return true;
    });
  }

  const activePath = getActivePath(treeData, activeTreeNodeId) || [];
  const deletingActiveOrAncestor = activePath.some(n => n.id === id);

  treeData = removeRecursive(treeData);

  if (deletingActiveOrAncestor) {
    activeTreeNodeId = treeData.length > 0 ? treeData[0].id : null;
    mockDatabase.selectedTreeNodeId = activeTreeNodeId;
  }

  renderTreeView();
  renderLiveJSON();
  fireToast("Deleted Node");
}
