/* ==========================================================================
   BLOCK 1: RAW TEXT INPUT & PROMPT AREA
   ========================================================================== */

function initRawText() {
  const idInput = document.getElementById('input-char-id');
  const prptTextarea = document.getElementById('input-char-prpt');

  if (idInput) {
    idInput.value = mockDatabase.id || '';
  }
  if (prptTextarea) {
    prptTextarea.value = mockDatabase._prpt_ || '';
  }
}
