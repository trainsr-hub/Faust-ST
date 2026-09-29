/* ==========================================================================
   BLOCK 3: NOTION-STYLE DROPDOWN SELECTOR (SINGLE)
   Persistent Suggestions + Deletion + On-the-Fly Creation
   ========================================================================== */

function toggleSingleDropdown() {
  const menu = document.getElementById('single-combo-menu');
  const trigger = document.getElementById('single-combo-trigger');
  if (!menu || !trigger) return;
  const isOpen = menu.classList.contains('open');
  closeAllDropdowns();
  if (!isOpen) {
    menu.classList.add('open');
    trigger.classList.add('active');
    const searchInput = document.getElementById('single-combo-search');
    if (searchInput) {
      searchInput.value = "";
      filterSingleDropdown("");
      searchInput.focus();
    }
  }
}

function renderSingleOptions(list) {
  const container = document.getElementById('single-options-list');
  if (!container) return;

  if (!list || list.length === 0) {
    container.innerHTML = '<div style="color:var(--text-muted);font-size:0.85rem;padding:0.5rem;">No matching factions.</div>';
    return;
  }

  container.innerHTML = list.map(opt => {
    const isSelected = mockDatabase.associate === opt;
    return `
      <div class="dropdown-opt-row ${isSelected ? 'selected' : ''}" onclick="selectSingleOption('${opt}')">
        <div class="opt-label-group">
          <span>⚡ ${opt}</span>
          ${isSelected ? '<span style="color:var(--accent);font-weight:bold;margin-left:4px;">✓</span>' : ''}
        </div>
        <button class="opt-delete-btn" title="Delete from suggestion pool" onclick="event.stopPropagation(); deleteSingleOption('${opt}')">✕</button>
      </div>
    `;
  }).join('');
}

function deleteSingleOption(opt) {
  availableFactions = availableFactions.filter(f => f !== opt);
  if (mockDatabase.associate === opt) {
    mockDatabase.associate = availableFactions.length > 0 ? availableFactions[0] : "";
    const selectedValEl = document.getElementById('single-selected-val');
    if (selectedValEl) selectedValEl.textContent = mockDatabase.associate ? "⚡ " + mockDatabase.associate : "None";
  }
  const searchInput = document.getElementById('single-combo-search');
  filterSingleDropdown(searchInput ? searchInput.value : "");
  renderLiveJSON();
  fireToast("Deleted faction option: " + opt);
}

function filterSingleDropdown(q) {
  const query = (q || "").trim();
  const filtered = availableFactions.filter(f => f.toLowerCase().includes(query.toLowerCase()));
  renderSingleOptions(filtered);

  const createRow = document.getElementById('single-create-row');
  const createQuery = document.getElementById('single-create-query');
  if (createRow && createQuery) {
    if (query.length > 0 && !availableFactions.some(f => f.toLowerCase() === query.toLowerCase())) {
      createRow.style.display = 'flex';
      createQuery.textContent = query;
    } else {
      createRow.style.display = 'none';
    }
  }
}

function selectSingleOption(opt) {
  mockDatabase.associate = opt;
  const selectedValEl = document.getElementById('single-selected-val');
  if (selectedValEl) selectedValEl.textContent = "⚡ " + opt;
  closeAllDropdowns();
  renderLiveJSON();
  fireToast("Selected Faction: " + opt);
}

function createSingleOption() {
  const input = document.getElementById('single-combo-search');
  if (!input) return;
  const newOpt = input.value.trim();
  if (!newOpt) return;
  if (!availableFactions.includes(newOpt)) {
    availableFactions.push(newOpt);
  }
  selectSingleOption(newOpt);
}

function handleSingleCreateKey(e) {
  if (e.key === 'Enter') {
    const input = document.getElementById('single-combo-search');
    if (!input) return;
    const val = input.value.trim();
    const existing = availableFactions.find(f => f.toLowerCase() === val.toLowerCase());
    if (existing) {
      selectSingleOption(existing);
    } else if (val) {
      createSingleOption();
    }
  }
}

function initSingleSelect() {
  const selectedValEl = document.getElementById('single-selected-val');
  if (selectedValEl && mockDatabase.associate) {
    selectedValEl.textContent = "⚡ " + mockDatabase.associate;
  }
  renderSingleOptions(availableFactions);
}
