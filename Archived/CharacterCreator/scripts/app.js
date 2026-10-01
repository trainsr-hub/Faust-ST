import { renderCharacter } from './renderer.js';
import { deleteSavedCharacter, listSavedCharacters, loadCurrentCharacter, persistCurrentCharacter, saveCharacter } from './storage.js';

const defaultCharacter = {
  id: '', name: 'Akari',
  skin: { id: 'skin-fair', color: '#F8D7CE', shade: '#E9B6AA' },
  eyes: { id: 'eyes-round', iris: 'round', color: '#3F6DA8' },
  hair: { base: 'hair-base-long-straight', parts: ['hair-part-bangs'], color: '#694231' }
};

const $ = (selector) => document.querySelector(selector);
const state = { catalog: null, activeTab: 'skin', character: { ...defaultCharacter }, toastTimer: null };

function selectedItem(type, id) { return state.catalog[type].find((item) => item.id === id); }
function selectedBase(id) { return state.catalog.hair.bases.find((item) => item.id === id); }
function selectedPart(id) { return state.catalog.hair.parts.find((item) => item.id === id); }
function escapeHtml(value) { const el = document.createElement('span'); el.textContent = value; return el.innerHTML; }

function optionIcon(type) {
  const icons = {
    eyes: '<svg viewBox="0 0 32 28" aria-hidden="true"><ellipse cx="16" cy="14" rx="11" ry="9" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="16" cy="14" r="5" fill="currentColor"/><circle cx="13" cy="12" r="2" fill="#fff" opacity=".7"/></svg>',
    hair: '<svg viewBox="0 0 32 28" aria-hidden="true"><path d="M5 26V12C5 2 27 2 27 12v14l-5-8-4 8-5-8-4 8-4-8Z"/></svg>'
  };
  return icons[type] || '';
}

function describeCharacter() {
  const { character } = state;
  const skin = selectedItem('skin', character.skin.id)?.name.toLowerCase() || 'fair';
  const iris = selectedItem('eyes', character.eyes.id)?.name.toLowerCase() || 'round iris';
  const hairBase = selectedBase(character.hair.base);
  const baseName = hairBase?.name.toLowerCase() || 'styled';
  const parts = (character.hair.parts || []).map(id => selectedPart(id)?.name).filter(Boolean);
  const partsDesc = parts.length ? ` + ${parts.join(', ')}` : '';
  return ['anime portrait', `${skin}`, `${iris} in ${colorName(character.eyes.color)}`, `${baseName}${partsDesc} in ${colorName(character.hair.color)}`, 'clean cel shading', 'soft studio backdrop'].join(', ');
}

function colorName(hex) {
  const colors = { '#6D4C41':'brown', '#3F6DA8':'blue', '#4E9A78':'green', '#A25D8B':'rose', '#8B5BB8':'violet', '#D58A32':'amber', '#271A22':'black', '#694231':'brown', '#B06D3B':'auburn', '#E8C7A8':'blonde', '#C55B79':'pink', '#5B6BAE':'blue', '#82A26E':'green' };
  return colors[hex] || 'custom';
}

function setFeature(type, id) {
  if (type === 'skin') {
    const item = selectedItem(type, id);
    state.character.skin = { id: item.id, color: item.color, shade: item.shade };
  } else if (type === 'eyes') {
    const item = selectedItem(type, id);
    state.character.eyes = { ...state.character.eyes, id: item.id, iris: item.iris };
  } else if (type === 'hair') {
    const base = selectedBase(id);
    if (base) {
      state.character.hair.base = id;
    }
  }
  sync();
}

function toggleHairPart(id) {
  if (!state.character.hair.parts) state.character.hair.parts = [];
  const parts = state.character.hair.parts;
  const index = parts.indexOf(id);
  if (index > -1) {
    parts.splice(index, 1);
  } else {
    parts.push(id);
  }
  sync();
}

function colorPicker(label, values, selected) {
  return `<div class="control-section"><div class="control-title"><div><h3>${label}</h3><p>Choose a color.</p></div></div><div class="color-row">${values.map((color) => `<button class="color-dot" type="button" style="background:${color}" aria-label="Use ${colorName(color)}" aria-pressed="${color === selected}" data-color="${color}"></button>`).join('')}</div></div>`;
}

