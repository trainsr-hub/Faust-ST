/* ==========================================================================
   BLOCKS 5 & 6: TOGGLE SWITCHES & CHECKBOXES
   Full-Surface Fitts's Law Hitboxes & Boolean Flags
   ========================================================================== */

function initTogglesAndCheckboxes() {
  const egoToggle = document.getElementById('toggle-ego');
  if (egoToggle && mockDatabase.settings) {
    egoToggle.checked = Boolean(mockDatabase.settings.autoResolveEgo);
  }

  const stealthToggle = document.getElementById('toggle-stealth');
  if (stealthToggle && mockDatabase.settings) {
    stealthToggle.checked = Boolean(mockDatabase.settings.stealthMode);
  }

  const chk1 = document.getElementById('chk-1');
  if (chk1 && mockDatabase.settings) {
    chk1.checked = Boolean(mockDatabase.settings.enableTaxonomy);
  }

  const chk2 = document.getElementById('chk-2');
  if (chk2 && mockDatabase.settings) {
    chk2.checked = Boolean(mockDatabase.settings.hardwareAccelerated);
  }

  const chk3 = document.getElementById('chk-3');
  if (chk3 && mockDatabase.settings) {
    chk3.checked = Boolean(mockDatabase.settings.strictZeroLLM);
  }
}
