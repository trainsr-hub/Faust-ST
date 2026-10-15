/**
 * Faust Tournament Arena - Clean MVP Client Engine
 * Backed by SQLite ACID Persistence (participants, participant_albums, matches)
 * Faithful to D:\My Drive\Blue AI\Old Stuffs\the.css & the.md
 */

let tournamentState = null;
let currentSlotData = {};
let currentScoreMatchId = null;
let activeScrubberRound = "all";

const MATCH_SLOTS = {
  1: ["l1", "l2", "l9"], 2: ["l3", "l4", "l10"], 3: ["l5", "l6", "l11"], 4: ["l7", "l8", "l12"],
  5: ["r1", "r2", "r9"], 6: ["r3", "r4", "r10"], 7: ["r5", "r6", "r11"], 8: ["r7", "r8", "r12"],
  9: ["l9", "l10", "l13"], 10: ["l11", "l12", "l14"], 11: ["r9", "r10", "r13"], 12: ["r11", "r12", "r14"],
  13: ["l13", "l14", "l15"], 14: ["r13", "r14", "r15"], 15: ["l15", "r15", null]
};

const ALL_SLOTS = [
  "l1","l2","l3","l4","l5","l6","l7","l8",
  "l9","l10","l11","l12","l13","l14","l15",
  "r1","r2","r3","r4","r5","r6","r7","r8",
  "r9","r10","r11","r12","r13","r14","r15"
];

document.addEventListener("DOMContentLoaded", () => {
  initEventListeners();
  buildSlotElements();
  loadTournamentData();
  window.addEventListener("resize", debounceDrawSVG);
});

function initEventListeners() {
  document.querySelectorAll(".round-step-btn").forEach((btn) => {
    btn.addEventListener("click", () => setScrubberRound(btn.dataset.round));
  });

  document.getElementById("btn-simulate-next").addEventListener("click", handleSimulateNext);
  document.getElementById("btn-simulate-all").addEventListener("click", handleSimulateAll);
  document.getElementById("btn-reset").addEventListener("click", handleReset);
  document.getElementById("btn-close-modal").addEventListener("click", closeModal);
  document.getElementById("btn-close-score-modal").addEventListener("click", closeScoreModal);
  document.getElementById("score-form").addEventListener("submit", handleScoreSubmit);

  document.getElementById("participant-modal").addEventListener("click", (e) => {
    if (e.target.id === "participant-modal") closeModal();
  });
  document.getElementById("score-modal").addEventListener("click", (e) => {
    if (e.target.id === "score-modal") closeScoreModal();
  });
}

function setScrubberRound(roundStr) {
  activeScrubberRound = roundStr;
  document.querySelectorAll(".round-step-btn").forEach((b) => {
    b.classList.toggle("active", b.dataset.round === roundStr);
  });
  applyScrubberFilter();
}

function applyScrubberFilter() {
  ALL_SLOTS.forEach((cls) => {
    const el = document.getElementById(`slot-${cls}`);
    if (!el) return;
    if (activeScrubberRound === "all") {
      el.style.opacity = "";
      return;
    }
    const r = getSlotRound(cls);
    el.style.opacity = (r === parseInt(activeScrubberRound, 10)) ? "" : "0.2";
  });
}

function getSlotRound(cls) {
  if (["l1","l2","l3","l4","l5","l6","l7","l8","r1","r2","r3","r4","r5","r6","r7","r8"].includes(cls)) return 1;
  if (["l9","l10","l11","l12","r9","r10","r11","r12"].includes(cls)) return 2;
  if (["l13","l14","r13","r14"].includes(cls)) return 3;
  return 4;
}

function buildSlotElements() {
  const container = document.getElementById("bracket-container");
  if (!container) return;
  container.querySelectorAll(".avatar").forEach((el) => el.remove());
  ALL_SLOTS.forEach((cls) => {
    const el = document.createElement("div");
    el.id = `slot-${cls}`;
    el.className = `avatar ${cls} is-empty`;
    container.appendChild(el);
  });
}

async function loadTournamentData() {
  try {
    const res = await fetch("/api/tournament");
    if (!res.ok) throw new Error("Failed to fetch tournament state");
    tournamentState = await res.json();
    renderBracketSlots();
    requestAnimationFrame(() => requestAnimationFrame(drawBracketSVG));
  } catch (err) {
    console.error("Error loading tournament:", err);
  }
}

