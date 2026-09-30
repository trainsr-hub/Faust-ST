const STORAGE_KEYS = Object.freeze({
  current: 'portraitForge.current.v1',
  saved: 'portraitForge.saved.v1'
});

function safeRead(key, fallback) {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
}

function safeWrite(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

export function loadCurrentCharacter(fallback) {
  return safeRead(STORAGE_KEYS.current, fallback);
}

export function persistCurrentCharacter(character) {
  return safeWrite(STORAGE_KEYS.current, character);
}

export function listSavedCharacters() {
  return safeRead(STORAGE_KEYS.saved, []);
}

export function saveCharacter(character) {
  const saved = listSavedCharacters();
  const entry = { ...character, id: character.id || crypto.randomUUID(), updatedAt: new Date().toISOString() };
  const index = saved.findIndex((item) => item.id === entry.id);

  if (index >= 0) saved[index] = entry;
  else saved.unshift(entry);

  safeWrite(STORAGE_KEYS.saved, saved.slice(0, 24));
  return entry;
}

export function deleteSavedCharacter(id) {
  const saved = listSavedCharacters().filter((character) => character.id !== id);
  return safeWrite(STORAGE_KEYS.saved, saved);
}
