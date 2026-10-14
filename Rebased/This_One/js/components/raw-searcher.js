/* ==========================================================================
   BLOCK 2: RAW SEARCHER (INSTANT COMMAND BAR)
   ========================================================================== */

function handleSearch(query) {
  const q = (query || "").trim().toLowerCase();
  const countEl = document.getElementById('search-count');

  if (!q) {
    renderSearchResults(allSearchRecords);
    if (countEl) countEl.textContent = `${allSearchRecords.length} items found`;
    return;
  }

  const filtered = allSearchRecords.filter(r =>
    r.id.toLowerCase().includes(q) ||
    r.name.toLowerCase().includes(q) ||
    r.faction.toLowerCase().includes(q)
  );

  renderSearchResults(filtered);
  if (countEl) countEl.textContent = `${filtered.length} item${filtered.length !== 1 ? 's' : ''} found`;
}

function selectSearchRecord(rec) {
  mockDatabase.id = rec.id;
  mockDatabase.names.primary = rec.name;
  mockDatabase.associate = rec.faction;

  // Sync inputs
  const charIdInput = document.getElementById('input-char-id');
  if (charIdInput) charIdInput.value = rec.id;

  // Sync active target indicator banner
  const bannerName = document.getElementById('search-active-name');
  const bannerId = document.getElementById('search-active-id');
  if (bannerName) bannerName.textContent = rec.name;
  if (bannerId) bannerId.textContent = `ID: ${rec.id} · ${rec.faction}`;

  // Sync Notion Single Combobox
  const singleSelectedVal = document.getElementById('single-selected-val');
  if (singleSelectedVal) singleSelectedVal.textContent = `⚡ ${rec.faction}`;

  // Sync tags if tag list exists
  if (!mockDatabase.names.nicknames.includes(rec.name.split(' ')[0])) {
    mockDatabase.names.nicknames.push(rec.name.split(' ')[0]);
    if (typeof renderMultiTags === 'function') renderMultiTags();
  }

  renderLiveJSON();
  fireToast(`Selected: ${rec.name} (${rec.id})`);
}

function clearSearch() {
  const searchInput = document.getElementById('raw-searcher');
  if (searchInput) {
    searchInput.value = "";
    handleSearch("");
    searchInput.focus();
  }
}

function renderSearchResults(records) {
  const container = document.getElementById('search-results-container');
  if (!container) return;
  container.innerHTML = "";

  if (records.length === 0) {
    container.innerHTML = `<div style="padding:1rem;color:var(--text-dim);font-size:0.85rem;text-align:center;">No matching pre-indexed records found.</div>`;
    return;
  }

  records.forEach(rec => {
    const isSelected = mockDatabase.id === rec.id;
    const item = document.createElement('div');
    item.className = `search-result-item ${isSelected ? 'selected-record' : ''}`;
    item.onclick = () => selectSearchRecord(rec);

    item.innerHTML = `
      <div class="result-info">
        <span class="result-id-badge">${rec.id}</span>
        <span class="result-name">${rec.name}</span>
        <span class="result-faction-tag">${rec.faction}</span>
      </div>
      <button class="result-select-btn" onclick="event.stopPropagation(); selectSearchRecord(${JSON.stringify(rec).replace(/"/g, '&quot;')})">
        ${isSelected ? '✓ Active' : 'Select'}
      </button>
    `;
    container.appendChild(item);
  });
}
