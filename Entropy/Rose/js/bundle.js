/**
 * Entropy Rose: Consolidated Client-Side Engine (Bundle)
 * Pure vanilla JavaScript with zero dependencies and no ES module imports.
 * Designed for immediate direct execution via both file:/// protocol and HTTP servers.
 */

(function () {
  "use strict";

  // --- 1. Deterministic Hex ID Generator ---
  function generateHexId(date = new Date()) {
    const pad = (n, len = 2) => String(n).padStart(len, "0");
    const year = date.getFullYear();
    const month = pad(date.getMonth() + 1);
    const day = pad(date.getDate());
    const hours = pad(date.getHours());
    const minutes = pad(date.getMinutes());
    const seconds = pad(date.getSeconds());
    const ms = pad(date.getMilliseconds(), 3);

    const timeStr = `${year}${month}${day}${hours}${minutes}${seconds}${ms}`;
    const decimalVal = BigInt(timeStr);
    return decimalVal.toString(16).toUpperCase().padStart(16, "0");
  }

  function parseHexIdToDate(hexId) {
    try {
      const decimalVal = BigInt(`0x${hexId}`).toString();
      if (decimalVal.length < 14) return null;

      const year = parseInt(decimalVal.slice(0, 4), 10);
      const month = parseInt(decimalVal.slice(4, 6), 10) - 1;
      const day = parseInt(decimalVal.slice(6, 8), 10);
      const hours = parseInt(decimalVal.slice(8, 10), 10);
      const minutes = parseInt(decimalVal.slice(10, 12), 10);
      const seconds = parseInt(decimalVal.slice(12, 14), 10);
      const ms = decimalVal.length >= 17 ? parseInt(decimalVal.slice(14, 17), 10) : 0;

      return new Date(year, month, day, hours, minutes, seconds, ms);
    } catch (err) {
      console.error("Failed to parse hex ID to Date:", err);
      return null;
    }
  }

  // --- 2. Default Seed Dataset (Pre-Embedded for file:/// Resilience) ---
  // Manager's absolute truth data from refined schema
  const DEFAULT_SEED_QUOTES = {
    "0047FB356CE62F42": {
      "id": "0047FB356CE62F42",
      "index": 1,
      "main_content": "\"Static hum, thrum—needle drops,\nSpinning echo, time just stops.\nFamiliar chords fill up the room,\nWrapped inside this faded tomb.\"",
      "context": "_from 'Vinyl Angel' by Koi no Koe._",
      "date": "2026-09-30",
      "source_speaker": {
        "name": "Vinyl Angel",
        "role": "Musical Artifact",
        "origin": "Koi no Koe"
      },
      "preference": [],
      "backlink": [],
      "tags": {
        "domains": ["music", "vinyl"],
        "themes": ["nostalgia", "analog"],
        "sentiment": "stoic",
        "custom": {}
      }
    },
    "0047FB35681B9A44": {
      "id": "0047FB35681B9A44",
      "index": 2,
      "main_content": "\"The needle wears grooves not just in vinyl,\nbut in the causality of moments.\nEach replay is a new iteration\nin the entropy of memory.\"",
      "context": "_Spontaneous reflection during vinyl playback session_",
      "date": "2026-09-30",
      "source_speaker": {
        "name": "Faust",
        "role": "Strategic Analytical Intellect",
        "origin": "Faust-Manager Codex"
      },
      "preference": ["0047FB356CE62F42"],  // Points to Quote #1 as a response
      "backlink": [],
      "tags": {
        "domains": ["philosophy", "entropy"],
        "themes": ["causality", "memory"],
        "sentiment": "transcendent",
        "custom": {
          "playback_speed": "33⅓ RPM",
          "record_side": "A"
        }
      }
    }
  };

  // --- 3. O(1) Quote Store ---
  const STORAGE_KEY = "entropy_rose_quotes_v5";

  class QuoteStore {
    constructor() {
      this.quotes = {};
      this.activeId = null;
      this.subscribers = new Set();
    }

    subscribe(callback) {
      this.subscribers.add(callback);
      return () => this.subscribers.delete(callback);
    }

    notify() {
      for (const callback of this.subscribers) {
        try {
          callback(this);
        } catch (err) {
          console.error("Subscriber error:", err);
        }
      }
    }

    async init() {
      // 1. Try local storage cache
      let loaded = false;
      const cached = localStorage.getItem(STORAGE_KEY);
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          if (parsed && typeof parsed === "object" && Object.keys(parsed).length > 0) {
            this.quotes = parsed;
            loaded = true;
          }
        } catch (e) {
          console.warn("Cached quotes parse error, refreshing store", e);
        }
      }

      // 2. If running under HTTP/HTTPS and not cached, attempt fetch from data/quotes.json
      if (!loaded && window.location.protocol.startsWith("http")) {
        try {
          const res = await fetch("data/quotes.json");
          if (res.ok) {
            const remoteMap = await res.json();
            if (remoteMap && typeof remoteMap === "object" && Object.keys(remoteMap).length > 0) {
              this.quotes = remoteMap;
              loaded = true;
            }
          }
        } catch (e) {
          console.info("Remote fetch failed, falling back to embedded seed data.");
        }
      }

      // 3. Fallback to embedded seed dataset (Vinyl Angel + Faust)
      if (!loaded || Object.keys(this.quotes).length === 0) {
        this.quotes = JSON.parse(JSON.stringify(DEFAULT_SEED_QUOTES));
      }

      // 4. Self-healing schema migration (ensure preference array exists on all quotes)
      for (const id in this.quotes) {
        if (!Array.isArray(this.quotes[id].preference)) {
          this.quotes[id].preference = [];
        }
      }

      // Default active ID to the highest index quote (or first key)
      const list = this.getAllQuotes("desc");
      this.activeId = list.length > 0 ? list[0].id : null;

      this.persist();
      this.notify();
    }

    resetToSeed() {
      try {
        localStorage.removeItem(STORAGE_KEY);
        localStorage.removeItem("entropy_rose_quotes_v1");
        localStorage.removeItem("entropy_rose_quotes_v2");
        localStorage.removeItem("entropy_rose_quotes_v3");
      } catch (e) {
        console.warn("LocalStorage clear error:", e);
      }
      this.quotes = JSON.parse(JSON.stringify(DEFAULT_SEED_QUOTES));
      const list = this.getAllQuotes("desc");
      this.activeId = list.length > 0 ? list[0].id : null;
      this.persist();
      this.notify();
    }

    persist() {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.quotes));
      } catch (e) {
        console.error("LocalStorage quota exceeded or unavailable:", e);
      }
    }

    getQuote(id) {
      return this.quotes[id] || null;
    }

    getAllQuotes(order = "desc") {
      const list = Object.values(this.quotes);
      list.sort((a, b) => {
        return order === "desc"
          ? b.id.localeCompare(a.id)
          : a.id.localeCompare(b.id);
      });
      return list;
    }

    setActiveId(id) {
      if (this.quotes[id]) {
        this.activeId = id;
        this.notify();
      }
    }

    getActiveQuote() {
      return this.activeId ? this.getQuote(this.activeId) : null;
    }

    upsertQuote(quote) {
      if (!quote.id) throw new Error("Quote must possess a 16-character hex ID");
      this.quotes[quote.id] = quote;
      this.activeId = quote.id;
      this.persist();
      this.notify();
    }

    deleteQuote(id) {
      if (this.quotes[id]) {
        delete this.quotes[id];
        const remaining = this.getAllQuotes("desc");
        this.activeId = remaining.length > 0 ? remaining[0].id : null;
        this.persist();
        this.notify();
      }
    }

    getNextIndex() {
      const values = Object.values(this.quotes);
      if (values.length === 0) return 1;
      const maxIdx = Math.max(...values.map(q => q.index || 0));
      return maxIdx + 1;
    }

    getGraphEdges(id) {
      const active = this.getQuote(id);
      if (!active) return { outgoing: [], incoming: [] };

      const outgoing = (active.backlink || []).map(link => {
        const targetQuote = this.getQuote(link.target_id);
        return {
          target_id: link.target_id,
          relation: link.relation,
          direction: "outgoing",
          targetTitle: targetQuote ? targetQuote.main_content.slice(0, 45) + "..." : "External / Root Entity",
          exists: !!targetQuote
        };
      });

      const incoming = [];
      for (const other of Object.values(this.quotes)) {
        if (other.id === id) continue;
        for (const link of (other.backlink || [])) {
          if (link.target_id === id) {
            incoming.push({
              source_id: other.id,
              relation: link.relation,
              direction: "incoming",
              sourceTitle: other.main_content.slice(0, 45) + "...",
              sourceIndex: other.index
            });
          }
        }
      }

      return { outgoing, incoming };
    }

    getFacets() {
      const domains = new Set();
      const themes = new Set();
      const sentiments = new Set();

      for (const q of Object.values(this.quotes)) {
        const tags = q.tags || {};
        (tags.domains || []).forEach(d => domains.add(d));
        (tags.themes || []).forEach(t => themes.add(t));
        if (tags.sentiment) sentiments.add(tags.sentiment);
      }

      return {
        domains: Array.from(domains).sort(),
        themes: Array.from(themes).sort(),
        sentiments: Array.from(sentiments).sort()
      };
    }

    exportJSON() {
      return JSON.stringify(this.quotes, null, 2);
    }

    importJSON(jsonStr) {
      try {
        const parsed = JSON.parse(jsonStr);
        if (typeof parsed !== "object" || parsed === null) {
          throw new Error("Invalid structure: JSON root must be an Object or Array");
        }

        let newMap = {};
        if (Array.isArray(parsed)) {
          for (const item of parsed) {
            if (item.id) newMap[item.id] = item;
          }
        } else {
          newMap = parsed;
        }

        this.quotes = newMap;
        const keys = Object.keys(this.quotes);
        this.activeId = keys.length > 0 ? keys[0] : null;
        this.persist();
        this.notify();
        return { success: true, count: keys.length };
      } catch (err) {
        console.error("Import failed:", err);
        return { success: false, error: err.message };
      }
    }
  }

  // --- 4. Main Reactive UI Controller ---
  class EntropyRoseApp {
    constructor() {
      this.store = new QuoteStore();
      this.activeFilter = {
        searchQuery: "",
        domain: null,
        theme: null,
        sentiment: null
      };

      this.editingQuoteId = null;

      // Cache DOM Elements
      this.dom = {
        themeToggleBtn: document.getElementById("themeToggleBtn"),
        searchQueryInput: document.getElementById("searchQueryInput"),
        newQuoteBtn: document.getElementById("newQuoteBtn"),
        exportJsonBtn: document.getElementById("exportJsonBtn"),
        importJsonBtn: document.getElementById("importJsonBtn"),
        importFileInput: document.getElementById("importFileInput"),
        resetSeedBtn: document.getElementById("resetSeedBtn"),
        sidebarFilterBar: document.getElementById("sidebarFilterBar"),
        quotesScrollArea: document.getElementById("quotesScrollArea"),

        // Reader View
        readerWorkspace: document.getElementById("readerWorkspace"),
        quoteDisplayCard: document.getElementById("quoteDisplayCard"),
        displayIndexBadge: document.getElementById("displayIndexBadge"),
        displayHexCode: document.getElementById("displayHexCode"),
        displayDate: document.getElementById("displayDate"),
        displayMainContent: document.getElementById("displayMainContent"),
        displayContextBox: document.getElementById("displayContextBox"),
        displayContextBody: document.getElementById("displayContextBody"),
        displaySpeakerName: document.getElementById("displaySpeakerName"),
        displaySpeakerRole: document.getElementById("displaySpeakerRole"),
        displaySpeakerOrigin: document.getElementById("displaySpeakerOrigin"),
        outgoingBacklinksList: document.getElementById("outgoingBacklinksList"),
        incomingBacklinksList: document.getElementById("incomingBacklinksList"),
        preferencesSection: document.getElementById("preferencesSection"),
        preferencesList: document.getElementById("preferencesList"),
        tagChipsDomains: document.getElementById("tagChipsDomains"),
        tagChipsThemes: document.getElementById("tagChipsThemes"),
        tagChipsSentiment: document.getElementById("tagChipsSentiment"),
        tagChipsCustom: document.getElementById("tagChipsCustom"),

        editActiveBtn: document.getElementById("editActiveBtn"),
        deleteActiveBtn: document.getElementById("deleteActiveBtn"),
        copyActiveBtn: document.getElementById("copyActiveBtn"),
        copyMarkdownBtn: document.getElementById("copyMarkdownBtn"),
        inspectJsonBtn: document.getElementById("inspectJsonBtn"),

        // Editor Modal
        quoteModal: document.getElementById("quoteModal"),
        modalTitle: document.getElementById("modalTitle"),
        closeModalBtn: document.getElementById("closeModalBtn"),
        cancelModalBtn: document.getElementById("cancelModalBtn"),
        quoteForm: document.getElementById("quoteForm"),
        formIdInput: document.getElementById("formIdInput"),
        formIndexInput: document.getElementById("formIndexInput"),
        formDateInput: document.getElementById("formDateInput"),
        formMainContent: document.getElementById("formMainContent"),
        formContext: document.getElementById("formContext"),
        formSpeakerName: document.getElementById("formSpeakerName"),
        formSpeakerRole: document.getElementById("formSpeakerRole"),
        formSpeakerOrigin: document.getElementById("formSpeakerOrigin"),
        formDomains: document.getElementById("formDomains"),
        formThemes: document.getElementById("formThemes"),
        formSentiment: document.getElementById("formSentiment"),
        formCustomTags: document.getElementById("formCustomTags"),
        formBacklinkTarget: document.getElementById("formBacklinkTarget"),
        formBacklinkRelation: document.getElementById("formBacklinkRelation"),
        formAddBacklinkBtn: document.getElementById("formAddBacklinkBtn"),
        formBacklinksContainer: document.getElementById("formBacklinksContainer"),
        formPreferenceTarget: document.getElementById("formPreferenceTarget"),
        formAddPreferenceBtn: document.getElementById("formAddPreferenceBtn"),
        formPreferencesContainer: document.getElementById("formPreferencesContainer"),

        // Inspector Modal
        inspectorModal: document.getElementById("inspectorModal"),
        closeInspectorBtn: document.getElementById("closeInspectorBtn"),
        inspectorPre: document.getElementById("inspectorPre"),
        copyJsonBtn: document.getElementById("copyJsonBtn"),
        downloadJsonBtn: document.getElementById("downloadJsonBtn")
      };

      this.modalBacklinks = [];
      this.modalPreferences = [];
    }

    async start() {
      this.initTheme();
      this.bindEvents();
      this.store.subscribe(() => this.render());
      await this.store.init();
    }

    initTheme() {
      const saved = localStorage.getItem("entropy_rose_theme") || "dark";
      document.documentElement.setAttribute("data-theme", saved);
    }

    toggleTheme() {
      const current = document.documentElement.getAttribute("data-theme") || "dark";
      const next = current === "dark" ? "light" : "dark";
      document.documentElement.setAttribute("data-theme", next);
      localStorage.setItem("entropy_rose_theme", next);
    }

    bindEvents() {
      this.dom.themeToggleBtn.addEventListener("click", () => this.toggleTheme());

      // Search query live filter
      this.dom.searchQueryInput.addEventListener("input", (e) => {
        this.activeFilter.searchQuery = e.target.value.toLowerCase().trim();
        this.renderSidebar();
      });

      // New Quote
      this.dom.newQuoteBtn.addEventListener("click", () => this.openEditorForNew());

      // Export JSON
      this.dom.exportJsonBtn.addEventListener("click", () => this.downloadJSON());

      // Import JSON file
      this.dom.importJsonBtn.addEventListener("click", () => this.dom.importFileInput.click());
      this.dom.importFileInput.addEventListener("change", (e) => this.handleFileImport(e));

      // Reset Seed Button
      if (this.dom.resetSeedBtn) {
        this.dom.resetSeedBtn.addEventListener("click", () => {
          if (confirm("Reset quote store to fresh seed data? Any local edits will be replaced.")) {
            this.store.resetToSeed();
            this.showToast("Store reset to fresh seed mock data.");
          }
        });
      }

      // Reader Action Buttons
      this.dom.editActiveBtn.addEventListener("click", () => {
        const active = this.store.getActiveQuote();
        if (active) this.openEditorForEdit(active);
      });

      this.dom.deleteActiveBtn.addEventListener("click", () => {
        const active = this.store.getActiveQuote();
        if (!active) return;
        if (confirm(`Delete quote #${active.index} [${active.id}]?`)) {
          this.store.deleteQuote(active.id);
        }
      });

      this.dom.copyActiveBtn.addEventListener("click", () => {
        const active = this.store.getActiveQuote();
        if (!active) return;
        const text = `"${active.main_content}"\n— ${active.source_speaker?.name || "Unknown"}`;
        navigator.clipboard.writeText(text).catch(() => {});
        this.showToast("Quote copied to clipboard");
      });

      if (this.dom.copyMarkdownBtn) {
        this.dom.copyMarkdownBtn.addEventListener("click", () => {
          const active = this.store.getActiveQuote();
          if (!active) return;
          const md = this.quoteToMarkdown(active);
          navigator.clipboard.writeText(md).catch(() => {});
          this.showToast(`Markdown copied for Quote #${active.index}`);
        });
      }

      this.dom.displayHexCode.addEventListener("click", () => {
        const active = this.store.getActiveQuote();
        if (!active) return;
        navigator.clipboard.writeText(active.id).catch(() => {});
        this.showToast(`Hex ID [${active.id}] copied`);
      });

      this.dom.inspectJsonBtn.addEventListener("click", () => this.openInspector());

      // Modal Events
      this.dom.closeModalBtn.addEventListener("click", () => this.closeModal());
      this.dom.cancelModalBtn.addEventListener("click", () => this.closeModal());
      this.dom.quoteForm.addEventListener("submit", (e) => this.handleSaveQuote(e));
      this.dom.formAddBacklinkBtn.addEventListener("click", () => this.handleAddFormBacklink());
      if (this.dom.formAddPreferenceBtn) {
        this.dom.formAddPreferenceBtn.addEventListener("click", () => this.handleAddFormPreference());
      }

      // Inspector Events
      this.dom.closeInspectorBtn.addEventListener("click", () => this.closeInspector());
      this.dom.copyJsonBtn.addEventListener("click", () => {
        navigator.clipboard.writeText(this.dom.inspectorPre.textContent).catch(() => {});
        this.showToast("JSON copied to clipboard");
      });
      this.dom.downloadJsonBtn.addEventListener("click", () => this.downloadJSON());

      // Close modals on overlay backdrop click
      this.dom.quoteModal.addEventListener("click", (e) => {
        if (e.target === this.dom.quoteModal) this.closeModal();
      });
      this.dom.inspectorModal.addEventListener("click", (e) => {
        if (e.target === this.dom.inspectorModal) this.closeInspector();
      });
    }

    showToast(msg) {
      console.log("[Toast]", msg);
      const orig = document.title;
      document.title = `✓ ${msg}`;
      setTimeout(() => { document.title = orig; }, 1800);
    }

    quoteToMarkdown(quote) {
      if (!quote) return "";
      const lines = [
        "---",
        `id: ${quote.id || ""}`,
        `index: ${quote.index || 1}`,
        `date: '${quote.date || ""}'`,
        "source_speaker:",
        `  name: ${quote.source_speaker?.name || ""}`,
        `  role: ${quote.source_speaker?.role || ""}`,
        `  origin: ${quote.source_speaker?.origin || ""}`
      ];

      const prefs = quote.preference || [];
      if (prefs.length === 0) {
        lines.push("preference: []");
      } else {
        lines.push("preference:");
        prefs.forEach(p => lines.push(`- ${p}`));
      }

      const backlinks = quote.backlink || [];
      if (backlinks.length === 0) {
        lines.push("backlink: []");
      } else {
        lines.push("backlink:");
        backlinks.forEach(b => {
          lines.push(`- target_id: ${b.target_id || ""}`);
          lines.push(`  relation: ${b.relation || "related"}`);
        });
      }

      const tags = quote.tags || {};
      const domains = tags.domains || [];
      lines.push("tags:");
      if (domains.length === 0) {
        lines.push("  domains: []");
      } else {
        lines.push("  domains:");
        domains.forEach(d => lines.push(`  - ${d}`));
      }

      const themes = tags.themes || [];
      if (themes.length === 0) {
        lines.push("  themes: []");
      } else {
        lines.push("  themes:");
        themes.forEach(t => lines.push(`  - ${t}`));
      }

      lines.push(`  sentiment: ${tags.sentiment || ""}`);

      const custom = tags.custom || {};
      const customKeys = Object.keys(custom);
      if (customKeys.length === 0) {
        lines.push("  custom: {}");
      } else {
        lines.push("  custom:");
        customKeys.forEach(k => lines.push(`    ${k}: ${custom[k]}`));
      }

      lines.push("---");
      lines.push("");
      lines.push("# Quote");
      lines.push("");
      lines.push(quote.main_content || "");
      lines.push("");
      lines.push("## Context");
      lines.push("");
      lines.push(quote.context || "");
      lines.push("");

      return lines.join("\n");
    }

    render() {
      this.renderFilterChips();
      this.renderSidebar();
      this.renderActiveQuote();
    }

    renderFilterChips() {
      const facets = this.store.getFacets();
      this.dom.sidebarFilterBar.innerHTML = "";

      // "All" chip
      const allChip = document.createElement("button");
      const isAll = !this.activeFilter.domain && !this.activeFilter.theme && !this.activeFilter.sentiment;
      allChip.className = `filter-chip ${isAll ? "active" : ""}`;
      allChip.textContent = "All";
      allChip.onclick = () => {
        this.activeFilter.domain = null;
        this.activeFilter.theme = null;
        this.activeFilter.sentiment = null;
        this.render();
      };
      this.dom.sidebarFilterBar.appendChild(allChip);

      // Domains
      for (const d of facets.domains.slice(0, 4)) {
        const chip = document.createElement("button");
        const isActive = this.activeFilter.domain === d;
        chip.className = `filter-chip ${isActive ? "active" : ""}`;
        chip.textContent = `#${d}`;
        chip.onclick = () => {
          this.activeFilter.domain = isActive ? null : d;
          this.render();
        };
        this.dom.sidebarFilterBar.appendChild(chip);
      }

      // Themes
      for (const t of facets.themes.slice(0, 4)) {
        const chip = document.createElement("button");
        const isActive = this.activeFilter.theme === t;
        chip.className = `filter-chip ${isActive ? "active" : ""}`;
        chip.textContent = `§${t}`;
        chip.onclick = () => {
          this.activeFilter.theme = isActive ? null : t;
          this.render();
        };
        this.dom.sidebarFilterBar.appendChild(chip);
      }
    }

    renderSidebar() {
      const all = this.store.getAllQuotes("desc");
      const filtered = all.filter(q => {
        // 1. Text search
        if (this.activeFilter.searchQuery) {
          const query = this.activeFilter.searchQuery;
          const inContent = (q.main_content || "").toLowerCase().includes(query);
          const inContext = (q.context || "").toLowerCase().includes(query);
          const inSpeaker = (q.source_speaker?.name || "").toLowerCase().includes(query);
          const inTags = JSON.stringify(q.tags || {}).toLowerCase().includes(query);
          const inId = (q.id || "").toLowerCase().includes(query);
          if (!inContent && !inContext && !inSpeaker && !inTags && !inId) return false;
        }
        // 2. Domain filter
        if (this.activeFilter.domain) {
          const domains = q.tags?.domains || [];
          if (!domains.includes(this.activeFilter.domain)) return false;
        }
        // 3. Theme filter
        if (this.activeFilter.theme) {
          const themes = q.tags?.themes || [];
          if (!themes.includes(this.activeFilter.theme)) return false;
        }
        // 4. Sentiment filter
        if (this.activeFilter.sentiment) {
          if (q.tags?.sentiment !== this.activeFilter.sentiment) return false;
        }
        return true;
      });

      this.dom.quotesScrollArea.innerHTML = "";

      if (filtered.length === 0) {
        const emptyDiv = document.createElement("div");
        emptyDiv.style.padding = "24px";
        emptyDiv.style.color = "var(--text-muted)";
        emptyDiv.style.textAlign = "center";
        emptyDiv.textContent = "No quotes match the current filters.";
        this.dom.quotesScrollArea.appendChild(emptyDiv);
        return;
      }

      for (const q of filtered) {
        const card = document.createElement("div");
        const isActive = q.id === this.store.activeId;
        card.className = `quote-item-card ${isActive ? "active" : ""}`;

        // Fitts's law: 100% surface hitbox
        card.onclick = () => this.store.setActiveId(q.id);

        const snippet = q.main_content.replace(/\n+/g, " ");

        card.innerHTML = `
          <div class="item-card-header">
            <span class="item-index-badge">#${q.index}</span>
            <span class="item-hex-id">${q.id}</span>
          </div>
          <div class="item-snippet">${snippet}</div>
          <div class="item-card-footer">
            <span>${q.source_speaker?.name || "Unknown"}</span>
            <span>${q.date || ""}</span>
          </div>
        `;

        this.dom.quotesScrollArea.appendChild(card);
      }
    }

    renderActiveQuote() {
      const q = this.store.getActiveQuote();
      if (!q) {
        this.dom.quoteDisplayCard.style.display = "none";
        return;
      }

      this.dom.quoteDisplayCard.style.display = "flex";
      this.dom.displayIndexBadge.textContent = `#${q.index}`;
      this.dom.displayHexCode.textContent = q.id;
      this.dom.displayDate.textContent = q.date || "Unknown Date";
      this.dom.displayMainContent.textContent = q.main_content;

      // Context
      if (q.context && q.context.trim()) {
        this.dom.displayContextBox.style.display = "flex";
        this.dom.displayContextBody.textContent = q.context;
      } else {
        this.dom.displayContextBox.style.display = "none";
      }

      // Speaker
      this.dom.displaySpeakerName.textContent = q.source_speaker?.name || "Anonymous";
      this.dom.displaySpeakerRole.textContent = q.source_speaker?.role || "Source";
      this.dom.displaySpeakerOrigin.textContent = q.source_speaker?.origin || "Direct Quote";

      // Graph & Backlinks
      this.renderBacklinks(q.id);

      // Response Preferences
      this.renderPreferences(q.preference || []);

      // Tags
      this.renderTags(q.tags || {});
    }

    renderBacklinks(quoteId) {
      const edges = this.store.getGraphEdges(quoteId);

      // 1. Outgoing Backlinks
      this.dom.outgoingBacklinksList.innerHTML = "";
      if (edges.outgoing.length === 0) {
        this.dom.outgoingBacklinksList.innerHTML = `<span style="font-size:0.8rem;color:var(--text-muted)">No outgoing connections</span>`;
      } else {
        for (const link of edges.outgoing) {
          const pill = document.createElement("button");
          pill.className = "backlink-pill";
          pill.title = link.targetTitle;
          pill.innerHTML = `
            <span class="backlink-relation">${link.relation}</span>
            <span class="backlink-id">${link.target_id}</span>
          `;
          // Instant O(1) jump
          pill.onclick = () => {
            if (link.exists) {
              this.store.setActiveId(link.target_id);
            } else {
              this.showToast(`Target [${link.target_id}] is an external or root reference`);
            }
          };
          this.dom.outgoingBacklinksList.appendChild(pill);
        }
      }

      // 2. Incoming Backlinks
      this.dom.incomingBacklinksList.innerHTML = "";
      if (edges.incoming.length === 0) {
        this.dom.incomingBacklinksList.innerHTML = `<span style="font-size:0.8rem;color:var(--text-muted)">No quotes link here</span>`;
      } else {
        for (const link of edges.incoming) {
          const pill = document.createElement("button");
          pill.className = "backlink-pill";
          pill.title = link.sourceTitle;
          pill.innerHTML = `
            <span class="backlink-relation">referenced by #${link.sourceIndex}</span>
            <span class="backlink-id">${link.source_id}</span>
          `;
          // Instant O(1) jump
          pill.onclick = () => this.store.setActiveId(link.source_id);
          this.dom.incomingBacklinksList.appendChild(pill);
        }
      }
    }

    renderPreferences(preferences) {
      if (!this.dom.preferencesList) return;
      this.dom.preferencesList.innerHTML = "";

      if (!preferences || preferences.length === 0) {
        if (this.dom.preferencesSection) {
          this.dom.preferencesSection.style.display = "none";
        }
        return;
      }

      if (this.dom.preferencesSection) {
        this.dom.preferencesSection.style.display = "block";
      }

      for (const targetId of preferences) {
        const targetQuote = this.store.getQuote(targetId);
        const pill = document.createElement("button");
        pill.className = "backlink-pill";
        pill.title = targetQuote ? targetQuote.main_content.slice(0, 45) + "..." : "Target Response Quote ID";
        pill.innerHTML = `
          <span class="backlink-relation" style="color:var(--accent-cyan, #00f0ff)">responds to</span>
          <span class="backlink-id">${targetId}</span>
        `;
        // Instant O(1) jump
        pill.onclick = () => {
          if (targetQuote) {
            this.store.setActiveId(targetId);
          } else {
            this.showToast(`Target quote [${targetId}] not in local store`);
          }
        };
        this.dom.preferencesList.appendChild(pill);
      }
    }

    renderTags(tags) {
      // Domains
      if (this.dom.tagChipsDomains) {
        this.dom.tagChipsDomains.innerHTML = "";
        (tags.domains || []).forEach(d => {
          const chip = document.createElement("span");
          chip.className = "tag-chip domain";
          chip.textContent = d;
          this.dom.tagChipsDomains.appendChild(chip);
        });
      }

      // Themes
      if (this.dom.tagChipsThemes) {
        this.dom.tagChipsThemes.innerHTML = "";
        (tags.themes || []).forEach(t => {
          const chip = document.createElement("span");
          chip.className = "tag-chip theme";
          chip.textContent = t;
          this.dom.tagChipsThemes.appendChild(chip);
        });
      }

      // Sentiment
      if (this.dom.tagChipsSentiment) {
        this.dom.tagChipsSentiment.innerHTML = "";
        if (tags.sentiment) {
          const chip = document.createElement("span");
          chip.className = "tag-chip sentiment";
          chip.textContent = tags.sentiment;
          this.dom.tagChipsSentiment.appendChild(chip);
        }
      }

      // Custom Key-Values
      if (this.dom.tagChipsCustom) {
        this.dom.tagChipsCustom.innerHTML = "";
        const custom = tags.custom || {};
        for (const [key, val] of Object.entries(custom)) {
          const chip = document.createElement("span");
          chip.className = "tag-chip custom";
          chip.textContent = `${key}: ${val}`;
          this.dom.tagChipsCustom.appendChild(chip);
        }
      }
    }

    openEditorForNew() {
      this.editingQuoteId = null;
      this.dom.modalTitle.textContent = "New Quote Note";

      const nextId = generateHexId(new Date());
      const nextIdx = this.store.getNextIndex();
      const today = new Date().toISOString().split("T")[0];

      this.dom.formIdInput.value = nextId;
      this.dom.formIndexInput.value = nextIdx;
      this.dom.formDateInput.value = today;
      this.dom.formMainContent.value = "";
      this.dom.formContext.value = "";
      this.dom.formSpeakerName.value = "";
      this.dom.formSpeakerRole.value = "";
      this.dom.formSpeakerOrigin.value = "";
      this.dom.formDomains.value = "";
      this.dom.formThemes.value = "";
      this.dom.formSentiment.value = "analytical";
      this.dom.formCustomTags.value = "";

      this.modalBacklinks = [];
      this.renderFormBacklinks();
      this.modalPreferences = [];
      this.renderFormPreferences();

      this.dom.quoteModal.classList.add("open");
      this.dom.formMainContent.focus();
    }

    openEditorForEdit(q) {
      this.editingQuoteId = q.id;
      this.dom.modalTitle.textContent = `Edit Quote #${q.index} [${q.id}]`;

      this.dom.formIdInput.value = q.id;
      this.dom.formIndexInput.value = q.index;
      this.dom.formDateInput.value = q.date || "";
      this.dom.formMainContent.value = q.main_content || "";
      this.dom.formContext.value = q.context || "";
      this.dom.formSpeakerName.value = q.source_speaker?.name || "";
      this.dom.formSpeakerRole.value = q.source_speaker?.role || "";
      this.dom.formSpeakerOrigin.value = q.source_speaker?.origin || "";

      const tags = q.tags || {};
      this.dom.formDomains.value = (tags.domains || []).join(", ");
      this.dom.formThemes.value = (tags.themes || []).join(", ");
      this.dom.formSentiment.value = tags.sentiment || "analytical";

      const customPairs = Object.entries(tags.custom || {}).map(([k, v]) => `${k}=${v}`).join(", ");
      this.dom.formCustomTags.value = customPairs;

      this.modalBacklinks = JSON.parse(JSON.stringify(q.backlink || []));
      this.renderFormBacklinks();
      this.modalPreferences = JSON.parse(JSON.stringify(q.preference || []));
      this.renderFormPreferences();

      this.dom.quoteModal.classList.add("open");
      this.dom.formMainContent.focus();
    }

    handleAddFormBacklink() {
      const target = this.dom.formBacklinkTarget.value.trim();
      const relation = this.dom.formBacklinkRelation.value;
      if (!target) return;

      this.modalBacklinks.push({ target_id: target, relation });
      this.dom.formBacklinkTarget.value = "";
      this.renderFormBacklinks();
    }

    renderFormBacklinks() {
      this.dom.formBacklinksContainer.innerHTML = "";
      this.modalBacklinks.forEach((link, idx) => {
        const chip = document.createElement("div");
        chip.style.cssText = "display:inline-flex;align-items:center;gap:6px;padding:4px 10px;background:var(--bg-input);border:1px solid var(--border-dim);border-radius:var(--radius-sm);font-size:0.8rem;";
        chip.innerHTML = `
          <span style="color:var(--accent-purple);font-weight:600;">${link.relation}</span>
          <span style="font-family:var(--font-mono);">${link.target_id}</span>
          <button type="button" style="color:var(--text-muted);margin-left:4px;font-size:1rem;background:none;border:none;cursor:pointer;">&times;</button>
        `;
        chip.querySelector("button").onclick = () => {
          this.modalBacklinks.splice(idx, 1);
          this.renderFormBacklinks();
        };
        this.dom.formBacklinksContainer.appendChild(chip);
      });
    }

    handleAddFormPreference() {
      if (!this.dom.formPreferenceTarget) return;
      const target = this.dom.formPreferenceTarget.value.trim();
      if (!target) return;

      if (!this.modalPreferences.includes(target)) {
        this.modalPreferences.push(target);
      }
      this.dom.formPreferenceTarget.value = "";
      this.renderFormPreferences();
    }

    renderFormPreferences() {
      if (!this.dom.formPreferencesContainer) return;
      this.dom.formPreferencesContainer.innerHTML = "";
      this.modalPreferences.forEach((prefId, idx) => {
        const chip = document.createElement("div");
        chip.style.cssText = "display:inline-flex;align-items:center;gap:6px;padding:4px 10px;background:var(--bg-input);border:1px solid var(--border-dim);border-radius:var(--radius-sm);font-size:0.8rem;";
        chip.innerHTML = `
          <span style="color:var(--accent-cyan, #00f0ff);font-weight:600;">responds to</span>
          <span style="font-family:var(--font-mono);">${prefId}</span>
          <button type="button" style="color:var(--text-muted);margin-left:4px;font-size:1rem;background:none;border:none;cursor:pointer;">&times;</button>
        `;
        chip.querySelector("button").onclick = () => {
          this.modalPreferences.splice(idx, 1);
          this.renderFormPreferences();
        };
        this.dom.formPreferencesContainer.appendChild(chip);
      });
    }

    handleSaveQuote(e) {
      e.preventDefault();

      const id = this.dom.formIdInput.value.trim();
      const index = parseInt(this.dom.formIndexInput.value, 10);
      const date = this.dom.formDateInput.value.trim();
      const mainContent = this.dom.formMainContent.value.trim();
      const context = this.dom.formContext.value.trim();

      if (!mainContent) {
        alert("Main quote content is required.");
        return;
      }

      // Parse Tag domains & themes
      const domains = this.dom.formDomains.value.split(",").map(s => s.trim().toLowerCase()).filter(Boolean);
      const themes = this.dom.formThemes.value.split(",").map(s => s.trim().toLowerCase()).filter(Boolean);
      const sentiment = this.dom.formSentiment.value;

      // Parse custom key-value pairs (e.g. key=val, key2=val2)
      const custom = {};
      const customStr = this.dom.formCustomTags.value.trim();
      if (customStr) {
        for (const pair of customStr.split(",")) {
          const parts = pair.split("=");
          if (parts.length === 2) {
            const k = parts[0].trim();
            const v = parts[1].trim();
            if (k && v) custom[k] = v;
          }
        }
      }

      const quoteObj = {
        id,
        index,
        main_content: mainContent,
        context,
        date,
        source_speaker: {
          name: this.dom.formSpeakerName.value.trim() || "Anonymous",
          role: this.dom.formSpeakerRole.value.trim() || "",
          origin: this.dom.formSpeakerOrigin.value.trim() || ""
        },
        backlink: this.modalBacklinks,
        preference: this.modalPreferences,
        tags: {
          domains,
          themes,
          sentiment,
          custom
        }
      };

      this.store.upsertQuote(quoteObj);
      this.closeModal();
      this.showToast(`Saved Quote #${index}`);
    }

    closeModal() {
      this.dom.quoteModal.classList.remove("open");
    }

    openInspector() {
      const rawJson = this.store.exportJSON();
      this.dom.inspectorPre.textContent = rawJson;
      this.dom.inspectorModal.classList.add("open");
    }

    closeInspector() {
      this.dom.inspectorModal.classList.remove("open");
    }

    downloadJSON() {
      const data = this.store.exportJSON();
      const blob = new Blob([data], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "quotes.json";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      this.showToast("Exported quotes.json");
    }

    handleFileImport(e) {
      const file = e.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target.result;
        const res = this.store.importJSON(content);
        if (res.success) {
          this.showToast(`Imported ${res.count} quotes successfully`);
        } else {
          alert("Failed to import JSON: " + res.error);
        }
      };
      reader.readAsText(file);
      e.target.value = "";
    }
  }

  // Bootstrap application on DOM ready
  document.addEventListener("DOMContentLoaded", () => {
    const app = new EntropyRoseApp();
    app.start();
  });
})();