function hairLengthBadge(length) {
  const labels = { short: 'Short', mid: 'Medium', long: 'Long' };
  return `<small>${labels[length] || length}</small>`;
}

function renderTab() {
  const host = $('#customization-content');
  const tab = state.activeTab;

  if (tab === 'skin') {
    host.innerHTML = `<div class="control-section"><div class="control-title"><div><h3>Skin tone</h3><p>Choose the canvas for your portrait.</p></div></div><div class="option-grid skin-grid">${state.catalog.skin.map((item) => `<button type="button" class="option-card" aria-pressed="${item.id === state.character.skin.id}" data-feature="skin" data-id="${item.id}"><span class="option-swatch" style="background:${item.color}"></span><span>${escapeHtml(item.name)}</span></button>`).join('')}</div></div>`;
  }

  if (tab === 'eyes') {
    host.innerHTML = `<div class="control-section"><div class="control-title"><div><h3>Iris shape</h3><p>Pick an iris style.</p></div></div><div class="option-grid">${state.catalog.eyes.map((item) => `<button type="button" class="option-card" aria-pressed="${item.id === state.character.eyes.id}" data-feature="eyes" data-id="${item.id}"><span class="option-icon">${optionIcon('eyes')}</span><span>${escapeHtml(item.name)}</span></button>`).join('')}</div></div>${colorPicker('Iris color', state.catalog.palette.eyes, state.character.eyes.color)}`;
  }

  if (tab === 'hair') {
    const hair = state.catalog.hair;
    const activeParts = state.character.hair.parts || [];
    const hairColor = state.character.hair.color;

    host.innerHTML = `
      <div class="control-section">
        <div class="control-title"><div><h3>Hair silhouette</h3><p>Pick a base cut and length.</p></div></div>
        <div class="option-grid">
          ${hair.bases.map((item) => `
            <button type="button" class="option-card" aria-pressed="${item.id === state.character.hair.base}" data-feature="hair" data-id="${item.id}">
              <span class="option-icon">${optionIcon('hair')}</span>
              <span>${escapeHtml(item.name)}</span>
              ${hairLengthBadge(item.length)}
            </button>
          `).join('')}
        </div>
      </div>
      <div class="control-section">
        <div class="control-title"><div><h3>Additive pieces</h3><p>Layer on extra parts (multi‑select).</p></div></div>
        <div class="parts-grid">
          ${hair.parts.map((item) => `
            <button type="button" class="part-chip" aria-pressed="${activeParts.includes(item.id)}" data-part="${item.id}">
              ${escapeHtml(item.name)}
            </button>
          `).join('')}
        </div>
      </div>
      ${colorPicker('Hair color', state.catalog.palette.hair, hairColor)}
    `;
  }
}

function sync() {
  persistCurrentCharacter(state.character);
  renderCharacter($('#portrait-stage'), state.character);
  $('#character-name').value = state.character.name;
  $('#prompt-output').textContent = describeCharacter();
  renderTab();
  renderSavedCount();
}

function renderSavedCount() { $('#saved-count').textContent = listSavedCharacters().length; }
function showToast(message) { const toast = $('#toast'); toast.textContent = message; toast.hidden = false; clearTimeout(state.toastTimer); state.toastTimer = setTimeout(() => { toast.hidden = true; }, 2800); }

function renderSavedRoster() {
  const saved = listSavedCharacters();
  $('#saved-grid').innerHTML = saved.length
    ? saved.map((character) => {
        const iris = character.eyes?.iris || 'round';
        const base = selectedBase(character.hair?.base);
        const baseName = base?.name.toLowerCase() || 'styled';
        const partsCount = character.hair?.parts?.length || 0;
        const partsInfo = partsCount ? ` +${partsCount} extra` : '';
        return `<article class="saved-card"><h3>${escapeHtml(character.name || 'Untitled')}</h3><p>${escapeHtml(iris)} iris · ${escapeHtml(baseName)}${partsInfo}</p><div class="saved-card-actions"><button type="button" data-load="${character.id}">Load</button><button type="button" data-delete="${character.id}">Delete</button></div></article>`;
      }).join('')
    : '<p class="empty-state">Your roster is waiting. Save a portrait to preserve this build.</p>';
}

