/* ==========================================================================
   LIVE STATE INSPECTOR & TOAST SYSTEM
   Syntax-Highlighted JSON Stream & Ephemeral Notifications
   ========================================================================== */

function nodeToSummary(n) {
  return {
    id: n.id,
    level: "H" + (n.depth + 1),
    label: n.label,
    children: (n.children || []).map(nodeToSummary)
  };
}

function renderLiveJSON() {
  const jsonPre = document.getElementById('live-json-pre');
  if (!jsonPre) return;

  const activePath = (typeof getActivePath === 'function') ? getActivePath(treeData, activeTreeNodeId) || [] : [];
  const activeNode = (typeof findNodeById === 'function') ? findNodeById(treeData, activeTreeNodeId) : null;

  const output = {
    ...mockDatabase,
    activeFocusedNode: activeNode ? {
      id: activeNode.id,
      label: activeNode.label,
      headingLevel: "H" + (activeNode.depth + 1),
      path: activePath.map(n => "H" + (n.depth + 1) + ": " + n.label)
    } : null,
    taxonomyTreeSnapshot: (treeData || []).map(nodeToSummary)
  };

  const formatted = JSON.stringify(output, null, 2);
  const highlighted = formatted
    .replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, function (match) {
      let cls = 'json-num';
      if (/^"/.test(match)) {
        if (/:$/.test(match)) {
          cls = 'json-key';
        } else {
          cls = 'json-str';
        }
      } else if (/true|false/.test(match)) {
        cls = 'json-bool';
      }
      return '<span class="' + cls + '">' + match + '</span>';
    });

  jsonPre.innerHTML = highlighted;
}

function fireToast(msg) {
  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.textContent = msg;
  toast.classList.add('show');
  clearTimeout(window.toastTimer);
  window.toastTimer = setTimeout(() => toast.classList.remove('show'), 2000);
}
