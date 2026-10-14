/* ==========================================================================
   BLOCK 4: NOTION-STYLE DROPDOWN MULTI-SELECT
   Available Tag Pool + Pinned Suggestions + Deletion + On-the-Fly Creation
   ========================================================================== */

function renderMultiTags() {
  const container = document.getElementById('active-tags-list');
  if (!container) return;
  container.innerHTML = mockDatabase.names.nicknames.map(tag => `
    <span class="tag-chip accent">
      <span># ${tag}</span>
      <span class="tag-chip-remove" onclick="event.stopPropagation(); removeMultiTag('${tag}')">✕</span>
    </span>
  `).join('');
}

function toggleMultiDropdown(forceOpen) {
  const menu = document.getElementById('multi-combo-menu');
  const box = document.getElementById('multi-tag-box');
  if (!menu || !box) return;

  const isOpen = menu.classList.contains('open');
  if (forceOpen === true && isOpen) return;

  if (forceOpen === true || !isOpen) {
    closeAllDropdowns();
    menu.classList.add('open');
    box.classList.add('active');
    const input = document.getElementById('tag-inline-input');
    filterMultiDropdown(input ? input.value : "");
  } else {
    menu.classList.remove('open');
    box.classList.remove('active');
  }
}

function renderMultiOptions(list) {
  const container = document.getElementById('multi-options-list');
  if (!container) return;

  const selected = [];
  const unselected = [];

  list.forEach(tag => {
    if (mockDatabase.names.nicknames.includes(tag)) {
      selected.push(tag);
    } else {
      unselected.push(tag);
    }
  });

  let html = '';
  if (selected.length > 0) {
    html += `<div class="dropdown-group-header">📌 SELECTED (${selected.length})</div>`;
    html += selected.map(tag => `
      <div class="dropdown-opt-row selected" onclick="toggleMultiTagOption('${tag}')">
        <div class="opt-label-group">
          <span class="opt-check" style="color:var(--accent);font-weight:bold;">✓</span>
          <span class="opt-text"># ${tag}</span>
        </div>
        <button class="opt-delete-btn" title="Delete from tag pool" onclick="event.stopPropagation(); deleteMultiTagPoolOption('${tag}')">✕</button>
      </div>
    `).join('');
  }

  if (unselected.length > 0) {
    html += `<div class="dropdown-group-header">🏷️ AVAILABLE SUGGESTIONS (${unselected.length})</div>`;
    html += unselected.map(tag => `
      <div class="dropdown-opt-row" onclick="toggleMultiTagOption('${tag}')">
        <div class="opt-label-group">
          <span class="opt-plus" style="color:var(--text-muted);font-weight:bold;">+</span>
          <span class="opt-text"># ${tag}</span>
        </div>
        <button class="opt-delete-btn" title="Delete from tag pool" onclick="event.stopPropagation(); deleteMultiTagPoolOption('${tag}')">✕</button>
      </div>
    `).join('');
  }

  if (selected.length === 0 && unselected.length === 0) {
    html = '<div style="color:var(--text-muted);font-size:0.85rem;padding:0.5rem;">No matching tags found.</div>';
  }

  container.innerHTML = html;
}

function deleteMultiTagPoolOption(tag) {
  availableTags = availableTags.filter(t => t !== tag);
  mockDatabase.names.nicknames = mockDatabase.names.nicknames.filter(t => t !== tag);
  renderMultiTags();
  const input = document.getElementById('tag-inline-input');
  filterMultiDropdown(input ? input.value : "");
  renderLiveJSON();
  fireToast("Deleted tag from pool: " + tag);
}

function filterMultiDropdown(q) {
  const query = (q || "").trim();
  const filtered = availableTags.filter(t => t.toLowerCase().includes(query.toLowerCase()));
  renderMultiOptions(filtered);

  const createRow = document.getElementById('multi-create-row');
  const createQuery = document.getElementById('multi-create-query');
  if (createRow && createQuery) {
    if (query.length > 0 && !availableTags.some(t => t.toLowerCase() === query.toLowerCase())) {
      createRow.style.display = 'flex';
      createQuery.textContent = query;
    } else {
      createRow.style.display = 'none';
    }
  }
}

function toggleMultiTagOption(tag) {
  if (mockDatabase.names.nicknames.includes(tag)) {
    mockDatabase.names.nicknames = mockDatabase.names.nicknames.filter(t => t !== tag);
    fireToast("Removed tag: " + tag);
  } else {
    mockDatabase.names.nicknames.push(tag);
    fireToast("Added tag: " + tag);
  }
  renderMultiTags();
  const input = document.getElementById('tag-inline-input');
  filterMultiDropdown(input ? input.value : "");
  renderLiveJSON();
}

function createMultiTagOption() {
  const input = document.getElementById('tag-inline-input');
  if (!input) return;
  const newTag = input.value.replace(/,/g, '').trim();
  if (!newTag) return;
  if (!availableTags.includes(newTag)) {
    availableTags.push(newTag);
  }
  if (!mockDatabase.names.nicknames.includes(newTag)) {
    mockDatabase.names.nicknames.push(newTag);
  }
  input.value = "";
  renderMultiTags();
  filterMultiDropdown("");
  renderLiveJSON();
  fireToast("Created Tag: " + newTag);
}

function handleTagInputKey(e) {
  if (e.key === 'Enter' || e.key === ',') {
    e.preventDefault();
    createMultiTagOption();
  } else if (e.key === 'Backspace' && e.target.value === '') {
    if (mockDatabase.names.nicknames.length > 0) {
      const removed = mockDatabase.names.nicknames.pop();
      renderMultiTags();
      filterMultiDropdown("");
      renderLiveJSON();
      fireToast("Removed: " + removed);
    }
  }
}

function removeMultiTag(tag) {
  mockDatabase.names.nicknames = mockDatabase.names.nicknames.filter(t => t !== tag);
  renderMultiTags();
  const input = document.getElementById('tag-inline-input');
  filterMultiDropdown(input ? input.value : "");
  renderLiveJSON();
  fireToast("Removed Tag: " + tag);
}

function initMultiSelect() {
  renderMultiTags();
  renderMultiOptions(availableTags);
}