function renderBracketSlots() {
  if (!tournamentState || !tournamentState.matches) return;
  const matchMap = {};
  tournamentState.matches.forEach((m) => { matchMap[m.id] = m; });

  currentSlotData = {};
  const eliminated = new Set();

  for (let mId = 1; mId <= 15; mId++) {
    const m = matchMap[mId];
    if (!m) continue;
    const [s1, s2, sw] = MATCH_SLOTS[mId];

    if (mId <= 8) {
      if (m.participant1) currentSlotData[s1] = m.participant1;
      if (m.participant2) currentSlotData[s2] = m.participant2;
    }
    if (m.status === "completed" && m.winner && sw) {
      currentSlotData[sw] = m.winner;
      const loserId = m.participant1_id === m.winner_id ? m.participant2_id : m.participant1_id;
      eliminated.add(loserId);
    }
  }

  // Champion in Match 15
  const finalMatch = matchMap[15];
  let championSlot = null;
  let finalLoserSlot = null;
  if (finalMatch && finalMatch.status === "completed" && finalMatch.winner_id) {
    championSlot = finalMatch.winner_id === finalMatch.participant1_id ? "l15" : "r15";
    finalLoserSlot = championSlot === "l15" ? "r15" : "l15";
  }

  ALL_SLOTS.forEach((cls) => {
    const el = document.getElementById(`slot-${cls}`);
    const fighter = currentSlotData[cls];
    if (!el) return;

    if (fighter) {
      const isChamp = (cls === championSlot);
      const isElim = (cls === finalLoserSlot) || (eliminated.has(fighter.id) && cls !== "l15" && cls !== "r15");
      renderFighterInSlot(el, cls, fighter, isElim, isChamp);
    } else {
      el.className = `avatar ${cls} is-empty`;
      el.title = "Empty Slot";
      el.innerHTML = "";
      el.onclick = null;
    }
  });

  applyScrubberFilter();
}

function renderFighterInSlot(el, cls, f, isElim, isChamp = false) {
  const champClass = isChamp ? "is-champion" : "";
  const elimClass = isElim ? "is-eliminated" : "is-victor";
  el.className = `avatar ${cls} has-fighter ${elimClass} ${champClass}`.trim();
  el.onclick = () => openParticipantModal(f.id);
  el.title = isChamp ? `👑 CHAMPION: ${f.name} (${f.origin})` : `${f.name} • ${f.origin}`;

  const crownHtml = isChamp ? `<div class="crown-badge">👑</div>` : "";
  el.innerHTML = `${crownHtml}<img src="${f.avatar_url || ''}" alt="${f.name}" class="avatar-img">`;
}

/* ================= CLEAN SVG ORTHOGONAL DRAW ================= */

function drawBracketSVG() {
  const container = document.getElementById("bracket-container");
  if (!container) return;

  const oldSvg = container.querySelector("svg.bracket-svg-layer");
  if (oldSvg) oldSvg.remove();

  const get = (c) => container.querySelector("." + c);
  const center = (el) => {
    if (!el) return null;
    const r = el.getBoundingClientRect();
    const c = container.getBoundingClientRect();
    return {
      x: r.left - c.left + r.width / 2,
      y: r.top - c.top + r.height / 2
    };
  };

  const svgNS = "http://www.w3.org/2000/svg";
  const svg = document.createElementNS(svgNS, "svg");
  svg.setAttribute("class", "bracket-svg-layer");
  svg.style.position = "absolute";
  svg.style.inset = "0";
  svg.style.zIndex = "1";
  svg.style.pointerEvents = "none";
  svg.setAttribute("width", container.clientWidth);
  svg.setAttribute("height", container.clientHeight);
  container.prepend(svg);

  const path = (a, b, isActive = false) => {
    if (!a || !b) return;
    const midX = (a.x + b.x) / 2;
    const d = `M ${a.x} ${a.y} H ${midX} V ${b.y} H ${b.x}`;
    const p = document.createElementNS(svgNS, "path");
    p.setAttribute("d", d);
    p.setAttribute("fill", "none");
    p.setAttribute("stroke", isActive ? "#e2e8f0" : "#64748b");
    p.setAttribute("stroke-width", isActive ? "2.5" : "2");
    p.setAttribute("stroke-opacity", isActive ? "1" : "0.4");
    svg.appendChild(p);
  };

  const drawSide = (rounds) => {
    for (let i = 0; i < rounds.length - 1; i++) {
      const cur = rounds[i];
      const next = rounds[i + 1];
      for (let j = 0; j < cur.length; j += 2) {
        const slotA = cur[j], slotB = cur[j + 1], slotP = next[Math.floor(j / 2)];
        const elA = get(slotA), elB = get(slotB), elP = get(slotP);
        const fA = currentSlotData[slotA], fB = currentSlotData[slotB], fP = currentSlotData[slotP];
        const isAActive = Boolean(fP && fA && fP.id === fA.id);
        const isBActive = Boolean(fP && fB && fP.id === fB.id);
        if (elA && elP) path(center(elA), center(elP), isAActive);
        if (elB && elP) path(center(elB), center(elP), isBActive);
      }
    }
  };

  drawSide([
    ["l1","l2","l3","l4","l5","l6","l7","l8"],
    ["l9","l10","l11","l12"],
    ["l13","l14"],
    ["l15"]
  ]);

  drawSide([
    ["r1","r2","r3","r4","r5","r6","r7","r8"],
    ["r9","r10","r11","r12"],
    ["r13","r14"],
    ["r15"]
  ]);

  const l15 = get("l15");
  const r15 = get("r15");
  if (l15 && r15) {
    const isCompleted = tournamentState?.matches?.find(m => m.id === 15)?.status === "completed";
    path(center(l15), center(r15), isCompleted);
  }
}