function randomItem(items) { return items[Math.floor(Math.random() * items.length)]; }
function randomize() {
  const skin = randomItem(state.catalog.skin);
  const eyes = randomItem(state.catalog.eyes);
  const hairBase = randomItem(state.catalog.hair.bases);
  const hairParts = Math.random() > 0.5 ? [randomItem(state.catalog.hair.parts).id] : [];
  state.character = {
    id: '', name: 'New Muse',
    skin: { id: skin.id, color: skin.color, shade: skin.shade },
    eyes: { id: eyes.id, iris: eyes.iris, color: randomItem(state.catalog.palette.eyes) },
    hair: { base: hairBase.id, parts: hairParts, color: randomItem(state.catalog.palette.hair) }
  };
  sync(); showToast('A fresh portrait is ready.');
}

function exportJson() {
  const exportData = { version: '1.0', portrait: state.character, prompt: describeCharacter(), exportedAt: new Date().toISOString() };
  const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
  const link = document.createElement('a'); link.href = URL.createObjectURL(blob); link.download = `${(state.character.name || 'portrait').toLowerCase().replace(/[^a-z0-9]+/g, '-')}.json`; link.click(); URL.revokeObjectURL(link.href); showToast('Character JSON downloaded.');
}

async function copyPrompt() {
  try { await navigator.clipboard.writeText(describeCharacter()); showToast('Prompt copied to clipboard.'); }
  catch { showToast('Select and copy the prompt manually.'); }
}

function bindEvents() {
  document.addEventListener('click', (event) => {
    const tab = event.target.closest('[data-tab]'); if (tab) { state.activeTab = tab.dataset.tab; document.querySelectorAll('[role="tab"]').forEach((button) => button.setAttribute('aria-selected', String(button === tab))); renderTab(); }
    const feature = event.target.closest('[data-feature]'); if (feature) setFeature(feature.dataset.feature, feature.dataset.id);
    const part = event.target.closest('[data-part]'); if (part) toggleHairPart(part.dataset.part);
    const color = event.target.closest('[data-color]'); if (color) { if (state.activeTab === 'eyes') state.character.eyes.color = color.dataset.color; if (state.activeTab === 'hair') state.character.hair.color = color.dataset.color; sync(); }
    const load = event.target.closest('[data-load]'); if (load) { const character = listSavedCharacters().find((item) => item.id === load.dataset.load); if (character) { state.character = character; sync(); $('#saved-drawer').hidden = true; showToast(`${character.name || 'Character'} loaded.`); } }
    const remove = event.target.closest('[data-delete]'); if (remove) { deleteSavedCharacter(remove.dataset.delete); renderSavedRoster(); renderSavedCount(); showToast('Portrait removed from roster.'); }
  });
  $('#character-name').addEventListener('input', (event) => { state.character.name = event.target.value; persistCurrentCharacter(state.character); renderCharacter($('#portrait-stage'), state.character); });
  $('#randomize-button').addEventListener('click', randomize);
  $('#save-button').addEventListener('click', () => { state.character = saveCharacter(state.character); sync(); showToast(`${state.character.name || 'Portrait'} saved to your roster.`); });
  $('#copy-prompt-button').addEventListener('click', copyPrompt); $('#json-export-button').addEventListener('click', exportJson);
  $('#saved-button').addEventListener('click', () => { renderSavedRoster(); $('#saved-drawer').hidden = false; $('#saved-drawer').scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' }); });
  $('#close-saved-button').addEventListener('click', () => { $('#saved-drawer').hidden = true; });
  $('#theme-toggle').addEventListener('click', () => { const isDark = document.documentElement.dataset.theme === 'dark'; document.documentElement.dataset.theme = isDark ? 'light' : 'dark'; });
}

async function init() {
  const response = await fetch('./data/features.json');
  if (!response.ok) throw new Error('Could not load the feature catalog.');
  state.catalog = await response.json();
  state.character = loadCurrentCharacter(defaultCharacter);
  bindEvents(); sync();
}

init().catch((error) => { console.error(error); $('#customization-content').innerHTML = '<p class="empty-state">The feature catalog could not load. Serve this folder from a local web server, then try again.</p>'; });