let resizeTimer = null;
function debounceDrawSVG() {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => {
    drawBracketSVG();
  }, 100);
}

async function handleSimulateNext() {
  if (!tournamentState || !tournamentState.matches) return;
  const nextPlayable = tournamentState.matches.find(
    m => m.status === "in_progress" && m.participant1 && m.participant2
  );
  if (!nextPlayable) {
    alert("No playable match remaining or tournament completed.");
    return;
  }
  try {
    const res = await fetch(`/api/matches/${nextPlayable.id}/simulate`, { method: "POST" });
    if (!res.ok) throw new Error("Simulation failed");
    await loadTournamentData();
  } catch (err) {
    alert(err.message);
  }
}

async function handleSimulateAll() {
  try {
    const res = await fetch("/api/tournament/simulate-all", { method: "POST" });
    if (!res.ok) throw new Error("Failed to auto-simulate");
    await loadTournamentData();
  } catch (err) {
    alert("Error simulating tournament: " + err.message);
  }
}

async function handleReset() {
  try {
    const res = await fetch("/api/tournament/reset", { method: "POST" });
    if (!res.ok) throw new Error("Failed to reset");
    await loadTournamentData();
  } catch (err) {
    alert("Error resetting tournament: " + err.message);
  }
}

async function openParticipantModal(participantId) {
  try {
    const res = await fetch(`/api/participants/${participantId}`);
    if (!res.ok) throw new Error("Failed to load contender dossier");
    const p = await res.json();

    document.getElementById("modal-avatar").src = p.avatar_url || "";
    document.getElementById("modal-seed").textContent = `SEED #${p.seed}`;
    document.getElementById("modal-origin").textContent = p.origin;
    document.getElementById("modal-name").textContent = p.name;
    document.getElementById("modal-title").textContent = p.title || "Contender";
    document.getElementById("modal-bio").textContent = p.bio || "No data.";

    const gallery = document.getElementById("modal-gallery");
    gallery.innerHTML = "";
    (p.albums || []).forEach((item) => {
      gallery.appendChild(createAlbumCard(item));
    });

    document.getElementById("participant-modal").classList.remove("hidden");
  } catch (err) {
    alert(err.message);
  }
}

function createAlbumCard(item) {
  const col = document.createElement("div");
  col.className = "album-item-card";
  col.innerHTML = `
    <div class="album-img-wrap"><img src="${item.image_url}" alt="" class="album-img"></div>
    <div class="album-item-meta">
      <span class="album-type-badge">${item.image_type}</span>
      <p class="album-caption" title="${item.caption || ''}">${item.caption || 'Untitled'}</p>
    </div>
  `;
  return col;
}

function closeModal() {
  document.getElementById("participant-modal").classList.add("hidden");
}

function closeScoreModal() {
  document.getElementById("score-modal").classList.add("hidden");
}

async function handleScoreSubmit(e) {
  e.preventDefault();
  const s1 = parseInt(document.getElementById("input-score1").value, 10);
  const s2 = parseInt(document.getElementById("input-score2").value, 10);
  const errBox = document.getElementById("score-error-msg");

  if (s1 === s2) {
    errBox.textContent = "Single elimination matches cannot end in a draw.";
    errBox.classList.remove("hidden");
    return;
  }

  try {
    const res = await fetch(`/api/matches/${currentScoreMatchId}/score`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ match_id: currentScoreMatchId, score1: s1, score2: s2 })
    });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.detail || "Failed to record score");
    }
    closeScoreModal();
    await loadTournamentData();
  } catch (err) {
    errBox.textContent = err.message;
    errBox.classList.remove("hidden");
  }
}
